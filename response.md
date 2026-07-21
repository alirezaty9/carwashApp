<div dir="rtl" align="right">

# 🕐 اصلاحِ منطقِ ضدِ دستکاریِ ساعت + 🔤 فونتِ وزیر آفلاین

> دو کار: **(۱)** حفره‌ای که خودت پیدا کردی (عقب‌کشیدنِ ۷۰ روزه) بسته شد و منطقِ ساعت به روشِ درست («ساعتِ سقفی») بازنویسی شد. **(۲)** فونتِ وزیرمتن دانلود و **کنارِ پروژه** بسته‌بندی شد؛ حالا برنامه کاملاً آفلاین است و همه‌جا (حتی تیترها) وزیر است.

<br>

---

<br>

## بخش ۱ — 🕐 منطقِ ساعت: قبل، مشکل، و راه‌حل

### مشکلِ نسخه‌ی قبلی (که تو درست دیدی)

منطقِ قبلی یک «آستانه‌ی ۶۰ روز» داشت: پرشِ عقبِ کوچک را قفل می‌کرد، ولی پرشِ بزرگ را «خطای ساعت» فرض می‌کرد و **قفل نمی‌کرد**. این یعنی:

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">سناریو</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">رفتارِ قبلی (باگ‌دار)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۷۰ روز عقب</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔴 چون >۶۰ روز بود، «خطای ساعت» فرض و <b>قفل نمی‌شد</b> ← حفره</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۵ سال جلو</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">قفل می‌شد (منقضی)، ولی بعد از اصلاح خوددرمانی می‌کرد</td>
    </tr>
  </tbody>
</table>

<br>

### 💡 راه‌حلِ درست: «ساعتِ سقفی» (Monotonic Clock)

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>ایده:</b> ما «بیشترین زمانی که تا حالا دیده‌ایم» را ذخیره می‌کنیم (سقف). «زمانِ مؤثر» = بزرگ‌ترینِ (زمانِ فعلیِ ساعت، سقف). تریال/لایسنس همیشه با <b>زمانِ مؤثر</b> سنجیده می‌شود، نه با ساعتِ خام. 🌍 مثلِ کنتورِ کیلومترِ ماشین که فقط جلو می‌رود؛ هرچقدر هم دنده‌عقب بروی، عددش کم نمی‌شود.</div>

<br>

**حالا هر سه سناریو درست است:**

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">سناریو</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">نتیجه</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چرا</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۱ روز عقب</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✅ هیچ سودی ندارد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">زمانِ مؤثر = سقف؛ عقب‌رفتن نادیده گرفته می‌شود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۷۰ روز عقب</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✅ هیچ سودی ندارد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">باز هم زمانِ مؤثر = سقف؛ تریالِ منقضی، منقضی می‌ماند</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۵ سال جلو</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔒 قفل می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">زمانِ مؤثر جلو می‌پرد → تریال/لایسنس منقضی</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۵ سال جلو، بعد اصلاح</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✅ باز می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فاصله >۱۸۰ روز = خطای واضحِ ساعت → سقف بازتنظیم می‌شود</td>
    </tr>
  </tbody>
</table>

<br>

```js
const HEAL_THRESHOLD = 180 * DAY_MS;
let lastSeen = Number(store.get(KEYS.lastSeen) || 0);
if (lastSeen > 0 && lastSeen - now > HEAL_THRESHOLD) lastSeen = now; // خطای بزرگ → بازتنظیم
const effectiveNow = Math.max(now, lastSeen);   // زمانِ مؤثر هیچ‌وقت عقب نمی‌رود
store.set(KEYS.lastSeen, effectiveNow);
// از این‌جا به بعد همه‌ی مقایسه‌های انقضا با effectiveNow است، نه now
```

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ <b>چرا آستانه‌ی ۱۸۰ روز، حفره‌ی قبلی را باز نمی‌کند؟</b> چون در روشِ جدید، عقب‌کشیدن (هر مقداری) <b>ذاتاً بی‌فایده</b> است — زمانِ مؤثر پایین نمی‌آید. آستانه‌ی ۱۸۰ روز فقط برای «بازیابی از خطای بزرگِ ساعت» است، نه تصمیمِ قفل. و کسی که تریالِ ۷روزه را می‌خواهد تمدید کند، باید بیش از ۱۸۰ روز عقب برود که آن‌وقت هم تریالش سال‌ها پیش منقضی شده و اصلاحِ سقف کمکی نمی‌کند.</div>

<br>

---

<br>

## بخش ۲ — 🔤 فونتِ وزیر (آفلاینِ کامل)

### چه کردم (شفاف)

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ ۵ وزنِ فونتِ <b>وزیرمتن</b> را از مخزنِ رسمی دانلود کردم و در <code>src/assets/fonts/</code> گذاشتم (هرکدام ~۵۰KB، مجموعاً ~۲۵۰KB): Regular(۴۰۰)، Medium(۵۰۰)، SemiBold(۶۰۰)، Bold(۷۰۰)، Black(۹۰۰). دانلود چند بار به‌خاطرِ کندیِ پراکسی قطع شد؛ با retry و در پس‌زمینه کامل شد و سلامتِ هر فایل با امضای <code>wOF2</code> تأیید شد.</div>

<br>

### قبل و بعد

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">مورد</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">قبل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">بعد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">منبعِ فونت</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔴 Google Fonts (نیازِ اینترنت)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 فایلِ محلیِ کنارِ پروژه</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">فونتِ تیترها</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">لاله‌زار</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">وزیرمتنِ سنگین (طبق خواسته‌ات «همیشه وزیر»)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">اپِ بدونِ اینترنت</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔴 تیترها فونتِ پیش‌فرضِ زشت</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 وزیر، تیز و درست</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>woff2 چیست؟</b> فرمتِ فشرده‌ی فونت برای وب (Web Open Font Format 2). 💻 سبک و سریع است و همه‌ی مرورگرها/Electron آن را می‌فهمند. <b>@font-face</b> هم قاعده‌ای در CSS است که می‌گوید «این فایلِ فونت را با این نام و این وزن بشناس».</div>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>چرا در <code>src/assets/fonts</code> نه پوشه‌ی public؟</b> چون Vite هنگام بیلد، فایل‌های داخلِ src را «پردازش» می‌کند و آدرسِ آن‌ها را <b>نسبی</b> می‌سازد. این برای Electron که فایل‌ها را از دیسک (<code>file://</code>) می‌خواند حیاتی است؛ آدرسِ مطلق (<code>/fonts/…</code>) در حالتِ نصب‌شده می‌شکند.</div>

<br>

### تغییراتِ CSS (در `src/index.css`)

- حذفِ خطِ `@import` از Google Fonts.
- افزودنِ ۵ قاعده‌ی `@font-face` با آدرسِ نسبی به فایل‌های محلی.
- تغییرِ `--font-display` از `Lalezar` به `Vazirmatn`.
- افزودنِ `.font-display { font-weight: 800 }` تا تیترها بعد از حذفِ لاله‌زار همچنان سنگین و «تیتروار» بمانند (۸۰۰ به نزدیک‌ترین فایل یعنی Black نگاشت می‌شود).

<br>

---

<br>

## بخش ۳ — 📦 خلاصه‌ی فایل‌های تغییرکرده

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">فایل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه شد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>electron/license.cjs</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">بازنویسیِ منطقِ ساعت به «ساعتِ سقفی» (effectiveNow)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/assets/fonts/*.woff2</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🆕 ۵ فایلِ فونتِ وزیرمتن</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/index.css</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فونتِ محلی + حذفِ Google Fonts + وزیر برای تیترها</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## بخش ۴ — 🧪 چطور تست کنی

- `npm run dev` بزن؛ برنامه باید حتی بدونِ اینترنت با فونتِ وزیرِ تیز بالا بیاید (اینترنت را قطع کن و امتحان کن).
- برای تستِ ساعت: در `electron/license.cjs` موقتاً `TRIAL_DAYS` را کم کن، برنامه را باز کن، بعد ساعتِ ویندوز را عقب بکش و دوباره باز کن → باید همچنان قفل بماند (سودی از عقب‌کشیدن نمی‌برد).

<br>

---

<br>

## بخش ۵ — 📌 قدمِ بعدی

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ حالا برنامه واقعاً «آفلاینِ کامل» است. موردهای باقی‌مانده همه اختیاری‌اند: آیکونِ <code>.exe</code>، سخت‌سازیِ رجیستری، گواهیِ امضای کد، و فاز ۵ (داشبوردِ آنلاین). بگو کدام را می‌خواهی، یا اگر پرینترِ واقعی داری چاپِ مستقیم را با هم تست و میزان کنیم.</div>

<br>

---

<br>

```bash
git add -A && git commit -m "fix: use monotonic clock for license and bundle Vazirmatn fonts offline"
```

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>چرا <code>fix</code>؟</b> بخشِ اصلیِ این تغییر <b>رفعِ یک باگِ امنیتیِ واقعی</b> است (حفره‌ی عقب‌کشیدنِ ساعت)، پس <code>fix</code> درست است نه <code>feat</code> (چون قابلیتِ کاربردیِ جدیدی به کاربر اضافه نشد). بسته‌بندیِ فونت هم بخشی از همین «درست‌کردنِ رفتارِ آفلاین» است. اگر فقط فونت بود، <code>chore(assets)</code> یا <code>style</code> مناسب‌تر بود؛ ولی چون باگِ ساعت وزنِ بیشتری دارد، <code>fix</code> را برای کلِ کامیت انتخاب کردم.</div>

</div>
