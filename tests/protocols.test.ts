import { describe, it, expect } from 'vitest';
import { parseVlessRequest, buildVlessResponseHeader } from '../src/protocols/vless/parser';
import { parseTrojanRequest, sha224 } from '../src/protocols/trojan/parser';
import { decryptAndParseShadowsocksRequest } from '../src/protocols/shadowsocks/parser';
import { deriveMasterKey, deriveSubkey, CIPHER_SPECS } from '../src/protocols/shadowsocks/crypto';
import { stringToBytes, uuidToBytes, writeUint16BE } from '../src/utils/bytes';
import { C1Error, ErrorCode } from '../src/app/errors';

describe('VLESS Protocol Parser', () => {
  const testUuid = '12345678-1234-1234-1234-123456789abc';

  it('parses valid VLESS TCP request with domain target', () => {
    const uuidBytes = uuidToBytes(testUuid);
    const domain = 'example.com';
    const domainBytes = stringToBytes(domain);
    const payload = stringToBytes('GET / HTTP/1.1\r\n\r\n');

    // 1 (ver 0) + 16 (uuid) + 1 (addon len 0) + 1 (cmd 1) + 2 (port 443) + 1 (addr type 2) + 1 (domain len) + domain + payload
    const packet = new Uint8Array(1 + 16 + 1 + 1 + 2 + 1 + 1 + domainBytes.length + payload.length);
    let offset = 0;
    packet[offset++] = 0x00; // version
    packet.set(uuidBytes, offset);
    offset += 16;
    packet[offset++] = 0x00; // addon len 0
    packet[offset++] = 0x01; // TCP command
    writeUint16BE(packet, offset, 443);
    offset += 2;
    packet[offset++] = 0x02; // domain type
    packet[offset++] = domainBytes.length;
    packet.set(domainBytes, offset);
    offset += domainBytes.length;
    packet.set(payload, offset);

    const parsed = parseVlessRequest(packet);
    expect(parsed.protocol).toBe('vless');
    expect(parsed.credentialId).toBe(testUuid);
    expect(parsed.target.host).toBe('example.com');
    expect(parsed.target.port).toBe(443);
    expect(parsed.target.isUdp).toBe(false);
    expect(new TextDecoder().decode(parsed.payload)).toBe('GET / HTTP/1.1\r\n\r\n');
  });

  it('parses valid VLESS TCP request with IPv4 target', () => {
    const uuidBytes = uuidToBytes(testUuid);
    const packet = new Uint8Array(26);
    let offset = 0;
    packet[offset++] = 0x00;
    packet.set(uuidBytes, offset);
    offset += 16;
    packet[offset++] = 0x00; // addon len
    packet[offset++] = 0x01; // TCP
    writeUint16BE(packet, offset, 80);
    offset += 2;
    packet[offset++] = 0x01; // IPv4
    packet[offset++] = 1;
    packet[offset++] = 1;
    packet[offset++] = 1;
    packet[offset++] = 1;

    const parsed = parseVlessRequest(packet);
    expect(parsed.target.host).toBe('1.1.1.1');
    expect(parsed.target.port).toBe(80);
  });

  it('rejects truncated or malformed VLESS packets', () => {
    expect(() => parseVlessRequest(new Uint8Array(10))).toThrow(
      expect.objectContaining({ code: ErrorCode.PROTO_INVALID_PACKET })
    );

    const invalidVer = new Uint8Array(30);
    invalidVer[0] = 0x01; // unsupported version
    expect(() => parseVlessRequest(invalidVer)).toThrow(
      expect.objectContaining({ code: ErrorCode.PROTO_UNSUPPORTED_VERSION })
    );
  });

  it('generates proper VLESS response header', () => {
    const header = buildVlessResponseHeader();
    expect(header).toEqual(new Uint8Array([0x00, 0x00]));
  });
});

describe('Trojan Protocol Parser & SHA-224', () => {
  it('computes correct SHA-224 hash conforming to RFC 3874 test vectors', () => {
    // RFC 3874 test vector: "abc" -> 23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7
    const hash = sha224('abc');
    expect(hash).toBe('23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7');
  });

  it('parses valid Trojan request with domain target', () => {
    const password = 'my-trojan-password';
    const passHash = sha224(password);
    const domain = 'cloudflare.com';
    const domainBytes = stringToBytes(domain);
    const payload = stringToBytes('HELLO TROJAN');

    // 56 (hash) + 2 (\r\n) + 1 (cmd 1) + 1 (addr type 3) + 1 (len) + domain + 2 (port) + 2 (\r\n) + payload
    const totalLen = 56 + 2 + 1 + 1 + 1 + domainBytes.length + 2 + 2 + payload.length;
    const packet = new Uint8Array(totalLen);
    let offset = 0;

    packet.set(stringToBytes(passHash), offset);
    offset += 56;
    packet[offset++] = 0x0d;
    packet[offset++] = 0x0a;
    packet[offset++] = 0x01; // TCP CONNECT
    packet[offset++] = 0x03; // Domain
    packet[offset++] = domainBytes.length;
    packet.set(domainBytes, offset);
    offset += domainBytes.length;
    writeUint16BE(packet, offset, 8443);
    offset += 2;
    packet[offset++] = 0x0d;
    packet[offset++] = 0x0a;
    packet.set(payload, offset);

    const parsed = parseTrojanRequest(packet);
    expect(parsed.protocol).toBe('trojan');
    expect(parsed.credentialId).toBe(passHash);
    expect(parsed.target.host).toBe('cloudflare.com');
    expect(parsed.target.port).toBe(8443);
    expect(parsed.target.isUdp).toBe(false);
    expect(new TextDecoder().decode(parsed.payload)).toBe('HELLO TROJAN');
  });

  it('rejects malformed Trojan packets without CRLF', () => {
    const buf = new Uint8Array(70);
    expect(() => parseTrojanRequest(buf)).toThrow(
      expect.objectContaining({ code: ErrorCode.PROTO_INVALID_PACKET })
    );
  });
});

describe('Shadowsocks AEAD Parser & Crypto', () => {
  it('encrypts, decrypts and parses Shadowsocks AEAD packet', async () => {
    const password = 'ss-secret-password-123';
    const method = 'aes-128-gcm';
    const spec = CIPHER_SPECS[method];

    const salt = new Uint8Array(spec.saltSize);
    crypto.getRandomValues(salt);

    const masterKey = await deriveMasterKey(password, spec.keySize);
    const subkey = await deriveSubkey(masterKey, salt, spec.keySize);

    // Prepare SOCKS5 payload: 0x03 (domain) + 10 ("google.com") + port 443 + "PING"
    const domain = 'google.com';
    const domainBytes = stringToBytes(domain);
    const data = stringToBytes('PING');
    const socks5Payload = new Uint8Array(1 + 1 + domainBytes.length + 2 + data.length);
    let offset = 0;
    socks5Payload[offset++] = 0x03;
    socks5Payload[offset++] = domainBytes.length;
    socks5Payload.set(domainBytes, offset);
    offset += domainBytes.length;
    writeUint16BE(socks5Payload, offset, 443);
    offset += 2;
    socks5Payload.set(data, offset);

    // Encrypt length chunk (2 bytes payload length)
    const lenBuffer = new Uint8Array(2);
    writeUint16BE(lenBuffer, 0, socks5Payload.length);

    const nonce = new Uint8Array(spec.nonceSize);
    const encLen = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: spec.tagSize * 8 },
      subkey,
      lenBuffer
    );

    // Increment nonce for payload
    const noncePayload = new Uint8Array(spec.nonceSize);
    noncePayload[0] = 1;

    const encPayload = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: noncePayload, tagLength: spec.tagSize * 8 },
      subkey,
      socks5Payload
    );

    // Assemble full packet
    const fullPacket = new Uint8Array(spec.saltSize + encLen.byteLength + encPayload.byteLength);
    let pktOffset = 0;
    fullPacket.set(salt, pktOffset);
    pktOffset += spec.saltSize;
    fullPacket.set(new Uint8Array(encLen), pktOffset);
    pktOffset += encLen.byteLength;
    fullPacket.set(new Uint8Array(encPayload), pktOffset);

    // Decrypt and parse
    const parsed = await decryptAndParseShadowsocksRequest(fullPacket, password, method);
    expect(parsed.protocol).toBe('shadowsocks');
    expect(parsed.target.host).toBe('google.com');
    expect(parsed.target.port).toBe(443);
    expect(new TextDecoder().decode(parsed.payload)).toBe('PING');
  });
});
