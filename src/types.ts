export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  C1_CLAIM_TOKEN?: string;
  C1_SESSION_SECRET?: string;
}

export interface UserRecord {
  id: string;
  name: string;
  username: string;
  uuid: string;
  token: string;
  enabled: number;
  quota_bytes: number;
  used_bytes: number;
  daily_quota_bytes: number;
  daily_used_bytes: number;
  daily_key: string;
  expires_at: string;
  clean_ip: string;
  notes: string;
  created_at: string;
  updated_at: string;
  last_seen_at: string;
}

export interface SessionData {
  exp: number;
  csrf: string;
}
