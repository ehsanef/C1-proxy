/**
 * Standard HTTP responses and security headers for C1 Proxy.
 */

export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy':
    "default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com data: blob:;",
};

export function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  });
}

export function htmlResponse(
  html: string,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  });
}

export function redirectResponse(
  url: string,
  status = 302,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(null, {
    status,
    headers: {
      Location: url,
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  });
}
