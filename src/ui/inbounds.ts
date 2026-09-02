/**
 * Inbound profiles management UI view for C1 Proxy.
 */

import { Language, t } from '../i18n';
import { InboundRecord } from '../database/schema';

export function renderInboundsView(lang: Language, inbounds: InboundRecord[]): string {
  return `
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <div>
      <h2 style="font-size: 20px; font-weight: 700;">${t(lang, 'nav_inbounds')}</h2>
      <div style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
        Reusable ingress templates attached to client subscription configurations.
      </div>
    </div>
    <button class="btn btn-primary" onclick="openModal('create-inbound-modal')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>${t(lang, 'add_inbound')}</span>
    </button>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>${t(lang, 'inbound_name')}</th>
          <th>${t(lang, 'protocol')}</th>
          <th>${t(lang, 'transport')}</th>
          <th>${t(lang, 'port')}</th>
          <th>Path Template</th>
          <th>${t(lang, 'actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${
          inbounds.length === 0
            ? `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">No inbound profiles found.</td></tr>`
            : inbounds
                .map(
                  (ib) => `
          <tr>
            <td>
              <div style="font-weight: 600; color: #FFF;">${ib.name}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${ib.notes || 'Default edge profile'}</div>
            </td>
            <td>
              <span class="status-badge" style="background: rgba(99, 102, 241, 0.15); color: #A5B4FC; border-color: rgba(99, 102, 241, 0.3);">
                ${ib.protocol.toUpperCase()}
              </span>
            </td>
            <td><span style="font-family: var(--font-mono); font-size: 12px;">${ib.transport.toUpperCase()} + ${ib.tls_mode.toUpperCase()}</span></td>
            <td><span style="font-family: var(--font-mono); font-size: 12px;">${ib.port}</span></td>
            <td><span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);">${ib.path_template}</span></td>
            <td>
              <button class="btn btn-danger" onclick="deleteInbound('${ib.id}', '${ib.name}')" style="padding: 4px 10px; font-size: 12px;">
                Delete
              </button>
            </td>
          </tr>
        `
                )
                .join('')
        }
      </tbody>
    </table>
  </div>

  <!-- Create Inbound Modal -->
  <div id="create-inbound-modal" class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">${t(lang, 'add_inbound')}</h3>
        <button class="modal-close" onclick="closeModal('create-inbound-modal')">&times;</button>
      </div>
      <form id="create-inbound-form" onsubmit="handleCreateInbound(event)">
        <div class="form-group">
          <label class="form-label">${t(lang, 'inbound_name')}</label>
          <input type="text" id="ib-name" class="form-input" placeholder="e.g. Custom Edge VLESS" required />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">${t(lang, 'protocol')}</label>
            <select id="ib-protocol" class="form-select">
              <option value="vless">VLESS</option>
              <option value="trojan">Trojan</option>
              <option value="shadowsocks">Shadowsocks</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">${t(lang, 'port')}</label>
            <input type="number" id="ib-port" class="form-input" value="443" min="1" max="65535" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Path Template (use {token} for user sub token)</label>
          <input type="text" id="ib-path" class="form-input" value="/edge/{token}/vless" required />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Custom Host (Optional)</label>
            <input type="text" id="ib-host" class="form-input" placeholder="Leave empty for Worker host" />
          </div>
          <div class="form-group">
            <label class="form-label">Custom SNI (Optional)</label>
            <input type="text" id="ib-sni" class="form-input" placeholder="Leave empty for Worker host" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Fingerprint</label>
          <select id="ib-fp" class="form-select">
            <option value="chrome">chrome</option>
            <option value="firefox">firefox</option>
            <option value="safari">safari</option>
            <option value="randomized">randomized</option>
          </select>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('create-inbound-modal')">Cancel</button>
          <button type="submit" id="btn-save-ib" class="btn btn-primary">Create Inbound</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    async function handleCreateInbound(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-save-ib');
      btn.disabled = true;

      const payload = {
        name: document.getElementById('ib-name').value.trim(),
        protocol: document.getElementById('ib-protocol').value,
        transport: 'ws',
        tls_mode: 'tls',
        port: parseInt(document.getElementById('ib-port').value, 10),
        path_template: document.getElementById('ib-path').value.trim(),
        host: document.getElementById('ib-host').value.trim(),
        sni: document.getElementById('ib-sni').value.trim(),
        fingerprint: document.getElementById('ib-fp').value,
        allow_udp: 1,
        enabled: 1,
        notes: '',
      };

      try {
        await apiRequest('/api/inbounds', { method: 'POST', body: payload });
        showToast('Inbound created successfully');
        closeModal('create-inbound-modal');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message || 'Failed to create inbound', 'error');
        btn.disabled = false;
      }
    }

    async function deleteInbound(id, name) {
      if (!confirm('Delete inbound ' + name + '?')) return;
      try {
        await apiRequest('/api/inbounds/' + id, { method: 'DELETE' });
        showToast('Inbound deleted');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message || 'Failed to delete inbound', 'error');
      }
    }
  </script>
  `;
}
