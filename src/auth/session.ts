import type { Env, SessionData } from '../types';
import { getSetting, setSetting } from '../database/repo';
import { hmacSha256, timingSafeEqual } from './crypto';
import { base64UrlDecodeText, base64UrlEncodeText, randomHex } from '../utils/encoding';

const SESSION_TTL_SECONDS = 8 * 60 * 60;
const COOKIE = 'c1_session';

function usableSecret(value?: string): value is string {
  return !!value && value.length >= 24 && !value.startsWith('replace-') && value !== 'change-me';
}

async function getSessionSecret(env: Env): Promise<string> {
  if (usableSecret(env.C1_SESSION_SECRET)) return env.C1_SESSION_SECRET;
  let value = await getSetting(env, 'session_secret');
  if (!value) {
    value = randomHex(32);
    await setSetting(env, 'session_secret', value);
  }
  return value;
}

export async function createSession(env: Env): Promise<{ token: string; data: SessionData }> {
  const data: SessionData = { exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS, csrf: randomHex(18) };
  const payload = base64UrlEncodeText(JSON.stringify(data));
  const sig = await hmacSha256(await getSessionSecret(env), payload);
  return { token: `${payload}.${sig}`, data };
}

export async function verifySession(env: Env, request: Request): Promise<SessionData | null> {
  const cookie = request.headers.get('Cookie') || '';
  const token = cookie.split(';').map((x) => x.trim()).find((x) => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = await hmacSha256(await getSessionSecret(env), payload);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(base64UrlDecodeText(payload)) as SessionData;
    if (!data.exp || Date.now() / 1000 > data.exp || !data.csrf) return null;
    return data;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string): string {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function validCsrf(request: Request, session: SessionData): boolean {
  return request.headers.get('x-c1-csrf') === session.csrf;
}
