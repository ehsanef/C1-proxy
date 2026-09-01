import type { Env } from '../types';

const WINDOW_SECONDS = 10 * 60;
const MAX_ATTEMPTS = 8;

function keyFor(ip: string) {
  return `login:${ip || 'unknown'}`;
}

export async function canAttemptLogin(env: Env, ip: string): Promise<boolean> {
  const value = Number(await env.KV.get(keyFor(ip))) || 0;
  return value < MAX_ATTEMPTS;
}

export async function recordLoginFailure(env: Env, ip: string) {
  const key = keyFor(ip);
  const value = Number(await env.KV.get(key)) || 0;
  await env.KV.put(key, String(value + 1), { expirationTtl: WINDOW_SECONDS });
}

export async function clearLoginFailures(env: Env, ip: string) {
  await env.KV.delete(keyFor(ip));
}
