# Deployment guide

## Recommended: Deploy to Cloudflare

The repository is designed to work as a Cloudflare template:

```text
https://deploy.workers.cloudflare.com/?url=https://github.com/ehsanef/C1-proxy
```

Cloudflare's Deploy button can automatically clone the public repository, provision D1 and KV from the Wrangler bindings, configure Workers Builds, and deploy the Worker.

### After deployment

Open:

```text
https://<worker>.<account-subdomain>.workers.dev/admin
```

Complete first install, then create a user and copy the subscription URL.

## Manual deployment

```bash
npm install
npx wrangler login
npm run check
npm run deploy
```

`wrangler.jsonc` declares D1 and KV bindings without account-specific IDs so modern Wrangler can provision them automatically.

## Custom domain

After deployment, attach a custom domain from Cloudflare Dashboard → Workers & Pages → your Worker → Settings → Domains & Routes.

C1 automatically uses the hostname of the incoming request when it builds subscription profiles, so no code change is required.

## Updating

When the project is connected to Cloudflare Workers Builds, pushing to the configured production branch triggers a new build/deploy. Review changes before merging production updates.

C1 deliberately does not download arbitrary JavaScript into itself and overwrite the running Worker.
