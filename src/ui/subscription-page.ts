/**
 * Public User Subscription Portal rendered at /s/{token} for browser requests.
 * Completely client-facing, pristine dark UI, zero admin exposure.
 */

import { InboundRecord, UserRecord } from '../database/schema';
import { buildVlessUri, buildTrojanUri, buildShadowsocksUri } from '../subscriptions/uri';
import { generateQrSvg } from '../qr/generate';
import { renderLogoSvg } from './shell';
import { generateAllNodeOptions } from '../routing/clean-ip';

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export function renderPublicSubscriptionPage(
  user: UserRecord,
  inbounds: InboundRecord[],
  serverHost: string,
  serverOrigin: string,
  cleanIps: string[] = []
): string {
  const isExpired = user.expires_at && new Date(user.expires_at).getTime() < Date.now();
  const subUrl = `${serverOrigin}/s/${user.subscription_token}`;
  const clashUrl = `${subUrl}?format=clash`;
  const singboxUrl = `${subUrl}?format=singbox`;
  const karingUrl = `${subUrl}?format=karing`;
  const base64Url = `${subUrl}?format=base64`;
  const rawUrl = `${subUrl}?format=raw`;

  const nodeOptions = generateAllNodeOptions(user, inbounds, serverHost, cleanIps);
  const totalNodes = nodeOptions.length;

  // Direct protocol nodes
  const vlessInbound = inbounds.find((i) => i.protocol === 'vless');
  const trojanInbound = inbounds.find((i) => i.protocol === 'trojan');
  const ssInbound = inbounds.find((i) => i.protocol === 'shadowsocks');

  const vlessUri = vlessInbound && user.protocol_vless_enabled ? buildVlessUri({ user, inbound: vlessInbound, serverHost }) : '';
  const trojanUri = trojanInbound && user.protocol_trojan_enabled ? buildTrojanUri({ user, inbound: trojanInbound, serverHost }) : '';
  const ssUri = ssInbound && user.protocol_shadowsocks_enabled ? buildShadowsocksUri({ user, inbound: ssInbound, serverHost }) : '';

  const vlessQr = vlessUri ? generateQrSvg(vlessUri, 200) : '';
  const trojanQr = trojanUri ? generateQrSvg(trojanUri, 200) : '';
  const ssQr = ssUri ? generateQrSvg(ssUri, 200) : '';
  const subQr = generateQrSvg(subUrl, 200);

  const trafficPercent = user.quota_bytes > 0 ? Math.min(100, Math.round((user.used_bytes / user.quota_bytes) * 100)) : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>C1 Subscription - ${user.name || user.username}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #090B0E;
      --bg-surface: #11141B;
      --bg-card: #151922;
      --border-subtle: #1F2633;
      --text-primary: #F8FAFC;
      --text-secondary: #94A3B8;
      --text-muted: #64748B;
      --accent: #6366F1;
      --accent-purple: #8B5CF6;
      --success: #10B981;
      --font-sans: 'Outfit', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
    }
    .container {
      width: 100%;
      max-width: 680px;
    }
    .header-branding {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #FFF, #94A3B8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .user-profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .status-dot {
      width: 7px; height: 7px; border-radius: 50%; background: var(--success);
      box-shadow: 0 0 8px var(--success);
    }
    .progress-bar {
      height: 8px; background: var(--bg-surface); border-radius: 4px; overflow: hidden; margin: 12px 0;
    }
    .progress-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-purple)); width: ${trafficPercent}%;
    }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
      cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease;
      text-decoration: none; color: inherit;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-purple));
      color: #FFF; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }
    .btn-secondary {
      background: #1C2230; color: #FFF; border-color: var(--border-subtle);
    }
    .btn-secondary:hover { background: #252D3D; }
    .grid-clients {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-top: 14px;
    }
    .toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #1C2230; border: 1px solid var(--accent); color: #FFF;
      padding: 10px 20px; border-radius: 8px; font-size: 13px; display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-branding">
      ${renderLogoSvg(36)}
      <span class="brand-title">C1 Proxy Subscription</span>
    </div>

    <!-- User Status Card -->
    <div class="card">
      <div class="user-profile-header">
        <div>
          <h2 style="font-size: 20px; font-weight: 700;">${user.name || user.username}</h2>
          <div style="color: var(--text-muted); font-size: 12px; margin-top: 2px;">Universal Subscription Portal</div>
        </div>
        <div class="status-badge">
          <span class="status-dot"></span>
          <span>${user.enabled && !isExpired ? 'Active' : 'Expired/Disabled'}</span>
        </div>
      </div>

      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">
        Bandwidth: <strong style="color: #FFF;">${formatBytes(user.used_bytes)}</strong> / ${user.quota_bytes > 0 ? formatBytes(user.quota_bytes) : 'Unlimited'}
      </div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
        <span>Expires: ${user.expires_at ? new Date(user.expires_at).toLocaleDateString() : 'Never'}</span>
        <span>Available Nodes: <strong style="color: #FFF;">${totalNodes}</strong></span>
      </div>
    </div>

    <!-- Universal Link Card -->
    <div class="card">
      <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 12px;">Universal Subscription URL</h3>
      <div style="display: flex; gap: 10px; margin-bottom: 16px;">
        <input type="text" id="sub-url-input" value="${subUrl}" readonly style="flex: 1; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 8px 12px; color: #FFF; font-family: var(--font-mono); font-size: 12px;" />
        <button class="btn btn-primary" onclick="copyText('${subUrl}')">Copy</button>
      </div>

      <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">1-Click Import & Formats:</div>
      <div class="grid-clients">
        <button class="btn btn-secondary" onclick="copyText('${karingUrl}')">Karing</button>
        <button class="btn btn-secondary" onclick="copyText('${clashUrl}')">Clash / Mihomo</button>
        <button class="btn btn-secondary" onclick="copyText('${singboxUrl}')">sing-box</button>
        <button class="btn btn-secondary" onclick="copyText('${base64Url}')">Base64</button>
        <a href="${rawUrl}" target="_blank" class="btn btn-secondary">Raw URIs</a>
      </div>

      <div style="margin-top: 20px; display: flex; flex-direction: column; align-items: center;">
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Universal Subscription QR Code:</div>
        <div style="padding: 12px; background: #FFF; border-radius: 12px;">${subQr}</div>
      </div>
    </div>

    <!-- Direct Nodes -->
    ${
      vlessUri
        ? `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="font-size: 15px; font-weight: 600;">VLESS Direct Connection</h3>
        <button class="btn btn-secondary" onclick="copyText('${vlessUri}')" style="font-size: 12px; padding: 4px 10px;">Copy URI</button>
      </div>
      <div style="display: flex; justify-content: center; padding: 12px; background: #FFF; border-radius: 12px; max-width: 220px; margin: 0 auto;">
        ${vlessQr}
      </div>
    </div>
    `
        : ''
    }

    ${
      trojanUri
        ? `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="font-size: 15px; font-weight: 600;">Trojan Direct Connection</h3>
        <button class="btn btn-secondary" onclick="copyText('${trojanUri}')" style="font-size: 12px; padding: 4px 10px;">Copy URI</button>
      </div>
      <div style="display: flex; justify-content: center; padding: 12px; background: #FFF; border-radius: 12px; max-width: 220px; margin: 0 auto;">
        ${trojanQr}
      </div>
    </div>
    `
        : ''
    }

    ${
      ssUri
        ? `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="font-size: 15px; font-weight: 600;">Shadowsocks Direct Connection</h3>
        <button class="btn btn-secondary" onclick="copyText('${ssUri}')" style="font-size: 12px; padding: 4px 10px;">Copy URI</button>
      </div>
      <div style="display: flex; justify-content: center; padding: 12px; background: #FFF; border-radius: 12px; max-width: 220px; margin: 0 auto;">
        ${ssQr}
      </div>
    </div>
    `
        : ''
    }
  </div>

  <div id="toast" class="toast">Link copied to clipboard!</div>

  <script>
    function copyText(t) {
      navigator.clipboard.writeText(t).then(() => {
        const toast = document.getElementById('toast');
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2500);
      });
    }
  </script>
</body>
</html>`;
}
