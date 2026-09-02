/**
 * Fast, allocation-conscious byte utilities using native Web Platform APIs.
 */

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function readUint16BE(buf: Uint8Array, offset: number): number {
  return (buf[offset] << 8) | buf[offset + 1];
}

export function writeUint16BE(buf: Uint8Array, offset: number, value: number): void {
  buf[offset] = (value >> 8) & 0xff;
  buf[offset + 1] = value & 0xff;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64.replace(/\s/g, ''));
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToBytes(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  return base64ToBytes(b64);
}

/**
 * Constant-time byte array comparison to prevent timing attacks.
 */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Convert 16-byte buffer to standard UUID format: 8-4-4-4-12
 */
export function bytesToUuid(buf: Uint8Array, offset = 0): string {
  if (buf.length < offset + 16) {
    throw new Error('Buffer too small for UUID');
  }
  const hex = bytesToHex(buf.subarray(offset, offset + 16));
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Parse standard UUID string to 16-byte buffer
 */
export function uuidToBytes(uuid: string): Uint8Array {
  const clean = uuid.replace(/-/g, '');
  if (clean.length !== 32) {
    throw new Error('Invalid UUID format');
  }
  return hexToBytes(clean);
}

/**
 * Generate cryptographically secure random token (hex or url-safe)
 */
export function randomToken(byteLength = 16): string {
  const buf = new Uint8Array(byteLength);
  crypto.getRandomValues(buf);
  return bytesToHex(buf);
}

/**
 * Generate cryptographically secure UUID v4
 */
export function randomUuid(): string {
  return crypto.randomUUID();
}
