<div dir="rtl" align="right">

# 🔒 جلوگیری از ریست‌کردنِ تریالِ ۷روزه با حذف و نصبِ دوباره

<br>

سؤالِ خیلی خوبی بود — و بله، این یک **ضعفِ واقعی** بود که الان رفعش کردم. مشتری دیگر نمی‌تواند با حذف/نصبِ دوباره‌ی اپ، ۷ روزِ تریال را از نو بگیرد.

<br>

---

<br>

## ۱) 🧭 چرا این ضعف وجود داشت؟

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">
ℹ️ <b>تریال چطور کار می‌کرد؟</b> اپ زمانِ «اولین اجرا» را ذخیره می‌کند و هر بار چک می‌کند «آیا کمتر از ۷ روز از آن گذشته؟». مشکل: این زمان فقط در یک فایل داخلِ <b>پوشه‌ی دیتای اپ</b> ذخیره می‌شد.
</div>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">
ℹ️ <b>«پوشه‌ی دیتای اپ» کجاست؟</b> در ویندوز مسیرِ <code>C:\Users\&lt;نام&gt;\AppData\Roaming\Yatash Carwash</code> است. کتابخانه‌ی <code>electron-store</code> داده را آن‌جا در یک فایلِ JSON نگه می‌دارد. بدیِ ماجرا: اگر کاربر اپ را حذف کند یا این پوشه را پاک کند، آن فایل — و زمانِ اولین‌اجرا — <b>می‌رود</b> و تریال از صفر شروع می‌شود.
</div>

<br>

**مثالِ واقعی:** مشتری ۷ روز رایگان کار می‌کند → اپ منقضی می‌شود → اپ را حذف و دوباره نصب می‌کند → چون فایلِ زمان رفته، اپ فکر می‌کند «این تازه‌واردِ اولین‌بار است» و باز ۷ روز می‌دهد. حلقه‌ی بی‌پایانِ رایگان.

<br>

---

<br>

## ۲) ✅ راه‌حل: «لنگرِ تریال» (Trial Anchor)

ایده ساده است: زمانِ اولین‌اجرا را **فقط** در پوشه‌ی دیتای اپ نگه ندار؛ در **چند جای پایدارِ دیگرِ سیستم** هم بنویس که با حذفِ اپ **پاک نمی‌شوند**. موقعِ خواندن، **قدیمی‌ترین** زمانِ ثبت‌شده را از بینِ همه بگیر.

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">
ℹ️ <b>ProgramData چیست؟</b> پوشه‌ای در ویندوز (<code>C:\ProgramData</code>) که مخصوصِ داده‌های <b>مشترکِ همه‌ی کاربرانِ دستگاه</b> است و — برخلافِ پوشه‌ی دیتای اپ — با حذفِ معمولیِ برنامه پاک نمی‌شود. در لینوکس معادلش را در <code>~/.config</code> گذاشتم.
</div>

<br>

**دو لنگری که اپ می‌نویسد:**

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">سیستم‌عامل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">لنگرِ ۱ (ماشین‌محور)</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">لنگرِ ۲ (خانه)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">ویندوز</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>C:\ProgramData\Yatash\.ytc</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>C:\Users\&lt;نام&gt;\.yatash-ytc</code></td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">لینوکس</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>~/.config/Yatash/.ytc</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>~/.yatash-ytc</code></td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">
✅ <b>خوددرمانی (Self-healing):</b> اگر کاربر یکی از این‌ها را هم پیدا و پاک کند، بقیه سالم می‌مانند و اپ در اجرای بعدی <b>از منبعِ سالم، پاک‌شده را دوباره می‌سازد</b>. یعنی باید هم‌زمان همه را پیدا و پاک کند تا موفق شود.
</div>

<br>

---

<br>

## ۳) 🔐 چطور جلوی دستکاریِ تاریخ را می‌گیرم؟

اگر فقط تاریخ را در یک فایل بنویسیم، کاربرِ زرنگ می‌تواند فایل را باز کند و تاریخ را عوض کند. برای همین هر لنگر را **امضا** می‌کنم.

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">
ℹ️ <b>HMAC چیست؟</b> یک «مُهرِ امنیتی» روی داده. با یک کلیدِ مخفیِ داخلِ اپ (+ شناسه‌ی دستگاه) از روی تاریخ یک رشته‌ی امضا می‌سازد. 🌍 <b>مثالِ روزمره:</b> مثلِ مُهرِ برجسته‌ی روی سند رسمی — اگر کسی متن را عوض کند، مُهر دیگر نمی‌خواند و تقلب لو می‌رود. 💻 اینجا: اگر کاربر تاریخِ داخلِ فایل را دست بزند، امضا نمی‌خواند و اپ آن لنگر را <b>نادیده</b> می‌گیرد.
</div>

<br>

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">
⚠️ <b>صادقانه بگویم — این ۱۰۰٪ نفوذناپذیر نیست:</b> چون اپ آفلاین است، کلیدِ مخفی هم داخلِ خودِ برنامه است. کاربرِ خیلی حرفه‌ای که هم برنامه را باز کند و هم هر دو لنگر را پیدا و پاک کند، باز هم می‌تواند ریست کند. <b>تنها راهِ صددرصدی، «فعال‌سازیِ آنلاین» است</b> (اپ موقعِ اجرا از سرورِ تو بپرسد) — که با ماهیتِ آفلاینِ فعلی نمی‌خواند. ولی این راه‌حل، <b>۹۹٪ مشتری‌های عادی</b> را که فقط «حذف و نصبِ دوباره» بلدند، متوقف می‌کند.
</div>

<br>

---

<br>

## ۴) 🔧 تغییرات در کد (فایل: `electron/license.cjs`)

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">تابع</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کارش</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>anchorPaths()</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مسیرهای پایدارِ لنگر را برای هر سیستم‌عامل برمی‌گرداند.</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>anchorSig()</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">امضای HMAC-SHA256 برای تشخیصِ دستکاری.</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>readAnchor()</code> / <code>writeAnchor()</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">خواندن/نوشتنِ یک فایلِ لنگرِ امضاشده (base64). فایلِ خراب/دستکاری‌شده نادیده گرفته می‌شود.</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>collectTrial()</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">از همه‌ی منابع (دیتای اپ + لنگرها) <b>قدیمی‌ترین</b> اولین‌اجرا و <b>تازه‌ترین</b> آخرین‌دیده‌شده را جمع می‌کند.</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>persistTrial()</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مقدارِ آشتی‌داده‌شده را در <b>همه‌ی</b> منابع می‌نویسد (خوددرمانی).</td>
    </tr>
  </tbody>
</table>

<br>

**قلبِ منطق در `computeStatus` — قبل و بعد:**

```js
// قبل: فقط از دیتای اپ می‌خواند → با حذفِ اپ ریست می‌شد
let firstRun = Number(store.get(KEYS.firstRun) || 0);
if (!firstRun) { firstRun = effectiveNow; store.set(KEYS.firstRun, firstRun); }

// بعد: از همه‌ی منابع «قدیمی‌ترین» را می‌گیرد و در همه می‌نویسد
let { firstRun, lastSeen } = collectTrial(store, machineId);   // دیتای اپ + لنگرها
const effectiveNow = Math.max(now, lastSeen);
if (!firstRun) firstRun = effectiveNow;                        // واقعاً اولین اجرا
persistTrial(store, machineId, firstRun, effectiveNow);        // در همه بنویس
```

<br>

**سناریوی واقعی حالا:**

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">اتفاق</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">نتیجه</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">اولین نصب</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">زمان در دیتای اپ + دو لنگر نوشته می‌شود. تریال شروع.</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">حذف + نصبِ دوباره</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">دیتای اپ خالی است، ولی لنگرها زمانِ اصلی را دارند → تریال <b>ادامه‌ی همان قبلی</b>، نه از صفر. ✅</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">پاک‌کردنِ یکی از لنگرها</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">از لنگرِ دیگر خوانده و پاک‌شده را می‌سازد. ✅</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">دستکاریِ تاریخِ فایل</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">امضا نمی‌خواند → نادیده گرفته می‌شود. ✅</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۵) 🧪 چطور خودت تست کنی؟

```bash
npm run dev
```
۱. اپ را باز کن؛ باید تریال شروع شود.
۲. اپ را ببند. حالا شبیه‌سازیِ «نصبِ دوباره»: پوشه‌ی دیتای اپ را پاک کن (مسیر بالا در بخش ۱).
۳. دوباره `npm run dev`. باید تریال **از همان‌جای قبل** ادامه دهد، نه از ۷ روزِ کامل.
۴. برای دیدنِ لنگرها: در ویندوز به `C:\ProgramData\Yatash\` برو (پوشه‌ی مخفی است؛ نمایشِ فایل‌های مخفی را روشن کن).

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">
⚠️ نکته‌ی مهمِ تست: چون لنگرها بعد از اجرای <b>همین نسخه‌ی جدید</b> ساخته می‌شوند، برای تستِ درست باید <b>یک بار پاکِ کامل</b> بکنی: هم پوشه‌ی دیتای اپ، هم <code>ProgramData\Yatash</code>، هم <code>.yatash-ytc</code> در پوشه‌ی خانه — بعد اجرای اول را «اولین‌بارِ واقعی» فرض کن.
</div>

<br>

---

<br>

## 🗂️ فایلِ تغییرکرده

- `electron/license.cjs` — افزودنِ سیستمِ «لنگرِ تریال» (۶ تابعِ کمکی + بازنویسیِ بخشِ تریال در `computeStatus`) و `require` برای `fs`/`path`.

<div style="background:#ffe3e3;border-right:4px solid #e03131;color:#7a1f1f;padding:8px 12px;border-radius:6px">
🔴 <b>یادآوریِ مهمِ لایسنس:</b> این تغییرات روی «شناسه‌ی دستگاه» اثری ندارند، ولی هنوز باید <b>درستیِ کلیدِ عمومیِ لایسنس</b> را قبل از تحویل تست کنی (بخش‌های قبلی). بدونِ آن، لایسنسِ سالانه‌ی مشتری‌ها رد می‌شود.
</div>

<br>

---

<br>

### 💾 دستورِ Git پیشنهادی

```bash
git add -A && git commit -m "feat(license): resist trial reset via signed persistent anchors outside app data"
```

**چرا `feat(license)`؟**
- `feat` چون یک **قابلیتِ جدید** به سیستمِ لایسنس اضافه شد (مقاومت در برابرِ ریستِ تریال) — نه رفعِ یک باگِ خرابیِ موجود، بلکه توانمندیِ تازه.
- `scope`ِ `license` می‌گوید این قابلیت در لایه‌ی لایسنس است.
- اگر فقط یک نشتِ موجود را می‌بستم `fix` می‌شد؛ ولی چون سازوکارِ کاملاً تازه‌ای (لنگرهای پایدارِ امضاشده) اضافه شد، `feat` دقیق‌تر است.

</div>
