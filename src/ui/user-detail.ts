/**
 * Comprehensive User Detail view for C1 Proxy.
 * Provides granular protocol toggles, credential rotation, direct URIs,
 * universal subscription links, SVG QR modals, and traffic controls.
 */

import { Language, t } from '../i18n';
import { InboundRecord, UserRecord } from '../database/schema';
import { buildVlessUri, buildTrojanUri, buildShadowsocksUri } from '../subscriptions/uri';
import { generateQrSvg } from '../qr/generate';
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

export function renderUserDetailView(
  lang: Language,
  user: UserRecord,
  inbounds: InboundRecord[],
  serverHost: string,
  serverOrigin: string
): string {
  const isExpired = user.expires_at && new Date(user.expires_at).getTime() < Date.now();
  let statusBadge = `<span class="status-badge"><span class="status-dot"></span>${t(lang, 'status_active')}</span>`;
  if (!user.enabled) {
    statusBadge = `<span class="status-badge" style="background: rgba(239, 68, 68, 0.1); color: #EF4444; border-color: rgba(239, 68, 68, 0.3);"><span class="status-dot" style="background: #EF4444; box-shadow: 0 0 8px #EF4444;"></span>${t(lang, 'status_disabled')}</span>`;
  } else if (isExpired) {
    statusBadge = `<span class="status-badge" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B; border-color: rgba(245, 158, 11, 0.3);"><span class="status-dot" style="background: #F59E0B; box-shadow: 0 0 8px #F59E0B;"></span>${t(lang, 'status_expired')}</span>`;
  }

  const universalSubUrl = `${serverOrigin}/s/${user.subscription_token}`;
  const clashSubUrl = `${universalSubUrl}?format=clash`;
  const singboxSubUrl = `${universalSubUrl}?format=singbox`;
  const karingSubUrl = `${universalSubUrl}?format=karing`;
  const base64SubUrl = `${universalSubUrl}?format=base64`;
  const rawSubUrl = `${universalSubUrl}?format=raw`;

  // Pre-generate primary node URIs for direct connection cards
  const vlessInbound = inbounds.find((i) => i.protocol === 'vless');
  const trojanInbound = inbounds.find((i) => i.protocol === 'trojan');
  const ssInbound = inbounds.find((i) => i.protocol === 'shadowsocks');

  const vlessUri = vlessInbound ? buildVlessUri({ user, inbound: vlessInbound, serverHost }) : '';
  const trojanUri = trojanInbound ? buildTrojanUri({ user, inbound: trojanInbound, serverHost }) : '';
  const ssUri = ssInbound ? buildShadowsocksUri({ user, inbound: ssInbound, serverHost }) : '';

  // QR SVGs
  const vlessQrSvg = vlessUri ? generateQrSvg(vlessUri, 220) : '';
  const trojanQrSvg = trojanUri ? generateQrSvg(trojanUri, 220) : '';
  const ssQrSvg = ssUri ? generateQrSvg(ssUri, 220) : '';
  const subQrSvg = generateQrSvg(universalSubUrl, 220);

  const trafficPercent = user.quota_bytes > 0 ? Math.min(100, Math.round((user.used_bytes / user.quota_bytes) * 100)) : 0;

  return `
  <!-- User Header -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
    <div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <h2 style="font-size: 24px; font-weight: 700;">${user.name || user.username}</h2>
        ${statusBadge}
      </div>
      <div style="font-family: var(--font-mono); color: var(--text-muted); font-size: 13px; margin-top: 4px;">
        @${user.username} &bull; ID: ${user.id}
      </div>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn btn-secondary" onclick="toggleUserStatus(${user.enabled ? 0 : 1})">
        ${user.enabled ? t(lang, 'disable_user') : t(lang, 'enable_user')}
      </button>
      <button class="btn btn-secondary" onclick="resetUserTraffic()">
        ${t(lang, 'reset_traffic')}
      </button>
      <button class="btn btn-danger" onclick="deleteUser()">
        ${t(lang, 'delete_user')}
      </button>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid-cards">
    <div class="card">
      <div class="card-title"><span>Bandwidth Quota</span></div>
      <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
        ${formatBytes(user.used_bytes)} / <span style="color: var(--text-secondary);">${user.quota_bytes > 0 ? formatBytes(user.quota_bytes) : '∞'}</span>
      </div>
      <div style="height: 6px; background: var(--bg-surface); border-radius: 3px; overflow: hidden;">
        <div style="height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); width: ${trafficPercent}%;"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span>Daily Quota</span></div>
      <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
        ${formatBytes(user.daily_used_bytes)} / <span style="color: var(--text-secondary);">${user.daily_quota_bytes > 0 ? formatBytes(user.daily_quota_bytes) : '∞'}</span>
      </div>
      <div style="color: var(--text-muted); font-size: 12px;">Reset key: ${user.daily_key || 'Today'}</div>
    </div>

    <div class="card">
      <div class="card-title"><span>Expiration Date</span></div>
      <div style="font-size: 18px; font-weight: 700;">
        ${user.expires_at ? new Date(user.expires_at).toLocaleDateString() : t(lang, 'never_expires')}
      </div>
      <div style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">
        ${user.expires_at ? (isExpired ? 'Expired' : 'Active') : 'No expiry set'}
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span>Limits & Routing</span></div>
      <div style="font-size: 14px;">
        <div>Max IPs: <strong>${user.max_ips > 0 ? user.max_ips : 'Unlimited'}</strong></div>
        <div style="margin-top: 4px;">Clean IP: <strong>${user.clean_ip_mode}</strong></div>
      </div>
    </div>
  </div>

  <!-- Universal Subscription Section -->
  <div class="card" style="margin-bottom: 24px;">
    <div class="card-title" style="margin-bottom: 16px;">
      <span>${t(lang, 'universal_subscription')}</span>
      <span style="font-size: 11px; color: var(--accent-cyan);">Supports auto client-detection</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center; background: var(--bg-surface); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 16px;">
      <input type="text" value="${universalSubUrl}" readonly style="flex: 1; background: none; border: none; color: #FFF; font-family: var(--font-mono); font-size: 12px; outline: none;" />
      <button class="btn btn-primary" onclick="copyToClipboard('${universalSubUrl}')" style="padding: 6px 14px; font-size: 12px;">
        ${t(lang, 'quick_copy_sub')}
      </button>
      <button class="btn btn-secondary" onclick="openModal('modal-sub-qr')" style="padding: 6px 14px; font-size: 12px;">
        ${t(lang, 'show_qr')}
      </button>
    </div>

    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
      <button class="btn btn-secondary" onclick="copyToClipboard('${clashSubUrl}', 'Clash URL copied!')" style="font-size: 12px;">
        Copy Clash / Mihomo
      </button>
      <button class="btn btn-secondary" onclick="copyToClipboard('${karingSubUrl}', 'Karing URL copied!')" style="font-size: 12px;">
        Copy Karing
      </button>
      <button class="btn btn-secondary" onclick="copyToClipboard('${singboxSubUrl}', 'sing-box URL copied!')" style="font-size: 12px;">
        Copy sing-box
      </button>
      <button class="btn btn-secondary" onclick="copyToClipboard('${base64SubUrl}', 'Base64 URL copied!')" style="font-size: 12px;">
        Copy Base64
      </button>
      <a href="${rawSubUrl}" target="_blank" class="btn btn-secondary" style="font-size: 12px;">
        View Raw URIs
      </a>
      <button class="btn btn-secondary" onclick="rotateCredential('token')" style="font-size: 12px; color: #F59E0B;">
        ${t(lang, 'rotate_token')}
      </button>
    </div>
  </div>

  <!-- Direct Protocol Cards -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px;">
    <!-- VLESS Card -->
    <div class="card">
      <div class="card-title">
        <span style="font-weight: 700; color: #FFF;">VLESS (WebSocket + TLS)</span>
        <label style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
          <input type="checkbox" ${user.protocol_vless_enabled ? 'checked' : ''} onchange="toggleProtocol('vless', this.checked)" /> Enabled
        </label>
      </div>
      <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin: 8px 0; word-break: break-all;">
        UUID: ${user.vless_uuid}
      </div>
      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button class="btn btn-secondary" onclick="copyToClipboard('${vlessUri}')" style="flex: 1; font-size: 12px;">
          ${t(lang, 'copy_uri')}
        </button>
        <button class="btn btn-secondary" onclick="openModal('modal-vless-qr')" style="font-size: 12px;">
          ${t(lang, 'show_qr')}
        </button>
        <button class="btn btn-secondary" onclick="rotateCredential('vless')" title="${t(lang, 'rotate_vless')}" style="padding: 6px 10px; font-size: 12px; color: #F59E0B;">
          ↻
        </button>
      </div>
    </div>

    <!-- Trojan Card -->
    <div class="card">
      <div class="card-title">
        <span style="font-weight: 700; color: #FFF;">Trojan (WebSocket + TLS)</span>
        <label style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
          <input type="checkbox" ${user.protocol_trojan_enabled ? 'checked' : ''} onchange="toggleProtocol('trojan', this.checked)" /> Enabled
        </label>
      </div>
      <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin: 8px 0; word-break: break-all;">
        Password: ${user.trojan_password}
      </div>
      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button class="btn btn-secondary" onclick="copyToClipboard('${trojanUri}')" style="flex: 1; font-size: 12px;">
          ${t(lang, 'copy_uri')}
        </button>
        <button class="btn btn-secondary" onclick="openModal('modal-trojan-qr')" style="font-size: 12px;">
          ${t(lang, 'show_qr')}
        </button>
        <button class="btn btn-secondary" onclick="rotateCredential('trojan')" title="${t(lang, 'rotate_trojan')}" style="padding: 6px 10px; font-size: 12px; color: #F59E0B;">
          ↻
        </button>
      </div>
    </div>

    <!-- Shadowsocks Card -->
    <div class="card">
      <div class="card-title">
        <span style="font-weight: 700; color: #FFF;">Shadowsocks (AEAD WS)</span>
        <label style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
          <input type="checkbox" ${user.protocol_shadowsocks_enabled ? 'checked' : ''} onchange="toggleProtocol('shadowsocks', this.checked)" /> Enabled
        </label>
      </div>
      <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin: 8px 0; word-break: break-all;">
        Cipher: ${user.shadowsocks_method} | Pass: ${user.shadowsocks_password}
      </div>
      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button class="btn btn-secondary" onclick="copyToClipboard('${ssUri}')" style="flex: 1; font-size: 12px;">
          ${t(lang, 'copy_uri')}
        </button>
        <button class="btn btn-secondary" onclick="openModal('modal-ss-qr')" style="font-size: 12px;">
          ${t(lang, 'show_qr')}
        </button>
        <button class="btn btn-secondary" onclick="rotateCredential('shadowsocks')" title="${t(lang, 'rotate_ss')}" style="padding: 6px 10px; font-size: 12px; color: #F59E0B;">
          ↻
        </button>
      </div>
    </div>
  </div>

  <!-- QR Modals (Inline pure SVG) -->
  <div id="modal-sub-qr" class="modal-backdrop">
    <div class="modal-content" style="text-align: center; max-width: 320px;">
      <div class="modal-header">
        <h3 class="modal-title">Universal Subscription QR</h3>
        <button class="modal-close" onclick="closeModal('modal-sub-qr')">&times;</button>
      </div>
      <div style="margin: 16px 0; display: flex; justify-content: center;">${subQrSvg}</div>
      <button class="btn btn-primary" onclick="copyToClipboard('${universalSubUrl}')" style="width: 100%;">Copy Link</button>
    </div>
  </div>

  <div id="modal-vless-qr" class="modal-backdrop">
    <div class="modal-content" style="text-align: center; max-width: 320px;">
      <div class="modal-header">
        <h3 class="modal-title">VLESS QR Code</h3>
        <button class="modal-close" onclick="closeModal('modal-vless-qr')">&times;</button>
      </div>
      <div style="margin: 16px 0; display: flex; justify-content: center;">${vlessQrSvg}</div>
      <button class="btn btn-primary" onclick="copyToClipboard('${vlessUri}')" style="width: 100%;">Copy URI</button>
    </div>
  </div>

  <div id="modal-trojan-qr" class="modal-backdrop">
    <div class="modal-content" style="text-align: center; max-width: 320px;">
      <div class="modal-header">
        <h3 class="modal-title">Trojan QR Code</h3>
        <button class="modal-close" onclick="closeModal('modal-trojan-qr')">&times;</button>
      </div>
      <div style="margin: 16px 0; display: flex; justify-content: center;">${trojanQrSvg}</div>
      <button class="btn btn-primary" onclick="copyToClipboard('${trojanUri}')" style="width: 100%;">Copy URI</button>
    </div>
  </div>

  <div id="modal-ss-qr" class="modal-backdrop">
    <div class="modal-content" style="text-align: center; max-width: 320px;">
      <div class="modal-header">
        <h3 class="modal-title">Shadowsocks QR Code</h3>
        <button class="modal-close" onclick="closeModal('modal-ss-qr')">&times;</button>
      </div>
      <div style="margin: 16px 0; display: flex; justify-content: center;">${ssQrSvg}</div>
      <button class="btn btn-primary" onclick="copyToClipboard('${ssUri}')" style="width: 100%;">Copy URI</button>
    </div>
  </div>

  <script>
    const USER_ID = "${user.id}";

    async function toggleUserStatus(newEnabled) {
      try {
        await apiRequest('/api/users/' + USER_ID + '/toggle', {
          method: 'POST',
          body: { enabled: newEnabled }
        });
        showToast('User status updated');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message || 'Failed to update user', 'error');
      }
    }

    async function resetUserTraffic() {
      if (!confirm('Are you sure you want to reset bandwidth usage for this user?')) return;
      try {
        await apiRequest('/api/users/' + USER_ID + '/reset-traffic', { method: 'POST' });
        showToast('Traffic counters reset to 0');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message || 'Failed to reset traffic', 'error');
      }
    }

    async function rotateCredential(type) {
      if (!confirm('Rotating credentials will immediately disconnect any active sessions using the old credential. Proceed?')) return;
      try {
        await apiRequest('/api/users/' + USER_ID + '/rotate-' + type, { method: 'POST' });
        showToast('Credential rotated successfully');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message || 'Failed to rotate credential', 'error');
      }
    }

    async function toggleProtocol(proto, isEnabled) {
      try {
        const payload = {};
        payload['protocol_' + proto + '_enabled'] = isEnabled ? 1 : 0;
        await apiRequest('/api/users/' + USER_ID, { method: 'PATCH', body: payload });
        showToast(proto.toUpperCase() + ' protocol ' + (isEnabled ? 'enabled' : 'disabled'));
      } catch (err) {
        showToast(err.message || 'Failed to update protocol', 'error');
      }
    }

    async function deleteUser() {
      if (!confirm('Delete user ${user.username}? This action is irreversible.')) return;
      try {
        await apiRequest('/api/users/' + USER_ID, { method: 'DELETE' });
        showToast('User deleted');
        window.location.href = '/admin/users';
      } catch (err) {
        showToast(err.message || 'Failed to delete user', 'error');
      }
    }
  </script>
  `;
}
