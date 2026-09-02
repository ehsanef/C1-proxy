/**
 * Settings, Backup/Restore, and Diagnostics UI view for C1 Proxy.
 */

import { Language, t } from '../i18n';

export interface SettingsViewData {
  settings: Record<string, string>;
  workerVersion: string;
  migrationVersion: number;
  d1Healthy: boolean;
  kvHealthy: boolean;
}

export function renderSettingsView(lang: Language, data: SettingsViewData): string {
  const { settings, workerVersion, migrationVersion, d1Healthy, kvHealthy } = data;

  const panelTitle = settings['panel_title'] || 'C1 Proxy Control';
  const nodePrefix = settings['node_prefix'] || 'C1';

  return `
  <div style="margin-bottom: 24px;">
    <h2 style="font-size: 22px; font-weight: 700;">${t(lang, 'nav_settings')}</h2>
    <div style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
      Manage panel configuration, system security, backups, and runtime diagnostics.
    </div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
    <!-- General Settings -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>${t(lang, 'general_settings')}</span>
      </div>
      <form onsubmit="handleSaveGeneral(event)">
        <div class="form-group">
          <label class="form-label">Panel Title</label>
          <input type="text" id="set-panel-title" class="form-input" value="${panelTitle}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Subscription Node Prefix</label>
          <input type="text" id="set-node-prefix" class="form-input" value="${nodePrefix}" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 8px;">
          ${t(lang, 'save_changes')}
        </button>
      </form>
    </div>

    <!-- Backup & Restore -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>${t(lang, 'backup_restore')}</span>
      </div>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
        Export canonical D1 database state (users, inbounds, settings) or restore from an existing JSON backup.
      </p>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <a href="/api/backup/export" download="c1-proxy-backup.json" class="btn btn-secondary" style="width: 100%;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>${t(lang, 'download_backup')}</span>
        </a>

        <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-top: 4px;">
          <label class="form-label">${t(lang, 'upload_restore')}</label>
          <input type="file" id="restore-file-input" accept=".json" class="form-input" onchange="previewRestoreFile(event)" />
        </div>
      </div>
    </div>

    <!-- Diagnostics & Health -->
    <div class="card" style="grid-column: 1 / -1;">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>System Diagnostics & Environment</span>
        <button class="btn btn-secondary" onclick="exportRedactedDiagnostics()" style="font-size: 11px; padding: 4px 10px;">
          Export Redacted JSON
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; background: var(--bg-surface); padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div>
          <div style="color: var(--text-muted); font-size: 12px;">Worker Engine Version</div>
          <div style="font-family: var(--font-mono); font-weight: 600; color: #FFF; margin-top: 4px;">v${workerVersion}</div>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 12px;">D1 Database State</div>
          <div style="font-weight: 600; color: #10B981; margin-top: 4px;">● ${d1Healthy ? 'Connected' : 'Unavailable'}</div>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 12px;">KV Hot-Path Cache</div>
          <div style="font-weight: 600; color: #10B981; margin-top: 4px;">● ${kvHealthy ? 'Active' : 'Fallback'}</div>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 12px;">Schema Migration Level</div>
          <div style="font-family: var(--font-mono); font-weight: 600; color: #8B5CF6; margin-top: 4px;">Revision ${migrationVersion}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Restore Preview Modal -->
  <div id="restore-modal" class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Confirm Database Restore</h3>
        <button class="modal-close" onclick="closeModal('restore-modal')">&times;</button>
      </div>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
        Please review the backup manifest before importing. Existing records with identical usernames or inbounds will be merged.
      </p>
      <div id="restore-summary" style="background: var(--bg-surface); padding: 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 12px; margin-bottom: 20px;"></div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" onclick="closeModal('restore-modal')">Cancel</button>
        <button class="btn btn-primary" onclick="executeRestore()">Confirm Restore</button>
      </div>
    </div>
  </div>

  <script>
    let pendingRestoreData = null;

    async function handleSaveGeneral(e) {
      e.preventDefault();
      const title = document.getElementById('set-panel-title').value.trim();
      const prefix = document.getElementById('set-node-prefix').value.trim();

      try {
        await apiRequest('/api/settings/bulk', {
          method: 'POST',
          body: {
            panel_title: title,
            node_prefix: prefix,
          }
        });
        showToast('Settings saved successfully');
      } catch (err) {
        showToast(err.message || 'Failed to save settings', 'error');
      }
    }

    function previewRestoreFile(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const json = JSON.parse(evt.target.result);
          if (!json.version || !json.users) {
            throw new Error('Invalid C1 backup schema');
          }
          pendingRestoreData = json;
          const summary = 'Backup Version: ' + json.version + '<br>' +
                          'Exported At: ' + (json.exported_at || 'Unknown') + '<br>' +
                          'Users to Restore: ' + json.users.length + '<br>' +
                          'Inbounds to Restore: ' + (json.inbounds ? json.inbounds.length : 0);
          document.getElementById('restore-summary').innerHTML = summary;
          openModal('restore-modal');
        } catch (err) {
          showToast('Failed to parse backup file: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    }

    async function executeRestore() {
      if (!pendingRestoreData) return;
      try {
        await apiRequest('/api/backup/restore', {
          method: 'POST',
          body: pendingRestoreData
        });
        showToast('Restore completed successfully!');
        closeModal('restore-modal');
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        showToast(err.message || 'Restore failed', 'error');
      }
    }

    async function exportRedactedDiagnostics() {
      try {
        const diag = await apiRequest('/api/diagnostics');
        const blob = new Blob([JSON.stringify(diag, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'c1-diagnostics-redacted.json';
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        showToast('Failed to fetch diagnostics', 'error');
      }
    }
  </script>
  `;
}
