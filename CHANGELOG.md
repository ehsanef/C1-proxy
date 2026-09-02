# Changelog

All notable changes to C1 Proxy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-02

### Added
- **Core Edge Data Plane**:
  - Full VLESS over WebSocket + TLS implementation conforming to VLESS v0 protocol specifications.
  - Trojan over WebSocket + TLS implementation with RFC 3874 SHA-224 password authentication.
  - Shadowsocks AEAD (`aes-128-gcm`, `aes-256-gcm`) over WebSocket implementation using native Web Crypto AES-GCM and HKDF-SHA1 (SIP007).
  - Bidirectional stream pump using `cloudflare:sockets` with memory-conscious buffer management.
  - Bounded connection accounting (flushes at $\ge 1\text{ MB}$, connection closure, or interval) to prevent database rate limits on high-throughput transfers.
- **Canonical Storage & Migrations**:
  - Cloudflare D1 canonical relational database schema (`admins`, `users`, `inbounds`, `user_inbounds`, `settings`, `audit_log`, `usage_events`, `radar_results`, `schema_migrations`).
  - Idempotent `ensureMigrations()` migration engine running directly on edge startup.
- **Authentication & Control Plane**:
  - Secure first-install claim flow with Web Crypto PBKDF2 (100,000 iterations).
  - Signed HMAC-SHA256 session tokens with `HttpOnly`, `Secure`, and `SameSite=Strict` cookies.
  - Double-submit header CSRF verification for mutating operations.
  - Rate limiting with sliding window KV cache.
- **Universal Subscription Engine**:
  - Automatic `User-Agent` client detection (v2rayNG, Karing, Clash Meta / Mihomo, sing-box, Shadowrocket).
  - Clash Meta YAML generator producing valid proxy lists, groups, and rules.
  - sing-box 1.8+ JSON generator with outbounds, selectors, and urltest.
  - Standard Base64 and Raw URI formatters.
  - Standard `subscription-userinfo` bandwidth header integration.
- **Browser-Side C1 Radar**:
  - Reachability and latency scanner running in the browser for accurate local ISP reflection.
  - Bounded concurrency worker pool with generation ID sequence guards to prevent stale async results.
  - 1-click application of clean IPs globally or per user.
- **Clean-IP Multi-Node System**:
  - Generates multiple subscription nodes with preserved Host/SNI headers.
- **Local Pure TypeScript SVG QR Generator**:
  - Zero external dependencies or network calls to render inline SVG QR codes.
- **User Experience & Internationalization**:
  - Dark graphite infrastructure console aesthetic with responsive layout.
  - Authentic Persian (Farsi) translation with true bidirectional RTL support (`dir="rtl"`).
  - Granular user detail page with live quota meters, credential rotation, and instant direct connection cards.
  - Reusable inbound ingress profile system.
  - Neutral decoy connectivity probe page rendered at root for unauthenticated visitors.
  - Backup & restore manifest export/import.
  - Sanitized diagnostic export with automated secret redaction.
