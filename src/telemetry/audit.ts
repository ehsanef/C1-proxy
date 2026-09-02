/**
 * Audit log recording helper with automated redaction.
 */

import { C1Repository } from '../database/repo';
import { redactSensitiveObject } from './redaction';

export async function recordAudit(
  repo: C1Repository,
  action: string,
  actor: string,
  details: Record<string, unknown>,
  ip = ''
): Promise<void> {
  const safeDetails = redactSensitiveObject(details);
  try {
    await repo.createAuditLog(action, actor, safeDetails, ip);
  } catch (e) {
    console.error('[C1-AUDIT] Failed to record audit log:', e);
  }
}
