import { describe, it, expect } from 'vitest';
import { evaluateUserPolicy } from '../src/users/policy';
import { validateOutboundTarget } from '../src/routing/target-policy';
import { StreamAccounting } from '../src/transports/websocket/stream';
import { UserRecord } from '../src/database/schema';
import { ErrorCode } from '../src/app/errors';

describe('User Access & Quota Policy', () => {
  const baseUser: UserRecord = {
    id: 'user-1',
    name: 'Test User',
    username: 'testuser',
    enabled: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subscription_token: 'sub-token-123',
    vless_uuid: '11111111-1111-1111-1111-111111111111',
    trojan_password: 'trojan-pass-123',
    shadowsocks_password: 'ss-pass-123',
    shadowsocks_method: 'aes-128-gcm',
    quota_bytes: 10 * 1024 * 1024 * 1024, // 10 GB
    used_bytes: 5 * 1024 * 1024 * 1024,  // 5 GB
    daily_quota_bytes: 1 * 1024 * 1024 * 1024, // 1 GB
    daily_used_bytes: 500 * 1024 * 1024, // 500 MB
    daily_key: new Date().toISOString().slice(0, 10),
    expires_at: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days later
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

  it('allows active user within limits', () => {
    const res = evaluateUserPolicy(baseUser, 'vless');
    expect(res.allowed).toBe(true);
  });

  it('blocks disabled user', () => {
    const disabled = { ...baseUser, enabled: 0 };
    const res = evaluateUserPolicy(disabled, 'vless');
    expect(res.allowed).toBe(false);
    expect(res.code).toBe(ErrorCode.PROTO_ACCOUNT_DISABLED);
  });

  it('blocks when specific protocol is disabled', () => {
    const noTrojan = { ...baseUser, protocol_trojan_enabled: 0 };
    expect(evaluateUserPolicy(noTrojan, 'trojan').allowed).toBe(false);
    expect(evaluateUserPolicy(noTrojan, 'vless').allowed).toBe(true);
  });

  it('blocks when total quota is exceeded', () => {
    const overQuota = { ...baseUser, used_bytes: baseUser.quota_bytes + 100 };
    const res = evaluateUserPolicy(overQuota, 'vless');
    expect(res.allowed).toBe(false);
    expect(res.code).toBe(ErrorCode.PROTO_QUOTA_EXCEEDED);
  });

  it('blocks when daily quota is exceeded', () => {
    const overDaily = {
      ...baseUser,
      daily_used_bytes: baseUser.daily_quota_bytes + 1,
      daily_key: new Date().toISOString().slice(0, 10),
    };
    const res = evaluateUserPolicy(overDaily, 'vless');
    expect(res.allowed).toBe(false);
    expect(res.code).toBe(ErrorCode.PROTO_QUOTA_EXCEEDED);
  });

  it('blocks expired user', () => {
    const expired = { ...baseUser, expires_at: new Date(Date.now() - 1000).toISOString() };
    const res = evaluateUserPolicy(expired, 'vless');
    expect(res.allowed).toBe(false);
    expect(res.code).toBe(ErrorCode.PROTO_EXPIRED);
  });
});

describe('Target Security Policy', () => {
  it('allows legitimate public internet targets', () => {
    expect(() => validateOutboundTarget('1.1.1.1', 443)).not.toThrow();
    expect(() => validateOutboundTarget('github.com', 443)).not.toThrow();
    expect(() => validateOutboundTarget('8.8.8.8', 53)).not.toThrow();
  });

  it('blocks RFC1918 and loopback targets to prevent SSRF', () => {
    expect(() => validateOutboundTarget('127.0.0.1', 80)).toThrow();
    expect(() => validateOutboundTarget('10.0.0.5', 443)).toThrow();
    expect(() => validateOutboundTarget('192.168.1.1', 443)).toThrow();
    expect(() => validateOutboundTarget('172.16.0.1', 443)).toThrow();
    expect(() => validateOutboundTarget('localhost', 8080)).toThrow();
  });

  it('blocks abusive SMTP ports', () => {
    expect(() => validateOutboundTarget('mail.example.com', 25)).toThrow();
    expect(() => validateOutboundTarget('mail.example.com', 465)).toThrow();
  });
});

describe('Stream Buffered Accounting', () => {
  it('buffers byte counts and flushes when exceeding threshold', async () => {
    let flushedUp = 0;
    let flushedDown = 0;

    const threshold = 1000;
    const accounting = new StreamAccounting(threshold, (up, down) => {
      flushedUp += up;
      flushedDown += down;
    });

    // Add 400 bytes - below threshold
    accounting.addUpload(400);
    expect(flushedUp).toBe(0);

    // Add 700 bytes - total 1100 >= 1000 threshold
    accounting.addDownload(700);
    // Allow microtask to run
    await new Promise((r) => setTimeout(r, 10));

    expect(flushedUp).toBe(400);
    expect(flushedDown).toBe(700);

    // Explicit flush on close
    accounting.addUpload(150);
    await accounting.flush();
    expect(flushedUp).toBe(550);
  });
});
