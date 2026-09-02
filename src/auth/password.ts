/**
 * Secure password hashing using Web Crypto PBKDF2 compatible with Cloudflare Workers runtime.
 */

import { bytesToHex, hexToBytes, stringToBytes, timingSafeEqual } from '../utils/bytes';
import { C1Error, ErrorCode } from '../app/errors';

export const DEFAULT_PBKDF2_ITERATIONS = 100_000;
const HASH_ALGORITHM = 'SHA-256';
const KEY_LENGTH_BITS = 256;

export async function hashPassword(password: string, iterations = DEFAULT_PBKDF2_ITERATIONS): Promise<string> {
  if (!password || password.length < 8) {
    throw new C1Error(ErrorCode.VAL_PASSWORD_TOO_SHORT, 'Password must be at least 8 characters', 400);
  }

  try {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);

    const baseKey = await crypto.subtle.importKey(
      'raw',
      stringToBytes(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: HASH_ALGORITHM,
      },
      baseKey,
      KEY_LENGTH_BITS
    );

    const hashBytes = new Uint8Array(derivedBits);
    const saltHex = bytesToHex(salt);
    const hashHex = bytesToHex(hashBytes);

    return `$pbkdf2$sha256$${iterations}$${saltHex}$${hashHex}`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new C1Error(ErrorCode.AUTH_KDF_FAILED, 'Failed to hash password', 500, msg);
  }
}

export async function verifyPassword(password: string, storedRecord: string): Promise<boolean> {
  if (!password || !storedRecord) {
    return false;
  }

  const parts = storedRecord.split('$');
  // Format: ["", "pbkdf2", "sha256", "100000", "<salt>", "<hash>"]
  if (parts.length !== 6 || parts[1] !== 'pbkdf2' || parts[2] !== 'sha256') {
    return false;
  }

  const iterations = parseInt(parts[3], 10);
  if (isNaN(iterations) || iterations < 1000 || iterations > 500_000) {
    return false;
  }

  const salt = hexToBytes(parts[4]);
  const expectedHash = hexToBytes(parts[5]);

  try {
    const baseKey = await crypto.subtle.importKey(
      'raw',
      stringToBytes(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: HASH_ALGORITHM,
      },
      baseKey,
      KEY_LENGTH_BITS
    );

    const actualHash = new Uint8Array(derivedBits);
    return timingSafeEqual(actualHash, expectedHash);
  } catch {
    return false;
  }
}
