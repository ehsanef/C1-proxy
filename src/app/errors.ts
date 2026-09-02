/**
 * Standardized application error codes and C1Error class.
 * Ensures user-facing errors are safe while diagnostics have clear diagnostic codes.
 */

export const ErrorCode = {
  // Database / Migration
  DB_MIGRATION_MISSING: 'C1-DB-001',
  DB_QUERY_FAILED: 'C1-DB-002',
  DB_NOT_INITIALIZED: 'C1-DB-003',
  DB_RECORD_NOT_FOUND: 'C1-DB-004',
  DB_RECORD_CONFLICT: 'C1-DB-005',

  // Authentication & Session
  AUTH_CLAIM_REQUIRED: 'C1-AUTH-001',
  AUTH_INVALID_CREDENTIALS: 'C1-AUTH-002',
  AUTH_KDF_FAILED: 'C1-AUTH-003',
  AUTH_UNAUTHORIZED: 'C1-AUTH-004',
  AUTH_SESSION_EXPIRED: 'C1-AUTH-005',
  AUTH_CSRF_INVALID: 'C1-AUTH-006',
  AUTH_RATE_LIMITED: 'C1-AUTH-007',

  // Protocol & Data Plane
  PROTO_INVALID_PACKET: 'C1-PROTO-001',
  PROTO_AUTH_FAILED: 'C1-PROTO-002',
  PROTO_UNSUPPORTED_VERSION: 'C1-PROTO-003',
  PROTO_UNSUPPORTED_COMMAND: 'C1-PROTO-004',
  PROTO_UNSUPPORTED_ADDRESS: 'C1-PROTO-005',
  PROTO_ACCOUNT_DISABLED: 'C1-PROTO-006',
  PROTO_QUOTA_EXCEEDED: 'C1-PROTO-007',
  PROTO_EXPIRED: 'C1-PROTO-008',
  PROTO_IP_LIMIT_EXCEEDED: 'C1-PROTO-009',

  // Network & Transport
  NET_CONNECT_FAILED: 'C1-NET-001',
  NET_TARGET_BLOCKED: 'C1-NET-002',
  NET_STREAM_ABORTED: 'C1-NET-003',
  NET_DNS_FAILED: 'C1-NET-004',

  // Subscription
  SUB_TOKEN_INVALID: 'C1-SUB-001',
  SUB_FORMAT_UNSUPPORTED: 'C1-SUB-002',
  SUB_USER_NOT_FOUND: 'C1-SUB-003',

  // Validation
  VAL_INVALID_INPUT: 'C1-VAL-001',
  VAL_PASSWORD_TOO_SHORT: 'C1-VAL-002',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export class C1Error extends Error {
  public readonly code: ErrorCodeType;
  public readonly status: number;
  public readonly safeMessage: string;

  constructor(code: ErrorCodeType, safeMessage: string, status = 400, internalDetail?: string) {
    super(internalDetail ? `${safeMessage} (${internalDetail})` : safeMessage);
    this.name = 'C1Error';
    this.code = code;
    this.status = status;
    this.safeMessage = safeMessage;
  }
}
