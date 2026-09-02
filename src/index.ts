/**
 * C1 Proxy - Edge-native secure proxy control plane & data plane.
 * Main Cloudflare Worker entrypoint.
 */

import { Router } from './app/router';
import { C1Repository } from './database/repo';
import { ensureMigrations } from './database/migrations';
import { hashPassword, verifyPassword } from './auth/password';
import {
  buildClearCookieHeader,
  buildSetCookieHeader,
  createSessionToken,
  parseCookies,
  SESSION_COOKIE_NAME,
  SessionPayload,
  verifySessionToken,
} from './auth/session';
import { validateCsrfToken } from './auth/csrf';
import { checkRateLimit } from './auth/rate-limit';
import { htmlResponse, jsonResponse, redirectResponse } from './app/responses';
import { C1Error, ErrorCode } from './app/errors';
import { UserService } from './users/service';
import { InboundService } from './inbounds/service';
import { handleWebSocketUpgrade } from './transports/websocket/handler';
import { buildSubscriptionResponse, detectSubscriptionFormat } from './subscriptions/auto';
import { generateAllNodeOptions, resolveCleanIpCandidates } from './routing/clean-ip';
import { RADAR_CANDIDATE_POOLS } from './radar/candidates';
import { classifyRadarLatency, RadarTestResult } from './radar/results';
import { recordAudit } from './telemetry/audit';
import { redactSensitiveObject, sanitizeUserForResponse } from './telemetry/redaction';
import { getLanguage, Language } from './i18n';
import { renderShell } from './ui/shell';
import { renderDashboardView } from './ui/dashboard';
import { renderUsersView } from './ui/users';
import { renderUserDetailView } from './ui/user-detail';
import { renderInboundsView } from './ui/inbounds';
import { renderRadarView } from './ui/radar';
import { renderRoutingView } from './ui/routing';
import { renderSettingsView } from './ui/settings';
import { renderPublicSubscriptionPage } from './ui/subscription-page';
import { renderInstallView } from './ui/install';
import { renderLoginView } from './ui/login';
import { renderDecoyProbePage } from './transports/http/probe';
import { randomToken } from './utils/bytes';

export interface Env {
  DB: D1Database;
  KV?: KVNamespace;
  C1_CLAIM_TOKEN?: string;
  C1_SESSION_SECRET?: string;
  C1_VERSION?: string;
  ENVIRONMENT?: string;
}

interface RequestContext {
  env: Env;
  session: SessionPayload | null;
  repo: C1Repository;
  sessionSecret: string;
  lang: Language;
}

const router = new Router<RequestContext>();

// ---------------- PUBLIC HEALTH & PROBES ----------------
router.get('/healthz', async (_req, _params, ctx) => {
  let dbOk = false;
  try {
    const adminCount = await ctx.repo.getAdminCount();
    dbOk = adminCount >= 0;
  } catch {}

  return jsonResponse({
    status: dbOk ? 'ok' : 'degraded',
    version: ctx.env.C1_VERSION || '1.0.0',
    d1: dbOk ? 'healthy' : 'error',
    kv: ctx.env.KV ? 'bound' : 'fallback',
  });
});

// ---------------- INSTALLATION FLOW ----------------
router.get('/install', async (_req, _params, ctx) => {
  const count = await ctx.repo.getAdminCount();
  if (count > 0) {
    return redirectResponse('/login');
  }
  const claimRequired = Boolean(ctx.env.C1_CLAIM_TOKEN);
  return htmlResponse(renderInstallView(ctx.lang, claimRequired));
});

router.post('/api/install', async (req, _params, ctx) => {
  const count = await ctx.repo.getAdminCount();
  if (count > 0) {
    throw new C1Error(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Application is already initialized', 400);
  }

  const body = (await req.json()) as { username?: string; password?: string; claim_token?: string };
  const username = (body.username || '').trim();
  const password = body.password || '';

  if (ctx.env.C1_CLAIM_TOKEN && ctx.env.C1_CLAIM_TOKEN !== body.claim_token) {
    throw new C1Error(ErrorCode.AUTH_CLAIM_REQUIRED, 'Invalid C1_CLAIM_TOKEN provided', 403);
  }

  const passHash = await hashPassword(password);
  const salt = passHash.split('$')[4];
  const admin = await ctx.repo.createAdmin(username, passHash, salt);

  await recordAudit(ctx.repo, 'admin_install', username, { username });

  // Issue session immediately
  const { token } = await createSessionToken(admin.id, admin.username, ctx.sessionSecret);
  const cookie = buildSetCookieHeader(SESSION_COOKIE_NAME, token, 7 * 86400);

  return jsonResponse({ success: true }, 200, { 'Set-Cookie': cookie });
});

// ---------------- AUTHENTICATION ----------------
router.get('/login', async (_req, _params, ctx) => {
  const count = await ctx.repo.getAdminCount();
  if (count === 0) {
    return redirectResponse('/install');
  }
  if (ctx.session) {
    return redirectResponse('/admin');
  }
  return htmlResponse(renderLoginView(ctx.lang));
});

router.post('/api/auth/login', async (req, _params, ctx) => {
  const clientIp = req.headers.get('cf-connecting-ip') || 'unknown';
  const rl = await checkRateLimit(ctx.env.KV, `login:${clientIp}`, 5, 60);
  if (!rl.allowed) {
    throw new C1Error(ErrorCode.AUTH_RATE_LIMITED, `Too many login attempts. Retry in ${rl.resetIn}s`, 429);
  }

  const body = (await req.json()) as { username?: string; password?: string };
  const username = (body.username || '').trim();
  const password = body.password || '';

  const admin = await ctx.repo.getAdminByUsername(username);
  if (!admin) {
    await recordAudit(ctx.repo, 'login_failed', username, { reason: 'User not found' }, clientIp);
    throw new C1Error(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid username or password', 401);
  }

  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    await recordAudit(ctx.repo, 'login_failed', username, { reason: 'Wrong password' }, clientIp);
    throw new C1Error(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid username or password', 401);
  }

  await recordAudit(ctx.repo, 'login_success', username, {}, clientIp);

  const { token } = await createSessionToken(admin.id, admin.username, ctx.sessionSecret);
  const cookie = buildSetCookieHeader(SESSION_COOKIE_NAME, token, 7 * 86400);

  return jsonResponse({ success: true }, 200, { 'Set-Cookie': cookie });
});

router.post('/api/auth/logout', async (_req, _params, _ctx) => {
  const clearCookie = buildClearCookieHeader(SESSION_COOKIE_NAME);
  return jsonResponse({ success: true }, 200, { 'Set-Cookie': clearCookie });
});

// ---------------- PUBLIC USER SUBSCRIPTION ----------------
router.get('/s/:token', async (req, params, ctx) => {
  const token = params.token;
  const user = await ctx.repo.getUserBySubscriptionToken(token);
  if (!user || !user.enabled) {
    return new Response('Subscription not found or disabled', { status: 404 });
  }

  const inbounds = await ctx.repo.getUserInbounds(user.id);
  const url = new URL(req.url);
  const serverHost = url.hostname;
  const serverOrigin = url.origin;

  const globalCleanIpsStr = (await ctx.repo.getSetting('global_clean_ips')) || '';
  const globalCleanIps = globalCleanIpsStr
    .split(/[\r\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const radarResults = await ctx.repo.getRecentRadarResults(5);
  const radarIps = radarResults.map((r) => r.ip);
  const cleanIps = resolveCleanIpCandidates(user, globalCleanIps, radarIps);

  const acceptHeader = req.headers.get('accept') || '';
  const isExplicitFormat = url.searchParams.has('format');

  // Render public portal in web browser unless an explicit format was specified
  if (acceptHeader.includes('text/html') && !isExplicitFormat) {
    return htmlResponse(renderPublicSubscriptionPage(user, inbounds, serverHost, serverOrigin, cleanIps));
  }

  // Generate subscription payload according to client
  const nodeOptions = generateAllNodeOptions(user, inbounds, serverHost, cleanIps);
  const format = detectSubscriptionFormat(req);
  return buildSubscriptionResponse(user, nodeOptions, format);
});

// ---------------- DATA PLANE WEBSOCKET UPGRADES ----------------
router.get('/edge/:token/vless', async (req, _params, ctx) => {
  return handleWebSocketUpgrade(req, 'vless', { DB: ctx.env.DB, KV: ctx.env.KV });
});

router.get('/edge/:token/trojan', async (req, _params, ctx) => {
  return handleWebSocketUpgrade(req, 'trojan', { DB: ctx.env.DB, KV: ctx.env.KV });
});

router.get('/edge/:token/ss', async (req, _params, ctx) => {
  return handleWebSocketUpgrade(req, 'shadowsocks', { DB: ctx.env.DB, KV: ctx.env.KV });
});

// ---------------- PROTECTED ADMIN CONSOLE VIEWS ----------------
function requireAuth(ctx: RequestContext): SessionPayload {
  if (!ctx.session) {
    throw new C1Error(ErrorCode.AUTH_UNAUTHORIZED, 'Authentication required', 401);
  }
  return ctx.session;
}

router.get('/admin', async (req, _params, ctx) => {
  const count = await ctx.repo.getAdminCount();
  if (count === 0) return redirectResponse('/install');
  if (!ctx.session) return redirectResponse('/login');

  const users = await ctx.repo.listUsers();
  const auditLogs = await ctx.repo.listAuditLogs(10);

  const content = renderDashboardView(ctx.lang, {
    users,
    auditLogs,
    d1Healthy: true,
    kvHealthy: Boolean(ctx.env.KV),
    migrationsCurrent: true,
  });

  return htmlResponse(
    renderShell({
      title: 'Dashboard',
      lang: ctx.lang,
      activeNav: 'overview',
      csrfToken: ctx.session.csrfToken,
      content,
    })
  );
});

router.get('/admin/users', async (req, _params, ctx) => {
  if (!ctx.session) return redirectResponse('/login');
  const users = await ctx.repo.listUsers();
  const url = new URL(req.url);
  const content = renderUsersView(ctx.lang, users, url.origin);

  return htmlResponse(
    renderShell({
      title: 'Users',
      lang: ctx.lang,
      activeNav: 'users',
      csrfToken: ctx.session.csrfToken,
      content,
    })
  );
});

router.get('/admin/users/:id', async (req, params, ctx) => {
  if (!ctx.session) return redirectResponse('/login');
  const user = await ctx.repo.getUserById(params.id);
  if (!user) return redirectResponse('/admin/users');

  const inbounds = await ctx.repo.getUserInbounds(user.id);
  const url = new URL(req.url);
  const content = renderUserDetailView(ctx.lang, user, inbounds, url.hostname, url.origin);

  return htmlResponse(
    renderShell({
      title: `User: ${user.name || user.username}`,
      lang: ctx.lang,
      activeNav: 'users',
      csrfToken: ctx.session.csrfToken,
      content,
    })
  );
});

router.get('/admin/inbounds', async (_req, _params, ctx) => {
  if (!ctx.session) return redirectResponse('/login');
  const inbounds = await ctx.repo.listInbounds();
  const content = renderInboundsView(ctx.lang, inbounds);

  return htmlResponse(
    renderShell({
      title: 'Inbounds',
      lang: ctx.lang,
      activeNav: 'inbounds',
      csrfToken: ctx.session.csrfToken,
      content,
    })
  );
});

router.get('/admin/radar', async (_req, _params, ctx) => {
  if (!ctx.session) return redirectResponse('/login');
  const users = await ctx.repo.listUsers();
  const recentResults = await ctx.repo.getRecentRadarResults(20);
  const content = renderRadarView(ctx.lang, users, recentResults);

  return htmlResponse(
    renderShell({
      title: 'C1 Radar',
      lang: ctx.lang,
      activeNav: 'radar',
      csrfToken: ctx.session.csrfToken,
      content,
    })
  );
});

router.get('/admin/routing', async (_req, _params, ctx) => {
  if (!ctx.session) return redirectResponse('/login');
  const cleanIps = (await ctx.repo.getSetting('global_clean_ips')) || '';
  const content = renderRoutingView(ctx.lang, cleanIps, 'direct');

  return htmlResponse(
    renderShell({
      title: 'Routing',
      lang: ctx.lang,
      activeNav: 'routing',
      csrfToken: ctx.session.csrfToken,
      content,
    })
  );
});

router.get('/admin/settings', async (_req, _params, ctx) => {
  if (!ctx.session) return redirectResponse('/login');
  const settings = await ctx.repo.getAllSettings();
  const content = renderSettingsView(ctx.lang, {
    settings,
    workerVersion: ctx.env.C1_VERSION || '1.0.0',
    migrationVersion: 1,
    d1Healthy: true,
    kvHealthy: Boolean(ctx.env.KV),
  });

  return htmlResponse(
    renderShell({
      title: 'Settings',
      lang: ctx.lang,
      activeNav: 'settings',
      csrfToken: ctx.session.csrfToken,
      content,
    })
  );
});

// ---------------- PROTECTED REST API ENDPOINTS ----------------
router.get('/api/users', async (_req, _params, ctx) => {
  requireAuth(ctx);
  const users = await ctx.repo.listUsers();
  return jsonResponse(users.map(sanitizeUserForResponse));
});

router.post('/api/users', async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const userService = new UserService(ctx.repo);
  const body = await req.json();
  const user = await userService.createUser(body as any);

  await recordAudit(ctx.repo, 'user_create', session.username, { userId: user.id, username: user.username });
  return jsonResponse(sanitizeUserForResponse(user), 201);
});

router.patch('/api/users/:id', async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const userService = new UserService(ctx.repo);
  const body = await req.json();
  await userService.updateUser(params.id, body as any);

  await recordAudit(ctx.repo, 'user_update', session.username, { userId: params.id, updates: body });
  return jsonResponse({ success: true });
});

router.delete('/api/users/:id', async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const userService = new UserService(ctx.repo);
  await userService.deleteUser(params.id);

  await recordAudit(ctx.repo, 'user_delete', session.username, { userId: params.id });
  return jsonResponse({ success: true });
});

router.post('/api/users/:id/toggle', async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const body = (await req.json()) as { enabled?: number };
  const userService = new UserService(ctx.repo);
  await userService.toggleUser(params.id, Boolean(body.enabled));

  await recordAudit(ctx.repo, 'user_toggle', session.username, { userId: params.id, enabled: body.enabled });
  return jsonResponse({ success: true });
});

router.post('/api/users/:id/reset-traffic', async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const userService = new UserService(ctx.repo);
  await userService.resetTraffic(params.id);

  await recordAudit(ctx.repo, 'traffic_reset', session.username, { userId: params.id });
  return jsonResponse({ success: true });
});

router.post('/api/users/:id/rotate-token', async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const userService = new UserService(ctx.repo);
  const token = await userService.rotateSubscriptionToken(params.id);

  await recordAudit(ctx.repo, 'credential_rotate', session.username, { userId: params.id, type: 'sub_token' });
  return jsonResponse({ success: true, token });
});

router.post('/api/users/:id/rotate-vless', async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const userService = new UserService(ctx.repo);
  const uuid = await userService.rotateVlessUuid(params.id);

  await recordAudit(ctx.repo, 'credential_rotate', session.username, { userId: params.id, type: 'vless_uuid' });
  return jsonResponse({ success: true, uuid });
});

router.post('/api/users/:id/rotate-trojan', async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const userService = new UserService(ctx.repo);
  const pass = await userService.rotateTrojanPassword(params.id);

  await recordAudit(ctx.repo, 'credential_rotate', session.username, { userId: params.id, type: 'trojan_password' });
  return jsonResponse({ success: true, pass });
});

router.post('/api/users/:id/rotate-shadowsocks', async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const userService = new UserService(ctx.repo);
  const pass = await userService.rotateShadowsocksPassword(params.id);

  await recordAudit(ctx.repo, 'credential_rotate', session.username, { userId: params.id, type: 'ss_password' });
  return jsonResponse({ success: true, pass });
});

router.get('/api/inbounds', async (_req, _params, ctx) => {
  requireAuth(ctx);
  const inbounds = await ctx.repo.listInbounds();
  return jsonResponse(inbounds);
});

router.post('/api/inbounds', async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const body = (await req.json()) as any;
  const inboundService = new InboundService(ctx.repo);
  const created = await inboundService.createInbound(body);

  await recordAudit(ctx.repo, 'inbound_create', session.username, { inboundId: created.id, name: created.name });
  return jsonResponse(created, 201);
});

router.delete('/api/inbounds/:id', async (req, params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const inboundService = new InboundService(ctx.repo);
  await inboundService.deleteInbound(params.id);

  await recordAudit(ctx.repo, 'inbound_delete', session.username, { inboundId: params.id });
  return jsonResponse({ success: true });
});

router.get('/api/radar/candidates', async (_req, _params, ctx) => {
  requireAuth(ctx);
  const globalCleanIpsStr = (await ctx.repo.getSetting('global_clean_ips')) || '';
  const customPool = globalCleanIpsStr
    .split(/[\r\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const candidates = Array.from(new Set([...customPool, ...RADAR_CANDIDATE_POOLS]));
  return jsonResponse({ candidates });
});

router.post('/api/radar/results', async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const body = (await req.json()) as { results: RadarTestResult[] };
  if (body.results && Array.isArray(body.results)) {
    await ctx.repo.saveRadarResults(body.results);
  }
  return jsonResponse({ success: true });
});

router.post('/api/settings', async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const body = (await req.json()) as { key: string; value: string };
  await ctx.repo.setSetting(body.key, body.value);

  await recordAudit(ctx.repo, 'setting_update', session.username, { key: body.key });
  return jsonResponse({ success: true });
});

router.post('/api/settings/bulk', async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const body = (await req.json()) as Record<string, string>;
  for (const [k, v] of Object.entries(body)) {
    await ctx.repo.setSetting(k, v);
  }

  await recordAudit(ctx.repo, 'settings_bulk_update', session.username, { keys: Object.keys(body) });
  return jsonResponse({ success: true });
});

router.get('/api/backup/export', async (_req, _params, ctx) => {
  requireAuth(ctx);
  const users = await ctx.repo.listUsers();
  const inbounds = await ctx.repo.listInbounds();
  const settings = await ctx.repo.getAllSettings();

  const backupManifest = {
    version: 1,
    exported_at: new Date().toISOString(),
    users: users.map(sanitizeUserForResponse),
    inbounds,
    settings,
  };

  return jsonResponse(backupManifest, 200, {
    'Content-Disposition': 'attachment; filename="c1-proxy-backup.json"',
  });
});

router.post('/api/backup/restore', async (req, _params, ctx) => {
  const session = requireAuth(ctx);
  validateCsrfToken(req, session);

  const body = (await req.json()) as any;
  if (!body || !body.version || !Array.isArray(body.users)) {
    throw new C1Error(ErrorCode.VAL_INVALID_INPUT, 'Invalid backup schema', 400);
  }

  const userService = new UserService(ctx.repo);
  for (const u of body.users) {
    const existing = await ctx.repo.getUserByUsername(u.username);
    if (!existing) {
      await userService.createUser({
        name: u.name,
        username: u.username,
        quota_bytes: u.quota_bytes,
        daily_quota_bytes: u.daily_quota_bytes,
        expires_at: u.expires_at,
        max_ips: u.max_ips,
        clean_ip_mode: u.clean_ip_mode,
        clean_ip: u.clean_ip,
        notes: u.notes,
        protocol_vless_enabled: u.protocol_vless_enabled,
        protocol_trojan_enabled: u.protocol_trojan_enabled,
        protocol_shadowsocks_enabled: u.protocol_shadowsocks_enabled,
      });
    }
  }

  if (body.settings && typeof body.settings === 'object') {
    for (const [k, v] of Object.entries(body.settings)) {
      if (k !== 'session_secret') {
        await ctx.repo.setSetting(k, String(v));
      }
    }
  }

  await recordAudit(ctx.repo, 'backup_restore', session.username, { userCount: body.users.length });
  return jsonResponse({ success: true });
});

router.get('/api/diagnostics', async (_req, _params, ctx) => {
  requireAuth(ctx);
  const settings = await ctx.repo.getAllSettings();
  const userCount = (await ctx.repo.listUsers()).length;
  const inboundCount = (await ctx.repo.listInbounds()).length;

  const diag = {
    worker_version: ctx.env.C1_VERSION || '1.0.0',
    environment: ctx.env.ENVIRONMENT || 'production',
    d1_database: 'connected',
    kv_cache: ctx.env.KV ? 'active' : 'memory_fallback',
    user_count: userCount,
    inbound_count: inboundCount,
    settings: redactSensitiveObject(settings),
    timestamp: new Date().toISOString(),
  };

  return jsonResponse(diag);
});

// ---------------- ROOT CATCH-ALL ----------------
router.get('/', async (_req, _params, ctx) => {
  const adminCount = await ctx.repo.getAdminCount();
  if (adminCount === 0) {
    return redirectResponse('/install');
  }
  if (ctx.session) {
    return redirectResponse('/admin');
  }
  return renderDecoyProbePage();
});

// ---------------- WORKER FETCH DISPATCHER ----------------
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // 1. Run migrations idempotently on edge
      await ensureMigrations(env.DB);

      const repo = new C1Repository(env.DB);
      const url = new URL(request.url);

      // 2. Ensure default inbounds exist
      const inboundService = new InboundService(repo);
      await inboundService.ensureDefaultInbounds(url.hostname);

      // 3. Ensure session secret is initialized
      let sessionSecret: string = env.C1_SESSION_SECRET || '';
      if (!sessionSecret) {
        const storedSecret = await repo.getSetting('session_secret');
        if (storedSecret) {
          sessionSecret = storedSecret;
        } else {
          sessionSecret = randomToken(32);
          await repo.setSetting('session_secret', sessionSecret);
        }
      }

      // 4. Extract and verify session from cookie
      const cookies = parseCookies(request.headers.get('Cookie'));
      const sessionToken = cookies[SESSION_COOKIE_NAME];
      const session = sessionToken ? await verifySessionToken(sessionToken, sessionSecret) : null;

      const lang = getLanguage(request);

      const ctx: RequestContext = {
        env,
        session,
        repo,
        sessionSecret,
        lang,
      };

      const res = await router.handle(request, ctx);
      if (res) {
        return res;
      }

      return new Response('Not Found', { status: 404 });
    } catch (err: unknown) {
      if (err instanceof C1Error) {
        return jsonResponse(
          {
            error: true,
            code: err.code,
            message: err.safeMessage,
          },
          err.status
        );
      }

      console.error('[C1-FATAL]', err);
      return jsonResponse(
        {
          error: true,
          code: 'C1-SYS-500',
          message: 'An unexpected internal error occurred',
        },
        500
      );
    }
  },
};
