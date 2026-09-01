# Changelog

## 0.1.0 — 2026-09-01

Initial public beta.

- Deploy-to-Cloudflare template with automatic D1 + KV provisioning.
- First-install admin setup with optional claim token.
- Salted PBKDF2 administrator password storage; no plaintext admin password.
- Signed, HttpOnly sessions with CSRF protection and KV-backed login throttling.
- Multi-user panel with quota, daily quota, expiry, enable/disable, notes, and per-user clean IP.
- VLESS-over-WebSocket TCP transport using Cloudflare Sockets.
- Base64/raw, Clash/Mihomo and sing-box subscription outputs.
- Subscription auto-format selection based on client User-Agent.
- Per-connection traffic accounting committed at connection close rather than per chunk.
- Private/reserved destination protection for the TCP relay.
- Static decoy root page and minimal `/healthz` route.
- JSON backup export.
- CI for typecheck, tests, and Wrangler dry-run deployment.

### Not yet parity with Nova

The public beta deliberately does not claim full Nova feature parity. Trojan, Shadowsocks AEAD, WARP/AmneziaWG, Telegram management, browser clean-IP radar, GitHub subscription mirroring, Pages dual-door mode, and automated import/restore are planned modules rather than hidden or half-working features.
