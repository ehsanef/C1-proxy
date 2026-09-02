/**
 * Standard protocol URI builders for VLESS, Trojan, and Shadowsocks.
 */

import { InboundRecord, UserRecord } from '../database/schema';
import { bytesToBase64, stringToBytes } from '../utils/bytes';

export interface NodeConfigOptions {
  user: UserRecord;
  inbound: InboundRecord;
  serverHost: string;
  cleanIp?: string;
  customName?: string;
}

export function buildNodeName(user: UserRecord, inbound: InboundRecord, suffix = ''): string {
  const parts = ['C1', user.name || user.username, inbound.name];
  if (suffix) {
    parts.push(suffix);
  }
  return parts.join(' - ');
}

export function resolveInboundPath(template: string, token: string): string {
  return template.replace('{token}', token);
}

export function buildVlessUri(options: NodeConfigOptions): string {
  const { user, inbound, serverHost, cleanIp, customName } = options;
  const address = cleanIp || inbound.host || serverHost;
  const port = inbound.port || 443;
  const host = inbound.host || serverHost;
  const sni = inbound.sni || serverHost;
  const path = resolveInboundPath(inbound.path_template, user.subscription_token);
  const nodeName = customName || buildNodeName(user, inbound, cleanIp ? `Clean (${cleanIp})` : '');

  const params = new URLSearchParams();
  params.set('type', 'ws');
  params.set('security', inbound.tls_mode === 'tls' ? 'tls' : 'none');
  params.set('path', path);
  if (host) params.set('host', host);
  if (sni) params.set('sni', sni);
  if (inbound.fingerprint) params.set('fp', inbound.fingerprint);

  return `vless://${user.vless_uuid}@${address}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`;
}

export function buildTrojanUri(options: NodeConfigOptions): string {
  const { user, inbound, serverHost, cleanIp, customName } = options;
  const address = cleanIp || inbound.host || serverHost;
  const port = inbound.port || 443;
  const host = inbound.host || serverHost;
  const sni = inbound.sni || serverHost;
  const path = resolveInboundPath(inbound.path_template, user.subscription_token);
  const nodeName = customName || buildNodeName(user, inbound, cleanIp ? `Clean (${cleanIp})` : '');

  const params = new URLSearchParams();
  params.set('type', 'ws');
  params.set('security', inbound.tls_mode === 'tls' ? 'tls' : 'none');
  params.set('path', path);
  if (host) params.set('host', host);
  if (sni) params.set('sni', sni);
  if (inbound.fingerprint) params.set('fp', inbound.fingerprint);

  return `trojan://${user.trojan_password}@${address}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`;
}

export function buildShadowsocksUri(options: NodeConfigOptions): string {
  const { user, inbound, serverHost, cleanIp, customName } = options;
  const address = cleanIp || inbound.host || serverHost;
  const port = inbound.port || 443;
  const host = inbound.host || serverHost;
  const path = resolveInboundPath(inbound.path_template, user.subscription_token);
  const nodeName = customName || buildNodeName(user, inbound, cleanIp ? `Clean (${cleanIp})` : '');

  // SIP002 format: ss://BASE64(method:password)@address:port/?plugin=...#name
  const userInfo = `${user.shadowsocks_method}:${user.shadowsocks_password}`;
  const userB64 = bytesToBase64(stringToBytes(userInfo)).replace(/=/g, '');

  const pluginOpts = `v2ray-plugin;tls;mode=websocket;path=${path};host=${host}`;

  return `ss://${userB64}@${address}:${port}?plugin=${encodeURIComponent(pluginOpts)}#${encodeURIComponent(nodeName)}`;
}
