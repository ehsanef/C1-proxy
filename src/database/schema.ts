/**
 * Database schema and model types for C1 Proxy (Cloudflare D1)
 */

export interface AdminRecord {
  id: string;
  username: string;
  password_hash: string;
  salt: string;
  created_at: string;
  updated_at: string;
}

export interface UserRecord {
  id: string;
  name: string;
  username: string;
  enabled: number; // 0 or 1
  created_at: string;
  updated_at: string;

  subscription_token: string;
  vless_uuid: string;
  trojan_password: string;
  shadowsocks_password: string;
  shadowsocks_method: string;

  quota_bytes: number;
  used_bytes: number;

  daily_quota_bytes: number;
  daily_used_bytes: number;
  daily_key: string;

  expires_at: string | null;

  max_ips: number;
  max_connections: number;

  clean_ip_mode: 'auto' | 'manual' | 'radar';
  clean_ip: string;
  notes: string;

  protocol_vless_enabled: number;
  protocol_trojan_enabled: number;
  protocol_shadowsocks_enabled: number;

  last_seen_at: string | null;
}

export interface InboundRecord {
  id: string;
  name: string;
  enabled: number;
  protocol: 'vless' | 'trojan' | 'shadowsocks';
  transport: 'ws';
  tls_mode: 'tls' | 'none';
  port: number;
  path_template: string;
  host: string;
  sni: string;
  fingerprint: string;
  allow_udp: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface UserInboundRecord {
  user_id: string;
  inbound_id: string;
  created_at: string;
}

export interface SettingRecord {
  key: string;
  value: string;
  updated_at: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  actor: string;
  details: string; // JSON string
  ip: string;
  created_at: string;
}

export interface UsageEventRecord {
  id: string;
  user_id: string;
  bytes_up: number;
  bytes_down: number;
  recorded_at: string;
}

export interface RadarResultRecord {
  id: string;
  ip: string;
  latency_ms: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'failed';
  jitter: number;
  tested_at: string;
}

export interface SchemaMigrationRecord {
  version: number;
  name: string;
  applied_at: string;
}
