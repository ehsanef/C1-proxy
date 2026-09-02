/**
 * First-Time Installation / Claim UI view for C1 Proxy.
 */

import { Language, t } from '../i18n';
import { renderLogoSvg } from './shell';

export function renderInstallView(lang: Language, claimRequired = false): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t(lang, 'install_title')} - ${t(lang, 'brand')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #090B0E;
      --bg-card: #151922;
      --border-subtle: #1F2633;
      --text-primary: #F8FAFC;
      --text-secondary: #94A3B8;
      --accent: #6366F1;
      --accent-purple: #8B5CF6;
      --danger: #EF4444;
      --font-sans: 'Outfit', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .install-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 36px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 24px 48px rgba(0,0,0,0.6);
    }
    .brand-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 700;
      margin-top: 14px;
    }
    .brand-subtitle {
      color: var(--text-secondary);
      font-size: 13px;
      margin-top: 6px;
    }
    .form-group { margin-bottom: 18px; }
    .form-label {
      display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px;
    }
    .form-input {
      width: 100%; background: #11141B; border: 1px solid var(--border-subtle);
      border-radius: 8px; padding: 10px 14px; color: #FFF; font-size: 14px;
    }
    .form-input:focus {
      outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    .btn-submit {
      width: 100%; padding: 11px; border-radius: 8px; font-weight: 600;
      background: linear-gradient(135deg, var(--accent), var(--accent-purple));
      color: #FFF; border: none; cursor: pointer; font-size: 14px; margin-top: 8px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .error-box {
      background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171; padding: 10px 14px; border-radius: 8px; font-size: 12px;
      margin-bottom: 18px; display: none;
    }
  </style>
</head>
<body>
  <div class="install-card">
    <div class="brand-header">
      ${renderLogoSvg(48)}
      <h1 class="brand-title">${t(lang, 'install_title')}</h1>
      <p class="brand-subtitle">${t(lang, 'install_subtitle')}</p>
    </div>

    <div id="error-box" class="error-box"></div>

    <form onsubmit="handleInstall(event)">
      <div class="form-group">
        <label class="form-label">${t(lang, 'admin_username')}</label>
        <input type="text" id="admin-user" class="form-input" placeholder="admin" value="admin" required />
      </div>
      <div class="form-group">
        <label class="form-label">${t(lang, 'admin_password')} (min 8 characters)</label>
        <input type="password" id="admin-pass" class="form-input" minlength="8" required />
      </div>
      <div class="form-group">
        <label class="form-label">${t(lang, 'confirm_password')}</label>
        <input type="password" id="admin-pass-confirm" class="form-input" minlength="8" required />
      </div>
      ${
        claimRequired
          ? `
      <div class="form-group">
        <label class="form-label">${t(lang, 'claim_token_optional')}</label>
        <input type="password" id="claim-token" class="form-input" placeholder="Enter C1_CLAIM_TOKEN" />
      </div>
      `
          : ''
      }
      <button type="submit" id="btn-submit" class="btn-submit">${t(lang, 'create_admin_btn')}</button>
    </form>
  </div>

  <script>
    async function handleInstall(e) {
      e.preventDefault();
      const errBox = document.getElementById('error-box');
      errBox.style.display = 'none';

      const username = document.getElementById('admin-user').value.trim();
      const pass = document.getElementById('admin-pass').value;
      const confirm = document.getElementById('admin-pass-confirm').value;
      const claimInput = document.getElementById('claim-token');
      const claimToken = claimInput ? claimInput.value.trim() : '';

      if (pass !== confirm) {
        errBox.innerText = 'Passwords do not match.';
        errBox.style.display = 'block';
        return;
      }

      if (pass.length < 8) {
        errBox.innerText = 'Password must be at least 8 characters long.';
        errBox.style.display = 'block';
        return;
      }

      const btn = document.getElementById('btn-submit');
      btn.disabled = true;
      btn.innerText = 'Setting up...';

      try {
        const res = await fetch('/api/install', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password: pass, claim_token: claimToken })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Setup failed');
        }
        window.location.href = '/admin';
      } catch (err) {
        errBox.innerText = err.message || 'Failed to complete setup';
        errBox.style.display = 'block';
        btn.disabled = false;
        btn.innerText = '${t(lang, 'create_admin_btn')}';
      }
    }
  </script>
</body>
</html>`;
}
