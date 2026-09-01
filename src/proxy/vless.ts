export interface ParsedVlessRequest {
  version: number;
  uuid: string;
  command: number;
  port: number;
  address: string;
  payloadOffset: number;
}

export function uuidBytesToString(bytes: Uint8Array): string {
  if (bytes.length !== 16) return '';
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

export function parseVlessRequest(data: Uint8Array): ParsedVlessRequest {
  if (data.byteLength < 24) throw new Error('VLESS header too short');
  const version = data[0];
  const uuid = uuidBytesToString(data.subarray(1, 17));
  const optLength = data[17];
  let offset = 18 + optLength;
  if (offset + 4 > data.length) throw new Error('VLESS options overflow');
  const command = data[offset++];
  const port = (data[offset++] << 8) | data[offset++];
  const addressType = data[offset++];
  let address = '';
  if (addressType === 1) {
    if (offset + 4 > data.length) throw new Error('Invalid IPv4 address');
    address = Array.from(data.subarray(offset, offset + 4)).join('.');
    offset += 4;
  } else if (addressType === 2) {
    if (offset >= data.length) throw new Error('Invalid domain address');
    const len = data[offset++];
    if (offset + len > data.length) throw new Error('Invalid domain length');
    address = new TextDecoder().decode(data.subarray(offset, offset + len));
    offset += len;
  } else if (addressType === 3) {
    if (offset + 16 > data.length) throw new Error('Invalid IPv6 address');
    const parts: string[] = [];
    for (let i = 0; i < 16; i += 2) parts.push(((data[offset+i] << 8) | data[offset+i+1]).toString(16));
    address = parts.join(':');
    offset += 16;
  } else {
    throw new Error('Unsupported VLESS address type');
  }
  return { version, uuid, command, port, address, payloadOffset: offset };
}
