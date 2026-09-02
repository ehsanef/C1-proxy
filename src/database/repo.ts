/**
 * Canonical D1 Database Repository for C1 Proxy
 */

import {
  AdminRecord,
  UserRecord,
  InboundRecord,
  SettingRecord,
  AuditLogRecord,
  RadarResultRecord,
} from './schema';
import { randomUuid } from '../utils/bytes';

export class C1Repository {
  constructor(private db: D1Database) {}

  // ---------------- ADMINS ----------------
  async getAdminCount(): Promise<number> {
    const res = await this.db.prepare('SELECT COUNT(*) as count FROM admins;').first<{ count: number }>();
    return res?.count ?? 0;
  }

  async getAdminByUsername(username: string): Promise<AdminRecord | null> {
    return this.db.prepare('SELECT * FROM admins WHERE username = ?;').bind(username).first<AdminRecord>();
  }

  async getAdminById(id: string): Promise<AdminRecord | null> {
    return this.db.prepare('SELECT * FROM admins WHERE id = ?;').bind(id).first<AdminRecord>();
  }

  async createAdmin(username: string, passwordHash: string, salt: string): Promise<AdminRecord> {
    const id = randomUuid();
    const now = new Date().toISOString();
    await this.db
      .prepare('INSERT INTO admins (id, username, password_hash, salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);')
      .bind(id, username, passwordHash, salt, now, now)
      .run();

    return {
      id,
      username,
      password_hash: passwordHash,
      salt,
      created_at: now,
      updated_at: now,
    };
  }

  // ---------------- USERS ----------------
  async listUsers(): Promise<UserRecord[]> {
    const res = await this.db.prepare('SELECT * FROM users ORDER BY created_at DESC;').all<UserRecord>();
    return res.results || [];
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    return this.db.prepare('SELECT * FROM users WHERE id = ?;').bind(id).first<UserRecord>();
  }

  async getUserByUsername(username: string): Promise<UserRecord | null> {
    return this.db.prepare('SELECT * FROM users WHERE username = ?;').bind(username).first<UserRecord>();
  }

  async getUserBySubscriptionToken(token: string): Promise<UserRecord | null> {
    return this.db.prepare('SELECT * FROM users WHERE subscription_token = ?;').bind(token).first<UserRecord>();
  }

  async getUserByVlessUuid(uuid: string): Promise<UserRecord | null> {
    return this.db.prepare('SELECT * FROM users WHERE vless_uuid = ?;').bind(uuid).first<UserRecord>();
  }

  async getUserByTrojanPassword(password: string): Promise<UserRecord | null> {
    return this.db.prepare('SELECT * FROM users WHERE trojan_password = ?;').bind(password).first<UserRecord>();
  }

  async getUserByShadowsocksPassword(password: string): Promise<UserRecord | null> {
    return this.db.prepare('SELECT * FROM users WHERE shadowsocks_password = ?;').bind(password).first<UserRecord>();
  }

  async createUser(user: Omit<UserRecord, 'id' | 'created_at' | 'updated_at'>): Promise<UserRecord> {
    const id = randomUuid();
    const now = new Date().toISOString();
    await this.db
      .prepare(
        `INSERT INTO users (
          id, name, username, enabled, created_at, updated_at,
          subscription_token, vless_uuid, trojan_password, shadowsocks_password, shadowsocks_method,
          quota_bytes, used_bytes, daily_quota_bytes, daily_used_bytes, daily_key,
          expires_at, max_ips, max_connections, clean_ip_mode, clean_ip, notes,
          protocol_vless_enabled, protocol_trojan_enabled, protocol_shadowsocks_enabled, last_seen_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?
        );`
      )
      .bind(
        id,
        user.name,
        user.username,
        user.enabled,
        now,
        now,
        user.subscription_token,
        user.vless_uuid,
        user.trojan_password,
        user.shadowsocks_password,
        user.shadowsocks_method,
        user.quota_bytes,
        user.used_bytes,
        user.daily_quota_bytes,
        user.daily_used_bytes,
        user.daily_key,
        user.expires_at,
        user.max_ips,
        user.max_connections,
        user.clean_ip_mode,
        user.clean_ip,
        user.notes,
        user.protocol_vless_enabled,
        user.protocol_trojan_enabled,
        user.protocol_shadowsocks_enabled,
        user.last_seen_at
      )
      .run();

    return {
      ...user,
      id,
      created_at: now,
      updated_at: now,
    };
  }

  async updateUser(id: string, updates: Partial<UserRecord>): Promise<void> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, val] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }

    if (fields.length === 0) return;

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?;`;
    await this.db.prepare(sql).bind(...values).run();
  }

  async deleteUser(id: string): Promise<void> {
    await this.db.batch([
      this.db.prepare('DELETE FROM user_inbounds WHERE user_id = ?;').bind(id),
      this.db.prepare('DELETE FROM usage_events WHERE user_id = ?;').bind(id),
      this.db.prepare('DELETE FROM users WHERE id = ?;').bind(id),
    ]);
  }

  async incrementUserUsage(userId: string, bytesDelta: number): Promise<void> {
    const now = new Date().toISOString();
    const todayKey = now.slice(0, 10); // YYYY-MM-DD

    await this.db
      .prepare(
        `UPDATE users
         SET used_bytes = used_bytes + ?,
             daily_used_bytes = CASE WHEN daily_key = ? THEN daily_used_bytes + ? ELSE ? END,
             daily_key = ?,
             last_seen_at = ?,
             updated_at = ?
         WHERE id = ?;`
      )
      .bind(bytesDelta, todayKey, bytesDelta, bytesDelta, todayKey, now, now, userId)
      .run();
  }

  async resetUserTraffic(userId: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare('UPDATE users SET used_bytes = 0, daily_used_bytes = 0, updated_at = ? WHERE id = ?;')
      .bind(now, userId)
      .run();
  }

  // ---------------- INBOUNDS ----------------
  async listInbounds(): Promise<InboundRecord[]> {
    const res = await this.db.prepare('SELECT * FROM inbounds ORDER BY created_at ASC;').all<InboundRecord>();
    return res.results || [];
  }

  async getInboundById(id: string): Promise<InboundRecord | null> {
    return this.db.prepare('SELECT * FROM inbounds WHERE id = ?;').bind(id).first<InboundRecord>();
  }

  async createInbound(inbound: Omit<InboundRecord, 'id' | 'created_at' | 'updated_at'>): Promise<InboundRecord> {
    const id = randomUuid();
    const now = new Date().toISOString();
    await this.db
      .prepare(
        `INSERT INTO inbounds (
          id, name, enabled, protocol, transport, tls_mode, port,
          path_template, host, sni, fingerprint, allow_udp, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
      )
      .bind(
        id,
        inbound.name,
        inbound.enabled,
        inbound.protocol,
        inbound.transport,
        inbound.tls_mode,
        inbound.port,
        inbound.path_template,
        inbound.host,
        inbound.sni,
        inbound.fingerprint,
        inbound.allow_udp,
        inbound.notes,
        now,
        now
      )
      .run();

    return {
      ...inbound,
      id,
      created_at: now,
      updated_at: now,
    };
  }

  async updateInbound(id: string, updates: Partial<InboundRecord>): Promise<void> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, val] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }

    if (fields.length === 0) return;

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const sql = `UPDATE inbounds SET ${fields.join(', ')} WHERE id = ?;`;
    await this.db.prepare(sql).bind(...values).run();
  }

  async deleteInbound(id: string): Promise<void> {
    await this.db.batch([
      this.db.prepare('DELETE FROM user_inbounds WHERE inbound_id = ?;').bind(id),
      this.db.prepare('DELETE FROM inbounds WHERE id = ?;').bind(id),
    ]);
  }

  async getUserInbounds(userId: string): Promise<InboundRecord[]> {
    const res = await this.db
      .prepare(
        `SELECT i.* FROM inbounds i
         INNER JOIN user_inbounds ui ON i.id = ui.inbound_id
         WHERE ui.user_id = ? AND i.enabled = 1
         ORDER BY i.created_at ASC;`
      )
      .bind(userId)
      .all<InboundRecord>();
    return res.results || [];
  }

  async setUserInbounds(userId: string, inboundIds: string[]): Promise<void> {
    const statements = [
      this.db.prepare('DELETE FROM user_inbounds WHERE user_id = ?;').bind(userId),
    ];
    const now = new Date().toISOString();
    for (const inboundId of inboundIds) {
      statements.push(
        this.db
          .prepare('INSERT INTO user_inbounds (user_id, inbound_id, created_at) VALUES (?, ?, ?);')
          .bind(userId, inboundId, now)
      );
    }
    await this.db.batch(statements);
  }

  // ---------------- SETTINGS ----------------
  async getSetting(key: string): Promise<string | null> {
    const res = await this.db.prepare('SELECT value FROM settings WHERE key = ?;').bind(key).first<SettingRecord>();
    return res ? res.value : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`
      )
      .bind(key, value, now)
      .run();
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const res = await this.db.prepare('SELECT key, value FROM settings;').all<SettingRecord>();
    const map: Record<string, string> = {};
    for (const row of res.results || []) {
      map[row.key] = row.value;
    }
    return map;
  }

  // ---------------- AUDIT LOG ----------------
  async createAuditLog(action: string, actor: string, details: Record<string, unknown>, ip = ''): Promise<void> {
    const id = randomUuid();
    const now = new Date().toISOString();
    await this.db
      .prepare('INSERT INTO audit_log (id, action, actor, details, ip, created_at) VALUES (?, ?, ?, ?, ?, ?);')
      .bind(id, action, actor, JSON.stringify(details), ip, now)
      .run();
  }

  async listAuditLogs(limit = 100): Promise<AuditLogRecord[]> {
    const res = await this.db
      .prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?;')
      .bind(limit)
      .all<AuditLogRecord>();
    return res.results || [];
  }

  // ---------------- RADAR RESULTS ----------------
  async saveRadarResults(results: { ip: string; latency_ms: number; status: string; jitter?: number }[]): Promise<void> {
    if (results.length === 0) return;
    const now = new Date().toISOString();
    const stmts = results.map(r =>
      this.db
        .prepare('INSERT INTO radar_results (id, ip, latency_ms, status, jitter, tested_at) VALUES (?, ?, ?, ?, ?, ?);')
        .bind(randomUuid(), r.ip, r.latency_ms, r.status, r.jitter || 0, now)
    );
    await this.db.batch(stmts);
  }

  async getRecentRadarResults(limit = 50): Promise<RadarResultRecord[]> {
    const res = await this.db
      .prepare('SELECT * FROM radar_results ORDER BY tested_at DESC, latency_ms ASC LIMIT ?;')
      .bind(limit)
      .all<RadarResultRecord>();
    return res.results || [];
  }
}
