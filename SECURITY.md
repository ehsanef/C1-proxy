# Security Policy for C1 Proxy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## Security Philosophy & Architecture

C1 Proxy is architected according to zero-trust edge computing principles:

1. **Native Web Crypto Cryptography**:
   - Administrative passwords are keyed using Web Crypto PBKDF2 with a tested Cloudflare-safe 100,000 iterations and a 16-byte random salt. Plaintext passwords are never stored.
   - Session tokens are signed using HMAC-SHA256 with an edge-persisted secret. Sessions use `HttpOnly`, `Secure`, and `SameSite=Strict` cookie policies.
2. **Strict CSRF Enforcement**:
   - Mutating API endpoints require a valid `x-c1-csrf` header matching the authenticated session payload.
3. **SSRF & RFC1918 Protection**:
   - The edge data plane blocks connections to loopback (127.0.0.0/8), RFC 1918 private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), link-local addresses, and spam ports (25, 465, 587).
4. **Zero Third-Party Data Leaks**:
   - QR codes are generated directly on the edge in pure TypeScript SVG. No user credentials, subscription tokens, or private node URIs are ever transmitted to external QR generation services.
5. **Sensitive Field Redaction**:
   - Passwords, cryptographic salts, session secrets, and cloud credentials are automatically stripped from API payloads, audit logs, and diagnostic exports.

---

## Reporting a Vulnerability

If you discover a security vulnerability in C1 Proxy, please report it privately via GitHub Security Advisories or by emailing `security@c1-proxy.org`.

Please include:
- A detailed description of the vulnerability.
- Steps to reproduce the issue or proof-of-concept payload.
- Potential impact and mitigation recommendations.

We will acknowledge receipt within 48 hours and provide a coordinated timeline for remediation.
