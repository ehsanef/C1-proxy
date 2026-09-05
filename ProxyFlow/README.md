<div align="center">

# ProxyFlow
### Find your flow.

**Public-proxy discovery. Real connection testing. A local-first workspace.**

Persian / English · Dark / Light · HTTP / HTTPS / SOCKS4 / SOCKS5

**1.0.0-rc1 — Release candidate**

</div>

## شروع سریع — ویندوز

فایل‌های شاخهٔ `proxyflow-v1` را دانلود و کامل از ZIP خارج کن. داخل پوشهٔ **ProxyFlow** فایل **Start-ProxyFlow.cmd** را باز کن. اجرای سورس به **Python 3.11 یا جدیدتر** و **cURL 8.4 یا جدیدتر** نیاز دارد؛ هیچ بستهٔ پایتونی یا کلید API برای اجرای سورس لازم نیست.

برنامه در مرورگر باز می‌شود؛ پنجرهٔ کنسول را هنگام استفاده باز نگه دار. آدرس معمولاً `http://127.0.0.1:8765` است. پورت اشغال باشد، برنامه پورت آزاد انتخاب می‌کند؛ آدرس دقیق در کنسول نمایش داده می‌شود.

**اسکن جهان** را بزن. برنامه فهرست‌های عمومی را از منابع ازپیش‌تعریف‌شده دریافت و از اینترنت همان کامپیوتر تست می‌کند. نتیجه را با کشور، پروتکل، وضعیت و حداکثر تأخیر فیلتر کن، آدرس را کپی کن و در برنامه‌ای که پراکسی می‌پذیرد وارد کن.

در GitHub Actions، گردش‌کار **ProxyFlow / Windows** برای ساخت بستهٔ اجرایی تعریف شده است. فقط اجرای موفق آن یک artifact به نام **ProxyFlow-Windows-x64** تولید می‌کند. بسته را کامل استخراج و `ProxyFlow.exe` را اجرا کن. EXE به نصب پایتون نیاز ندارد، اما همچنان از cURL سیستم استفاده می‌کند. فایل اجرایی امضای دیجیتال ندارد؛ محافظت امنیتی ویندوز را غیرفعال نکن. وضعیت موفقیت ساخت را در همان اجرای Actions بررسی کن.

**این برنامه VPN سراسری نیست و تنظیمات اینترنت ویندوز را تغییر نمی‌دهد.** فقط باز کردن HTML یا قراردادن آن در GitHub Pages برای اسکن واقعی کافی نیست؛ موتور محلی باید اجرا شود.

## امکانات پیاده‌سازی‌شده

رابط فارسی و انگلیسی، تم روشن و تیره، کرهٔ متحرک تزئینی، طراحی واکنش‌گرا، منابع آمادهٔ ProxyScrape و monosans و TheSpeedX، حذف تکراری‌ها، تست واقعی HTTPS از داخل پراکسی، نمایش پیشرفت و توقف، فیلتر و مرتب‌سازی، ذخیرهٔ منتخب‌ها، ورود فهرست، کپی آدرس، تست مجدد و خروجی TXT / CSV / JSON.

تست دانلود جداگانه و با تأیید تو انجام می‌شود: یک میلیون بایت از Cloudflare از داخل پراکسی انتخاب‌شده دریافت می‌شود. پیش از این تست، عدد سرعت دانلود نمایش داده نمی‌شود. برنامه نتیجهٔ ساختگی یا تضمین پیدا شدن پراکسی سالم ندارد. منابع ممکن است مسدود، خالی یا موقتاً خراب باشند؛ خطا در صفحهٔ منابع نمایش داده می‌شود.

## معنی اندازه‌گیری‌ها

**TCP** زمان اتصال به پراکسی است. **HTTPS** میانهٔ زمان درخواست کامل، شامل مذاکرهٔ پراکسی و TLS است؛ هیچ‌کدام پینگ ICMP نیستند. TTFB زمان اولین بایت است. اختلاف نمونه‌ها تنها با حداقل دو نمونهٔ موفق نمایش داده می‌شود.

کشور و IP مربوط به **خروجی مشاهده‌شده** در پاسخ HTTPS سرویس تشخیصی Cloudflare هستند؛ محل فیزیکی سرور یا مالک را ثابت نمی‌کنند. نسبت موفقیت فقط نمونه‌های همین اسکن است، نه پایداری بلندمدت. امتیاز بر اساس موفقیت و تأخیر محاسبه می‌شود، نه امنیت یا ناشناس‌بودن. تست موفق به این مقصد، تضمین باز شدن تمام سایت‌ها نیست.

پراکسی عمومی برای بانک، رمز عبور، ایمیل اصلی، توکن و اطلاعات محرمانه مناسب نیست. عمومی بودن یک لیست، اجازهٔ استفاده از تک‌تک سرورها را ثابت نمی‌کند. فقط از آدرس‌هایی استفاده کن که مجاز به استفاده از آن‌ها هستی.

---

## Run from source

Windows: `Start-ProxyFlow.cmd`.

macOS / Linux:

```sh
python3 proxyflow.py
```

Requires Python 3.11+ and current system cURL 8.4+. No runtime pip/npm dependencies. Optional flags: `--no-browser`, `--port 0`. Close the console or press Ctrl+C to stop. Do not expose the loopback-only server through a public reverse proxy.

Build on Windows using `Build-Windows.cmd`. It creates an isolated environment and installs PyInstaller 6.22.2, runs regression tests, packages a one-file console executable and smoke-tests startup. Cross-building a Windows EXE on Linux is not supported by this project.

## Architecture and bounds

Python standard-library local HTTP server + explicitly routed system cURL subprocesses; vanilla HTML/CSS/JavaScript frontend. No external UI libraries, fonts, trackers, account system or embedded proxy credentials.

Default: 300 candidates, 12 workers, 8-second timeout, two samples. Maximum: 3,000 candidates, 24 workers, 20 seconds and three samples. Verification starts are capped at four per second. A failed first sample is not retried automatically. Additional samples follow a successful first request. Download benchmarks are one at a time and explicit opt-in.

Only public literal IP endpoints are accepted. No subnet scanning, private-address probing, arbitrary diagnostic URL input, authenticated proxies, hostname proxies, VLESS or Shadowsocks. Sources are fetched only when a scan starts and cached in memory for five minutes. No third-party proxy lists are redistributed in this repository.

SOCKS5 uses proxy-side DNS (`socks5h`). SOCKS4 resolves the destination locally. An HTTP CONNECT proxy carrying HTTPS is not the same as TLS encryption to the proxy itself (`https://`). Use the protocol actually supported by the endpoint.

## Metrics are observations, not guarantees

- TCP: cURL connect time to the proxy; not ICMP.
- HTTPS: median complete request duration, including negotiation and TLS.
- Country / exit IP: Cloudflare trace `loc` / `ip`, describing the observed exit and approximate IP-associated country, not guaranteed physical location.
- Success: successful samples divided by attempted samples in this scan; not historical uptime.
- Sample spread: maximum minus minimum successful durations, only when at least two succeed.
- Download: average throughput for exactly 1,000,000 bytes, including setup overhead; not sustained bandwidth.
- Score: `round(70 * successes/attempts + 30/(1 + latency_ms/400))`, or zero with no success. Not an anonymity, elite, or security classification.

A matching direct and proxied exit IP is flagged. Exit changes between samples are flagged. The globe is illustrative, not a live geographic map of proxy results.

## Privacy and security

Results remain in engine memory. Favorites, theme, language and preferences are stored in this browser's localStorage; exports are files requested by the user. Providers, tested proxies, the system resolver for SOCKS4, and the diagnostic destination can observe the connections needed for their roles. A direct baseline request also reaches Cloudflare.

TLS certificates are verified. cURL configuration files and ambient proxy settings are ignored. There is no silent direct-connection fallback after a proxy failure, no shell execution, and no system-proxy modification. Responses, request bodies, concurrency and timeouts are bounded. The API checks exact Host, Origin and a per-session token. See [SECURITY.md](SECURITY.md).

## Validation

```sh
python -m unittest discover -s tests -v
python tests/smoke_executable.py
node --check web/app.js
```

The repository regression suite tests parsing, validation, orchestration with a mock network, and the real loopback API. The executable smoke test checks startup, all four UI assets, API token enforcement and private-IP rejection without contacting public proxies.

The frontend was checked in static Chromium previews at 1440 and 390 pixels, including language/theme switching, source navigation, help, no page-wide horizontal overflow, and preservation of unsaved settings during state refresh. The build environment blocked browser navigation to local servers; those static previews do not constitute a browser-to-engine end-to-end test.

Earlier development also exercised four proxy protocols against local TLS fixtures. None of these tests certify availability, latency or speed of public proxies on an end user's internet connection. Treat this as a release candidate, not an audited or production-certified privacy product.

## Primary references

[ProxyScrape API](https://docs.proxyscrape.com/api-overview) · [monosans list](https://github.com/monosans/proxy-list) · [TheSpeedX list](https://github.com/TheSpeedX/PROXY-List) · [cURL manual](https://curl.se/docs/manpage.html) · [Cloudflare diagnostics](https://developers.cloudflare.com/fundamentals/reference/cdn-cgi-endpoint/)
