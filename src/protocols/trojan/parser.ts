/**
 * Trojan protocol packet parser and SHA-224 password hash utility.
 * Complies with the standard Trojan protocol specification.
 */

import { bytesToHex, bytesToString, readUint16BE } from '../../utils/bytes';
import { isValidPort } from '../../utils/validation';
import { C1Error, ErrorCode } from '../../app/errors';
import { ParsedProtocolRequest } from '../types';

/**
 * Standard SHA-224 hash implementation (RFC 3874).
 * SHA-224 uses the same compression function as SHA-256 with distinct initial values (H0-H7).
 */
export function sha224(message: string | Uint8Array): string {
  const bytes = typeof message === 'string' ? new TextEncoder().encode(message) : message;

  // Initial hash values for SHA-224
  let h0 = 0xc1059ed8;
  let h1 = 0x367cd507;
  let h2 = 0x3070dd17;
  let h3 = 0xf70e5939;
  let h4 = 0xffc00b31;
  let h5 = 0x68581511;
  let h6 = 0x64f98fa7;
  let h7 = 0xbefa4fa4;

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const len = bytes.length;
  const bitLen = len * 8;
  // Padding: 0x80 byte + k zero bytes + 8 bytes bit length = multiple of 64
  const k = (56 - ((len + 1) % 64) + 64) % 64;
  const totalLen = len + 1 + k + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes);
  padded[len] = 0x80;

  // 64-bit length big-endian (last 8 bytes)
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  // High 32 bits (0 for typical message lengths)
  view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000), false);
  // Low 32 bits
  view.setUint32(totalLen - 4, bitLen >>> 0, false);

  const W = new Int32Array(64);

  for (let i = 0; i < totalLen; i += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = view.getInt32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = ((W[t - 15] >>> 7) | (W[t - 15] << 25)) ^ ((W[t - 15] >>> 18) | (W[t - 15] << 14)) ^ (W[t - 15] >>> 3);
      const s1 = ((W[t - 2] >>> 17) | (W[t - 2] << 15)) ^ ((W[t - 2] >>> 19) | (W[t - 2] << 13)) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  // SHA-224 produces 7 32-bit words (28 bytes / 56 hex chars)
  const result = new Uint8Array(28);
  const outView = new DataView(result.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);

  return bytesToHex(result);
}

export function parseTrojanRequest(data: Uint8Array): ParsedProtocolRequest {
  // 56 (hash) + 2 (\r\n) + 1 (cmd) + 1 (addr type) + 4 (min ip) + 2 (port) + 2 (\r\n) = 68 bytes min
  if (!data || data.length < 68) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Trojan packet too short', 400);
  }

  // 1. Password hash: 56 ASCII hex chars
  const hexChars = data.subarray(0, 56);
  const passwordHash = bytesToString(hexChars).toLowerCase();

  // Validate CRLF after password
  if (data[56] !== 0x0d || data[57] !== 0x0a) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Missing CRLF after Trojan password hash', 400);
  }

  // 2. Command
  const command = data[58];
  const isTcp = command === 0x01;
  const isUdp = command === 0x03;

  if (!isTcp && !isUdp) {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_COMMAND, `Unsupported Trojan command: ${command}`, 400);
  }

  // 3. Address Type (SOCKS5 standard: 0x01=IPv4, 0x03=Domain, 0x04=IPv6)
  const addressType = data[59];
  let offset = 60;

  let host = '';
  let addrTypeStr: 'ipv4' | 'domain' | 'ipv6' = 'ipv4';

  if (addressType === 0x01) {
    // IPv4: 4 bytes
    if (data.length < offset + 4) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Trojan packet truncated in IPv4 address', 400);
    }
    host = `${data[offset]}.${data[offset + 1]}.${data[offset + 2]}.${data[offset + 3]}`;
    offset += 4;
    addrTypeStr = 'ipv4';
  } else if (addressType === 0x03) {
    // Domain: 1 byte length + ASCII string
    if (data.length < offset + 1) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Trojan packet truncated before domain length', 400);
    }
    const domainLen = data[offset];
    offset += 1;

    if (domainLen === 0 || data.length < offset + domainLen) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Trojan packet truncated in domain name', 400);
    }

    host = bytesToString(data.subarray(offset, offset + domainLen));
    offset += domainLen;
    addrTypeStr = 'domain';
  } else if (addressType === 0x04) {
    // IPv6: 16 bytes
    if (data.length < offset + 16) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Trojan packet truncated in IPv6 address', 400);
    }
    const parts: string[] = [];
    for (let i = 0; i < 16; i += 2) {
      parts.push(readUint16BE(data, offset + i).toString(16));
    }
    host = parts.join(':');
    offset += 16;
    addrTypeStr = 'ipv6';
  } else {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_ADDRESS, `Unsupported Trojan address type: ${addressType}`, 400);
  }

  // 4. Port (2 bytes)
  if (data.length < offset + 2) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Trojan packet truncated before port', 400);
  }
  const port = readUint16BE(data, offset);
  if (!isValidPort(port)) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, `Invalid port: ${port}`, 400);
  }
  offset += 2;

  // 5. Final CRLF
  if (data.length < offset + 2 || data[offset] !== 0x0d || data[offset + 1] !== 0x0a) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Missing final CRLF in Trojan header', 400);
  }
  offset += 2;

  const payload = data.subarray(offset);

  return {
    protocol: 'trojan',
    credentialId: passwordHash,
    target: {
      host,
      port,
      addressType: addrTypeStr,
      isUdp,
    },
    payload,
    headerLength: offset,
  };
}
