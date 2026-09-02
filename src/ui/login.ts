/**
 * Administrator login UI view for C1 Proxy.
 */

import { Language, t } from '../i18n';
import { renderLogoSvg } from './shell';

export function renderLoginView(lang: Language): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - ${t(lang, 'brand_control')}</title>
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
    .login-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 36px;
      width: 100%;
      max-width: 400px;
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
      font-size: 20px;
      font-weight: 700;
      margin-top: 14px;
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
  <div class="login-card">
    <div class="brand-header">
      ${renderLogoSvg(44)}
      <h1 class="brand-title">${t(lang, 'brand_control')}</h1>
      <p style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">Sign in to access control plane</p>
    </div>

    <div id="error-box" class="error-box"></div>

    <form onsubmit="handleLogin(event)">
      <div class="form-group">
        <label class="form-label">${t(lang, 'admin_username')}</label>
        <input type="text" id="login-user" class="form-input" required />
      </div>
      <div class="form-group">
        <label class="form-label">${t(lang, 'admin_password')}</label>
        <input type="password" id="login-pass" class="form-input" required />
      </div>
      <button type="submit" id="btn-login" class="btn-submit">Sign In</button>
    </form>
  </div>

  <script>
    async function handleLogin(e) {
      e.preventDefault();
      const errBox = document.getElementById('error-box');
      errBox.style.display = 'none';

      const username = document.getElementById('login-user').value.trim();
      const password = document.getElementById('login-pass').value;

      const btn = document.getElementById('btn-login');
      btn.disabled = true;
      btn.innerText = 'Signing in...';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Invalid username or password');
        }
        window.location.href = '/admin';
      } catch (err) {
        errBox.innerText = err.message || 'Login failed';
        errBox.style.display = 'block';
        btn.disabled = false;
        btn.innerText = 'Sign In';
      }
    }
  </script>
</body>
</html>`;
}
