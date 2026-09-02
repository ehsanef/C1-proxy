/**
 * User access, quota, expiration, and IP/connection limit policies.
 */

import { UserRecord } from '../database/schema';
import { C1Error, ErrorCode } from '../app/errors';

export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
  code?: (typeof ErrorCode)[keyof typeof ErrorCode];
}

export function evaluateUserPolicy(
  user: UserRecord,
  protocol: 'vless' | 'trojan' | 'shadowsocks'
): PolicyCheckResult {
  // 1. Enabled check
  if (!user.enabled) {
    return { allowed: false, reason: 'User account is disabled', code: ErrorCode.PROTO_ACCOUNT_DISABLED };
  }

  // 2. Protocol specific check
  if (protocol === 'vless' && !user.protocol_vless_enabled) {
    return { allowed: false, reason: 'VLESS protocol disabled for this user', code: ErrorCode.PROTO_ACCOUNT_DISABLED };
  }
  if (protocol === 'trojan' && !user.protocol_trojan_enabled) {
    return { allowed: false, reason: 'Trojan protocol disabled for this user', code: ErrorCode.PROTO_ACCOUNT_DISABLED };
  }
  if (protocol === 'shadowsocks' && !user.protocol_shadowsocks_enabled) {
    return { allowed: false, reason: 'Shadowsocks protocol disabled for this user', code: ErrorCode.PROTO_ACCOUNT_DISABLED };
  }

  // 3. Expiration check
  if (user.expires_at) {
    const expiryTime = new Date(user.expires_at).getTime();
    if (expiryTime <= Date.now()) {
      return { allowed: false, reason: 'User account has expired', code: ErrorCode.PROTO_EXPIRED };
    }
  }

  // 4. Total Quota check
  if (user.quota_bytes > 0 && user.used_bytes >= user.quota_bytes) {
    return { allowed: false, reason: 'User bandwidth quota exceeded', code: ErrorCode.PROTO_QUOTA_EXCEEDED };
  }

  // 5. Daily Quota check
  if (user.daily_quota_bytes > 0) {
    const today = new Date().toISOString().slice(0, 10);
    if (user.daily_key === today && user.daily_used_bytes >= user.daily_quota_bytes) {
      return { allowed: false, reason: 'User daily bandwidth quota exceeded', code: ErrorCode.PROTO_QUOTA_EXCEEDED };
    }
  }

  return { allowed: true };
}

export async function checkAndRecordClientIp(
  kv: KVNamespace | undefined,
  userId: string,
  clientIp: string,
  maxIps: number
): Promise<PolicyCheckResult> {
  if (!kv || maxIps <= 0 || !clientIp) {
    return { allowed: true };
  }

  const now = Math.floor(Date.now() / 1000);
  const ttlWindow = 120; // 2 minutes active window
  const key = `user_ips:${userId}`;

  try {
    const dataStr = await kv.get(key);
    let ipList: { ip: string; lastSeen: number }[] = [];

    if (dataStr) {
      const parsed = JSON.parse(dataStr) as { ip: string; lastSeen: number }[];
      ipList = parsed.filter(item => now - item.lastSeen < ttlWindow);
    }

    const existingIndex = ipList.findIndex(item => item.ip === clientIp);

    if (existingIndex > -1) {
      // Refresh timestamp
      ipList[existingIndex].lastSeen = now;
    } else {
      if (ipList.length >= maxIps) {
        return {
          allowed: false,
          reason: `Maximum concurrent IP limit (${maxIps}) reached for this user`,
          code: ErrorCode.PROTO_IP_LIMIT_EXCEEDED,
        };
      }
      ipList.push({ ip: clientIp, lastSeen: now });
    }

    await kv.put(key, JSON.stringify(ipList), { expirationTtl: 180 });
    return { allowed: true };
  } catch {
    // If KV fails, allow gracefully
    return { allowed: true };
  }
}
