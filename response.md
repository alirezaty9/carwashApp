<div dir="rtl" align="right">

# 🔴 فاز ۴ انجام شد — سیستمِ لایسنسِ آفلاین

> سیستمِ کاملِ لایسنس ساخته شد: **تریالِ ۷روزه‌ی خودکار برای همه**، و **لایسنسِ سالانه با فایلِ امضاشده**. کلِ منطق آفلاین است و در پروسه‌ی Main اجرا می‌شود. وقتی دوره تمام شود، برنامه قفل می‌شود و صفحه‌ی فعال‌سازی نشان داده می‌شود.

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ <b>دو نکته که همین حالا بدان:</b><br>
۱) <b>تریال</b> بدونِ هیچ کاری کار می‌کند (خودکار در اولین اجرا).<br>
۲) <b>لایسنسِ سالانه</b> تا وقتی یاتاش یک‌بار «جفت‌کلید» نسازد و کلیدِ عمومی را در کد نگذارد، تأیید نمی‌شود. چون در محیطِ من Node نبود، این کلید هنوز placeholder است — روشِ ساختش در بخشِ ۵ آمده.</div>

<br>

---

<br>

## ۱) 🧠 مفهومِ پایه — چطور بدونِ اینترنت جلوی جعل گرفته می‌شود؟

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>امضای دیجیتال (Ed25519):</b> 🌍 مثلِ <b>مُهرِ مخصوصِ یک اداره</b> — اداره یک مُهرِ یکتا دارد که کسی نمی‌تواند بسازد، ولی همه می‌توانند ببینند مُهر واقعی است. 💻 یاتاش یک <b>کلیدِ خصوصی</b> دارد (فقط پیشِ خودش) که با آن فایلِ لایسنس را «امضا» می‌کند؛ داخلِ برنامه یک <b>کلیدِ عمومی</b> هست که فقط می‌تواند امضا را <b>بررسی</b> کند، نه بسازد. پس کارواش نمی‌تواند لایسنسِ تقلبی درست کند.</div>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>Ed25519 چیست؟</b> یک الگوریتمِ مدرنِ امضای دیجیتال — سریع، امن و کوتاه. 💻 در پروژه با ماژولِ داخلیِ Node به‌نامِ <code>crypto</code> پیاده شد، بدونِ هیچ کتابخانه‌ی اضافه.</div>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>machineId (اثرِ انگشتِ دستگاه):</b> 🌍 مثلِ کدِ ملیِ کامپیوتر. 💻 از ترکیبِ نامِ دستگاه + MAC کارتِ شبکه + سیستم‌عامل یک رشته می‌سازیم و <b>hash</b> می‌کنیم (SHA-256). فایلِ لایسنس به همین کد گره می‌خورد، پس کپی‌کردنِ فایل روی دستگاهِ دیگر بی‌فایده است.</div>

<br>

---

<br>

## ۲) 🔄 جریانِ کار (سناریوی واقعی)

```text
کارواش برنامه را نصب می‌کند
        │
        ▼
  ۷ روز تریالِ خودکار  ──(تمام شد)──►  برنامه قفل می‌شود
        │                                     │
        │                              کدِ دستگاه را می‌بیند و برای یاتاش می‌فرستد
        │                                     │
        │                              یاتاش با ابزارش فایلِ license.dat می‌سازد
        │                                     │
        ▼                                     ▼
  در هر لحظه می‌تواند              کارواش فایل را در برنامه import می‌کند
  «فعال‌سازی» بزند  ◄─────────────────────────┘
        │
        ▼
  ۱ سالِ کامل باز — با نزدیک‌شدنِ انقضا هشدار
```

<br>

**بررسیِ لایسنس هنگامِ هر بار باز شدن:**

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">وضعیت</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">یعنی چه</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">رفتارِ برنامه</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>trial</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">در بازه‌ی ۷ روزه</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">باز + بنرِ «X روز باقی مانده»</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>licensed</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">لایسنسِ سالانه‌ی معتبر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کاملاً باز</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>expired</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">تریال یا لایسنس تمام شده</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔒 قفل + صفحه‌ی فعال‌سازی</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>invalid</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">امضا/دستگاه/ساعت مشکل دارد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔒 قفل + پیامِ علت</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۳) 🛡️ دفاع در برابر دو حقه‌ی رایج

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">حقه</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">دفاعِ ما</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">ساعتِ ویندوز را عقب می‌کشد تا انقضا نرسد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">«آخرین زمانِ دیده‌شده» ذخیره می‌شود؛ اگر ساعت بیش از یک روز عقب رفت → قفل (وضعیتِ <code>clock</code>)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">فایلِ لایسنس را برای دستگاهِ دیگر کپی می‌کند</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">لایسنس به <code>machineId</code> گره خورده؛ روی دستگاهِ دیگر <code>invalid</code></td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ <b>صداقتِ امنیتی:</b> هیچ قفلِ آفلاینی نفوذناپذیر نیست؛ یک متخصص می‌تواند فایلِ برنامه را دستکاری کند. 🌍 هدف «قفلِ درِ خانه» است نه «گاوصندوقِ بانک» — جلوی کپیِ سرسری و کاربرِ عادی را می‌گیرد که برای این بازار کافی است. کنترلِ محکم‌ترِ آنلاین در فاز ۵ می‌آید. یک سخت‌سازیِ اختیاری هم باقی است: نوشتنِ تاریخِ اولین اجرا در <b>رجیستریِ ویندوز</b> (علاوه بر فایل) تا ریستِ تریال با حذفِ برنامه سخت‌تر شود.</div>

<br>

---

<br>

## ۴) 📦 تک‌تکِ تغییرات (فایل به فایل)

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">فایل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">نوع</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه شد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>electron/license.cjs</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🆕 جدید</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مغزِ لایسنس: machineId، بررسیِ امضا، محاسبه‌ی وضعیت (تریال/سالانه)، import</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>tools/license-gen.cjs</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🆕 جدید</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">ابزارِ خط‌فرمانِ یاتاش: <code>keygen</code> (ساختِ کلید) و <code>issue</code> (صدورِ لایسنس)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/license/useLicense.ts</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🆕 جدید</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">هوکِ React برای گرفتنِ وضعیت و فعال‌سازی</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/license/LicenseGate.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🆕 جدید</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">صفحه‌ی قفل، کارتِ فعال‌سازی (کد دستگاه + بارگذاریِ فایل)، بنرِ تریال</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>electron/main.cjs</code> و <code>preload.cjs</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✏️ تغییر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">ثبتِ کانال‌های IPC لایسنس و افشای امنِ <code>window.license</code></td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/App.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✏️ تغییر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">پیچیدنِ کلِ برنامه در <code>&lt;LicenseGate&gt;</code></td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>.gitignore</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✏️ تغییر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>*.pem</code> و <code>license.dat</code> نادیده گرفته شد تا کلیدِ خصوصی هرگز commit نشود</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ <b>امنیتِ کلید رعایت شد:</b> کلیدِ خصوصی هرگز داخلِ برنامه یا گیت نمی‌رود؛ فقط با <code>keygen</code> روی سیستمِ یاتاش ساخته و همان‌جا می‌ماند (و در <code>.gitignore</code> است).</div>

<br>

---

<br>

## ۵) 🧑‍🏫 راه‌اندازیِ یک‌باره‌ی یاتاش (قدم‌به‌قدم)

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ این کارها را <b>تو (یاتاش)</b> یک‌بار روی سیستمِ خودت انجام می‌دهی.</div>

<br>

**گام ۱ — ساختِ جفت‌کلید (فقط یک‌بار در عمر):**
```bash
node tools/license-gen.cjs keygen
```
> خروجی: فایلِ <code>yatash-private.pem</code> (خصوصی — امن نگه دار) ساخته می‌شود و یک بلوکِ «کلیدِ عمومی» چاپ می‌شود.

<br>

**گام ۲ — گذاشتنِ کلیدِ عمومی در برنامه:**  
آن بلوکِ چاپ‌شده را کپی کن و در `electron/license.cjs` جای این خط بگذار:
```js
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
REPLACE_WITH_YATASH_PUBLIC_KEY      // ← این را با کلیدِ واقعی جایگزین کن
-----END PUBLIC KEY-----`;
```
> بعد از این، برنامه را دوباره بیلد کن (<code>npm run electron:build</code>) تا کلید داخلِ نصب‌کننده برود.

<br>

**گام ۳ — صدورِ لایسنس برای یک مشتری** (هر بار که فروش داری):
```bash
node tools/license-gen.cjs issue --machine <کدِ دستگاهِ مشتری> --customer "کارواش نمونه" --type annual --days 365 --out license.dat
```
> کارواش «کدِ دستگاه» را از صفحه‌ی قفلِ برنامه‌اش برایت می‌فرستد. تو فایلِ <code>license.dat</code> را می‌سازی و برایش می‌فرستی؛ او در برنامه «انتخاب و فعال‌سازی» را می‌زند.

<br>

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">اگر مشتری این خطا را دید</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">علت / راه‌حل</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">«امضای لایسنس معتبر نیست»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کلیدِ عمومی در برنامه ست نشده، یا فایل دستکاری شده</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">«برای دستگاهِ دیگری صادر شده»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کدِ دستگاهِ اشتباه؛ کدِ درست را از همان دستگاه بگیر</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">«ساعتِ سیستم دستکاری شده»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">ساعت/تاریخِ ویندوز را درست کن</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۶) 🧪 چطور خودت تست کنی

- **تریال:** همین حالا با <code>npm run dev</code> برنامه باز می‌شود و بنرِ «۷ روز باقی مانده» را می‌بینی.
- **قفل‌شدن:** برای تستِ سریع، در <code>electron/license.cjs</code> مقدارِ <code>TRIAL_DAYS</code> را موقتاً <code>0</code> بگذار → دفعه‌ی بعد صفحه‌ی قفل می‌آید.
- **فعال‌سازیِ سالانه:** بعد از انجامِ گام‌های ۱ و ۲، کدِ دستگاهِ خودت را بردار، با گام ۳ یک <code>license.dat</code> بساز و import کن → باید <code>licensed</code> شوی.

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ در مرورگر (اگر جایی باز کردی) لایسنس بررسی نمی‌شود و برنامه باز است؛ چون سیستمِ لایسنس فقط داخلِ Electron معنا دارد. تو که فقط با <code>npm run dev</code> کار می‌کنی، همیشه در Electron هستی.</div>

<br>

---

<br>

## ۷) 📌 قدمِ بعدی

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ چهار فازِ اصلی تمام شد (فروش لوازم، برند، Electron، لایسنس). گزینه‌های بعدی: <b>(الف)</b> فاز ۵ — داشبوردِ آنلاینِ فروشِ یاتاش (صدورِ خودکارِ لایسنس با یک کلیک)، <b>(ب)</b> بسته‌بندیِ فونت‌ها برای آفلاینِ کامل، <b>(ج)</b> سخت‌سازیِ لایسنس (رجیستری) یا افزودنِ گواهیِ امضای کد. کدام را می‌خواهی؟</div>

<br>

---

<br>

```bash
git add -A && git commit -m "feat: add offline license system (7-day trial, signed annual license, machine binding)"
```

</div>
