import type { Env, UserRecord } from '../types';
import { randomHex } from '../utils/encoding';

export async function isInstalled(env: Env): Promise<boolean> {
  const row = await env.DB.prepare('SELECT id FROM admins WHERE id = 1').first<{ id: number }>();
  return !!row;
}

export async function getAdmin(env: Env) {
  return env.DB.prepare('SELECT * FROM admins WHERE id = 1').first<{
    id: number;
    password_salt: string;
    password_hash: string;
    password_iterations: number;
    created_at: string;
  }>();
}

export async function createAdmin(env: Env, salt: string, hash: string, iterations: number) {
  await env.DB.prepare(
    'INSERT INTO admins (id,password_salt,password_hash,password_iterations,created_at) VALUES (1,?,?,?,?)',
  ).bind(salt, hash, iterations, new Date().toISOString()).run();
}

export async function getSetting(env: Env, key: string, fallback = ''): Promise<string> {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>();
  return row?.value ?? fallback;
}

export async function setSetting(env: Env, key: string, value: string) {
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at',
  ).bind(key, value, now).run();
}

export async function listSettings(env: Env): Promise<Record<string, string>> {
  const result = await env.DB.prepare('SELECT key,value FROM settings').all<{ key: string; value: string }>();
  return Object.fromEntries((result.results ?? []).map((r) => [r.key, r.value]));
}

export async function listUsers(env: Env): Promise<UserRecord[]> {
  const result = await env.DB.prepare('SELECT * FROM users ORDER BY created_at DESC').all<UserRecord>();
  return result.results ?? [];
}

export async function getUserByToken(env: Env, token: string): Promise<UserRecord | null> {
  return (await env.DB.prepare('SELECT * FROM users WHERE token = ?').bind(token).first<UserRecord>()) ?? null;
}

export async function getUserById(env: Env, id: string): Promise<UserRecord | null> {
  return (await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRecord>()) ?? null;
}

export async function createUser(env: Env, input: Partial<UserRecord> & { name: string; username: string }): Promise<UserRecord> {
  const now = new Date().toISOString();
  const user: UserRecord = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    username: input.username.trim().toLowerCase(),
    uuid: crypto.randomUUID(),
    token: randomHex(18),
    enabled: 1,
    quota_bytes: Number(input.quota_bytes) || 0,
    used_bytes: 0,
    daily_quota_bytes: Number(input.daily_quota_bytes) || 0,
    daily_used_bytes: 0,
    daily_key: '',
    expires_at: input.expires_at || '',
    clean_ip: input.clean_ip || '',
    notes: input.notes || '',
    created_at: now,
    updated_at: now,
    last_seen_at: '',
  };
  await env.DB.prepare(`INSERT INTO users
    (id,name,username,uuid,token,enabled,quota_bytes,used_bytes,daily_quota_bytes,daily_used_bytes,daily_key,expires_at,clean_ip,notes,created_at,updated_at,last_seen_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(user.id,user.name,user.username,user.uuid,user.token,user.enabled,user.quota_bytes,user.used_bytes,user.daily_quota_bytes,user.daily_used_bytes,user.daily_key,user.expires_at,user.clean_ip,user.notes,user.created_at,user.updated_at,user.last_seen_at)
    .run();
  return user;
}

export async function updateUser(env: Env, id: string, patch: Record<string, unknown>): Promise<UserRecord | null> {
  const allowed = new Set(['name','username','enabled','quota_bytes','daily_quota_bytes','expires_at','clean_ip','notes']);
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [key, raw] of Object.entries(patch)) {
    if (!allowed.has(key)) continue;
    let value = raw;
    if (['quota_bytes','daily_quota_bytes','enabled'].includes(key)) value = Number(raw) || 0;
    fields.push(`${key} = ?`);
    values.push(value ?? '');
  }
  if (!fields.length) return getUserById(env, id);
  fields.push('updated_at = ?');
  values.push(new Date().toISOString(), id);
  await env.DB.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
  return getUserById(env, id);
}

export async function deleteUser(env: Env, id: string) {
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
}

export async function addUsage(env: Env, id: string, up: number, down: number) {
  const total = Math.max(0, Math.floor(up + down));
  if (!total) return;
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE users SET
    used_bytes = used_bytes + ?,
    daily_used_bytes = CASE WHEN daily_key = ? THEN daily_used_bytes + ? ELSE ? END,
    daily_key = ?,
    last_seen_at = ?,
    updated_at = ?
    WHERE id = ?`)
    .bind(total, today, total, total, today, now, now, id).run();
}

export function userIsAllowed(user: UserRecord): { ok: boolean; reason?: string } {
  if (!user.enabled) return { ok: false, reason: 'disabled' };
  if (user.expires_at) {
    const t = Date.parse(user.expires_at);
    if (Number.isFinite(t) && Date.now() > t) return { ok: false, reason: 'expired' };
  }
  if (user.quota_bytes > 0 && user.used_bytes >= user.quota_bytes) return { ok: false, reason: 'quota' };
  const today = new Date().toISOString().slice(0, 10);
  const dailyUsed = user.daily_key === today ? user.daily_used_bytes : 0;
  if (user.daily_quota_bytes > 0 && dailyUsed >= user.daily_quota_bytes) return { ok: false, reason: 'daily-quota' };
  return { ok: true };
}

export async function audit(env: Env, action: string, detail = '') {
  const safe = detail.slice(0, 500);
  await env.DB.prepare('INSERT INTO audit_log (created_at,action,detail) VALUES (?,?,?)')
    .bind(new Date().toISOString(), action, safe).run();
}
