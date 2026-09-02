# Contributing to C1 Proxy

We welcome community contributions, bug reports, and optimizations to C1 Proxy!

## Clean Implementation & Architecture Principles

1. **Clean Code & Independent Maintainability**:
   - Do not copy proprietary or non-permissively licensed source code from other panel projects.
   - All protocols and transports must be built against open RFC standards and public specifications.
2. **Feature Claim Accuracy**:
   - Never implement a "config-only" or fake protocol that the Cloudflare Worker cannot genuinely carry.
   - If a feature requires non-native runtime capabilities (e.g. native TCP Reality, full Xray-core), design it as an optional modular backend node rather than simulating it.
3. **Zero Third-Party Telemetry**:
   - Never send client credentials, passwords, or node links to external APIs (e.g. third-party QR code generation sites).
4. **Performance & Cloudflare Free-Tier Friendliness**:
   - Avoid database writes on every TCP packet or chunk. Usage accounting must be buffered.
   - Keep cold-start size minimal and avoid unnecessary npm dependencies.

## Development Workflow

1. Fork and clone the repository.
2. Install development dependencies:
   ```bash
   npm install
   ```
3. Run the automated test suite:
   ```bash
   npm test
   ```
4. Verify TypeScript compilation:
   ```bash
   npm run typecheck
   ```
5. Test Cloudflare Worker bundling:
   ```bash
   npm run build
   ```

All pull requests must pass the CI pipeline (typecheck, tests, and build dry-run) before merging.
