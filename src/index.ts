import type { Env, SessionData } from './types';
import { ensureSchema } from './database/schema';
import { addUsage, audit, createAdmin, createUser, deleteUser, getAdmin, getUserByToken, isInstalled, listSettings, listUsers, setSetting, updateUser, userIsAllowed } from './database/repo';
import { hashPassword, timingSafeEqual, verifyPassword } from './auth/crypto';
import { canAttemptLogin, clearLoginFailures, recordLoginFailure } from './auth/login';
import { clearSessionCookie, createSession, sessionCookie, validCsrf, verifySession } from './auth/session';
import { decoyPage, dashboardPage, installPage, loginPage, userStatusPage } from './app/pages';
import { html, json, redirect } from './app/http';
import { handleVlessWebSocket } from './proxy/handler';
import { buildSubscription } from './subscriptions/generate';

function ipOf(request: Request) { return request.headers.get('cf-connecting-ip') || 'unknown'; }
function claimRequired(env: Env) { const x = env.C1_CLAIM_TOKEN || ''; return x.length >= 8 && !x.startsWith('replace-') && x !== 'change-me'; }
async function bodyJson(request: Request) { try { return await request.json() as Record<string, unknown>; } catch { return {}; } }

async function requireAdmin(env: Env, request: Request): Promise<SessionData | Response> {
  const session = await verifySession(env, request);
  if (!session) return json({ error: 'Unauthorized' }, 401);
  return session;
}

async function apiRouter(request: Request, env: Env, session: SessionData, path: string): Promise<Response> {
  if (!['GET','HEAD'].includes(request.method) && !validCsrf(request, session)) return json({ error: 'CSRF check failed' }, 403);
  if (path === '/api/users' && request.method === 'GET') {
    const users = await listUsers(env);
    const origin = new URL(request.url).origin;
    return json({ users: users.map((u) => ({ ...u, status: userIsAllowed(u).ok ? 'active' : userIsAllowed(u).reason, subscription_url: `${origin}/s/${u.token}` })) });
  }
  if (path === '/api/users' && request.method === 'POST') {
    const b = await bodyJson(request);
    const name = String(b.name || '').trim();
    const username = String(b.username || '').trim().toLowerCase();
    if (!name || !/^[a-z0-9_-]{2,32}$/.test(username)) return json({ error: 'Invalid name or username' }, 400);
    try {
      const user = await createUser(env, {
        name, username,
        quota_bytes: Number(b.quota_bytes) || 0,
        daily_quota_bytes: Number(b.daily_quota_bytes) || 0,
        expires_at: String(b.expires_at || ''),
        clean_ip: String(b.clean_ip || ''),
        notes: String(b.notes || ''),
      });
      await audit(env, 'user.create', user.id);
      return json({ user }, 201);
    } catch (e) {
      return json({ error: String(e).includes('UNIQUE') ? 'Username already exists' : 'Could not create user' }, 400);
    }
  }
  const userMatch = path.match(/^\/api\/users\/([a-f0-9-]+)$/i);
  if (userMatch && request.method === 'PATCH') {
    const user = await updateUser(env, userMatch[1], await bodyJson(request));
    if (!user) return json({ error: 'Not found' }, 404);
    await audit(env, 'user.update', user.id);
    return json({ user });
  }
  if (userMatch && request.method === 'DELETE') {
    await deleteUser(env, userMatch[1]);
    await audit(env, 'user.delete', userMatch[1]);
    return json({ ok: true });
  }
  if (path === '/api/settings' && request.method === 'GET') return json(await listSettings(env));
  if (path === '/api/settings' && request.method === 'PUT') {
    const b = await bodyJson(request);
    if ('node_prefix' in b) await setSetting(env, 'node_prefix', String(b.node_prefix || '').slice(0, 40));
    if ('clean_ips' in b) await setSetting(env, 'clean_ips', String(b.clean_ips || '').slice(0, 8000));
    await audit(env, 'settings.update');
    return json({ ok: true });
  }
  if (path === '/api/backup' && request.method === 'GET') {
    const payload = { exported_at: new Date().toISOString(), version: '0.1.0', settings: await listSettings(env), users: await listUsers(env) };
    return new Response(JSON.stringify(payload, null, 2), { headers: { 'content-type': 'application/json', 'content-disposition': `attachment; filename="c1-backup-${new Date().toISOString().slice(0,10)}.json"`, 'cache-control': 'no-store' } });
  }
  return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/healthz') return new Response('ok', { headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' } });

    try { await ensureSchema(env); } catch { return new Response('Storage unavailable', { status: 503 }); }

    if (path === '/install') {
      if (await isInstalled(env)) return redirect('/login');
      const required = claimRequired(env);
      if (request.method === 'GET') return html(installPage(required, url.searchParams.get('claim') || ''));
      if (request.method === 'POST') {
        const form = await request.formData();
        const password = String(form.get('password') || '');
        const password2 = String(form.get('password2') || '');
        const claim = String(form.get('claim') || '');
        if (required && !timingSafeEqual(claim, env.C1_CLAIM_TOKEN!)) return html(installPage(required, '', 'Invalid claim token'), 403);
        if (password.length < 10) return html(installPage(required, '', 'Use at least 10 characters'), 400);
        if (password !== password2) return html(installPage(required, '', 'Passwords do not match'), 400);
        const h = await hashPassword(password);
        await createAdmin(env, h.saltHex, h.hashHex, h.iterations);
        await setSetting(env, 'node_prefix', 'C1');
        await setSetting(env, 'clean_ips', '');
        await audit(env, 'install.complete');
        const s = await createSession(env);
        return redirect('/admin', { 'set-cookie': sessionCookie(s.token) });
      }
      return new Response('Method not allowed', { status: 405 });
    }

    if (!(await isInstalled(env))) {
      if (path.startsWith('/ws/') || path.startsWith('/s/') || path.startsWith('/sub/')) return new Response('Not ready', { status: 503 });
      return redirect('/install');
    }

    if (path === '/login') {
      if (request.method === 'GET') {
        if (await verifySession(env, request)) return redirect('/admin');
        return html(loginPage());
      }
      if (request.method === 'POST') {
        const ip = ipOf(request);
        if (!(await canAttemptLogin(env, ip))) return html(loginPage('Too many attempts. Try later.'), 429);
        const form = await request.formData();
        const password = String(form.get('password') || '');
        const admin = await getAdmin(env);
        const ok = !!admin && await verifyPassword(password, admin.password_salt, admin.password_hash, admin.password_iterations);
        if (!ok) {
          await recordLoginFailure(env, ip);
          return html(loginPage('Incorrect password'), 401);
        }
        await clearLoginFailures(env, ip);
        const s = await createSession(env);
        await audit(env, 'login.success');
        return redirect('/admin', { 'set-cookie': sessionCookie(s.token) });
      }
    }

    if (path === '/logout' && request.method === 'POST') {
      const session = await verifySession(env, request);
      if (!session || !validCsrf(request, session)) return json({ error: 'Unauthorized' }, 401);
      return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
    }

    if (path === '/admin') {
      const session = await verifySession(env, request);
      if (!session) return redirect('/login');
      return html(dashboardPage(session));
    }

    if (path.startsWith('/api/')) {
      const auth = await requireAdmin(env, request);
      if (auth instanceof Response) return auth;
      return apiRouter(request, env, auth, path);
    }

    const statusMatch = path.match(/^\/status\/([a-f0-9]+)$/i);
    if (statusMatch) {
      const user = await getUserByToken(env, statusMatch[1]);
      if (!user) return new Response('Not found', { status: 404 });
      const st = userIsAllowed(user);
      return html(userStatusPage(user, st.ok ? 'active' : st.reason || 'inactive'));
    }

    const subMatch = path.match(/^\/(?:s|sub)\/([a-f0-9]+)$/i);
    if (subMatch) {
      const user = await getUserByToken(env, subMatch[1]);
      if (!user) return new Response('Not found', { status: 404 });
      const st = userIsAllowed(user);
      if (!st.ok) return new Response('Subscription inactive', { status: 403 });
      return buildSubscription(env, request, user);
    }

    const wsMatch = path.match(/^\/ws\/([a-f0-9]+)$/i);
    if (wsMatch) {
      const user = await getUserByToken(env, wsMatch[1]);
      if (!user) return new Response('Not found', { status: 404 });
      return handleVlessWebSocket(request, env, ctx, user);
    }

    if (path === '/' || path === '/index.html') return html(decoyPage());
    return new Response('Not found', { status: 404 });
  },
};
