/**
 * CSRF validation for mutating panel API operations.
 */

import { C1Error, ErrorCode } from '../app/errors';
import { CSRF_HEADER_NAME, SessionPayload } from './session';

export function validateCsrfToken(request: Request, session: SessionPayload): void {
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return;
  }

  const headerVal = request.headers.get(CSRF_HEADER_NAME);
  if (!headerVal || headerVal !== session.csrfToken) {
    throw new C1Error(ErrorCode.AUTH_CSRF_INVALID, 'Invalid or missing CSRF token', 403);
  }
}
