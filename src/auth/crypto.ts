import { base64UrlEncodeBytes, bytesToHex, randomHex } from '../utils/encoding';

const DEFAULT_ITERATIONS = 120_000;

export async function hashPassword(password: string, saltHex = randomHex(16), iterations = DEFAULT_ITERATIONS) {
  const enc = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{2}/g)?.map((x) => parseInt(x, 16)) ?? []);
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    256,
  );
  return { saltHex, hashHex: bytesToHex(new Uint8Array(bits)), iterations };
}

export async function verifyPassword(password: string, saltHex: string, expectedHashHex: string, iterations: number) {
  const derived = await hashPassword(password, saltHex, iterations);
  return timingSafeEqual(derived.hashHex, expectedHashHex);
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hmacSha256(secret: string, value: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return base64UrlEncodeBytes(new Uint8Array(sig));
}
