/**
 * Cryptographically signed HMAC-SHA256 session management with HttpOnly cookies.
 */

import {
  base64UrlToBytes,
  bytesToBase64Url,
  bytesToString,
  stringToBytes,
  timingSafeEqual,
  randomToken,
} from '../utils/bytes';
import { C1Error, ErrorCode } from '../app/errors';

export interface SessionPayload {
  adminId: string;
  username: string;
  exp: number; // Unix timestamp in seconds
  csrfToken: string;
}

export const SESSION_COOKIE_NAME = 'c1_session';
export const CSRF_HEADER_NAME = 'x-c1-csrf';
export const DEFAULT_SESSION_TTL_SECONDS = 7 * 24 * 3600; // 7 days

export async function createSessionToken(
  adminId: string,
  username: string,
  secretKey: string,
  ttlSeconds = DEFAULT_SESSION_TTL_SECONDS
): Promise<{ token: string; csrfToken: string }> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const csrfToken = randomToken(16);

  const payload: SessionPayload = {
    adminId,
    username,
    exp,
    csrfToken,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = bytesToBase64Url(stringToBytes(payloadJson));

  const signature = await signHmacSha256(payloadB64, secretKey);
  const token = `${payloadB64}.${signature}`;

  return { token, csrfToken };
}

export async function verifySessionToken(token: string, secretKey: string): Promise<SessionPayload | null> {
  if (!token || !secretKey) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, providedSigB64] = parts;

  try {
    const expectedSigB64 = await signHmacSha256(payloadB64, secretKey);
    const expectedSigBytes = base64UrlToBytes(expectedSigB64);
    const providedSigBytes = base64UrlToBytes(providedSigB64);

    if (!timingSafeEqual(expectedSigBytes, providedSigBytes)) {
      return null;
    }

    const payloadJson = bytesToString(base64UrlToBytes(payloadB64));
    const payload = JSON.parse(payloadJson) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function signHmacSha256(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    stringToBytes(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign('HMAC', key, stringToBytes(data));
  return bytesToBase64Url(new Uint8Array(signatureBytes));
}

export function buildSetCookieHeader(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

export function buildClearCookieHeader(name: string): string {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      cookies[key] = decodeURIComponent(val);
    }
  }
  return cookies;
}
