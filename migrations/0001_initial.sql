-- Migration 0001: Initial Schema for C1 Proxy
-- Database: SQLite (Cloudflare D1)

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  subscription_token TEXT NOT NULL UNIQUE,
  vless_uuid TEXT NOT NULL UNIQUE,
  trojan_password TEXT NOT NULL,
  shadowsocks_password TEXT NOT NULL,
  shadowsocks_method TEXT NOT NULL DEFAULT 'aes-128-gcm',
  quota_bytes INTEGER NOT NULL DEFAULT 0,
  used_bytes INTEGER NOT NULL DEFAULT 0,
  daily_quota_bytes INTEGER NOT NULL DEFAULT 0,
  daily_used_bytes INTEGER NOT NULL DEFAULT 0,
  daily_key TEXT NOT NULL DEFAULT '',
  expires_at TEXT,
  max_ips INTEGER NOT NULL DEFAULT 0,
  max_connections INTEGER NOT NULL DEFAULT 0,
  clean_ip_mode TEXT NOT NULL DEFAULT 'auto',
  clean_ip TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  protocol_vless_enabled INTEGER NOT NULL DEFAULT 1,
  protocol_trojan_enabled INTEGER NOT NULL DEFAULT 1,
  protocol_shadowsocks_enabled INTEGER NOT NULL DEFAULT 1,
  last_seen_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_subscription_token ON users (subscription_token);
CREATE INDEX IF NOT EXISTS idx_users_vless_uuid ON users (vless_uuid);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_enabled ON users (enabled);

CREATE TABLE IF NOT EXISTS inbounds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  protocol TEXT NOT NULL,
  transport TEXT NOT NULL DEFAULT 'ws',
  tls_mode TEXT NOT NULL DEFAULT 'tls',
  port INTEGER NOT NULL DEFAULT 443,
  path_template TEXT NOT NULL,
  host TEXT NOT NULL DEFAULT '',
  sni TEXT NOT NULL DEFAULT '',
  fingerprint TEXT NOT NULL DEFAULT 'chrome',
  allow_udp INTEGER NOT NULL DEFAULT 1,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_inbounds (
  user_id TEXT NOT NULL,
  inbound_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, inbound_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (inbound_id) REFERENCES inbounds(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  details TEXT NOT NULL,
  ip TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at DESC);

CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  bytes_up INTEGER NOT NULL DEFAULT 0,
  bytes_down INTEGER NOT NULL DEFAULT 0,
  recorded_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_time ON usage_events (user_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS radar_results (
  id TEXT PRIMARY KEY,
  ip TEXT NOT NULL,
  latency_ms REAL NOT NULL,
  status TEXT NOT NULL,
  jitter REAL NOT NULL DEFAULT 0,
  tested_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_radar_results_tested_at ON radar_results (tested_at DESC);
