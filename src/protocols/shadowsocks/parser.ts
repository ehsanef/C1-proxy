/**
 * Shadowsocks AEAD packet parser and initial payload decryptor.
 */

import { bytesToString, readUint16BE } from '../../utils/bytes';
import { isValidPort } from '../../utils/validation';
import { C1Error, ErrorCode } from '../../app/errors';
import { ParsedProtocolRequest } from '../types';
import { CIPHER_SPECS, deriveMasterKey, deriveSubkey, incrementNonce } from './crypto';

export async function decryptAndParseShadowsocksRequest(
  data: Uint8Array,
  password: string,
  method = 'aes-128-gcm'
): Promise<ParsedProtocolRequest> {
  const spec = CIPHER_SPECS[method];
  if (!spec) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, `Unsupported Shadowsocks method: ${method}`, 400);
  }

  // Minimum size: salt + 2-byte len + 16-byte tag + min payload (7 bytes) + 16-byte tag
  const minSize = spec.saltSize + 2 + spec.tagSize + 7 + spec.tagSize;
  if (!data || data.length < minSize) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Shadowsocks packet too short', 400);
  }

  const salt = data.subarray(0, spec.saltSize);
  const masterKey = await deriveMasterKey(password, spec.keySize);
  const subkey = await deriveSubkey(masterKey, salt, spec.keySize);

  const nonce = new Uint8Array(spec.nonceSize);

  // 1. Decrypt chunk length (2 bytes ciphertext + tag)
  const lenChunk = data.subarray(spec.saltSize, spec.saltSize + 2 + spec.tagSize);
  let decryptedLenBytes: ArrayBuffer;
  try {
    decryptedLenBytes = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: spec.tagSize * 8 },
      subkey,
      lenChunk
    );
  } catch {
    throw new C1Error(ErrorCode.PROTO_AUTH_FAILED, 'Failed to decrypt Shadowsocks length header', 401);
  }

  incrementNonce(nonce);

  const lenView = new DataView(decryptedLenBytes);
  const payloadLen = lenView.getUint16(0, false); // big-endian

  if (payloadLen > 0x3fff || payloadLen < 7) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, `Invalid Shadowsocks payload length: ${payloadLen}`, 400);
  }

  const payloadStart = spec.saltSize + 2 + spec.tagSize;
  const payloadEnd = payloadStart + payloadLen + spec.tagSize;

  if (data.length < payloadEnd) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Shadowsocks packet truncated before payload end', 400);
  }

  const payloadChunk = data.subarray(payloadStart, payloadEnd);
  let decryptedPayload: ArrayBuffer;
  try {
    decryptedPayload = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: spec.tagSize * 8 },
      subkey,
      payloadChunk
    );
  } catch {
    throw new C1Error(ErrorCode.PROTO_AUTH_FAILED, 'Failed to decrypt Shadowsocks payload', 401);
  }

  incrementNonce(nonce);

  // Parse SOCKS5 target address inside decrypted payload
  const decBytes = new Uint8Array(decryptedPayload);
  const addrType = decBytes[0];
  let offset = 1;
  let host = '';
  let addrTypeStr: 'ipv4' | 'domain' | 'ipv6' = 'ipv4';

  if (addrType === 0x01) {
    // IPv4
    if (decBytes.length < offset + 4) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Truncated SOCKS5 IPv4 address', 400);
    }
    host = `${decBytes[offset]}.${decBytes[offset + 1]}.${decBytes[offset + 2]}.${decBytes[offset + 3]}`;
    offset += 4;
    addrTypeStr = 'ipv4';
  } else if (addrType === 0x03) {
    // Domain
    if (decBytes.length < offset + 1) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Truncated SOCKS5 domain length', 400);
    }
    const domainLen = decBytes[offset];
    offset += 1;
    if (domainLen === 0 || decBytes.length < offset + domainLen) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Truncated SOCKS5 domain', 400);
    }
    host = bytesToString(decBytes.subarray(offset, offset + domainLen));
    offset += domainLen;
    addrTypeStr = 'domain';
  } else if (addrType === 0x04) {
    // IPv6
    if (decBytes.length < offset + 16) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Truncated SOCKS5 IPv6', 400);
    }
    const parts: string[] = [];
    for (let i = 0; i < 16; i += 2) {
      parts.push(readUint16BE(decBytes, offset + i).toString(16));
    }
    host = parts.join(':');
    offset += 16;
    addrTypeStr = 'ipv6';
  } else {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_ADDRESS, `Unsupported SOCKS5 address type: ${addrType}`, 400);
  }

  if (decBytes.length < offset + 2) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'Truncated SOCKS5 port', 400);
  }

  const port = readUint16BE(decBytes, offset);
  if (!isValidPort(port)) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, `Invalid SOCKS5 port: ${port}`, 400);
  }
  offset += 2;

  const clientPayload = decBytes.subarray(offset);

  return {
    protocol: 'shadowsocks',
    credentialId: password,
    target: {
      host,
      port,
      addressType: addrTypeStr,
      isUdp: false,
    },
    payload: clientPayload,
    headerLength: payloadEnd,
  };
}
