/**
 * C1 Radar browser-side scanning interface.
 * Implements bounded concurrency testing and generation ID sequence guards.
 */

import { Language, t } from '../i18n';
import { RadarResultRecord, UserRecord } from '../database/schema';

export function renderRadarView(lang: Language, users: UserRecord[], recentResults: RadarResultRecord[]): string {
  return `
  <div style="margin-bottom: 24px;">
    <h2 style="font-size: 22px; font-weight: 700;">${t(lang, 'radar_title')}</h2>
    <div style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
      ${t(lang, 'radar_desc')}
    </div>
  </div>

  <!-- Radar Control Panel -->
  <div class="card" style="margin-bottom: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <button id="btn-start-radar" class="btn btn-primary" onclick="startRadarScan()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          <span>${t(lang, 'run_radar')}</span>
        </button>
        <button id="btn-stop-radar" class="btn btn-secondary" onclick="stopRadarScan()" style="display: none;">
          ${t(lang, 'stop_radar')}
        </button>
        <button class="btn btn-secondary" onclick="clearRadarResults()">
          ${t(lang, 'clear_results')}
        </button>
      </div>

      <div style="display: flex; align-items: center; gap: 10px;">
        <select id="radar-user-select" class="form-select" style="width: auto; font-size: 12px;">
          <option value="">Select User to Apply</option>
          ${users.map((u) => `<option value="${u.id}">${u.name || u.username}</option>`).join('')}
        </select>
        <button class="btn btn-secondary" onclick="applyToSelectedUser()" style="font-size: 12px;">
          ${t(lang, 'apply_to_user')}
        </button>
        <button class="btn btn-secondary" onclick="applyGlobally()" style="font-size: 12px; color: var(--accent-cyan);">
          ${t(lang, 'apply_global')}
        </button>
      </div>
    </div>

    <!-- Progress Status Indicator -->
    <div id="radar-status-bar" style="margin-top: 16px; display: none;">
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
        <span id="radar-progress-text" style="color: var(--text-secondary);">Scanning candidates...</span>
        <span id="radar-counter" style="font-family: var(--font-mono); color: var(--accent-primary);">0 / 0</span>
      </div>
      <div style="height: 6px; background: var(--bg-surface); border-radius: 3px; overflow: hidden;">
        <div id="radar-progress-fill" style="height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-cyan)); width: 0%; transition: width 0.2s;"></div>
      </div>
    </div>
  </div>

  <!-- Results Table -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>${t(lang, 'ip_address')}</th>
          <th>${t(lang, 'latency')}</th>
          <th>${t(lang, 'status')}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="radar-results-body">
        ${
          recentResults.length === 0
            ? `<tr id="radar-empty-row"><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 36px;">No radar scan results yet. Click "${t(lang, 'run_radar')}" above to test endpoints.</td></tr>`
            : recentResults
                .map((r) => {
                  let badge = `<span class="status-badge"><span class="status-dot"></span>${r.status}</span>`;
                  if (r.status === 'failed') {
                    badge = `<span class="status-badge" style="background: rgba(239, 68, 68, 0.1); color: #EF4444; border-color: rgba(239, 68, 68, 0.3);"><span class="status-dot" style="background: #EF4444; box-shadow: 0 0 8px #EF4444;"></span>failed</span>`;
                  } else if (r.status === 'fair' || r.status === 'poor') {
                    badge = `<span class="status-badge" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B; border-color: rgba(245, 158, 11, 0.3);"><span class="status-dot" style="background: #F59E0B; box-shadow: 0 0 8px #F59E0B;"></span>${r.status}</span>`;
                  }
                  return `
          <tr data-ip="${r.ip}">
            <td><span style="font-family: var(--font-mono); font-weight: 600; color: #FFF;">${r.ip}</span></td>
            <td><span style="font-family: var(--font-mono); color: ${r.latency_ms < 150 ? '#10B981' : '#F59E0B'};">${r.latency_ms > 0 ? r.latency_ms + ' ms' : 'Timeout'}</span></td>
            <td>${badge}</td>
            <td>
              <button class="btn btn-secondary" onclick="copyToClipboard('${r.ip}')" style="padding: 4px 8px; font-size: 11px;">
                Copy
              </button>
            </td>
          </tr>
        `;
                })
                .join('')
        }
      </tbody>
    </table>
  </div>

  <script>
    let scanGenerationId = 0;
    let isScanning = false;
    let scanResults = [];

    async function startRadarScan() {
      scanGenerationId++;
      const currentGen = scanGenerationId;
      isScanning = true;

      document.getElementById('btn-start-radar').style.display = 'none';
      document.getElementById('btn-stop-radar').style.display = 'inline-flex';
      document.getElementById('radar-status-bar').style.display = 'block';

      const tbody = document.getElementById('radar-results-body');
      tbody.innerHTML = '';
      scanResults = [];

      try {
        const { candidates } = await apiRequest('/api/radar/candidates');
        if (!candidates || candidates.length === 0) {
          showToast('No candidates available to scan', 'error');
          stopRadarScan();
          return;
        }

        let completed = 0;
        const total = candidates.length;
        const concurrency = 8; // bounded concurrency
        let queueIndex = 0;

        function updateProgress() {
          if (scanGenerationId !== currentGen) return;
          const percent = Math.round((completed / total) * 100);
          document.getElementById('radar-counter').innerText = completed + ' / ' + total;
          document.getElementById('radar-progress-fill').style.width = percent + '%';
        }

        async function worker() {
          while (queueIndex < candidates.length && isScanning && scanGenerationId === currentGen) {
            const ip = candidates[queueIndex++];
            const result = await testIpLatency(ip, currentGen);
            if (scanGenerationId !== currentGen) return;

            completed++;
            updateProgress();

            if (result && result.status !== 'failed') {
              scanResults.push(result);
              renderRadarRow(result);
            }
          }
        }

        const workers = Array.from({ length: Math.min(concurrency, candidates.length) }, () => worker());
        await Promise.all(workers);

        if (scanGenerationId === currentGen) {
          showToast('Radar scan completed! Found ' + scanResults.length + ' reachable endpoints.');
          // Persist best results to D1
          if (scanResults.length > 0) {
            scanResults.sort((a, b) => a.latency_ms - b.latency_ms);
            await apiRequest('/api/radar/results', {
              method: 'POST',
              body: { results: scanResults.slice(0, 20) }
            }).catch(() => {});
          }
        }
      } catch (err) {
        if (scanGenerationId === currentGen) {
          showToast(err.message || 'Scan error', 'error');
        }
      } finally {
        if (scanGenerationId === currentGen) {
          stopRadarScan();
        }
      }
    }

    function stopRadarScan() {
      isScanning = false;
      document.getElementById('btn-start-radar').style.display = 'inline-flex';
      document.getElementById('btn-stop-radar').style.display = 'none';
    }

    function clearRadarResults() {
      scanGenerationId++;
      isScanning = false;
      scanResults = [];
      document.getElementById('radar-results-body').innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 36px;">Results cleared.</td></tr>';
      document.getElementById('radar-status-bar').style.display = 'none';
      stopRadarScan();
    }

    async function testIpLatency(ip, genId) {
      if (scanGenerationId !== genId) return null;
      const start = performance.now();
      try {
        // Test HTTPS connection via image/trace probe
        await fetch('https://' + ip + '/cdn-cgi/trace', {
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(2500)
        });
        const elapsed = Math.round(performance.now() - start);
        let status = 'excellent';
        if (elapsed > 300) status = 'fair';
        else if (elapsed > 150) status = 'good';
        return { ip, latency_ms: elapsed, status };
      } catch {
        return { ip, latency_ms: 0, status: 'failed' };
      }
    }

    function renderRadarRow(res) {
      const tbody = document.getElementById('radar-results-body');
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><span style="font-family: var(--font-mono); font-weight: 600; color: #FFF;">\${res.ip}</span></td>
        <td><span style="font-family: var(--font-mono); color: #10B981;">\${res.latency_ms} ms</span></td>
        <td><span class="status-badge"><span class="status-dot"></span>\${res.status}</span></td>
        <td>
          <button class="btn btn-secondary" onclick="copyToClipboard('\${res.ip}')" style="padding: 4px 8px; font-size: 11px;">
            Copy
          </button>
        </td>
      \`;
      tbody.appendChild(tr);
    }

    async function applyToSelectedUser() {
      const userId = document.getElementById('radar-user-select').value;
      if (!userId) {
        showToast('Please select a user first', 'error');
        return;
      }
      if (scanResults.length === 0) {
        showToast('No scanned clean IPs available. Run radar scan first.', 'error');
        return;
      }
      scanResults.sort((a, b) => a.latency_ms - b.latency_ms);
      const bestIp = scanResults[0].ip;

      try {
        await apiRequest('/api/users/' + userId, {
          method: 'PATCH',
          body: { clean_ip_mode: 'manual', clean_ip: bestIp }
        });
        showToast('Applied clean IP ' + bestIp + ' to user!');
      } catch (err) {
        showToast(err.message || 'Failed to apply IP', 'error');
      }
    }

    async function applyGlobally() {
      if (scanResults.length === 0) {
        showToast('No scanned clean IPs available. Run radar scan first.', 'error');
        return;
      }
      scanResults.sort((a, b) => a.latency_ms - b.latency_ms);
      const topIps = scanResults.slice(0, 3).map(r => r.ip).join(', ');

      try {
        await apiRequest('/api/settings', {
          method: 'POST',
          body: { key: 'global_clean_ips', value: topIps }
        });
        showToast('Updated global clean IPs: ' + topIps);
      } catch (err) {
        showToast(err.message || 'Failed to update global clean IPs', 'error');
      }
    }
  </script>
  `;
}
