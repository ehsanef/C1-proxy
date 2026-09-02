/**
 * Core application shell, modern infrastructure styling, original SVG branding,
 * responsive layout, and genuine RTL support for C1 Proxy.
 */

import { getDir, Language, t, TranslationKey } from '../i18n';

export interface ShellOptions {
  title: string;
  lang: Language;
  activeNav: 'overview' | 'users' | 'inbounds' | 'radar' | 'routing' | 'subscriptions' | 'settings';
  csrfToken?: string;
  content: string;
}

export function renderLogoSvg(size = 32): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="c1-logo">
    <defs>
      <linearGradient id="c1-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366F1" />
        <stop offset="50%" stop-color="#8B5CF6" />
        <stop offset="100%" stop-color="#3B82F6" />
      </linearGradient>
      <filter id="c1-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="url(#c1-grad)" stroke-width="2.5" fill="#12151C" filter="url(#c1-glow)" />
    <path d="M24 10L36 17V31L24 38L12 31V17L24 10Z" fill="url(#c1-grad)" fill-opacity="0.15" stroke="url(#c1-grad)" stroke-width="1.5" />
    <circle cx="24" cy="24" r="5" fill="#3B82F6" />
    <path d="M24 12V18M24 30V36M14 24H19M29 24H34" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" />
  </svg>`;
}

export function renderShell(options: ShellOptions): string {
  const { title, lang, activeNav, csrfToken = '', content } = options;
  const dir = getDir(lang);

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${t(lang, 'brand_control')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Vazirmatn:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #090B0E;
      --bg-surface: #11141B;
      --bg-card: #151922;
      --bg-card-hover: #1C2230;
      --border-subtle: #1F2633;
      --border-focus: #4F46E5;

      --text-primary: #F8FAFC;
      --text-secondary: #94A3B8;
      --text-muted: #64748B;

      --accent-primary: #6366F1;
      --accent-secondary: #8B5CF6;
      --accent-cyan: #06B6D4;
      --success: #10B981;
      --warning: #F59E0B;
      --danger: #EF4444;

      --font-sans: ${lang === 'fa' ? "'Vazirmatn', 'Outfit', sans-serif" : "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"};
      --font-mono: 'JetBrains Mono', monospace;
      --sidebar-width: 260px;
      --header-height: 64px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 14px;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
    }

    a { color: inherit; text-decoration: none; }
    button, input, select, textarea { font-family: inherit; }

    /* Layout */
    .app-container {
      display: flex;
      width: 100%;
      min-height: 100vh;
    }

    /* Sidebar */
    .app-sidebar {
      width: var(--sidebar-width);
      background-color: var(--bg-surface);
      border-inline-end: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: fixed;
      top: 0;
      bottom: 0;
      inset-inline-start: 0;
      z-index: 40;
    }

    .sidebar-brand {
      height: var(--header-height);
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .brand-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #FFF, #94A3B8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .sidebar-nav {
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      color: var(--text-secondary);
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .nav-item:hover {
      background-color: var(--bg-card-hover);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.05));
      color: #A5B4FC;
      border-inline-start: 3px solid var(--accent-primary);
    }

    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .lang-switcher {
      display: flex;
      gap: 6px;
      background: var(--bg-card);
      padding: 4px;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
    }
    .lang-btn {
      flex: 1;
      background: none;
      border: none;
      color: var(--text-muted);
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
    }
    .lang-btn.active {
      background: var(--accent-primary);
      color: #FFF;
    }

    /* Main Content */
    .app-main {
      flex: 1;
      margin-inline-start: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .app-header {
      height: var(--header-height);
      background-color: rgba(17, 20, 27, 0.8);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 30;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
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
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: var(--success);
      box-shadow: 0 0 8px var(--success);
    }

    .content-container {
      padding: 32px;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    /* Cards & Components */
    .grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 20px;
      transition: border-color 0.2s;
    }
    .card:hover {
      border-color: #2D3748;
    }
    .card-title {
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-value {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: #FFF;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }
    .btn-primary:hover {
      opacity: 0.95;
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
    }
    .btn-secondary {
      background: var(--bg-card-hover);
      color: var(--text-primary);
      border-color: var(--border-subtle);
    }
    .btn-secondary:hover {
      background: #252D3D;
    }
    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #F87171;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.25);
    }

    .form-group {
      margin-bottom: 16px;
    }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
    .form-input, .form-select {
      width: 100%;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 9px 12px;
      color: var(--text-primary);
      font-size: 13px;
      transition: border-color 0.15s;
    }
    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    /* Tables */
    .table-container {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      background: var(--bg-card);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: start;
    }
    th {
      background: var(--bg-surface);
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-subtle);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 13px;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background-color: rgba(255, 255, 255, 0.02);
    }

    /* Toast */
    #toast-container {
      position: fixed;
      bottom: 24px;
      inset-inline-end: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 100;
    }
    .toast {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 12px 18px;
      border-radius: 8px;
      font-size: 13px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.2s ease forwards;
    }
    .toast.success { border-inline-start: 4px solid var(--success); }
    .toast.error { border-inline-start: 4px solid var(--danger); }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 90;
    }
    .modal-backdrop.open {
      display: flex;
    }
    .modal-content {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      width: 90%;
      max-width: 540px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .modal-title { font-size: 17px; font-weight: 600; }
    .modal-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 20px;
    }

    @keyframes slideIn {
      from { transform: translateY(12px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 768px) {
      .app-sidebar {
        display: none;
      }
      .app-main {
        margin-inline-start: 0;
      }
      .content-container {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        ${renderLogoSvg(28)}
        <span class="brand-title">${t(lang, 'brand')}</span>
      </div>
      <nav class="sidebar-nav">
        <a href="/admin" class="nav-item ${activeNav === 'overview' ? 'active' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>${t(lang, 'nav_overview')}</span>
        </a>
        <a href="/admin/users" class="nav-item ${activeNav === 'users' ? 'active' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>${t(lang, 'nav_users')}</span>
        </a>
        <a href="/admin/inbounds" class="nav-item ${activeNav === 'inbounds' ? 'active' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          <span>${t(lang, 'nav_inbounds')}</span>
        </a>
        <a href="/admin/radar" class="nav-item ${activeNav === 'radar' ? 'active' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <span>${t(lang, 'nav_radar')}</span>
        </a>
        <a href="/admin/routing" class="nav-item ${activeNav === 'routing' ? 'active' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          <span>${t(lang, 'nav_routing')}</span>
        </a>
        <a href="/admin/settings" class="nav-item ${activeNav === 'settings' ? 'active' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>${t(lang, 'nav_settings')}</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <div class="lang-switcher">
          <button class="lang-btn ${lang === 'en' ? 'active' : ''}" onclick="setLanguage('en')">EN</button>
          <button class="lang-btn ${lang === 'fa' ? 'active' : ''}" onclick="setLanguage('fa')">فارسی</button>
        </div>
        <button class="btn btn-secondary" onclick="logout()" style="width: 100%; font-size: 12px; padding: 6px;">
          ${t(lang, 'nav_logout')}
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="app-main">
      <header class="app-header">
        <h1 class="page-title">${title}</h1>
        <div class="status-badge">
          <span class="status-dot"></span>
          <span>${t(lang, 'edge_online')}</span>
        </div>
      </header>

      <div class="content-container">
        ${content}
      </div>
    </main>
  </div>

  <div id="toast-container"></div>

  <script>
    const C1_CSRF = "${csrfToken}";

    function showToast(msg, type = 'success') {
      const c = document.getElementById('toast-container');
      const t = document.createElement('div');
      t.className = 'toast ' + type;
      t.innerText = msg;
      c.appendChild(t);
      setTimeout(() => {
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 200);
      }, 3500);
    }

    async function copyToClipboard(text, customMsg = '${t(lang, 'copied')}') {
      try {
        await navigator.clipboard.writeText(text);
        showToast(customMsg, 'success');
      } catch (err) {
        showToast('Failed to copy', 'error');
      }
    }

    async function apiRequest(url, options = {}) {
      options.headers = options.headers || {};
      options.headers['x-c1-csrf'] = C1_CSRF;
      if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }
      const res = await fetch(url, options);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || 'Error ' + res.status);
      }
      return res.json().catch(() => ({}));
    }

    function setLanguage(l) {
      document.cookie = 'c1_lang=' + l + '; Path=/; Max-Age=31536000; SameSite=Lax';
      window.location.reload();
    }

    async function logout() {
      await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {});
      window.location.href = '/login';
    }

    function openModal(id) {
      document.getElementById(id).classList.add('open');
    }
    function closeModal(id) {
      document.getElementById(id).classList.remove('open');
    }
  </script>
</body>
</html>`;
}
