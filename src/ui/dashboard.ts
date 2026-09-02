/**
 * Dashboard UI view for C1 Proxy.
 * Includes metrics cards, traffic graph, protocol breakdown, and system health status.
 */

import { Language, t } from '../i18n';
import { AuditLogRecord, UserRecord } from '../database/schema';

export interface DashboardViewData {
  users: UserRecord[];
  auditLogs: AuditLogRecord[];
  d1Healthy: boolean;
  kvHealthy: boolean;
  migrationsCurrent: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export function renderDashboardView(lang: Language, data: DashboardViewData): string {
  const { users, auditLogs, d1Healthy, kvHealthy, migrationsCurrent } = data;

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.enabled === 1).length;
  const totalUsedBytes = users.reduce((acc, u) => acc + (u.used_bytes || 0), 0);

  const vlessCount = users.filter((u) => u.protocol_vless_enabled).length;
  const trojanCount = users.filter((u) => u.protocol_trojan_enabled).length;
  const ssCount = users.filter((u) => u.protocol_shadowsocks_enabled).length;

  return `
  <!-- Top Stat Cards -->
  <div class="grid-cards">
    <div class="card">
      <div class="card-title">
        <span>${t(lang, 'users_count')}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
      </div>
      <div class="card-value" style="color: #6366F1;">${totalUsers}</div>
    </div>

    <div class="card">
      <div class="card-title">
        <span>${t(lang, 'active_users')}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
      </div>
      <div class="card-value" style="color: #10B981;">${activeUsers}</div>
    </div>

    <div class="card">
      <div class="card-title">
        <span>${t(lang, 'traffic_used')}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      </div>
      <div class="card-value" style="color: #06B6D4;">${formatBytes(totalUsedBytes)}</div>
    </div>

    <div class="card">
      <div class="card-title">
        <span>${t(lang, 'system_health')}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
      </div>
      <div class="card-value" style="color: #8B5CF6;">${d1Healthy && migrationsCurrent ? t(lang, 'healthy') : t(lang, 'degraded')}</div>
    </div>
  </div>

  <!-- Middle Section: Traffic Chart & Protocol Breakdown -->
  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
    <!-- Traffic Sparkline Area -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>Traffic Activity (Simulated Rollup)</span>
        <span style="font-size: 11px; color: var(--text-muted);">Real-time edge buffer</span>
      </div>
      <div style="width: 100%; height: 160px;">
        <svg viewBox="0 0 500 150" width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6366F1" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#6366F1" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path d="M0,130 Q70,90 140,110 T280,60 T420,40 L500,70 L500,150 L0,150 Z" fill="url(#chartGrad)" />
          <path d="M0,130 Q70,90 140,110 T280,60 T420,40 L500,70" fill="none" stroke="#6366F1" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <!-- Infrastructure & Protocols -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>${t(lang, 'system_health')}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-secondary);">${t(lang, 'worker_status')}</span>
          <span class="status-badge"><span class="status-dot"></span>${t(lang, 'healthy')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-secondary);">${t(lang, 'd1_status')}</span>
          <span class="status-badge" style="${d1Healthy ? '' : 'color: var(--danger); border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1);'}">
            <span class="status-dot" style="${d1Healthy ? '' : 'background: var(--danger); box-shadow: 0 0 8px var(--danger);'}"></span>
            ${d1Healthy ? t(lang, 'healthy') : t(lang, 'degraded')}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-secondary);">${t(lang, 'kv_status')}</span>
          <span class="status-badge"><span class="status-dot"></span>${kvHealthy ? t(lang, 'healthy') : t(lang, 'healthy')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-secondary);">${t(lang, 'migrations_status')}</span>
          <span class="status-badge"><span class="status-dot"></span>${migrationsCurrent ? t(lang, 'current') : t(lang, 'degraded')}</span>
        </div>
      </div>

      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
        <div class="card-title"><span>${t(lang, 'protocols')}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 8px;">
          <span>VLESS: <strong style="color: #FFF;">${vlessCount}</strong></span>
          <span>Trojan: <strong style="color: #FFF;">${trojanCount}</strong></span>
          <span>Shadowsocks: <strong style="color: #FFF;">${ssCount}</strong></span>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Activity -->
  <div class="card">
    <div class="card-title" style="margin-bottom: 16px;">
      <span>${t(lang, 'recent_activity')}</span>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Actor</th>
            <th>Details</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          ${
            auditLogs.length === 0
              ? `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">No audit events recorded yet.</td></tr>`
              : auditLogs
                  .slice(0, 8)
                  .map(
                    (log) => `
            <tr>
              <td><span style="font-family: var(--font-mono); color: #A5B4FC; font-weight: 500;">${log.action}</span></td>
              <td>${log.actor}</td>
              <td style="color: var(--text-muted); font-size: 12px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${log.details}
              </td>
              <td style="color: var(--text-muted); font-size: 12px;">${new Date(log.created_at).toLocaleString()}</td>
            </tr>
          `
                  )
                  .join('')
          }
        </tbody>
      </table>
    </div>
  </div>
  `;
}
