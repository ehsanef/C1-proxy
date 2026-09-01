<div dir="rtl" align="right">

<div align="center"><img src="./assets/c1-logo.svg" width="96" alt="C1 Proxy logo"></div>

# C1 Proxy

### پنل پروکسی شخصی، ماژولار و قابل‌نگهداری روی Cloudflare Workers

**VLESS · WebSocket · چندکاربره · D1 · Clean IP · Clash · sing-box · Base64**

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ehsanef/C1-proxy)

## نصب خیلی ساده برای همه

وقتی این پروژه را روی GitHub عمومی کردی، هر کسی فقط روی دکمه‌ی **Deploy to Cloudflare** بالا می‌زند. Cloudflare خودش:

1. پروژه را داخل GitHub همان شخص clone می‌کند.
2. Worker را می‌سازد.
3. دیتابیس D1 و فضای KV را خودکار می‌سازد و به Worker متصل می‌کند.
4. Workers Builds را فعال می‌کند تا آپدیت‌های GitHub بتوانند deploy شوند.
5. Worker را روی حساب Cloudflare خود کاربر منتشر می‌کند.

بعد از نصب کافی است این آدرس را باز کند:

```text
https://نام-ورکر.ساب‌دامین-کلادفلر.workers.dev/admin
```

اگر اولین اجرا باشد، C1 خودش به صفحه‌ی `/install` می‌فرستد.

### پیشنهاد امنیتی نصب

در مرحله‌ی Deploy یک مقدار تصادفی برای `C1_CLAIM_TOKEN` بگذارید. مثلاً:

```bash
openssl rand -hex 16
```

این توکن فقط برای گرفتن مالکیت پنل در اولین نصب است. اگر تنظیم نشده باشد، اولین کسی که صفحه‌ی install را باز کند می‌تواند رمز ادمین را تعیین کند؛ بنابراین در آن حالت بلافاصله بعد از Deploy پنل را باز کنید.

## امکانات نسخه 0.1.0

- نصب تک‌کلیکی روی Cloudflare.
- ساخت خودکار D1 و KV.
- پنل مدیریت با ظاهر مستقل C1.
- چند کاربر با حجم کل، حجم روزانه، تاریخ انقضا و فعال/غیرفعال.
- UUID و لینک خصوصی جدا برای هر کاربر.
- VLESS روی WebSocket + TLS.
- خروجی Base64، Clash/Mihomo و sing-box.
- تشخیص خودکار نوع subscription برای تعدادی از کلاینت‌ها.
- Clean IP سراسری یا اختصاصی برای هر کاربر.
- شمارش مصرف بدون نوشتن در دیتابیس روی هر packet؛ مصرف در پایان اتصال ثبت می‌شود.
- Backup JSON از کاربران و تنظیمات.
- رمز ادمین به‌صورت plaintext ذخیره نمی‌شود؛ از PBKDF2 + salt استفاده شده است.
- Session امضاشده، HttpOnly cookie، CSRF protection و محدودسازی تلاش Login.
- مسیر `/healthz` بسیار سبک.
- صفحه‌ی اصلی بدون نام و fingerprint مستقیم C1.

## ساخت کاربر و لینک اشتراک

در پنل `/admin` کاربر بسازید. برای هر کاربر C1 لینکی شبیه این می‌دهد:

```text
https://دامنه-شما/s/TOKEN-خصوصی
```

و فرمت‌های اجباری:

```text
https://دامنه-شما/s/TOKEN?format=base64
https://دامنه-شما/s/TOKEN?format=clash
https://دامنه-شما/s/TOKEN?format=singbox
```

کاربر فقط همین لینک را داخل اپ خودش وارد می‌کند.

## نصب دستی برای صاحب پروژه

```bash
git clone https://github.com/ehsanef/C1-proxy.git
cd C1-proxy
npm install
npx wrangler login
npm run deploy
```

با Wrangler جدید لازم نیست قبلش دستی D1 یا KV بسازی؛ bindingها در `wrangler.jsonc` بدون ID تعریف شده‌اند و Cloudflare آن‌ها را هنگام Deploy provision می‌کند.

## ساختار پروژه

برخلاف پروژه‌هایی که همه‌چیز را داخل یک `worker.js` بسیار بزرگ می‌ریزند، C1 سورس را ماژولار نگه می‌دارد:

```text
src/
├── index.ts
├── app/
├── auth/
├── database/
├── proxy/
├── subscriptions/
└── utils/
```

Wrangler هنگام Deploy این فایل‌ها را bundle می‌کند و خروجی مناسب Worker می‌سازد.

## وضعیت نسخه

این فایل ZIP نسخه‌ی **Public Beta 0.1.0** است و واقعاً قابل Deploy و استفاده است، اما من عمداً روی README ادعا نکرده‌ام که همین الان تمام امکانات Nova را دارد.

قابلیت‌هایی که برای نسخه‌های بعدی در نظر گرفته شده‌اند:

- Trojan
- Shadowsocks AEAD
- WARP / AmneziaWG profile
- کنترل از Telegram
- GitHub subscription mirror
- C1 Radar برای Clean IP
- import/restore کامل
- routing policy پیشرفته
- مسیرهای ورودی بیشتر

بهتر است این‌ها مرحله‌به‌مرحله اضافه شوند تا امنیت و پایداری قربانی تعداد آپشن‌ها نشود.

## لایسنس

کد نوشته‌شده برای C1 تحت MIT منتشر شده است. C1 یک پروژه مستقل است و کد نسخه‌های جدید و محافظت‌شده‌ی Nova را داخل خود قرار نمی‌دهد. جزئیات در `THIRD_PARTY_NOTICES.md` آمده است.

</div>
