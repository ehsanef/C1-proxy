/**
 * Auto-detection subscription router based on User-Agent and query parameters.
 */

import { NodeConfigOptions } from './uri';
import { generateRawSubscription } from './raw';
import { generateBase64Subscription } from './base64';
import { generateClashSubscription } from './clash';
import { generateSingboxSubscription } from './singbox';
import { generateKaringSubscription } from './karing';
import { UserRecord } from '../database/schema';

export type SubFormat = 'auto' | 'base64' | 'raw' | 'clash' | 'mihomo' | 'singbox' | 'karing';

export function detectSubscriptionFormat(request: Request): SubFormat {
  const url = new URL(request.url);
  const explicitFormat = url.searchParams.get('format')?.toLowerCase() as SubFormat | undefined;

  if (explicitFormat && ['base64', 'raw', 'clash', 'mihomo', 'singbox', 'karing'].includes(explicitFormat)) {
    return explicitFormat;
  }

  const ua = (request.headers.get('user-agent') || '').toLowerCase();

  if (ua.includes('clash') || ua.includes('mihomo') || ua.includes('meta')) {
    return 'clash';
  }

  if (ua.includes('sing-box') || ua.includes('singbox')) {
    return 'singbox';
  }

  if (ua.includes('karing')) {
    return 'karing';
  }

  return 'base64';
}

export function buildSubscriptionResponse(
  user: UserRecord,
  nodeOptions: NodeConfigOptions[],
  format: SubFormat
): Response {
  let content = '';
  let contentType = 'text/plain; charset=utf-8';
  let filename = `c1-${user.username}.txt`;

  if (format === 'raw') {
    content = generateRawSubscription(nodeOptions);
    contentType = 'text/plain; charset=utf-8';
  } else if (format === 'clash' || format === 'mihomo') {
    content = generateClashSubscription(nodeOptions);
    contentType = 'text/yaml; charset=utf-8';
    filename = `c1-${user.username}.yaml`;
  } else if (format === 'singbox') {
    content = generateSingboxSubscription(nodeOptions);
    contentType = 'application/json; charset=utf-8';
    filename = `c1-${user.username}.json`;
  } else if (format === 'karing') {
    content = generateKaringSubscription(nodeOptions);
    contentType = 'text/plain; charset=utf-8';
  } else {
    // Default to base64
    content = generateBase64Subscription(nodeOptions);
    contentType = 'text/plain; charset=utf-8';
  }

  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  headers.set('Profile-Update-Interval', '24');
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  // Standard subscription-userinfo header
  const expireEpoch = user.expires_at ? Math.floor(new Date(user.expires_at).getTime() / 1000) : 0;
  headers.set(
    'Subscription-Userinfo',
    `upload=0; download=${user.used_bytes}; total=${user.quota_bytes}; expire=${expireEpoch}`
  );

  return new Response(content, { status: 200, headers });
}
