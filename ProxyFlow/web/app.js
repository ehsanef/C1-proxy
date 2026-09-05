/* ProxyFlow: local-first UI. Never inserts demonstration measurements. */
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeHTML;
const paths={
grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
layers:'<path d="m12 3 10 5-10 5L2 8Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
star:'<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
sliders:'<path d="M3 7h8m6 0h4M3 17h4m6 0h8"/><circle cx="14" cy="7" r="3"/><circle cx="10" cy="17" r="3"/>',
shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3v.1"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
radar:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 7-7"/><circle cx="12" cy="12" r="1"/>',
upload:'<path d="M4 15v5h16v-5M12 16V3m-5 5 5-5 5 5"/>',
download:'<path d="M4 15v5h16v-5M12 3v13m-5-5 5 5 5-5"/>',
check:'<path d="m5 12 4 4L19 6"/>',
activity:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',
globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
refresh:'<path d="M20 11a8 8 0 0 0-14-5L3 9m0-6v6h6M4 13a8 8 0 0 0 14 5l3-3m0 6v-6h-6"/>',
search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/>',
arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
stop:'<rect x="6" y="6" width="12" height="12" rx="1"/>',
speed:'<path d="M4 19a10 10 0 1 1 16 0M12 13l5-5M5 12h2M17 12h2M12 5v2"/><circle cx="12" cy="14" r="2"/>'
};
const icon=n=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[n]||paths.globe}</svg>`;
$$('[data-icon]').forEach(x=>x.innerHTML=icon(x.dataset.icon));
const D={
overview:['نمای شبکه','Network overview'],sources:['منابع پراکسی','Proxy sources'],saved:['ذخیره‌شده‌ها','Saved routes'],settings:['تنظیمات اسکن','Scan settings'],
local:['قدرت محلی.','Local power.'],localCopy:['بدون حساب کاربری، بدون تغییر تنظیمات شبکه.','No account. No changes to your network settings.'],guide:['راهنمای استفاده','Quick guide'],workspace:['فضای شخصی','Workspace'],
offline:['موتور قطع است','Engine offline'],online:['موتور محلی آماده','Local engine online'],
offlineHelp:['برای تست واقعی، Start-ProxyFlow.cmd را اجرا کن و پنجرهٔ برنامه را باز نگه دار. این صفحه بدون موتور محلی فقط پیش‌نمایش است.','Run Start-ProxyFlow.cmd and keep its console open. Without the local engine this page is an interface preview only.'],
hero1:['بهترین مسیر،','The internet.'],hero2:['پیش روی تو.','A better route.'],
heroCopy:['پراکسی‌ها را پیدا کن. اتصال واقعی را بسنج. سریع‌ترین مسیر اینترنت خودت را انتخاب کن.','Discover public proxies. Verify real connections. Find the fastest route from your own network.'],
scan:['اسکن جهان','Scan the world'],scanning:['در حال بررسی…','Scanning…'],import:['ورود لیست','Import list'],heroNote:['تست از اینترنت خودت · بدون نیاز به کلید API','Your network. Your measurements. No API key.'],globe:['جهان بزرگ است. مسیرت را پیدا کن.','A world of routes. Find yours.'],
mode:['حالت اسکن','Scan mode'],quick:['سریع','Quick'],balanced:['متعادل','Balanced'],thorough:['دقیق','Thorough'],customize:['شخصی‌سازی','Customize'],
discovered:['آدرس‌های پیدا‌شده','Proxies discovered'],dedupe:['بدون موارد تکراری','Duplicates removed'],verified:['مسیرهای تأیید‌شده','Verified routes'],waiting:['منتظر اولین اسکن','Awaiting your first scan'],
best:['کمترین تأخیر HTTPS','Best HTTPS latency'],notPing:['زمان درخواست؛ نه پینگ ICMP','Request time, not ICMP ping'],countries:['کشورهای خروجی','Exit countries'],exitGeo:['کشور IP دیده‌شده در مقصد','Country reported for the exit IP'],
routes:['مسیرهای تو','Your routes'],retest:['تست مجدد سالم‌ها','Retest healthy'],export:['خروجی','Export'],stop:['توقف','Stop'],search:['جست‌وجوی IP یا کشور…','Search IP or country…'],
allCountries:['همهٔ کشورها','All countries'],allProtocols:['همهٔ پروتکل‌ها','All protocols'],healthy:['فقط سالم‌ها','Healthy only'],all:['همهٔ نتایج','All results'],failed:['ناموفق‌ها','Failed only'],
byScore:['بهترین امتیاز','Best score'],byLatency:['کمترین تأخیر','Lowest latency'],bySpeed:['بیشترین سرعت تست‌شده','Highest measured speed'],maxLatency:['حداکثر ms','Max. latency ms'],
endpoint:['آدرس پراکسی','Proxy endpoint'],country:['کشور خروجی','Exit country'],samples:['نمونه‌های موفق','Successful samples'],score:['امتیاز مسیر','Flow score'],actions:['عملیات','Actions'],
emptyTitle:['اولین مسیرت را پیدا کن.','Your first route is out there.'],emptyCopy:['«اسکن جهان» را بزن. نتیجه‌ها پس از تست واقعی همین‌جا ظاهر می‌شوند.','Start a world scan. Real, verified connections will appear right here.'],
runningTitle:['در حال پیدا کردن مسیر…','Finding your flow…'],runningCopy:['هر آدرس باید واقعاً درخواست HTTPS را عبور دهد تا تأیید شود.','Each candidate must actually carry a verified HTTPS request to qualify.'],
noneTitle:['مسیری با این فیلترها پیدا نشد.','No matching routes yet.'],noneCopy:['فیلترها و رویدادها را بررسی کن. منبع یا مهلت تست را تغییر بده و دوباره امتحان کن.','Check the filters and activity log. Try different sources or a longer timeout.'],
activity:['رویدادهای زنده','Live activity'],safetyTitle:['سریع بودن، به معنی امن بودن نیست.','Fast does not mean safe.'],
safety:['پراکسی عمومی برای بانک، رمز عبور و دادهٔ حساس مناسب نیست. تست موفق هم ناشناس‌بودن یا اتصال دائمی را تضمین نمی‌کند.','Never trust public proxies with banking, passwords or sensitive data. A successful check guarantees neither anonymity nor future availability.'],
metricsHelp:['معیارها را بشناس ↗','Understand the metrics ↗'],sourcesTitle:['چند منبع. یک مسیر بهتر.','Multiple sources. One better route.'],
sourcesCopy:['منابع آماده‌اند؛ لازم نیست سورسی بشناسی. آمار بعد از دریافت واقعی نمایش داده می‌شود.','Sources are built in. Nothing to configure. Counts appear only after an actual fetch.'],
sourcesNote:['فهرست عمومی تضمین کیفیت یا اجازهٔ استفاده از سرورها نیست. لیست‌ها پنج دقیقه در حافظه می‌مانند. آدرس‌ها از اینترنت خودت دوباره تست می‌شوند.','A public listing guarantees neither quality nor permission to use an endpoint. Lists are cached in memory for five minutes; candidates are tested from your own network.'],
savedTitle:['مسیرهای منتخب تو.','Your routes. Shortlisted.'],savedCopy:['ستاره بزن و نگه دار. این‌ها نتیجهٔ گذشته‌اند؛ پیش از استفاده دوباره تستشان کن.','Star a route to keep it. These are historical snapshots: retest before using them.'],
testSaved:['تست ذخیره‌شده‌ها','Retest saved'],settingsTitle:['با ریتم اینترنت تو.','Tune it to your network.'],settingsCopy:['نمونهٔ بیشتر برای مقایسهٔ بهتر؛ هم‌زمانی کمتر برای شبکهٔ ضعیف‌تر.','More samples for a better comparison. Fewer concurrent connections for constrained networks.'],
limit:['حداکثر پراکسی در اسکن (۱ تا ۳۰۰۰)','Candidates per scan (1–3,000)'],workers:['اتصال هم‌زمان (۱ تا ۲۴)','Concurrent connections (1–24)'],timeout:['مهلت هر درخواست، ثانیه (۳ تا ۲۰)','Request timeout, seconds (3–20)'],
sampleCount:['تعداد نمونهٔ HTTPS (۱ تا ۳)','HTTPS samples (1–3)'],protocols:['پروتکل‌های مورد بررسی','Protocols to verify'],saveSettings:['ذخیرهٔ تنظیمات','Save settings'],settingsLocal:['فقط در این مرورگر ذخیره می‌شود.','Stored in this browser only.'],
rateNote:['سقف شروع تست‌ها چهار درخواست در ثانیه است. SOCKS5 از DNS سمت پراکسی و SOCKS4 از DNS محلی استفاده می‌کند. HTTP با تونل CONNECT به مقصد HTTPS تست می‌شود؛ با TLS تا خود پراکسی متفاوت است.','Verification starts are capped at four requests per second. SOCKS5 uses proxy-side DNS; SOCKS4 uses local DNS. HTTP is tested with CONNECT to an HTTPS target, distinct from TLS encryption to an HTTPS proxy.'],
footer:['اندازه‌گیری محلی. بدون آمار ساختگی.','Local measurements. No invented numbers.'],
idle:['آمادهٔ کشف مسیر','Ready to discover'],collecting:['دریافت و ترکیب منابع','Collecting and deduplicating sources'],testing:['تست واقعی مسیرها','Verifying real connections'],complete:['اسکن کامل شد','Scan complete'],
cancelled:['متوقف شد؛ نتایج کامل حفظ شدند','Stopped; completed results retained'],error:['اسکن با خطا متوقف شد','Scan ended with an error'],benchmarking:['تست دانلود ۱ مگابایتی','Running a 1 MB download test'],stopping:['در حال توقف اتصال‌ها…','Stopping active connections…'],
source_idle:['بررسی نشده','Not checked'],source_fetching:['در حال دریافت…','Fetching…'],source_ready:['دریافت شد','Fetched'],source_partial:['دریافت ناقص','Partial fetch'],source_failed:['دریافت ناموفق','Fetch failed'],source_disabled:['غیرفعال','Disabled'],cached:['حافظهٔ موقت','cached'],sourceLink:['مشاهدهٔ منبع ↗','View source ↗'],
unknown:['نامشخص','Unknown'],checked:['تست‌شده','checked'],successRate:['از تست‌شده‌ها تأیید شدند','of checked routes verified'],noMeasurements:['هنوز اندازه‌گیری انجام نشده است','No measurements yet'],showing:['نمایش','Showing'],
copy:['کپی IP:PORT','Copy IP:PORT'],copyURL:['کپی آدرس کامل','Copy proxy URL'],copied:['کپی شد.','Copied to clipboard.'],copyManual:['متن را برای کپی انتخاب کن.','Select this text to copy it.'],
details:['جزئیات مسیر','Route details'],save:['ذخیرهٔ مسیر','Save route'],unsave:['حذف از منتخب‌ها','Remove saved route'],noSaved:['هنوز مسیری ذخیره نکرده‌ای. کنار نتیجهٔ سالم ستاره بزن.','No saved routes yet. Star a healthy result to keep it.'],
noResults:['نتیجهٔ سالمی برای این کار وجود ندارد.','No healthy results are available for this action.'],savedLimit:['حداکثر ۲۰۰ مسیر قابل ذخیره است.','You can save up to 200 routes.'],savedOK:['تنظیمات ذخیره شد.','Settings saved.'],storageError:['مرورگر اجازهٔ ذخیره‌سازی نداد.','Browser storage is unavailable.'],
selectSource:['حداقل یک منبع را فعال کن.','Enable at least one source.'],selectProtocol:['حداقل یک پروتکل را انتخاب کن.','Select at least one protocol.'],requestFailed:['درخواست انجام نشد؛ اتصال موتور یا تنظیمات را بررسی کن.','Request failed. Check the local engine and settings.'],
importTitle:['لیست خودت را وارد کن.','Bring your own routes.'],importCopy:['هر خط یک IP عمومی و پورت. بدون پیشوند، پروتکل انتخابی استفاده می‌شود. آدرس خصوصی، دامنه یا رمز عبور پذیرفته نمی‌شود.','One public IP and port per line. Entries without a scheme use the selected protocol. Private IPs, hostnames and credentials are not accepted.'],
defaultProtocol:['پروتکل پیش‌فرض','Default protocol'],importTest:['وارد کن و تست بگیر','Import & verify'],emptyImport:['ابتدا چند آدرس وارد کن.','Enter some proxy addresses first.'],
tcp:['اتصال TCP','TCP connect'],https:['تأخیر HTTPS','HTTPS latency'],ttfb:['زمان اولین بایت','Time to first byte'],jitter:['اختلاف نمونه‌ها','Sample spread'],exitIP:['IP خروجی','Exit IP'],speed:['سرعت دانلود','Download speed'],untested:['تست نشده','Not tested'],insufficient:['نمونهٔ کافی نیست','Not enough samples'],
speedTest:['تست سرعت · ۱ MB','Speed test · 1 MB'],measuredAt:['زمان اندازه‌گیری','Measured at'],sameExit:['IP خروجی با اتصال مستقیم یکسان است؛ تغییر IP تأیید نشده است.','Exit IP matches your direct connection. An IP change has not been verified.'],
rotated:['IP خروجی بین نمونه‌ها تغییر کرد.','Exit IP changed between samples.'],geoNote:['کشور مربوط به IP خروجی است؛ محل فیزیکی سرور تضمین نمی‌شود.','Country describes the observed exit IP, not a guaranteed physical server location.'],
useNote:['این برنامه VPN نیست و تنظیمات ویندوز را تغییر نمی‌دهد. IP، پورت و پروتکل را در برنامهٔ مقصدی که پراکسی می‌پذیرد وارد کن.','This is not a VPN and does not change system settings. Enter the IP, port and matching protocol in an app that supports proxies.'],
benchmarkTitle:['سرعت واقعی را اندازه بگیر.','Put its speed to the test.'],benchmarkCopy:['یک فایل یک‌میلیون‌بایتی از Cloudflare از داخل این پراکسی دریافت می‌شود. نتیجه، میانگین سرعت همین درخواست با احتساب راه‌اندازی اتصال است؛ نه تضمین پهنای باند.','Downloads exactly 1,000,000 bytes from Cloudflare through this proxy. The result is average throughput for this request, including connection setup—not a bandwidth guarantee.'],
startBenchmark:['شروع تست ۱ MB','Start 1 MB test'],cancel:['انصراف','Cancel'],benchmarkDone:['تست سرعت کامل شد.','Speed test completed.'],benchmarkFailed:['تست سرعت موفق نشد.','Speed test failed.'],
exportTitle:['مسیرهایت، با فرمت دلخواه.','Your routes. Your format.'],exportCopy:['فقط نتیجه‌های سالم منطبق با فیلترها صادر می‌شوند. این فایل وضعیت همین نوبت است، نه تضمین اتصال آینده.','Exports healthy routes matching the current filters. This is a snapshot, not a guarantee of future connectivity.'],
exportHistorical:['خروجی شامل ذخیره‌های گذشته است؛ پیش از استفاده دوباره تست بگیر.','This export contains historical saved snapshots. Retest before use.'],
helpTitle:['مسیر را درست انتخاب کن.','Choose your route with confidence.'],helpMetrics:['معنی عددها','What the numbers mean'],
helpMetricsCopy:['TCP زمان اتصال به پراکسی است. HTTPS میانهٔ زمان درخواست کامل شامل مذاکره و TLS است؛ پینگ ICMP نیست. نسبت موفقیت فقط نمونه‌های همین اسکن است، نه پایداری بلندمدت.','TCP is connection time to the proxy. HTTPS is median complete request time, including negotiation and TLS, not ICMP ping. The success ratio describes this scan, not long-term uptime.'],
helpScore:['امتیاز مسیر، نه امنیت','A route score, not a security rating'],
helpScoreCopy:['امتیاز = ۷۰ × نسبت موفقیت + ۳۰ ÷ (۱ + تأخیر HTTPS ÷ ۴۰۰). این عدد ناشناس‌بودن، امنیت یا Elite بودن را ثابت نمی‌کند.','Score = 70 × success ratio + 30 / (1 + HTTPS latency / 400). It does not establish anonymity, security or an elite proxy classification.'],
helpPrivacy:['مرزهای حریم خصوصی','The privacy boundary'],
helpPrivacyCopy:['رابط فقط روی 127.0.0.1 اجرا می‌شود. منابع عمومی، پراکسی‌ها و Cloudflare اتصال‌های لازم برای تست را می‌بینند. ردیاب یا ارسال خودکار نتایج وجود ندارد. تنظیمات و منتخب‌ها در مرورگر می‌مانند.','The interface listens only on 127.0.0.1. Public providers, tested proxies and Cloudflare see the connections necessary for diagnostics. No trackers or automatic result uploads. Preferences and favorites stay in browser storage.'],
helpLimits:['محدودیت این نسخه','Release limitations'],
helpLimitsCopy:['VPN سراسری، پراکسی رمزدار، VLESS، Shadowsocks و تست ناشناس‌بودن در این نسخه نیستند. نتیجه فقط به مقصد تشخیصی و اینترنت همین کامپیوتر مربوط است؛ تضمین باز شدن همهٔ سایت‌ها نیست.','System-wide VPN routing, authenticated proxies, VLESS, Shadowsocks and anonymity auditing are not included. Results apply to this diagnostic target and this computer, not guaranteed access to every site.'],
timeoutError:['پایان مهلت','Timed out'],unreachable:['غیرقابل دسترس','Unreachable'],tls:['خطای TLS','TLS error'],handshake:['خطای مذاکره','Proxy handshake error'],dns:['خطای DNS','DNS error'],http_error:['خطای HTTP','HTTP error'],
oversize:['پاسخ بیش از حد بزرگ','Response too large'],authentication:['نیاز به احراز هویت','Authentication required'],invalid_response:['پاسخ نامعتبر','Invalid response'],connection_failed:['خطای اتصال','Connection failed'],
empty:['لیست خالی یا نامعتبر','Empty or invalid list'],no_candidates:['آدرس معتبری دریافت نشد؛ منابع و ورودی را بررسی کن.','No valid candidates received. Check sources and imports.'],internal_error:['خطای داخلی موتور','Internal engine error'],
started:['اسکن جدید شروع شد.','A new scan started.'],baseline_unavailable:['IP مستقیم قابل بررسی نبود؛ تست پراکسی ادامه دارد.','Direct IP check unavailable; proxy verification continues.'],
benchmark_done:['اندازه‌گیری دانلود کامل شد.','Download measurement completed.'],readyLog:['موتور منتظر شروع اسکن است.','Engine ready. Waiting for a scan.']
};
function readStore(k,fallback){try{return JSON.parse(localStorage.getItem(k))??fallback;}catch{return fallback;}}
let lang=readStore('proxyflow.language','fa')==='en'?'en':'fa';
let theme=readStore('proxyflow.theme','dark')==='light'?'light':'dark';
const t=k=>D[k]?.[lang==='fa'?0:1]||k;
const num=(v,d=0)=>Number.isFinite(v)?v.toLocaleString('en-US',{maximumFractionDigits:d}):'—';
const errorText=k=>t(k==='timeout'?'timeoutError':k||'connection_failed');
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function store(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{toast(t('storageError'));}}
const sourceDefaults=[
{id:'proxyscrape',name:'ProxyScrape',kind:'Public API',homepage:'https://proxyscrape.com/free-proxy-list'},
{id:'monosans',name:'monosans',kind:'Community list',homepage:'https://github.com/monosans/proxy-list'},
{id:'speedx',name:'TheSpeedX',kind:'Community list',homepage:'https://github.com/TheSpeedX/PROXY-List'}
];
const protocols=['http','https','socks4','socks5'];
const presets={quick:{limit:150,workers:12,timeout:6,samples:1},balanced:{limit:300,workers:12,timeout:8,samples:2},thorough:{limit:500,workers:8,timeout:12,samples:3}};
function cleanSettings(v){
 const out={...presets.balanced,sources:sourceDefaults.map(s=>s.id),protocols:[...protocols]};
 if(!v||typeof v!=='object')return out;
 for(const [k,low,high] of [['limit',1,3000],['workers',1,24],['timeout',3,20],['samples',1,3]])if(Number.isInteger(v[k])&&v[k]>=low&&v[k]<=high)out[k]=v[k];
 if(Array.isArray(v.sources))out.sources=v.sources.filter(x=>sourceDefaults.some(s=>s.id===x));
 if(Array.isArray(v.protocols)&&v.protocols.some(x=>protocols.includes(x)))out.protocols=v.protocols.filter(x=>protocols.includes(x));
 return out;
}
let settings=cleanSettings(readStore('proxyflow.settings',null));
let saved=new Map();
const rawSaved=readStore('proxyflow.saved',[]);
if(Array.isArray(rawSaved))for(const r of rawSaved.slice(0,200)){
 if(r&&/^[a-f0-9]{20}$/.test(r.id)&&typeof r.url==='string'&&/^(https?|socks4|socks5h):\/\/[\da-fA-F.:[\]]+:\d{1,5}$/.test(r.url)&&Number.isFinite(r.checked_at))saved.set(r.id,r);
}
let state={revision:0,run_id:'',phase:'idle',discovered:0,total:0,checked:0,alive:0,failed:0,results:[],sources:sourceDefaults.map(s=>({...s,status:'idle',count:0})),logs:[],error:''};
let token='',online=false,currentView='overview',page=1,signature='',submitting=false;
const busy=()=>submitting||['collecting','testing','benchmarking','stopping'].includes(state.phase);
function countryName(code){if(!code)return t('unknown');try{return new Intl.DisplayNames([lang],{type:'region'}).of(code)||code;}catch{return code;}}
function connected(value){
 online=value;$('#connection').classList.toggle('online',value);$('#connection span').textContent=t(value?'online':'offline');$('#offline-notice').classList.toggle('hidden',value);buttons();
}
async function api(path,body){
 const r=await fetch(path,{method:body===undefined?'GET':'POST',credentials:'omit',headers:{'X-ProxyFlow-Token':token,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(8000)});
 if(!r.ok){if(r.status===403)token='';throw new Error('API request failed');}
 return r.json();
}
async function poll(){
 try{
  if(!token){
   const r=await fetch('/api/session',{signal:AbortSignal.timeout(5000)});if(!r.ok)throw new Error();
   const session=await r.json();if(session.name!=='ProxyFlow'||typeof session.token!=='string')throw new Error();
   token=session.token;signature='';
  }
  const next=await api('/api/state');if(!Array.isArray(next.results)||!Array.isArray(next.sources))throw new Error();
  connected(true);
  const nextSignature=`${next.run_id}:${next.revision}`;
  if(signature!==nextSignature){
   if(state.phase==='benchmarking'&&next.phase!=='benchmarking'){
    const row=next.results.find(r=>r.id===state.benchmark_id);toast(row?.speed_mbps!=null?`${t('benchmarkDone')} ${num(row.speed_mbps,2)} Mbps`:t('benchmarkFailed'));
   }
   state=next;signature=nextSignature;
   let changed=false;for(const row of state.results)if(saved.has(row.id)){const old=saved.get(row.id);if(old.checked_at!==row.checked_at||old.speed_at!==row.speed_at){saved.set(row.id,row);changed=true;}}
   if(changed)store('proxyflow.saved',[...saved.values()]);
   render();
  }
 }catch{token='';connected(false);}
 setTimeout(poll,document.hidden?4000:1100);
}
function buttons(){
 $$('.scan').forEach(b=>{b.disabled=!online||busy();$('[data-t="scan"]',b).textContent=t(busy()?'scanning':'scan');});
 $('#stop').classList.toggle('hidden',!['collecting','testing','benchmarking','stopping'].includes(state.phase));$('#stop').disabled=!online||state.phase==='stopping';
 $('#retest').disabled=!online||busy()||!state.alive;$('#test-saved').disabled=!online||busy()||!saved.size;
 document.body.classList.toggle('busy',busy());
}
function setLanguage(){
 document.documentElement.lang=lang;
 $$('[data-t]').forEach(x=>x.textContent=t(x.dataset.t));
 $$('[data-placeholder]').forEach(x=>x.placeholder=t(x.dataset.placeholder));
 $('#language').textContent=lang==='fa'?'EN':'FA';$('#page-title').textContent=t(currentView);
 $$('.nav').forEach(b=>b.setAttribute('aria-label',t(b.dataset.view)));
 connected(online);render();renderSettingsSummary();
}
function go(view){
 if(!['overview','sources','saved','settings'].includes(view))return;
 currentView=view;$$('.view').forEach(x=>x.classList.toggle('active',x.id===view+'-view'));
 $$('.nav').forEach(x=>{x.classList.toggle('active',x.dataset.view===view);x.setAttribute('aria-current',x.dataset.view===view?'page':'false');});
 $('#page-title').textContent=t(view);window.scrollTo({top:0,behavior:'instant'});
}
function filtered(){
 const q=$('#search').value.trim().toLowerCase(),c=$('#country').value,p=$('#protocol').value.toLowerCase(),status=$('#status').value,cap=Number($('#max-latency').value);
 const out=state.results.filter(r=>(!q||`${r.host} ${r.exit_ip} ${r.country} ${countryName(r.country)}`.toLowerCase().includes(q))&&(!c||r.country===c)&&(!p||r.protocol===p)&&(status==='all'||r.status===status)&&(!cap||(r.latency_ms!=null&&r.latency_ms<=cap)));
 const sort=$('#sort').value;
 return out.sort((a,b)=>a.status!==b.status?(a.status==='alive'?-1:1):sort==='latency'?(a.latency_ms??Infinity)-(b.latency_ms??Infinity):sort==='speed'?(b.speed_mbps??-1)-(a.speed_mbps??-1):b.score-a.score||(a.latency_ms??Infinity)-(b.latency_ms??Infinity));
}
function renderRows(){
 const rows=filtered(),pages=Math.max(1,Math.ceil(rows.length/25));page=Math.min(Math.max(page,1),pages);
 $('#result-count').textContent=num(state.results.length);
 $('#rows').innerHTML=rows.slice((page-1)*25,page*25).map(r=>`<tr>
 <td><button class="star ${saved.has(r.id)?'saved':''}" data-save="${e(r.id)}" aria-label="${e(t(saved.has(r.id)?'unsave':'save'))}" aria-pressed="${saved.has(r.id)}" ${r.status!=='alive'&&!saved.has(r.id)?'disabled':''}>${saved.has(r.id)?'★':'☆'}</button></td>
 <td><button class="endpoint" data-details="${e(r.id)}">${e(r.endpoint)}</button><span class="protocol-tag">${e(r.protocol.toUpperCase())}</span></td>
 <td><span class="country-cell"><span class="country-code">${e(r.country||'??')}</span>${e(countryName(r.country))}</span></td>
 <td class="mono">${r.tcp_ms==null?'—':num(r.tcp_ms,1)}</td>
 <td>${r.status==='alive'?`<span class="latency">${num(r.latency_ms,1)}</span>`:`<span class="danger">${e(errorText(r.error))}</span>`}</td>
 <td class="mono">${r.successes}/${r.attempts}</td><td><span class="score">${r.status==='alive'?num(r.score):'—'}<meter min="0" max="100" value="${Number(r.score)||0}" aria-label="${e(t('score'))}"></meter></span></td>
 <td><div class="row-actions"><button class="icon-btn" data-copy="${e(r.id)}" aria-label="${e(t('copy'))}" title="${e(t('copy'))}">${icon('copy')}</button><button class="icon-btn" data-details="${e(r.id)}" aria-label="${e(t('details'))}" title="${e(t('details'))}">${icon('arrow')}</button></div></td></tr>`).join('');
 $('#empty').classList.toggle('hidden',rows.length>0);
 $('#empty-title').textContent=t(busy()?'runningTitle':state.checked||state.error?'noneTitle':'emptyTitle');
 $('#empty-copy').textContent=state.error?errorText(state.error):t(busy()?'runningCopy':state.checked?'noneCopy':'emptyCopy');
 $('#page').textContent=`${page} / ${pages}`;$('#prev').disabled=page===1;$('#next').disabled=page===pages;
 $('#table-summary').textContent=state.checked?`${t('showing')} ${rows.length?(page-1)*25+1:0}–${Math.min(page*25,rows.length)} / ${num(rows.length)} · ${num(state.checked)} ${t('checked')}`:t('noMeasurements');
}
function renderSources(){
 $('#source-grid').innerHTML=state.sources.map((s,i)=>`<article class="source-card"><header><span class="source-symbol">${['PS','/m','SX'][i]||'PF'}</span><input type="checkbox" data-source="${e(s.id)}" ${settings.sources.includes(s.id)?'checked':''} aria-label="${e(s.name)}"></header><h2>${e(s.name)}</h2><small>${e(s.kind)}</small><div class="source-stat"><strong>${['idle','disabled'].includes(s.status)?'—':num(s.count)}</strong><span>${e(t('source_'+s.status))}${s.cached?' · '+e(t('cached')):''}</span></div>${s.error?`<div class="source-error">${e(s.error.split(', ').map(errorText).join(' · '))}</div>`:''}<a href="${e(sourceDefaults.find(x=>x.id===s.id)?.homepage||'#')}" target="_blank" rel="noopener noreferrer">${e(t('sourceLink'))}</a></article>`).join('');
}
function renderSaved(){
 $('#saved-count').textContent=saved.size;
 $('#saved-grid').innerHTML=saved.size?[...saved.values()].map(r=>`<article class="saved-card"><div><code>${e(r.endpoint)}</code><button class="star saved" data-save="${e(r.id)}" aria-label="${e(t('unsave'))}">★</button></div><p>${e(r.protocol.toUpperCase())} · ${e(countryName(r.country))} · ${r.status==='alive'?num(r.latency_ms,1)+' ms':e(errorText(r.error))}</p><footer><time>${e(new Date(r.checked_at*1000).toLocaleString(lang==='fa'?'fa-IR':'en-US'))}</time><button class="icon-btn" data-copy="${e(r.id)}" aria-label="${e(t('copy'))}">${icon('copy')}</button></footer></article>`).join(''):`<div class="saved-empty">${e(t('noSaved'))}</div>`;
}
function renderSettingsSummary(){
 $('#config-summary').textContent=`${num(settings.limit)} / ${settings.samples}`;
 $$('[data-mode]').forEach(b=>b.classList.toggle('selected',Object.keys(presets.balanced).every(k=>settings[k]===presets[b.dataset.mode][k])));
}
function fillSettings(){
 for(const k of Object.keys(presets.balanced))$(`[name="${k}"]`).value=settings[k];
 $$('[name="protocols"]').forEach(x=>x.checked=settings.protocols.includes(x.value));renderSettingsSummary();
}
function renderLogs(){
 $('#logs').innerHTML=state.logs.length?state.logs.slice(-6).map(l=>{
  let text=t(l.code);
  if(l.code==='source_done')text=`${l.source} · ${num(l.count)} ${t('discovered')}`;
  if(l.code==='testing')text=`${t('testing')} · ${num(l.count)}`;
  if(l.code==='complete')text=`${t('complete')} · ${num(l.count)} ${t('verified')}`;
  if(l.code==='error')text=errorText(l.error);
  return `<div class="log"><time>${new Date(l.time*1000).toLocaleTimeString('en-GB')}</time><span>${e(text)}</span></div>`;
 }).join(''):`<div class="log"><time>--:--:--</time><span>${e(t('readyLog'))}</span></div>`;
}
function render(){
 const healthy=state.results.filter(r=>r.status==='alive');
 $('#discovered').textContent=state.discovered?num(state.discovered):'—';$('#alive').textContent=state.checked?num(state.alive):'—';
 $('#best').textContent=healthy.length?num(Math.min(...healthy.map(r=>r.latency_ms))):'—';
 const countries=[...new Set(healthy.map(r=>r.country).filter(Boolean))].sort((a,b)=>countryName(a).localeCompare(countryName(b)));
 $('#countries').textContent=healthy.length?countries.length:'—';$('#success-label').textContent=state.checked?`${Math.round(state.alive/state.checked*100)}% ${t('successRate')}`:t('waiting');
 $('#phase').textContent=t(state.phase);$('#progress-count').textContent=`${num(state.checked)} / ${num(state.total)}`;$('#progress').value=state.total?state.checked/state.total*100:0;
 const old=$('#country').value;$('#country').innerHTML=`<option value="">${e(t('allCountries'))}</option>`+countries.map(c=>`<option value="${e(c)}">${e(countryName(c))}</option>`).join('');if(countries.includes(old))$('#country').value=old;
 renderRows();renderSources();renderSaved();renderLogs();buttons();
 // Do not repaint the settings form during polling: unsaved edits must survive.
}
async function scan(overrides={}){
 if(!online||busy())return;
 if(!overrides.text&&!settings.sources.length){toast(t('selectSource'));go('sources');return;}
 submitting=true;buttons();
 try{await api('/api/scan',{...settings,...overrides});page=1;$('#search').value='';$('#country').value='';$('#status').value='alive';go('overview');state=await api('/api/state');signature=`${state.run_id}:${state.revision}`;render();}
 catch{toast(t('requestFailed'));}
 finally{submitting=false;buttons();}
}
const rowById=id=>state.results.find(r=>r.id===id)||saved.get(id);
function saveRoute(id){
 if(saved.has(id))saved.delete(id);
 else{const row=rowById(id);if(!row||row.status!=='alive')return;if(saved.size>=200){toast(t('savedLimit'));return;}saved.set(id,row);}
 store('proxyflow.saved',[...saved.values()]);renderRows();renderSaved();buttons();
}
function modal(content){$('#modal-body').innerHTML=content;if(!$('#modal').open)$('#modal').showModal();}
async function copy(text){
 try{await navigator.clipboard.writeText(text);toast(t('copied'));}
 catch{modal(`<h2>${e(t('copyManual'))}</h2><code>${e(text)}</code>`);}
}
function showImport(){
 modal(`<h2>${e(t('importTitle'))}</h2><p>${e(t('importCopy'))}</p><textarea id="import-text" spellcheck="false" maxlength="1000000" aria-label="${e(t('import'))}" placeholder="socks5://IP:PORT&#10;http://IP:PORT&#10;IP:PORT"></textarea><label>${e(t('defaultProtocol'))}<select id="import-protocol">${['socks5','socks4','http','https'].map(p=>`<option value="${p}">${p.toUpperCase()}</option>`).join('')}</select></label><div class="modal-actions"><button id="confirm-import" class="button primary">${e(t('importTest'))}</button></div>`);
 $('#confirm-import').disabled=!online||busy();
 $('#confirm-import').onclick=()=>{const text=$('#import-text').value.trim(),default_protocol=$('#import-protocol').value;if(!text){toast(t('emptyImport'));return;}$('#modal').close();scan({text,default_protocol,sources:[],protocols});};
}
function showDetails(id){
 const r=rowById(id);if(!r)return;
 const ms=v=>v==null?'—':num(v,1)+' ms';
 const fields=[
 [t('country'),countryName(r.country)],[t('exitIP'),r.exit_ip||'—'],[t('tcp'),ms(r.tcp_ms)],[t('https'),ms(r.latency_ms)],
 [t('ttfb'),ms(r.ttfb_ms)],[t('jitter'),r.jitter_ms==null?t('insufficient'):ms(r.jitter_ms)],[t('samples'),`${r.successes}/${r.attempts}`],
 [t('speed'),r.speed_mbps==null?(r.speed_error?errorText(r.speed_error):t('untested')):num(r.speed_mbps,2)+' Mbps']
 ];
 modal(`<h2>${e(t('details'))}</h2><code>${e(r.url)}</code><div class="detail-grid">${fields.map(([a,b])=>`<div><small>${e(a)}</small><strong>${e(b)}</strong></div>`).join('')}</div>${r.same_exit?`<div class="notice danger">${e(t('sameExit'))}</div>`:''}${r.exit_changed?`<p>${e(t('rotated'))}</p>`:''}<p>${e(t('geoNote'))}</p><p>${e(t('measuredAt'))}: ${e(new Date(r.checked_at*1000).toLocaleString(lang==='fa'?'fa-IR':'en-US'))}</p><div class="modal-actions"><button id="detail-copy" class="button">${icon('copy')}${e(t('copyURL'))}</button><button id="detail-speed" class="button primary">${icon('speed')}${e(t('speedTest'))}</button></div><p>${e(t('useNote'))}</p>`);
 $('#detail-copy').onclick=()=>copy(r.url);$('#detail-speed').disabled=!online||busy()||r.status!=='alive'||!state.results.some(x=>x.id===id);
 $('#detail-speed').onclick=()=>showBenchmark(id);
}
function showBenchmark(id){
 modal(`<h2>${e(t('benchmarkTitle'))}</h2><p>${e(t('benchmarkCopy'))}</p><div class="modal-actions"><button class="button" id="cancel-benchmark">${e(t('cancel'))}</button><button class="button primary" id="confirm-benchmark">${e(t('startBenchmark'))}</button></div>`);
 $('#cancel-benchmark').onclick=()=>$('#modal').close();
 $('#confirm-benchmark').onclick=async()=>{
  if(busy()||!online)return;$('#confirm-benchmark').disabled=true;submitting=true;buttons();
  try{await api('/api/benchmark',{id,consent:true});$('#modal').close();state=await api('/api/state');signature=`${state.run_id}:${state.revision}`;render();}
  catch{toast(t('requestFailed'));}
  finally{submitting=false;buttons();}
 };
}
function showExport(input,historical=false){
 const rows=input.filter(r=>r.status==='alive');if(!rows.length){toast(t('noResults'));return;}
 modal(`<h2>${e(t('exportTitle'))}</h2><p>${e(t(historical?'exportHistorical':'exportCopy'))}</p><code>${rows.length} ROUTES</code><div class="modal-actions">${['txt','csv','json'].map(f=>`<button class="button" data-format="${f}">${f.toUpperCase()} ↗</button>`).join('')}</div>`);
 $$('[data-format]').forEach(b=>b.onclick=()=>{
  const f=b.dataset.format;let text,mime;
  if(f==='txt'){text=rows.map(r=>r.url).join('\n')+'\n';mime='text/plain';}
  else if(f==='json'){text=JSON.stringify({application:'ProxyFlow',exported_at:new Date().toISOString(),historical,results:rows},null,2);mime='application/json';}
  else{
   const keys=['protocol','host','port','country','exit_ip','tcp_ms','latency_ms','ttfb_ms','jitter_ms','successes','attempts','score','speed_mbps','checked_at','source'];
   const cell=v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
   text='\uFEFF'+[keys.join(','),...rows.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\r\n');mime='text/csv';
  }
  const url=URL.createObjectURL(new Blob([text],{type:mime+';charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`proxyflow-${new Date().toISOString().slice(0,10)}.${f}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);$('#modal').close();
 });
}
function showHelp(){
 modal(`<h2>${e(t('helpTitle'))}</h2>${[['helpMetrics','helpMetricsCopy'],['helpScore','helpScoreCopy'],['helpPrivacy','helpPrivacyCopy'],['helpLimits','helpLimitsCopy'],['safetyTitle','safety']].map(([a,b])=>`<section class="help-section"><h3>${e(t(a))}</h3><p>${e(t(b))}</p></section>`).join('')}<p>${e(t('useNote'))}</p>`);
}
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.dataset.view)go(b.dataset.view);
 if(b.dataset.mode){settings={...settings,...presets[b.dataset.mode]};store('proxyflow.settings',settings);fillSettings();}
 if(b.dataset.save)saveRoute(b.dataset.save);
 if(b.dataset.copy){const r=rowById(b.dataset.copy);if(r)copy(r.endpoint);}
 if(b.dataset.details)showDetails(b.dataset.details);
 if(b.classList.contains('scan'))scan();
 if(b.classList.contains('help'))showHelp();
});
$('.brand').onclick=event=>{event.preventDefault();go('overview');};
$('#source-grid').onchange=event=>{const el=event.target;if(!el.dataset.source)return;settings.sources=el.checked?[...new Set([...settings.sources,el.dataset.source])]:settings.sources.filter(x=>x!==el.dataset.source);store('proxyflow.settings',settings);};
$('#settings-form').onsubmit=event=>{event.preventDefault();const f=new FormData(event.target),ps=f.getAll('protocols');if(!ps.length){toast(t('selectProtocol'));return;}settings=cleanSettings({...settings,...Object.fromEntries(Object.keys(presets.balanced).map(k=>[k,Number(f.get(k))])),protocols:ps});store('proxyflow.settings',settings);fillSettings();toast(t('savedOK'));};
$('#language').onclick=()=>{lang=lang==='fa'?'en':'fa';store('proxyflow.language',lang);setLanguage();};
$('#theme').onclick=()=>{theme=theme==='dark'?'light':'dark';store('proxyflow.theme',theme);document.documentElement.dataset.theme=theme;};
$('#import').onclick=showImport;$('#guide').onclick=showHelp;
$('#export').onclick=()=>showExport(filtered());$('#export-saved').onclick=()=>showExport([...saved.values()],true);
$('#test-saved').onclick=()=>{if(saved.size)scan({text:[...saved.values()].map(r=>r.url).join('\n'),sources:[],limit:saved.size,protocols});};
$('#retest').onclick=()=>{const rows=state.results.filter(r=>r.status==='alive');if(rows.length)scan({text:rows.map(r=>r.url).join('\n'),sources:[],limit:Math.min(rows.length,3000),protocols});};
$('#stop').onclick=async()=>{try{await api('/api/stop',{});}catch{toast(t('requestFailed'));}};
$('#close-modal').onclick=()=>$('#modal').close();
$('#modal').addEventListener('click',event=>{if(event.target!==$('#modal'))return;const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();});
for(const id of ['search','country','protocol','status','sort','max-latency'])$('#'+id).addEventListener(['search','max-latency'].includes(id)?'input':'change',()=>{page=1;renderRows();});
$('#prev').onclick=()=>{page--;renderRows();};$('#next').onclick=()=>{page++;renderRows();};
document.documentElement.dataset.theme=theme;fillSettings();setLanguage();
if(location.protocol!=='file:')poll();

/* Original illustrative globe. Dots and arcs do not represent measured proxies. */
(function globe(){
 const canvas=$('#globe'),ctx=canvas.getContext('2d');if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const land=[
 [[-168,70],[-140,71],[-125,60],[-109,58],[-94,68],[-58,53],[-65,44],[-81,26],[-92,18],[-103,22],[-120,42],[-140,58]],
 [[-81,12],[-70,9],[-50,1],[-35,-8],[-49,-26],[-58,-39],[-69,-55],[-76,-25],[-82,-2]],
 [[-16,35],[3,37],[18,32],[34,31],[51,12],[43,-12],[32,-33],[17,-35],[10,-4],[-9,6],[-17,15]],
 [[-11,36],[-9,44],[1,50],[-5,58],[10,58],[18,71],[34,70],[30,50],[43,41],[25,36],[11,43]],
 [[30,70],[63,74],[103,77],[144,68],[178,61],[161,50],[140,48],[125,36],[120,23],[107,5],[98,14],[78,7],[66,27],[50,26],[43,43],[30,52]],
 [[113,-11],[134,-12],[154,-23],[148,-38],[129,-34],[114,-25]],
 [[-53,60],[-41,61],[-20,76],[-30,82],[-60,81],[-70,71]],[[47,-13],[51,-17],[48,-27],[44,-23]],
 [[129,32],[142,45],[146,43],[138,34]],[[96,4],[112,-2],[120,-8],[106,-7]]
 ];
 function inside(x,y,p){let yes=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [xi,yi]=p[i],[xj,yj]=p[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)yes=!yes;}return yes;}
 const dots=[];for(let lat=-58;lat<81;lat+=3.3)for(let lon=-179;lon<180;lon+=3.3)if(land.some(p=>inside(lon,lat,p)))dots.push([lon,lat]);
 let width=0,height=0,last=0;
 function draw(now){
  if(!width||!height)return;
  const light=theme==='light',x0=width*.5,y0=height*.5,R=Math.min(width,height)*.365,angle=(reduced.matches?0:now*.000025)+.65;
  const project=(lon,lat)=>{const a=lon*Math.PI/180+angle,b=lat*Math.PI/180;return [x0+Math.cos(b)*Math.sin(a)*R,y0-Math.sin(b)*R,Math.cos(b)*Math.cos(a)];};
  ctx.clearRect(0,0,width,height);
  const glow=ctx.createRadialGradient(x0,y0,R*.4,x0,y0,R*1.6);glow.addColorStop(0,light?'#7fac3026':'#9ed64c19');glow.addColorStop(1,'#9ed64c00');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  ctx.strokeStyle=light?'#60883235':'#bedc721b';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(x0,y0,R*1.4,R*.44,-.42,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.arc(x0,y0,R*1.15,0,Math.PI*2);ctx.setLineDash([1,7]);ctx.stroke();ctx.setLineDash([]);
  const fill=ctx.createRadialGradient(x0-R*.4,y0-R*.4,2,x0,y0,R);fill.addColorStop(0,light?'#dceaca':'#25321d');fill.addColorStop(1,light?'#c7d7bc':'#0c1410');ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x0,y0,R,0,Math.PI*2);ctx.fill();
  function curve(coords){ctx.beginPath();let pen=false;for(const [a,b]of coords){const [x,y,z]=project(a,b);if(z<0){pen=false;continue;}if(pen)ctx.lineTo(x,y);else{ctx.moveTo(x,y);pen=true;}}ctx.stroke();}
  ctx.strokeStyle=light?'#537b362c':'#b0cd6717';ctx.lineWidth=.6;
  for(let lat=-60;lat<=60;lat+=30)curve(Array.from({length:121},(_,i)=>[-180+i*3,lat]));
  for(let lon=-180;lon<180;lon+=30)curve(Array.from({length:61},(_,i)=>[lon,-90+i*3]));
  for(const [lon,lat]of dots){const [x,y,z]=project(lon,lat);if(z<.015)continue;ctx.fillStyle=light?`rgba(62,103,25,${.2+z*.65})`:`rgba(197,224,116,${.12+z*.72})`;ctx.beginPath();ctx.arc(x,y,.68+z*.5,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle=light?'#5b873749':'#bdd87840';ctx.beginPath();ctx.arc(x0,y0,R,0,Math.PI*2);ctx.stroke();
  for(const [lon,lat]of [[8,49],[35,39],[78,23],[-74,41],[105,12]]){const [x,y,z]=project(lon,lat);if(z<.1)continue;ctx.fillStyle=light?'#547a21':'#e3ffa5';ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.stroke();}
  for(let i=0;i<28;i++){const x=((Math.sin(i*42.12)*14293)%1+1)%1*width,y=((Math.sin(i*18.76)*1324)%1+1)%1*height;ctx.fillStyle=light?'#66825635':'#d0e58b35';ctx.fillRect(x,y,i%4===0?1.3:.8,i%4===0?1.3:.8);}
 }
 function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5);width=r.width;height=r.height;canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);draw(0);}
 function frame(now){if(!document.hidden&&currentView==='overview'&&now-last>33){draw(now);last=now;}requestAnimationFrame(frame);}
 new ResizeObserver(resize).observe(canvas);resize();if(!reduced.matches)requestAnimationFrame(frame);
 $('#theme').addEventListener('click',()=>draw(0));
})();
