/**
 * Inbound profile models and standard default presets.
 */

import { InboundRecord } from '../database/schema';

export type InboundProtocol = 'vless' | 'trojan' | 'shadowsocks';

export interface InboundPreset {
  name: string;
  protocol: InboundProtocol;
  transport: 'ws';
  tls_mode: 'tls' | 'none';
  port: number;
  path_template: string;
  fingerprint: string;
  allow_udp: number;
  notes: string;
}

export const DEFAULT_INBOUND_PRESETS: InboundPreset[] = [
  {
    name: 'VLESS WS TLS (Edge)',
    protocol: 'vless',
    transport: 'ws',
    tls_mode: 'tls',
    port: 443,
    path_template: '/edge/{token}/vless',
    fingerprint: 'chrome',
    allow_udp: 1,
    notes: 'Primary VLESS over WebSocket with TLS termination',
  },
  {
    name: 'Trojan WS TLS (Edge)',
    protocol: 'trojan',
    transport: 'ws',
    tls_mode: 'tls',
    port: 443,
    path_template: '/edge/{token}/trojan',
    fingerprint: 'chrome',
    allow_udp: 1,
    notes: 'Trojan protocol over WebSocket with TLS termination',
  },
  {
    name: 'Shadowsocks WS TLS (Edge)',
    protocol: 'shadowsocks',
    transport: 'ws',
    tls_mode: 'tls',
    port: 443,
    path_template: '/edge/{token}/ss',
    fingerprint: 'chrome',
    allow_udp: 1,
    notes: 'Shadowsocks AEAD (AES-128-GCM) over WebSocket with TLS',
  },
];
