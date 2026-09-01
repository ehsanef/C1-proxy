import type { Env, UserRecord } from '../types';
import { getSetting } from '../database/repo';
import { base64EncodeUtf8 } from '../utils/encoding';
import { parseCleanTargets } from '../utils/network';

interface NodeInfo {
  name: string;
  address: string;
  port: number;
  host: string;
  uuid: string;
  path: string;
}

async function nodesFor(env: Env, request: Request, user: UserRecord): Promise<NodeInfo[]> {
  const url = new URL(request.url);
  const host = url.hostname;
  const nodePrefix = (await getSetting(env, 'node_prefix', 'C1')).trim() || 'C1';
  const globalClean = await getSetting(env, 'clean_ips', '');
  const targets = parseCleanTargets(user.clean_ip || globalClean);
  if (!targets.length) targets.push(host);
  return targets.slice(0, 12).map((target, i) => {
    const clean = target.trim();
    let address = clean;
    let port = 443;
    const match = clean.match(/^(.+):(\d{1,5})$/);
    if (match && !clean.includes(']:')) {
      address = match[1];
      const parsed = Number(match[2]);
      if (parsed >= 1 && parsed <= 65535) port = parsed;
    }
    return { name: `${nodePrefix} ${user.name}${targets.length>1?` ${i+1}`:''}`, address, port, host, uuid: user.uuid, path: `/ws/${user.token}?ed=2560` };
  });
}

function vlessUrl(n: NodeInfo): string {
  const q = new URLSearchParams({ encryption: 'none', security: 'tls', type: 'ws', host: n.host, sni: n.host, fp: 'randomized', path: n.path });
  return `vless://${n.uuid}@${n.address}:${n.port}?${q.toString()}#${encodeURIComponent(n.name)}`;
}

function clash(nodes: NodeInfo[]): string {
  const lines = ['mixed-port: 7890','allow-lan: false','mode: rule','log-level: warning','proxies:'];
  for (const n of nodes) {
    lines.push(`  - name: ${JSON.stringify(n.name)}`);
    lines.push('    type: vless');
    lines.push(`    server: ${JSON.stringify(n.address)}`);
    lines.push(`    port: ${n.port}`);
    lines.push(`    uuid: ${JSON.stringify(n.uuid)}`);
    lines.push('    network: ws');
    lines.push('    tls: true');
    lines.push(`    servername: ${JSON.stringify(n.host)}`);
    lines.push('    udp: false');
    lines.push('    ws-opts:');
    lines.push(`      path: ${JSON.stringify(n.path)}`);
    lines.push('      headers:');
    lines.push(`        Host: ${JSON.stringify(n.host)}`);
  }
  lines.push('proxy-groups:');
  lines.push('  - name: C1');
  lines.push('    type: select');
  lines.push(`    proxies: [${nodes.map((n) => JSON.stringify(n.name)).join(', ')}]`);
  lines.push('rules:');
  lines.push('  - MATCH,C1');
  return lines.join('\n');
}

function singbox(nodes: NodeInfo[]): string {
  const outbounds = nodes.map((n, i) => ({
    type: 'vless', tag: `c1-${i+1}`, server: n.address, server_port: n.port, uuid: n.uuid,
    tls: { enabled: true, server_name: n.host },
    transport: { type: 'ws', path: n.path, headers: { Host: n.host } },
  }));
  return JSON.stringify({ log: { level: 'warn' }, outbounds: [...outbounds, { type: 'selector', tag: 'C1', outbounds: outbounds.map((o) => o.tag) }] }, null, 2);
}

function detectFormat(request: Request): string {
  const explicit = new URL(request.url).searchParams.get('format');
  if (explicit) return explicit.toLowerCase();
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (ua.includes('clash') || ua.includes('mihomo') || ua.includes('meta')) return 'clash';
  if (ua.includes('sing-box') || ua.includes('singbox')) return 'singbox';
  return 'base64';
}

export async function buildSubscription(env: Env, request: Request, user: UserRecord): Promise<Response> {
  const nodes = await nodesFor(env, request, user);
  const format = detectFormat(request);
  let body: string;
  let contentType = 'text/plain; charset=utf-8';
  if (format === 'clash' || format === 'yaml') {
    body = clash(nodes); contentType = 'text/yaml; charset=utf-8';
  } else if (format === 'singbox' || format === 'sing-box' || format === 'json') {
    body = singbox(nodes); contentType = 'application/json; charset=utf-8';
  } else if (format === 'raw') {
    body = nodes.map(vlessUrl).join('\n');
  } else {
    body = base64EncodeUtf8(nodes.map(vlessUrl).join('\n'));
  }
  return new Response(body, {
    headers: {
      'content-type': contentType,
      'cache-control': 'no-store',
      'profile-update-interval': '6',
      'subscription-userinfo': `upload=0; download=${user.used_bytes}; total=${user.quota_bytes || 0}; expire=${user.expires_at ? Math.floor(Date.parse(user.expires_at)/1000) : 0}`,
    },
  });
}
