/**
 * Protocol interfaces and common types for proxy data plane.
 */

export interface TargetAddress {
  host: string;
  port: number;
  addressType: 'ipv4' | 'domain' | 'ipv6';
  isUdp: boolean;
}

export interface ParsedProtocolRequest {
  protocol: 'vless' | 'trojan' | 'shadowsocks';
  credentialId: string; // UUID for VLESS, SHA224 hex for Trojan, password for SS
  target: TargetAddress;
  payload: Uint8Array;
  headerLength: number;
}
