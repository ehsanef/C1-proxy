/**
 * Users list view and Create User modal for C1 Proxy.
 */

import { Language, t } from '../i18n';
import { UserRecord } from '../database/schema';

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

export function renderUsersView(lang: Language, users: UserRecord[], serverOrigin: string): string {
  return `
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; flex-wrap: wrap;">
    <div style="position: relative; flex: 1; max-width: 380px;">
      <input type="text" id="user-search" class="form-input" placeholder="${t(lang, 'search_users')}" oninput="filterUsersTable()" style="padding-inline-start: 36px;" />
      <svg style="position: absolute; inset-inline-start: 12px; top: 11px; color: var(--text-muted);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    </div>
    <button class="btn btn-primary" onclick="openModal('create-user-modal')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>${t(lang, 'add_user')}</span>
    </button>
  </div>

  <div class="table-container">
    <table id="users-table">
      <thead>
        <tr>
          <th>${t(lang, 'user_name')}</th>
          <th>${t(lang, 'traffic')}</th>
          <th>${t(lang, 'expires')}</th>
          <th>${t(lang, 'status')}</th>
          <th>${t(lang, 'actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${
          users.length === 0
            ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 48px;">No users created yet. Click "Add User" to get started.</td></tr>`
            : users
                .map((u) => {
                  const isExpired = u.expires_at && new Date(u.expires_at).getTime() < Date.now();
                  const isOverQuota = u.quota_bytes > 0 && u.used_bytes >= u.quota_bytes;
                  let statusBadge = `<span class="status-badge"><span class="status-dot"></span>${t(lang, 'status_active')}</span>`;
                  if (!u.enabled) {
                    statusBadge = `<span class="status-badge" style="background: rgba(239, 68, 68, 0.1); color: #EF4444; border-color: rgba(239, 68, 68, 0.3);"><span class="status-dot" style="background: #EF4444; box-shadow: 0 0 8px #EF4444;"></span>${t(lang, 'status_disabled')}</span>`;
                  } else if (isExpired) {
                    statusBadge = `<span class="status-badge" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B; border-color: rgba(245, 158, 11, 0.3);"><span class="status-dot" style="background: #F59E0B; box-shadow: 0 0 8px #F59E0B;"></span>${t(lang, 'status_expired')}</span>`;
                  } else if (isOverQuota) {
                    statusBadge = `<span class="status-badge" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B; border-color: rgba(245, 158, 11, 0.3);"><span class="status-dot" style="background: #F59E0B; box-shadow: 0 0 8px #F59E0B;"></span>Over Quota</span>`;
                  }

                  const subUrl = `${serverOrigin}/s/${u.subscription_token}`;

                  return `
          <tr class="user-row" data-search="${u.name.toLowerCase()} ${u.username.toLowerCase()}">
            <td>
              <div style="font-weight: 600; color: #FFF;">${u.name || u.username}</div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">@${u.username}</div>
            </td>
            <td>
              <div>${formatBytes(u.used_bytes)} / ${u.quota_bytes > 0 ? formatBytes(u.quota_bytes) : '∞'}</div>
              <div style="height: 4px; background: var(--bg-surface); border-radius: 2px; margin-top: 4px; overflow: hidden; width: 120px;">
                <div style="height: 100%; background: var(--accent-primary); width: ${u.quota_bytes > 0 ? Math.min(100, Math.round((u.used_bytes / u.quota_bytes) * 100)) : 0}%;"></div>
              </div>
            </td>
            <td style="color: var(--text-secondary); font-size: 12px;">
              ${u.expires_at ? new Date(u.expires_at).toLocaleDateString() : t(lang, 'never_expires')}
            </td>
            <td>${statusBadge}</td>
            <td>
              <div style="display: flex; gap: 8px;">
                <a href="/admin/users/${u.id}" class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">
                  ${t(lang, 'manage')}
                </a>
                <button class="btn btn-secondary" onclick="copyToClipboard('${subUrl}', '${t(lang, 'copied')}')" title="${t(lang, 'quick_copy_sub')}" style="padding: 5px 10px; font-size: 12px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
            </td>
          </tr>
          `;
                })
                .join('')
        }
      </tbody>
    </table>
  </div>

  <!-- Create User Modal -->
  <div id="create-user-modal" class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">${t(lang, 'add_user')}</h3>
        <button class="modal-close" onclick="closeModal('create-user-modal')">&times;</button>
      </div>
      <form id="create-user-form" onsubmit="handleCreateUser(event)">
        <div class="form-group">
          <label class="form-label">${t(lang, 'user_name')}</label>
          <input type="text" id="new-user-name" class="form-input" placeholder="e.g. Ehsan" required />
        </div>
        <div class="form-group">
          <label class="form-label">${t(lang, 'username')} (letters, numbers, _ and - only)</label>
          <input type="text" id="new-user-username" class="form-input" placeholder="e.g. ehsan_node" pattern="[a-zA-Z0-9_-]{3,32}" required />
          <div id="username-error" style="color: var(--danger); font-size: 11px; margin-top: 4px; display: none;"></div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Traffic Quota (GB, 0 = Unlimited)</label>
            <input type="number" id="new-user-quota" class="form-input" min="0" value="50" />
          </div>
          <div class="form-group">
            <label class="form-label">Daily Limit (GB, 0 = Off)</label>
            <input type="number" id="new-user-daily" class="form-input" min="0" value="0" />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Expiration Date (Optional)</label>
            <input type="date" id="new-user-expiry" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Max Concurrent IPs (0 = Off)</label>
            <input type="number" id="new-user-maxips" class="form-input" min="0" value="2" />
          </div>
        </div>

        <div style="display: flex; gap: 16px; margin: 16px 0;">
          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
            <input type="checkbox" id="proto-vless" checked /> VLESS
          </label>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
            <input type="checkbox" id="proto-trojan" checked /> Trojan
          </label>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
            <input type="checkbox" id="proto-ss" checked /> Shadowsocks
          </label>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('create-user-modal')">Cancel</button>
          <button type="submit" id="btn-save-user" class="btn btn-primary">${t(lang, 'add_user')}</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function filterUsersTable() {
      const q = document.getElementById('user-search').value.toLowerCase();
      const rows = document.querySelectorAll('.user-row');
      rows.forEach(r => {
        const text = r.getAttribute('data-search') || '';
        r.style.display = text.includes(q) ? '' : 'none';
      });
    }

    async function handleCreateUser(e) {
      e.preventDefault();
      const errBox = document.getElementById('username-error');
      errBox.style.display = 'none';

      const username = document.getElementById('new-user-username').value.trim();
      if (!/^[a-zA-Z0-9_-]{3,32}$/.test(username)) {
        errBox.innerText = 'Username may contain letters, numbers, _ and - only (3-32 chars).';
        errBox.style.display = 'block';
        return;
      }

      const quotaGb = parseFloat(document.getElementById('new-user-quota').value) || 0;
      const dailyGb = parseFloat(document.getElementById('new-user-daily').value) || 0;
      const expiryDate = document.getElementById('new-user-expiry').value;

      const payload = {
        name: document.getElementById('new-user-name').value.trim(),
        username,
        quota_bytes: Math.round(quotaGb * 1024 * 1024 * 1024),
        daily_quota_bytes: Math.round(dailyGb * 1024 * 1024 * 1024),
        expires_at: expiryDate ? new Date(expiryDate).toISOString() : null,
        max_ips: parseInt(document.getElementById('new-user-maxips').value, 10) || 0,
        protocol_vless_enabled: document.getElementById('proto-vless').checked ? 1 : 0,
        protocol_trojan_enabled: document.getElementById('proto-trojan').checked ? 1 : 0,
        protocol_shadowsocks_enabled: document.getElementById('proto-ss').checked ? 1 : 0,
      };

      const btn = document.getElementById('btn-save-user');
      btn.disabled = true;

      try {
        await apiRequest('/api/users', { method: 'POST', body: payload });
        showToast('User created successfully');
        closeModal('create-user-modal');
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        showToast(err.message || 'Failed to create user', 'error');
        btn.disabled = false;
      }
    }
  </script>
  `;
}
