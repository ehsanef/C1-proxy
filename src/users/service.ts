/**
 * User management service for C1 Proxy.
 */

import { C1Repository } from '../database/repo';
import { UserRecord } from '../database/schema';
import { randomToken, randomUuid } from '../utils/bytes';
import { isValidUsername } from '../utils/validation';
import { C1Error, ErrorCode } from '../app/errors';

export interface CreateUserInput {
  name: string;
  username: string;
  quota_bytes?: number;
  daily_quota_bytes?: number;
  expires_at?: string | null;
  max_ips?: number;
  max_connections?: number;
  clean_ip_mode?: 'auto' | 'manual' | 'radar';
  clean_ip?: string;
  notes?: string;
  protocol_vless_enabled?: number;
  protocol_trojan_enabled?: number;
  protocol_shadowsocks_enabled?: number;
  inbound_ids?: string[];
}

export class UserService {
  constructor(private repo: C1Repository) {}

  async listUsers(): Promise<UserRecord[]> {
    return this.repo.listUsers();
  }

  async getUser(id: string): Promise<UserRecord> {
    const user = await this.repo.getUserById(id);
    if (!user) {
      throw new C1Error(ErrorCode.DB_RECORD_NOT_FOUND, `User not found: ${id}`, 404);
    }
    return user;
  }

  async getUserBySubscriptionToken(token: string): Promise<UserRecord> {
    const user = await this.repo.getUserBySubscriptionToken(token);
    if (!user) {
      throw new C1Error(ErrorCode.SUB_TOKEN_INVALID, 'Invalid subscription token', 404);
    }
    return user;
  }

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    if (!isValidUsername(input.username)) {
      throw new C1Error(
        ErrorCode.VAL_INVALID_INPUT,
        'Username may contain letters, numbers, _ and - only (3-32 characters)',
        400
      );
    }

    const existing = await this.repo.getUserByUsername(input.username);
    if (existing) {
      throw new C1Error(ErrorCode.DB_RECORD_CONFLICT, `Username already exists: ${input.username}`, 409);
    }

    const subscriptionToken = randomToken(16);
    const vlessUuid = randomUuid();
    const trojanPassword = randomToken(16);
    const shadowsocksPassword = randomToken(16);

    const user = await this.repo.createUser({
      name: input.name || input.username,
      username: input.username,
      enabled: 1,
      subscription_token: subscriptionToken,
      vless_uuid: vlessUuid,
      trojan_password: trojanPassword,
      shadowsocks_password: shadowsocksPassword,
      shadowsocks_method: 'aes-128-gcm',
      quota_bytes: input.quota_bytes ?? 0,
      used_bytes: 0,
      daily_quota_bytes: input.daily_quota_bytes ?? 0,
      daily_used_bytes: 0,
      daily_key: '',
      expires_at: input.expires_at ?? null,
      max_ips: input.max_ips ?? 0,
      max_connections: input.max_connections ?? 0,
      clean_ip_mode: input.clean_ip_mode ?? 'auto',
      clean_ip: input.clean_ip ?? '',
      notes: input.notes ?? '',
      protocol_vless_enabled: input.protocol_vless_enabled ?? 1,
      protocol_trojan_enabled: input.protocol_trojan_enabled ?? 1,
      protocol_shadowsocks_enabled: input.protocol_shadowsocks_enabled ?? 1,
      last_seen_at: null,
    });

    // Bind inbounds
    if (input.inbound_ids && input.inbound_ids.length > 0) {
      await this.repo.setUserInbounds(user.id, input.inbound_ids);
    } else {
      // Bind to all enabled inbounds by default
      const inbounds = await this.repo.listInbounds();
      const enabledIds = inbounds.filter((i) => i.enabled).map((i) => i.id);
      if (enabledIds.length > 0) {
        await this.repo.setUserInbounds(user.id, enabledIds);
      }
    }

    return user;
  }

  async updateUser(id: string, updates: Partial<UserRecord>): Promise<void> {
    await this.getUser(id);
    await this.repo.updateUser(id, updates);
  }

  async toggleUser(id: string, enabled: boolean): Promise<void> {
    await this.updateUser(id, { enabled: enabled ? 1 : 0 });
  }

  async resetTraffic(id: string): Promise<void> {
    await this.getUser(id);
    await this.repo.resetUserTraffic(id);
  }

  async rotateSubscriptionToken(id: string): Promise<string> {
    await this.getUser(id);
    const newToken = randomToken(16);
    await this.repo.updateUser(id, { subscription_token: newToken });
    return newToken;
  }

  async rotateVlessUuid(id: string): Promise<string> {
    await this.getUser(id);
    const newUuid = randomUuid();
    await this.repo.updateUser(id, { vless_uuid: newUuid });
    return newUuid;
  }

  async rotateTrojanPassword(id: string): Promise<string> {
    await this.getUser(id);
    const newPass = randomToken(16);
    await this.repo.updateUser(id, { trojan_password: newPass });
    return newPass;
  }

  async rotateShadowsocksPassword(id: string): Promise<string> {
    await this.getUser(id);
    const newPass = randomToken(16);
    await this.repo.updateUser(id, { shadowsocks_password: newPass });
    return newPass;
  }

  async deleteUser(id: string): Promise<void> {
    await this.getUser(id);
    await this.repo.deleteUser(id);
  }
}
