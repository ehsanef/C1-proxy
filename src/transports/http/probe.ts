/**
 * Neutral decoy / connectivity probe page rendered at root '/' for unauthenticated visitors.
 * Looks like a standard modern edge CDN network status page.
 */

export function renderDecoyProbePage(): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edge Network Status</title>
  <style>
    body {
      background-color: #0d1117;
      color: #c9d1d9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .status-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 32px;
      max-width: 440px;
      width: 90%;
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(46, 160, 67, 0.15);
      color: #3fb950;
      border: 1px solid rgba(46, 160, 67, 0.4);
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .dot {
      width: 6px; height: 6px; background: #3fb950; border-radius: 50%;
    }
    h1 { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #f0f6fc; }
    p { font-size: 13px; color: #8b949e; line-height: 1.5; margin: 0; }
  </style>
</head>
<body>
  <div class="status-card">
    <div class="badge"><span class="dot"></span> All Systems Operational</div>
    <h1>Edge Gateway Active</h1>
    <p>Global edge distribution node is functioning normally. HTTPS and HTTP/2 connections terminated securely.</p>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
