/**
 * sing-box (v1.8+) JSON subscription generator.
 */

import { NodeConfigOptions, buildNodeName, resolveInboundPath } from './uri';

export function generateSingboxSubscription(nodeOptions: NodeConfigOptions[]): string {
  const outbounds: Record<string, unknown>[] = [];
  const nodeTags: string[] = [];

  for (const opt of nodeOptions) {
    const { user, inbound, serverHost, cleanIp, customName } = opt;
    const tag = customName || buildNodeName(user, inbound, cleanIp ? `Clean (${cleanIp})` : '');
    const server = cleanIp || inbound.host || serverHost;
    const server_port = inbound.port || 443;
    const host = inbound.host || serverHost;
    const path = resolveInboundPath(inbound.path_template, user.subscription_token);

    if (inbound.protocol === 'vless' && user.protocol_vless_enabled) {
      outbounds.push({
        type: 'vless',
        tag,
        server,
        server_port,
        uuid: user.vless_uuid,
        flow: '',
        packet_encoding: 'xudp',
        tls: {
          enabled: inbound.tls_mode === 'tls',
          server_name: inbound.sni || host,
          insecure: false,
          utls: {
            enabled: true,
            fingerprint: inbound.fingerprint || 'chrome',
          },
        },
        transport: {
          type: 'ws',
          path,
          headers: {
            Host: host,
          },
        },
      });
      nodeTags.push(tag);
    } else if (inbound.protocol === 'trojan' && user.protocol_trojan_enabled) {
      outbounds.push({
        type: 'trojan',
        tag,
        server,
        server_port,
        password: user.trojan_password,
        tls: {
          enabled: inbound.tls_mode === 'tls',
          server_name: inbound.sni || host,
          insecure: false,
          utls: {
            enabled: true,
            fingerprint: inbound.fingerprint || 'chrome',
          },
        },
        transport: {
          type: 'ws',
          path,
          headers: {
            Host: host,
          },
        },
      });
      nodeTags.push(tag);
    } else if (inbound.protocol === 'shadowsocks' && user.protocol_shadowsocks_enabled) {
      outbounds.push({
        type: 'shadowsocks',
        tag,
        server,
        server_port,
        method: user.shadowsocks_method,
        password: user.shadowsocks_password,
        plugin: 'v2ray-plugin',
        plugin_opts: `tls;mode=websocket;path=${path};host=${host}`,
      });
      nodeTags.push(tag);
    }
  }

  // Composite outbounds
  const config = {
    version: 1,
    outbounds: [
      {
        type: 'selector',
        tag: 'select',
        outbounds: ['auto', ...nodeTags, 'direct'],
        default: 'auto',
      },
      {
        type: 'urltest',
        tag: 'auto',
        outbounds: [...nodeTags],
        url: 'http://www.gstatic.com/generate_204',
        interval: '3m',
        tolerance: 50,
      },
      ...outbounds,
      {
        type: 'direct',
        tag: 'direct',
      },
      {
        type: 'block',
        tag: 'block',
      },
    ],
  };

  return JSON.stringify(config, null, 2);
}
