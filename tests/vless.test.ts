import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVlessRequest } from '../src/proxy/vless';

function uuidBytes(uuid: string) {
  const hex = uuid.replace(/-/g, '');
  return Uint8Array.from(hex.match(/.{2}/g)!.map((x) => parseInt(x, 16)));
}

test('parses VLESS TCP domain header', () => {
  const uuid = '11111111-2222-4333-8444-555555555555';
  const domain = new TextEncoder().encode('example.com');
  const bytes = new Uint8Array(1 + 16 + 1 + 1 + 2 + 1 + 1 + domain.length + 3);
  let o = 0;
  bytes[o++] = 0;
  bytes.set(uuidBytes(uuid), o); o += 16;
  bytes[o++] = 0;
  bytes[o++] = 1;
  bytes[o++] = 0x01; bytes[o++] = 0xbb;
  bytes[o++] = 2;
  bytes[o++] = domain.length;
  bytes.set(domain, o); o += domain.length;
  bytes.set([1,2,3], o);
  const p = parseVlessRequest(bytes);
  assert.equal(p.uuid, uuid);
  assert.equal(p.command, 1);
  assert.equal(p.port, 443);
  assert.equal(p.address, 'example.com');
  assert.deepEqual(Array.from(bytes.subarray(p.payloadOffset)), [1,2,3]);
});
