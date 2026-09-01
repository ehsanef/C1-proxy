# انتشار C1 Proxy روی GitHub در ویندوز

اگر ZIP را از ChatGPT گرفته‌ای، این سریع‌ترین روش است.

## روش ۱ — با PowerShell و Git

1. ZIP را Extract کن. مثلاً:

```text
F:\C1-proxy
```

2. PowerShell را داخل همان فولدر باز کن.

3. این دستورها را بزن:

```powershell
git init
git branch -M main
git add .
git commit -m "Initial C1 Proxy public beta"
git remote add origin https://github.com/ehsanef/C1-proxy.git
git push -u origin main
```

اگر GitHub برای Login مرورگر باز کرد، وارد حساب GitHub خودت شو و اجازه را تأیید کن.

### روش حتی ساده‌تر

داخل فولدر پروژه در PowerShell بزن:

```powershell
powershell -ExecutionPolicy Bypass -File .\PUBLISH_WINDOWS.ps1
```

اسکریپت خودش git init / commit / remote / push را انجام می‌دهد.

## روش ۲ — بدون Git، از خود سایت GitHub

چون repository از قبل خالی ساخته شده:

1. وارد `ehsanef/C1-proxy` شو.
2. روی **uploading an existing file** بزن.
3. تمام فایل‌ها و فولدرهای داخل C1-proxy را Drag & Drop کن.
4. پایین صفحه Commit message را بگذار `Initial C1 Proxy public beta`.
5. روی **Commit changes** بزن.

روش Git بهتر است، چون فولدرهای مخفی مثل `.github` و فایل‌های بعدی راحت‌تر مدیریت می‌شوند.

## بعد از Push چه اتفاقی می‌افتد؟

README در صفحه اصلی GitHub نمایش داده می‌شود و دکمه نارنجی/Cloudflare با متن Deploy to Cloudflare قابل استفاده خواهد بود.

لینک Deploy پروژه:

```text
https://deploy.workers.cloudflare.com/?url=https://github.com/ehsanef/C1-proxy
```

هر کاربر با زدن این لینک، پروژه را داخل حساب خودش clone می‌کند و Cloudflare برایش Worker + D1 + KV می‌سازد.

## اولین تست خودت

بعد از اینکه روی GitHub Push کردی، اول خودت دکمه Deploy to Cloudflare را تست کن.

بعد از Deploy آدرس Worker را باز کن و `/admin` را آخرش بگذار:

```text
https://YOUR-WORKER.YOUR-NAME.workers.dev/admin
```

در نصب اولیه Admin Password بساز، بعد یک User ایجاد کن و Subscription link را داخل یک کلاینت سازگار با VLESS/WS تست کن.
