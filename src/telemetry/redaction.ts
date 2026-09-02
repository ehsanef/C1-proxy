/**
 * Sensitive value sanitization and redaction.
 * Ensures credentials and secrets never leak to logs or API payloads.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'salt',
  'trojan_password',
  'shadowsocks_password',
  'session_secret',
  'secret',
  'api_token',
  'cf_token',
  'claim_token',
  'token',
]);

export function redactSensitiveObject<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      result[key] = '[REDACTED]';
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      result[key] = redactSensitiveObject(val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }

  return result;
}

export function sanitizeUserForResponse(user: any): Record<string, unknown> {
  const sanitized = { ...user };
  delete sanitized.password_hash;
  delete sanitized.salt;
  return sanitized;
}
