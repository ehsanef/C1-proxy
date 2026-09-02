import { describe, it, expect } from 'vitest';
import { buildVlessUri, buildTrojanUri, buildShadowsocksUri } from '../src/subscriptions/uri';
import { generateRawSubscription } from '../src/subscriptions/raw';
import { generateBase64Subscription } from '../src/subscriptions/base64';
import { generateClashSubscription } from '../src/subscriptions/clash';
import { generateSingboxSubscription } from '../src/subscriptions/singbox';
import { detectSubscriptionFormat } from '../src/subscriptions/auto';
import { InboundRecord, UserRecord } from '../src/database/schema';

describe('Universal Subscription Engine', () => {
  const dummyUser: UserRecord = {
    id: 'u1',
    name: 'Ehsan',
    username: 'ehsan',
    enabled: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subscription_token: 'sub-token-xyz',
    vless_uuid: '11111111-2222-3333-4444-555555555555',
    trojan_password: 'trojan-secret-pass',
    shadowsocks_password: 'ss-secret-pass',
    shadowsocks_method: 'aes-128-gcm',
    quota_bytes: 107374182400,
    used_bytes: 104857600,
    daily_quota_bytes: 0,
    daily_used_bytes: 0,
    daily_key: '',
    expires_at: null,
    max_ips: 2,
    max_connections: 5,
    clean_ip_mode: 'auto',
    clean_ip: '',
    notes: '',
    protocol_vless_enabled: 1,
    protocol_trojan_enabled: 1,
    protocol_shadowsocks_enabled: 1,
    last_seen_at: null,
  };

  const vlessInbound: InboundRecord = {
    id: 'in-vless',
    name: 'Edge VLESS',
    enabled: 1,
    protocol: 'vless',
    transport: 'ws',
    tls_mode: 'tls',
    port: 443,
    path_template: '/edge/{token}/vless',
    host: 'c1.example.com',
    sni: 'c1.example.com',
    fingerprint: 'chrome',
    allow_udp: 1,
    notes: '',
    created_at: '',
    updated_at: '',
  };

  const trojanInbound: InboundRecord = {
    id: 'in-trojan',
    name: 'Edge Trojan',
    enabled: 1,
    protocol: 'trojan',
    transport: 'ws',
    tls_mode: 'tls',
    port: 443,
    path_template: '/edge/{token}/trojan',
    host: 'c1.example.com',
    sni: 'c1.example.com',
    fingerprint: 'chrome',
    allow_udp: 1,
    notes: '',
    created_at: '',
    updated_at: '',
  };

  const ssInbound: InboundRecord = {
    id: 'in-ss',
    name: 'Edge SS',
    enabled: 1,
    protocol: 'shadowsocks',
    transport: 'ws',
    tls_mode: 'tls',
    port: 443,
    path_template: '/edge/{token}/ss',
    host: 'c1.example.com',
    sni: 'c1.example.com',
    fingerprint: 'chrome',
    allow_udp: 1,
    notes: '',
    created_at: '',
    updated_at: '',
  };

  const nodeOptions = [
    { user: dummyUser, inbound: vlessInbound, serverHost: 'c1.example.com' },
    { user: dummyUser, inbound: trojanInbound, serverHost: 'c1.example.com' },
    { user: dummyUser, inbound: ssInbound, serverHost: 'c1.example.com' },
  ];

  it('generates valid direct protocol URIs', () => {
    const vless = buildVlessUri(nodeOptions[0]);
    expect(vless.startsWith('vless://11111111-2222-3333-4444-555555555555@c1.example.com:443')).toBe(true);
    expect(vless).toContain('type=ws');
    expect(vless).toContain('security=tls');
    expect(vless).toContain('path=%2Fedge%2Fsub-token-xyz%2Fvless');

    const trojan = buildTrojanUri(nodeOptions[1]);
    expect(trojan.startsWith('trojan://trojan-secret-pass@c1.example.com:443')).toBe(true);
    expect(trojan).toContain('path=%2Fedge%2Fsub-token-xyz%2Ftrojan');

    const ss = buildShadowsocksUri(nodeOptions[2]);
    expect(ss.startsWith('ss://')).toBe(true);
    expect(ss).toContain('plugin=');
  });

  it('generates raw and base64 subscription outputs', () => {
    const raw = generateRawSubscription(nodeOptions);
    const lines = raw.split('\n');
    expect(lines.length).toBe(3);
    expect(lines[0].startsWith('vless://')).toBe(true);
    expect(lines[1].startsWith('trojan://')).toBe(true);
    expect(lines[2].startsWith('ss://')).toBe(true);

    const b64 = generateBase64Subscription(nodeOptions);
    const decoded = atob(b64);
    expect(decoded).toBe(raw);
  });

  it('generates valid Clash Meta / Mihomo YAML', () => {
    const yaml = generateClashSubscription(nodeOptions);
    expect(yaml).toContain('proxies:');
    expect(yaml).toContain('proxy-groups:');
    expect(yaml).toContain('rules:');
    expect(yaml).toContain('type: vless');
    expect(yaml).toContain('type: trojan');
    expect(yaml).toContain('type: ss');
    expect(yaml).toContain('C1-AUTO');
    expect(yaml).toContain('C1-SELECT');
  });

  it('generates valid sing-box JSON', () => {
    const jsonStr = generateSingboxSubscription(nodeOptions);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.outbounds).toBeDefined();
    expect(parsed.outbounds.length).toBeGreaterThan(3);

    const vlessOutbound = parsed.outbounds.find((o: any) => o.type === 'vless');
    expect(vlessOutbound).toBeDefined();
    expect(vlessOutbound.uuid).toBe(dummyUser.vless_uuid);
    expect(vlessOutbound.transport.type).toBe('ws');

    const trojanOutbound = parsed.outbounds.find((o: any) => o.type === 'trojan');
    expect(trojanOutbound).toBeDefined();
    expect(trojanOutbound.password).toBe(dummyUser.trojan_password);
  });

  it('auto-detects format based on User-Agent and query params', () => {
    // Explicit query param
    const clashReq = new Request('https://c1.test/s/token?format=clash');
    expect(detectSubscriptionFormat(clashReq)).toBe('clash');

    // Clash UA
    const clashUaReq = new Request('https://c1.test/s/token', {
      headers: { 'User-Agent': 'ClashMeta/1.18.0' },
    });
    expect(detectSubscriptionFormat(clashUaReq)).toBe('clash');

    // sing-box UA
    const singboxReq = new Request('https://c1.test/s/token', {
      headers: { 'User-Agent': 'sing-box/1.9.0' },
    });
    expect(detectSubscriptionFormat(singboxReq)).toBe('singbox');

    // Default
    const defaultReq = new Request('https://c1.test/s/token');
    expect(detectSubscriptionFormat(defaultReq)).toBe('base64');
  });
});
