<div align="center">

# ⚡ C1 Proxy

**Self-Hosted, Edge-Native Secure Proxy Control Plane for Cloudflare Workers**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020.svg?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-31%20Passed-brightgreen.svg?style=flat-square)](#automated-testing)

[English](README.md) &bull; [فارسی (Persian)](README.fa.md)

<br/>

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/c1-proxy/c1-proxy)

</div>

---

## 📖 Overview

**C1 Proxy** is an edge-native secure proxy control plane and data plane designed to run inside your personal Cloudflare account. It delivers high-performance proxy routing across **VLESS**, **Trojan**, and **Shadowsocks AEAD** over WebSocket + TLS with zero mandatory VPS, Docker, Python, or external database infrastructure.

### Core Architectural Principles

1. **Clear Plane Separation**: Control Plane (Admin Console, REST API, D1 Canonical Store, Subscriptions) and Data Plane (WebSocket Pair, Protocol Dispatcher, Sockets Pump, Bounded Accounting) are strictly separated internally.
2. **True Cloudflare Native**: Uses Cloudflare Workers, D1 Database, KV Cache, Web Crypto API, and Cloudflare Sockets (`cloudflare:sockets`) without unneeded npm runtime bloat.
3. **Zero 3rd-Party Credential Leaks**: QR codes are generated directly on the edge in pure TypeScript SVG. No credentials or URIs are ever sent to external QR servers.
4. **Accurate Feature Claims**: Every advertised protocol actually works on the edge. No fake country selectors, simulated configs, or unsupported claims.

---

## 🚀 Installation Methods

C1 Proxy supports two simple setup paths:

---

### Option A: Cloudflare-Only (No GitHub Account Required)
Anyone with just a free Cloudflare account can deploy in under 2 minutes:
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com).
2. Go to **Workers & Pages** &rarr; **Create Application** &rarr; **Create Worker** (name it `my-c1`) &rarr; click **Deploy**.
3. Click **Edit code** in the Worker view.
4. Copy the entire pre-built code from **[`bundle/c1-worker.js`](bundle/c1-worker.js)** and paste it into the Cloudflare online editor, then click **Deploy**.
5. **Attach D1 Database**:
   - Go to **Storage & Databases** &rarr; **D1** &rarr; click **Create database** (e.g. `c1-db`).
   - Return to your Worker &rarr; **Settings** &rarr; **Bindings** &rarr; **Add** &rarr; **D1 Database**.
   - Set **Variable name** to: `DB` and select your database.
   - *(Optional)*: Add a KV binding with variable name `KV`.
6. **Done!** Open `https://my-c1.your-subdomain.workers.dev/admin` to set up your administrator password.

---

### Option B: 1-Click Deploy (With GitHub Account)
1. Click the **Deploy to Cloudflare Workers** button above.
2. Cloudflare provisions the Worker, D1 database, and KV bindings automatically.
3. Open `https://your-worker.workers.dev/admin` to launch the first-install wizard.

---

## 🛡️ Protocol Engine & Data Plane

| Protocol | Transport | Security | Status | Details |
| :--- | :--- | :--- | :--- | :--- |
| **VLESS** | WebSocket | TLS (Port 443) | **Stable** | Standard VLESS v0 protocol, 16-byte UUID auth, custom SNI & fingerprint. |
| **Trojan** | WebSocket | TLS (Port 443) | **Stable** | RFC 3874 SHA-224 password authentication with CRLF delimiter compliance. |
| **Shadowsocks** | WebSocket | TLS (Port 443) | **Stable** | SIP007 AEAD (`aes-128-gcm`, `aes-256-gcm`) over WebSocket. |
| **VLESS Reality** | TCP | Custom | *Planned* | Modular backend node architecture required for native TCP Reality. |
| **WireGuard / WARP** | UDP | Crypto | *Planned* | Planned for optional secondary backend forwarder. |

---

## 📡 C1 Radar & Clean IP System

### Integrated Browser-Side C1 Radar
Unlike server-side IP testers that test latency from Cloudflare datacenters to themselves, **C1 Radar** runs directly in your browser. It measures reachability, packet loss, and round-trip latency from **your actual local ISP** to Cloudflare edge nodes.

- **Bounded Concurrency**: Scans 8–16 candidates simultaneously without freezing the browser.
- **Generation ID Sequence Guards**: Ensures stale asynchronous scan results never reappear after clearing or retesting.
- **1-Click Apply**: Immediately apply the lowest-latency IP globally or to specific users.

---

## 📱 Client Compatibility Matrix

C1 Proxy universal subscriptions (`/s/{token}`) detect the client's `User-Agent` and automatically deliver the proper schema:

| Client | Platform | Direct URI | Auto Sub | Clash Meta | sing-box | Base64 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **v2rayNG** | Android | ✅ | ✅ | — | — | ✅ |
| **Karing** | iOS / Android / macOS / Windows | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Mihomo / Clash Meta** | Multi-platform | — | ✅ | ✅ | — | — |
| **sing-box** (v1.8+) | Multi-platform | — | ✅ | — | ✅ | — |
| **Shadowrocket** | iOS | ✅ | ✅ | — | — | ✅ |
| **Streisand** | iOS | ✅ | ✅ | — | — | ✅ |

Explicit formats can also be queried directly:
- `?format=auto`
- `?format=clash` / `?format=mihomo`
- `?format=singbox`
- `?format=karing`
- `?format=base64`
- `?format=raw`

---

## 🎨 Interface & Experience

- **Console Aesthetic**: Dark graphite palette (`#090B0E`), glassmorphism accents, crisp monospace typography.
- **Internationalization & True RTL**: English and Persian (Farsi) are first-class citizens. Switching to Persian sets `dir="rtl"`, mirroring sidebar layouts, tables, buttons, and progress indicators authentically.
- **Granular User Detail**:
  - Live bandwidth and daily quota meters
  - Active concurrent IP counters
  - Instant credential rotation (Sub token, VLESS UUID, Trojan pass, Shadowsocks pass)
  - SVG QR code modals with zero external requests
- **Reusable Inbound Profiles**: Create and bind modular inbound ingress profiles across multiple users.

---

## 🔒 Security & Architecture

- **Web Crypto PBKDF2**: Password hashing uses native Web Crypto PBKDF2 with 100,000 iterations (fully tested within Cloudflare runtime limits).
- **HMAC Signed Sessions**: Ephemeral HttpOnly, Secure, SameSite=Strict cookie session management.
- **Double-Submit CSRF**: Mutating administrative actions require valid `x-c1-csrf` headers.
- **SSRF / Target Policy**: Outbound connections to RFC 1918 private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, loopback) and spam ports are blocked by default.
- **Sensitive Value Redaction**: Audit logs, diagnostics, and API responses sanitize passwords, session keys, and tokens.

---

## 🧪 Automated Testing

C1 Proxy maintains an automated test suite across all subsystems:

```bash
npm test
```

### Verified Test Suites:
- `tests/protocols.test.ts`: VLESS v0 packet parsing, Trojan SHA-224 test vectors, Shadowsocks AEAD decrypt & parsing.
- `tests/auth.test.ts`: PBKDF2 100,000 iterations, HMAC-SHA256 session signatures, CSRF enforcement.
- `tests/policy.test.ts`: Quota policies, daily quotas, expiration checks, SSRF target validation, and buffered accounting.
- `tests/subscription.test.ts`: Clash Meta YAML structure, sing-box JSON schemas, Base64 formatting, User-Agent detection.
- `tests/qr.test.ts`: Pure TypeScript SVG QR generation and data URIs.
- `tests/migrations.test.ts`: Idempotent D1 database schema migration execution.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
Attributions and specifications are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
