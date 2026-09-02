/**
 * VLESS protocol packet parser and validator.
 * Conforms to VLESS v0 specification with strict bounds checking.
 */

import { bytesToString, bytesToUuid, readUint16BE } from '../../utils/bytes';
import { isValidPort } from '../../utils/validation';
import { C1Error, ErrorCode } from '../../app/errors';
import { ParsedProtocolRequest } from '../types';

export function parseVlessRequest(data: Uint8Array): ParsedProtocolRequest {
  // Minimum header size: 1 (ver) + 16 (uuid) + 1 (addon len) + 1 (cmd) + 2 (port) + 1 (addr type) + 4 (min ipv4) = 26 bytes
  if (!data || data.length < 26) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'VLESS packet too short', 400);
  }

  const version = data[0];
  if (version !== 0x00) {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_VERSION, `Unsupported VLESS version: ${version}`, 400);
  }

  const uuid = bytesToUuid(data, 1);
  const addonLen = data[17];
  let offset = 18 + addonLen;

  if (data.length < offset + 4) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'VLESS packet truncated before command/port', 400);
  }

  const command = data[offset];
  const isTcp = command === 0x01;
  const isUdp = command === 0x02;

  if (!isTcp && !isUdp) {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_COMMAND, `Unsupported VLESS command: ${command}`, 400);
  }

  const port = readUint16BE(data, offset + 1);
  if (!isValidPort(port)) {
    throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, `Invalid port: ${port}`, 400);
  }

  const addressType = data[offset + 3];
  offset += 4;

  let host = '';
  let addrTypeStr: 'ipv4' | 'domain' | 'ipv6' = 'ipv4';

  if (addressType === 0x01) {
    // IPv4: 4 bytes
    if (data.length < offset + 4) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'VLESS packet truncated in IPv4 address', 400);
    }
    host = `${data[offset]}.${data[offset + 1]}.${data[offset + 2]}.${data[offset + 3]}`;
    offset += 4;
    addrTypeStr = 'ipv4';
  } else if (addressType === 0x02) {
    // Domain: 1 byte length + ASCII string
    if (data.length < offset + 1) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'VLESS packet truncated before domain length', 400);
    }
    const domainLen = data[offset];
    offset += 1;

    if (domainLen === 0 || data.length < offset + domainLen) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'VLESS packet truncated in domain name', 400);
    }

    host = bytesToString(data.subarray(offset, offset + domainLen));
    offset += domainLen;
    addrTypeStr = 'domain';
  } else if (addressType === 0x03) {
    // IPv6: 16 bytes
    if (data.length < offset + 16) {
      throw new C1Error(ErrorCode.PROTO_INVALID_PACKET, 'VLESS packet truncated in IPv6 address', 400);
    }
    const parts: string[] = [];
    for (let i = 0; i < 16; i += 2) {
      parts.push(readUint16BE(data, offset + i).toString(16));
    }
    host = parts.join(':');
    offset += 16;
    addrTypeStr = 'ipv6';
  } else {
    throw new C1Error(ErrorCode.PROTO_UNSUPPORTED_ADDRESS, `Unsupported VLESS address type: ${addressType}`, 400);
  }

  const payload = data.subarray(offset);

  return {
    protocol: 'vless',
    credentialId: uuid,
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

export function buildVlessResponseHeader(): Uint8Array {
  // VLESS response header: version 0, addon length 0
  return new Uint8Array([0x00, 0x00]);
}
