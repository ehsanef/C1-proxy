/**
 * Clean IP resolution and candidate pool management.
 * Preserves Host and SNI while substituting reachable Cloudflare CDN fronting IPs.
 */

import { InboundRecord, UserRecord } from '../database/schema';
import { NodeConfigOptions } from '../subscriptions/uri';

export const DEFAULT_CLEAN_IPS = [
  '104.16.132.229',
  '104.16.133.229',
  '104.17.157.100',
  '104.18.2.161',
  '172.64.155.209',
  '172.67.74.152',
];

export function resolveCleanIpCandidates(
  user: UserRecord,
  globalCleanIps: string[] = [],
  radarIps: string[] = []
): string[] {
  if (user.clean_ip_mode === 'manual' && user.clean_ip) {
    return user.clean_ip
      .split(/[\r\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  if (user.clean_ip_mode === 'radar' && radarIps.length > 0) {
    return radarIps.slice(0, 3);
  }

  if (globalCleanIps.length > 0) {
    return globalCleanIps.slice(0, 3);
  }

  return DEFAULT_CLEAN_IPS.slice(0, 2);
}

export function generateAllNodeOptions(
  user: UserRecord,
  inbounds: InboundRecord[],
  serverHost: string,
  cleanIps: string[]
): NodeConfigOptions[] {
  const options: NodeConfigOptions[] = [];

  for (const inbound of inbounds) {
    if (!inbound.enabled) continue;

    // 1. Primary edge node
    options.push({
      user,
      inbound,
      serverHost,
    });

    // 2. Clean IP nodes
    for (let i = 0; i < cleanIps.length; i++) {
      const ip = cleanIps[i];
      options.push({
        user,
        inbound,
        serverHost,
        cleanIp: ip,
        customName: `C1 - ${user.name || user.username} - ${inbound.name} - Clean ${String(i + 1).padStart(2, '0')}`,
      });
    }
  }

  return options;
}
