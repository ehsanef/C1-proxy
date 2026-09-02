/**
 * Shadowsocks AEAD cryptographic operations (SIP007).
 * Uses Web Crypto AES-GCM and HKDF.
 */

import { stringToBytes } from '../../utils/bytes';

export interface CipherSpec {
  keySize: number;
  saltSize: number;
  tagSize: number;
  nonceSize: number;
}

export const CIPHER_SPECS: Record<string, CipherSpec> = {
  'aes-128-gcm': { keySize: 16, saltSize: 16, tagSize: 16, nonceSize: 12 },
  'aes-256-gcm': { keySize: 32, saltSize: 32, tagSize: 16, nonceSize: 12 },
};

/**
 * Derive Shadowsocks master key from password using SHA-256
 */
export async function deriveMasterKey(password: string, keySize: number): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest('SHA-256', stringToBytes(password));
  return new Uint8Array(hash).subarray(0, keySize);
}

/**
 * Derive Shadowsocks subkey from master key and salt using HKDF-SHA1 (SIP007)
 */
export async function deriveSubkey(
  masterKey: Uint8Array,
  salt: Uint8Array,
  keySize: number
): Promise<CryptoKey> {
  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    masterKey,
    'HKDF',
    false,
    ['deriveBits', 'deriveKey']
  );

  const subkeyBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-1',
      salt,
      info: stringToBytes('ss-subkey'),
    },
    hkdfKey,
    keySize * 8
  );

  return crypto.subtle.importKey(
    'raw',
    subkeyBits,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Increment 12-byte little-endian nonce
 */
export function incrementNonce(nonce: Uint8Array): void {
  for (let i = 0; i < nonce.length; i++) {
    nonce[i] = (nonce[i] + 1) & 0xff;
    if (nonce[i] !== 0) {
      break;
    }
  }
}
