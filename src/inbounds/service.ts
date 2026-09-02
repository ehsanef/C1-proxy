/**
 * Inbound management service for C1 Proxy.
 */

import { C1Repository } from '../database/repo';
import { InboundRecord } from '../database/schema';
import { DEFAULT_INBOUND_PRESETS } from './model';
import { C1Error, ErrorCode } from '../app/errors';

export class InboundService {
  constructor(private repo: C1Repository) {}

  async ensureDefaultInbounds(serverHost = ''): Promise<void> {
    const existing = await this.repo.listInbounds();
    if (existing.length > 0) return;

    for (const preset of DEFAULT_INBOUND_PRESETS) {
      await this.repo.createInbound({
        name: preset.name,
        enabled: 1,
        protocol: preset.protocol,
        transport: preset.transport,
        tls_mode: preset.tls_mode,
        port: preset.port,
        path_template: preset.path_template,
        host: serverHost,
        sni: serverHost,
        fingerprint: preset.fingerprint,
        allow_udp: preset.allow_udp,
        notes: preset.notes,
      });
    }
  }

  async listInbounds(): Promise<InboundRecord[]> {
    return this.repo.listInbounds();
  }

  async getInbound(id: string): Promise<InboundRecord> {
    const inbound = await this.repo.getInboundById(id);
    if (!inbound) {
      throw new C1Error(ErrorCode.DB_RECORD_NOT_FOUND, `Inbound profile not found: ${id}`, 404);
    }
    return inbound;
  }

  async createInbound(data: Omit<InboundRecord, 'id' | 'created_at' | 'updated_at'>): Promise<InboundRecord> {
    return this.repo.createInbound(data);
  }

  async updateInbound(id: string, updates: Partial<InboundRecord>): Promise<void> {
    await this.getInbound(id); // verify exists
    await this.repo.updateInbound(id, updates);
  }

  async deleteInbound(id: string): Promise<void> {
    await this.repo.deleteInbound(id);
  }
}
