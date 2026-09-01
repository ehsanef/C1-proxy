# C1 Proxy security

C1 is a credentialed network relay. Security issues can affect both the administrator and every user of an instance.

## Credentials

Treat these as secrets:

- administrator password
- `C1_CLAIM_TOKEN`
- `C1_SESSION_SECRET`
- every user's subscription token
- every user's VLESS UUID

Never commit `.dev.vars` or real secret values to GitHub.

## Administrator password

C1 does not store the administrator password in plaintext. It stores a random salt and PBKDF2-derived verifier in D1. Session signing uses an independent secret.

## Sessions

Admin sessions are HMAC-signed, HttpOnly, Secure and SameSite=Strict. State-changing API calls additionally require a CSRF token bound to the signed session.

## Login throttling

Failed login attempts are counted in KV by client IP with a TTL. This is intended as basic online brute-force protection, not a replacement for Cloudflare Access or account-level security.

## First install

Set `C1_CLAIM_TOKEN` when possible. Without it, an uninitialized public Worker is claimable by the first visitor who reaches the install endpoint.

## Relay restrictions

The VLESS TCP relay blocks obvious private, loopback and link-local destinations and blocks selected high-risk service ports. This reduces the chance that a compromised user credential can be used as an SSRF path into private infrastructure.

## Logging

The code does not intentionally log subscription tokens, UUIDs, passwords, request payloads or destination traffic. Do not add verbose packet logging to production instances.

## Vulnerability reports

If you publish this project, enable GitHub private vulnerability reporting and ask researchers to report exploitable issues privately before public disclosure.
