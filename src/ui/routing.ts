/**
 * Routing and Clean-IP pool management UI view.
 */

import { Language, t } from '../i18n';

export function renderRoutingView(lang: Language, globalCleanIps: string, outboundMode: string): string {
  return `
  <div style="margin-bottom: 24px;">
    <h2 style="font-size: 22px; font-weight: 700;">${t(lang, 'nav_routing')}</h2>
    <div style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
      Configure global clean IP frontend pools and outbound routing architecture.
    </div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
    <!-- Clean IP Pool -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>Global Clean IP Pool</span>
      </div>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 14px;">
        Comma or newline-separated Cloudflare frontend IPs. These are appended to user subscriptions as alternate clean nodes while keeping proper Host and SNI headers.
      </p>
      <form onsubmit="handleSaveCleanIps(event)">
        <div class="form-group">
          <textarea id="routing-clean-ips" class="form-input" rows="6" style="font-family: var(--font-mono); font-size: 12px;" placeholder="104.16.132.229&#10;104.17.157.100&#10;172.64.155.209">${globalCleanIps}</textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          ${t(lang, 'save_changes')}
        </button>
      </form>
    </div>

    <!-- Outbound Architecture -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>Outbound Architecture</span>
        <span class="status-badge"><span class="status-dot"></span>Active</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px;">
          <div style="font-weight: 600; color: #FFF; margin-bottom: 4px;">Direct Cloudflare Edge Outbound</div>
          <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 8px;">
            The Cloudflare Worker initiates native TCP socket connections directly to public internet destinations via the <code>cloudflare:sockets</code> API.
          </p>
          <span class="status-badge" style="background: rgba(99, 102, 241, 0.15); color: #A5B4FC; border-color: rgba(99, 102, 241, 0.3);">
            Default &bull; Zero External Infrastructure
          </span>
        </div>

        <div style="padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; opacity: 0.85;">
          <div style="font-weight: 600; color: #FFF; margin-bottom: 4px;">Optional C1 Backend Node (Future/Modular)</div>
          <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 8px;">
            Enables forwarding to dedicated Xray-core / Reality / WireGuard backend nodes for advanced egress policies.
          </p>
          <span style="font-size: 11px; color: var(--text-muted);">
            Status: Disabled (Modular architecture ready)
          </span>
        </div>
      </div>
    </div>
  </div>

  <script>
    async function handleSaveCleanIps(e) {
      e.preventDefault();
      const val = document.getElementById('routing-clean-ips').value.trim();
      try {
        await apiRequest('/api/settings', {
          method: 'POST',
          body: { key: 'global_clean_ips', value: val }
        });
        showToast('Clean IP pool updated successfully');
      } catch (err) {
        showToast(err.message || 'Failed to save settings', 'error');
      }
    }
  </script>
  `;
}
