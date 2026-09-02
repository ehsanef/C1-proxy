/**
 * Clash Meta / Mihomo YAML subscription generator.
 * Zero external dependencies, pure TypeScript YAML generator.
 */

import { NodeConfigOptions, buildNodeName, resolveInboundPath } from './uri';

export function generateClashSubscription(nodeOptions: NodeConfigOptions[]): string {
  const proxies: Record<string, unknown>[] = [];
  const proxyNames: string[] = [];

  for (const opt of nodeOptions) {
    const { user, inbound, serverHost, cleanIp, customName } = opt;
    const name = customName || buildNodeName(user, inbound, cleanIp ? `Clean (${cleanIp})` : '');
    const server = cleanIp || inbound.host || serverHost;
    const port = inbound.port || 443;
    const host = inbound.host || serverHost;
    const path = resolveInboundPath(inbound.path_template, user.subscription_token);

    if (inbound.protocol === 'vless' && user.protocol_vless_enabled) {
      proxies.push({
        name,
        type: 'vless',
        server,
        port,
        uuid: user.vless_uuid,
        network: 'ws',
        tls: inbound.tls_mode === 'tls',
        udp: inbound.allow_udp === 1,
        servername: inbound.sni || host,
        'client-fingerprint': inbound.fingerprint || 'chrome',
        'ws-opts': {
          path,
          headers: {
            Host: host,
          },
        },
      });
      proxyNames.push(name);
    } else if (inbound.protocol === 'trojan' && user.protocol_trojan_enabled) {
      proxies.push({
        name,
        type: 'trojan',
        server,
        port,
        password: user.trojan_password,
        network: 'ws',
        sni: inbound.sni || host,
        udp: inbound.allow_udp === 1,
        'client-fingerprint': inbound.fingerprint || 'chrome',
        'ws-opts': {
          path,
          headers: {
            Host: host,
          },
        },
      });
      proxyNames.push(name);
    } else if (inbound.protocol === 'shadowsocks' && user.protocol_shadowsocks_enabled) {
      proxies.push({
        name,
        type: 'ss',
        server,
        port,
        cipher: user.shadowsocks_method,
        password: user.shadowsocks_password,
        plugin: 'v2ray-plugin',
        'plugin-opts': {
          mode: 'websocket',
          tls: true,
          host,
          path,
        },
      });
      proxyNames.push(name);
    }
  }

  // Safe fallback if no proxies enabled
  if (proxyNames.length === 0) {
    proxyNames.push('DIRECT');
  }

  return formatClashYaml(proxies, proxyNames);
}

function formatClashYaml(proxies: Record<string, unknown>[], proxyNames: string[]): string {
  const lines: string[] = [
    '# C1 Proxy Generated Clash Meta / Mihomo Profile',
    'port: 7890',
    'socks-port: 7891',
    'allow-lan: true',
    'mode: rule',
    'log-level: info',
    'external-controller: 127.0.0.1:9090',
    '',
    'proxies:',
  ];

  for (const p of proxies) {
    lines.push(`  - name: "${escapeYaml(p.name as string)}"`);
    lines.push(`    type: ${p.type}`);
    lines.push(`    server: ${p.server}`);
    lines.push(`    port: ${p.port}`);

    if (p.uuid) lines.push(`    uuid: ${p.uuid}`);
    if (p.password) lines.push(`    password: "${escapeYaml(p.password as string)}"`);
    if (p.cipher) lines.push(`    cipher: ${p.cipher}`);
    if (p.network) lines.push(`    network: ${p.network}`);
    if (p.tls !== undefined) lines.push(`    tls: ${p.tls}`);
    if (p.udp !== undefined) lines.push(`    udp: ${p.udp}`);
    if (p.servername) lines.push(`    servername: ${p.servername}`);
    if (p.sni) lines.push(`    sni: ${p.sni}`);
    if (p['client-fingerprint']) lines.push(`    client-fingerprint: ${p['client-fingerprint']}`);

    if (p['ws-opts']) {
      const ws = p['ws-opts'] as { path: string; headers: Record<string, string> };
      lines.push('    ws-opts:');
      lines.push(`      path: "${escapeYaml(ws.path)}"`);
      lines.push('      headers:');
      for (const [k, v] of Object.entries(ws.headers)) {
        lines.push(`        ${k}: "${escapeYaml(v)}"`);
      }
    }

    if (p.plugin) {
      lines.push(`    plugin: ${p.plugin}`);
      if (p['plugin-opts']) {
        const po = p['plugin-opts'] as Record<string, unknown>;
        lines.push('    plugin-opts:');
        for (const [k, v] of Object.entries(po)) {
          lines.push(`      ${k}: ${typeof v === 'boolean' ? v : `"${escapeYaml(String(v))}"`}`);
        }
      }
    }
  }

  lines.push('');
  lines.push('proxy-groups:');
  lines.push('  - name: C1-SELECT');
  lines.push('    type: select');
  lines.push('    proxies:');
  lines.push('      - C1-AUTO');
  for (const name of proxyNames) {
    lines.push(`      - "${escapeYaml(name)}"`);
  }

  lines.push('  - name: C1-AUTO');
  lines.push('    type: url-test');
  lines.push('    url: http://www.gstatic.com/generate_204');
  lines.push('    interval: 300');
  lines.push('    tolerance: 50');
  lines.push('    proxies:');
  for (const name of proxyNames) {
    lines.push(`      - "${escapeYaml(name)}"`);
  }

  lines.push('');
  lines.push('rules:');
  lines.push('  - GEOIP,LAN,DIRECT');
  lines.push('  - MATCH,C1-SELECT');

  return lines.join('\n');
}

function escapeYaml(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
