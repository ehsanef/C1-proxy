import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, DEFAULT_PBKDF2_ITERATIONS } from '../src/auth/password';
import {
  createSessionToken,
  verifySessionToken,
  buildSetCookieHeader,
  parseCookies,
  SESSION_COOKIE_NAME,
} from '../src/auth/session';
import { validateCsrfToken } from '../src/auth/csrf';
import { C1Error, ErrorCode } from '../src/app/errors';

describe('Auth & Password Security', () => {
  it('hashes and verifies password using Web Crypto PBKDF2 with 100,000 iterations', async () => {
    const password = 'SuperSecretAdminPassword123!';
    const hash = await hashPassword(password);

    expect(hash).toContain(`$pbkdf2$sha256$${DEFAULT_PBKDF2_ITERATIONS}$`);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);

    const isWrong = await verifyPassword('WrongPassword', hash);
    expect(isWrong).toBe(false);
  });

  it('rejects passwords shorter than 8 characters', async () => {
    await expect(hashPassword('short')).rejects.toThrow();
  });

  it('signs and validates HMAC session tokens', async () => {
    const secret = 'super-secure-independent-secret-key-32b!';
    const adminId = 'admin-uuid-1234';
    const username = 'admin';

    const { token, csrfToken } = await createSessionToken(adminId, username, secret, 3600);
    expect(token).toBeDefined();
    expect(token.split('.').length).toBe(2);
    expect(csrfToken).toBeDefined();

    const payload = await verifySessionToken(token, secret);
    expect(payload).not.toBeNull();
    expect(payload?.adminId).toBe(adminId);
    expect(payload?.username).toBe(username);
    expect(payload?.csrfToken).toBe(csrfToken);

    // Tampered token fails
    const tampered = token + 'a';
    const tamperedPayload = await verifySessionToken(tampered, secret);
    expect(tamperedPayload).toBeNull();

    // Wrong secret fails
    const wrongSecretPayload = await verifySessionToken(token, 'wrong-secret');
    expect(wrongSecretPayload).toBeNull();
  });

  it('handles cookie formatting and parsing', () => {
    const cookieHeader = buildSetCookieHeader(SESSION_COOKIE_NAME, 'my-token', 3600);
    expect(cookieHeader).toContain('c1_session=my-token');
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('Secure');
    expect(cookieHeader).toContain('SameSite=Strict');

    const parsed = parseCookies(`theme=dark; ${SESSION_COOKIE_NAME}=my-token; other=123`);
    expect(parsed[SESSION_COOKIE_NAME]).toBe('my-token');
    expect(parsed.theme).toBe('dark');
  });

  it('enforces CSRF validation for mutating requests', () => {
    const session = {
      adminId: 'admin1',
      username: 'admin',
      exp: 9999999999,
      csrfToken: 'valid-csrf-token-12345',
    };

    // GET requests skip CSRF
    const getReq = new Request('https://c1.test/api/users', { method: 'GET' });
    expect(() => validateCsrfToken(getReq, session)).not.toThrow();

    // POST without header fails
    const postReqNoHeader = new Request('https://c1.test/api/users', { method: 'POST' });
    expect(() => validateCsrfToken(postReqNoHeader, session)).toThrow(
      expect.objectContaining({ code: ErrorCode.AUTH_CSRF_INVALID })
    );

    // POST with wrong header fails
    const postReqWrong = new Request('https://c1.test/api/users', {
      method: 'POST',
      headers: { 'x-c1-csrf': 'wrong-token' },
    });
    expect(() => validateCsrfToken(postReqWrong, session)).toThrow(
      expect.objectContaining({ code: ErrorCode.AUTH_CSRF_INVALID })
    );

    // POST with valid header succeeds
    const postReqValid = new Request('https://c1.test/api/users', {
      method: 'POST',
      headers: { 'x-c1-csrf': 'valid-csrf-token-12345' },
    });
    expect(() => validateCsrfToken(postReqValid, session)).not.toThrow();
  });
});
