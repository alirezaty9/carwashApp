<div dir="rtl" align="right">

# 🔐 راهنمای ساده و عملی لایسنس (فرض: نرم‌افزار روی Electron)

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ این گزارش قدم‌به‌قدم و با مثالِ واقعی توضیح می‌دهد: چی نصب کنی، چی تغییر بدی، توی مغازه چی از مشتری بگیری و چی بهش بدهی، و چقدرش خودکار است. هنوز کدی اضافه نشده؛ فقط نقشه است.</div>

<br>

---

<br>

## ۱) 🧩 اول ذهنیت درست: سه قطعه داریم

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">قطعه</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کجاست</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کارش</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🖥️ نرم‌افزار کارواش (Electron)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">روی کامپیوترِ مشتری</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">دمو را می‌شمارد، کلید را چک می‌کند، قفل/باز می‌کند</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🏭 ابزار ساختِ کلید (license-gen)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فقط روی لپ‌تاپِ خودت</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">وقتی مشتری خرید، کلیدِ لایسنس تولید می‌کند</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🗝️ جفت‌کلیدِ تو (عمومی + خصوصی)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">عمومی داخل اپ، خصوصی مخفی پیشِ تو</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">پایه‌ی امنیت؛ فقط تو می‌توانی کلیدِ معتبر بسازی</td>
    </tr>
  </tbody>
</table>

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ مثلِ قفلِ در: <b>کلیدِ خصوصی</b> = دستگاهِ کلیدسازِ توست (فقط دستِ تو). <b>کلیدِ عمومی</b> = خودِ قفل که روی درِ همه نصب است و فقط می‌تواند «تشخیص دهد» کلید اصل است یا نه، ولی نمی‌تواند کلید بسازد.</div>

<br>

---

<br>

## ۲) 💻 چی نصب کنم؟ (فقط یک‌بار، روی لپ‌تاپِ خودت)

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">چی</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">برای چی</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">دستور</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">Node.js</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">اجرای اپ و ابزارها (احتمالاً داری)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">از nodejs.org</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>electron</code> + <code>electron-builder</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">اجرا و ساختِ فایلِ نصبِ ویندوز (<code>Setup.exe</code>)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>npm i -D electron electron-builder</code></td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>tweetnacl</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">امضا و تأییدِ کلید (رمزنگاری)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>npm i tweetnacl</code></td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>node-machine-id</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">خواندنِ «کدِ یکتای دستگاهِ» مشتری</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>npm i node-machine-id</code></td>
    </tr>
  </tbody>
</table>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ مشتری هیچ‌کدام از این‌ها را نصب نمی‌کند. مشتری فقط یک فایلِ <code>Setup.exe</code> می‌گیرد و نصب می‌کند؛ همه‌چیز داخلش هست.</div>

<br>

---

<br>

## ۳) 🔨 چیا را در برنامه تغییر بدهم؟ (یک‌بار)

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">اضافه‌شونده</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کارش</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">کلیدِ عمومیِ تو (یک رشته)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">داخلِ کدِ اپ کارگذاشته می‌شود تا کلیدها را تأیید کند</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">ماژولِ لایسنس (چند فایلِ کوچک)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">شمارشِ دمو، تأییدِ کلید، تشخیصِ انقضا و دستکاریِ ساعت</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">صفحه‌ی قفل + نوارِ دمو</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">نمایشِ «۵ روز مانده» و بعدش صفحه‌ی «تماس بگیرید + کادرِ واردکردنِ کلید»</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">خواندنِ machineId در Electron</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">پروسهٔ اصلیِ Electron با <code>node-machine-id</code> کدِ دستگاه را می‌دهد به صفحه</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">فایلِ <code>license-gen.js</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">ابزارِ کلیدسازِ تو (این را داخلِ اپِ مشتری نمی‌گذاری)</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۴) 🗝️ جفت‌کلید — یک‌بار برای همیشه بساز

یک‌بار این را اجرا می‌کنی و دو رشته می‌گیری:

```bash
node make-keys.js
```

خروجیِ نمونه (اعداد واقعی طولانی‌ترند):

```text
PUBLIC KEY  :  Zk8Qw3n2...A1b   ← این را داخلِ اپ می‌گذاری (اشکالی ندارد لو برود)
PRIVATE KEY :  9xTr7Lm5... f0Z   ← این را فقط پیشِ خودت نگه‌دار (هرگز نده)
```

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ اگر کلیدِ خصوصی لو برود، هر کسی می‌تواند لایسنسِ جعلی بسازد. یک‌جای امن (مثلاً پسورد‌منیجر) نگه‌دار و در گیت commit نکن.</div>

<br>

---

<br>

## ۵) 🏪 سناریوی مغازه — دقیق، مرحله‌به‌مرحله

### مرحله ۱ — پرزنت و نصبِ دمو
به مشتری فایلِ `KarwashSetup.exe` را می‌دهی (فلش/واتساپ). نصب می‌کند و باز می‌کند.
- ✅ همان لحظه‌ی اول، تاریخ به‌صورتِ **خودکار** ثبت می‌شود و ۷ روز شروع به شمارش می‌کند.
- 🔵 بالای برنامه می‌نویسد: «نسخه‌ی آزمایشی — ۷ روز باقی مانده».
- **در این مرحله هیچ‌چیز از مشتری نمی‌گیری.** فقط بگذار کار کند و راضی شود.

<br>

### مرحله ۲ — پایانِ دمو (بعدِ ۷ روز، خودکار)
برنامه خودش قفل می‌شود و این صفحه را نشان می‌دهد:

```text
┌─────────────────────────────────────────────┐
│   دوره‌ی آزمایشی تمام شد.                     │
│   برای فعال‌سازی با ۰۹۱۲XXXXXXX تماس بگیرید.  │
│                                             │
│   کدِ دستگاهِ شما:  7F3A-9C21-B0E4-5D88       │
│                                             │
│   [ کلیدِ لایسنس را اینجا وارد کنید ______ ] │
└─────────────────────────────────────────────┘
```

<br>

### مرحله ۳ — مشتری خرید کرد → چی از او بگیری؟
<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ فقط یک چیز: <b>«کدِ دستگاه»</b> که در همان صفحه‌ی قفل نوشته (مثلاً <code>7F3A-9C21-B0E4-5D88</code>). مشتری آن را برایت می‌خواند یا عکسش را واتساپ می‌کند.</div>

<br>

### مرحله ۴ — چی به او بدهی؟ (کارِ تو، ۱۰ ثانیه)
روی لپ‌تاپِ خودت یک دستور می‌زنی:

```bash
node license-gen.js  --name "کارواش آفتاب"  --machine 7F3A-9C21-B0E4-5D88  --years 1
```

خروجی یک رشته‌ی کلید است:

```text
KEY:  eyJjIjoi2KfYqiIsIm0iOiI3RjNBLTlDMjEi... . k9Xf2Lm7Qw==
```

این رشته را برای مشتری می‌فرستی (واتساپ/پیامک).

<br>

### مرحله ۵ — مشتری فعال می‌کند (خودکار و آفلاین)
مشتری کلید را در همان کادر Paste می‌کند و دکمه‌ی «فعال‌سازی» را می‌زند.
- ✅ برنامه **بدونِ اینترنت** چک می‌کند: امضا درست است؟ کدِ دستگاه با این کامپیوتر یکی است؟ تاریخ نگذشته؟
- ✅ اگر همه اوکی بود، باز می‌شود و **۱ سال** دیگر مزاحم نمی‌شود.

<br>

### مرحله ۶ — بعدِ ۱ سال (خودکار)
تاریخِ داخلِ کلید تمام می‌شود → برنامه دوباره قفل می‌شود و همان صفحه‌ی «تماس بگیرید» را نشان می‌دهد.
- 🔵 برای **تمدید**: مشتری همان کدِ دستگاه را می‌فرستد، تو یک کلیدِ جدیدِ ۱‌ساله می‌سازی، تمام. (چند روز مانده به انقضا هم می‌توانی یادآوری نشان بدهی.)

<br>

---

<br>

## ۶) 🔁 خلاصه: چی می‌گیری / چی می‌دهی

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">مرحله</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">از مشتری می‌گیری</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">به مشتری می‌دهی</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">شروعِ دمو</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">— هیچی —</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فایلِ نصب <code>Setup.exe</code></td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">بعدِ خرید</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">«کدِ دستگاه» (یک رشته‌ی کوتاه)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">«کلیدِ لایسنس» (یک رشته‌ی بلند)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">تمدیدِ سالانه</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">همان کدِ دستگاه</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کلیدِ جدیدِ ۱‌ساله</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۷) 🤖 چقدر خودکار است؟

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">✅ کاملاً خودکار (برنامه خودش)</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">✋ دستی (تو، فقط چند ثانیه)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">ثبتِ تاریخِ اولین اجرا و شمارشِ ۷ روز</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">ساختِ کلید با یک دستور (بعدِ خرید)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">قفل‌شدن بعدِ اتمامِ دمو یا لایسنس</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فرستادنِ کلید برای مشتری</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">تأییدِ کلید + چکِ تاریخ + چکِ دستگاه + چکِ دستکاریِ ساعت</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">—</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">نشان‌دادنِ «X روز مانده» و یادآوریِ تمدید</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">—</td>
    </tr>
  </tbody>
</table>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ یعنی تنها کارِ دستیِ تو در کلِ عمرِ یک مشتری: <b>یک دستور برای ساختِ کلید و فرستادنش</b> — آن هم فقط سالی یک‌بار. بقیه خودکار است. اگر تعدادِ مشتری زیاد شد، بعداً می‌شود همین را با یک صفحه‌ی وبِ کوچک یا سرورِ آنلاین تمام‌خودکار کرد.</div>

<br>

---

<br>

## ۸) 🔬 مثالِ فنیِ دقیق (تا کاملاً واضح شود)

**«کدِ دستگاه» از کجا می‌آید؟** در Electron، پروسهٔ اصلی این را صدا می‌زند:

```js
const { machineIdSync } = require('node-machine-id');
machineIdSync();  // مثال: "b91f33cd7a0e45d8..."  (برای هر ویندوز یکتا و ثابت)
```
ما کوتاه و خوانا نشانش می‌دهیم: `7F3A-9C21-B0E4-5D88`.

<br>

**داخلِ «کلیدِ لایسنس» چه چیزی امضا می‌شود؟**

```text
payload = {
  customer : "کارواش آفتاب",
  machine  : "7F3A-9C21-B0E4-5D88",
  issued   : 2026-07-17,
  expires  : 2027-07-17     ← دقیقاً ۱ سال بعد
}
key = base64(payload) + "." + base64( امضای payload با کلیدِ خصوصیِ تو )
```

<br>

**برنامه هنگامِ فعال‌سازی این ۴ چک را می‌کند (مثال با تاریخ):**

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">چک</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">مثالِ درست</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">مثالِ رد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">امضا معتبر؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">با کلیدِ عمومی جور است ✅</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کلید را دستکاری کرده ❌ قفل</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">دستگاه یکی است؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>7F3A-...</code> = همین کامپیوتر ✅</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کلیدِ کامپیوترِ دیگر ❌ قفل</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">تاریخ نگذشته؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">امروز ۱۴۰۵/۰۴/۲۶ &lt; انقضا ۱۴۰۶/۰۴/۲۶ ✅</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">امروز بعدِ انقضا ❌ قفل</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">ساعت عقب نکشیده؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">امروز ≥ آخرین بارِ دیده‌شده ✅</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">ساعت را عقب برده ❌ قفل</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ اگر مشتری ویندوز را عوض/نصبِ مجدد کند، «کدِ دستگاه» عوض می‌شود و کلیدِ قبلی کار نمی‌کند. طبقِ سیاستِ خودت یک کلیدِ جدیدِ رایگان برایش می‌سازی (همان دستور با کدِ جدید).</div>

<br>

---

<br>

## ۹) 📌 جمع‌بندی و قدمِ بعدی

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ کلِ کارِ تو: یک‌بار جفت‌کلید بساز و در اپ بگذار → به هر مشتری <code>Setup.exe</code> بده → بعدِ خرید، «کدِ دستگاه»ش را بگیر و با یک دستور «کلید» بساز و بده. تمدید هم همان یک دستور. بقیه خودکار و آفلاین.</div>

<br>

**من می‌توانم این‌ها را برایت بسازم:**
1. 🟢 ماژولِ لایسنس + صفحه‌ی قفل + نوارِ دمو (روی همین نسخه‌ی فعلی، قابلِ تست در مرورگر).
2. 🟢 اسکریپتِ `make-keys.js` (ساختِ جفت‌کلید) و `license-gen.js` (ساختِ کلیدِ مشتری).
3. 🔵 (وقتی Electron را راه انداختی) اتصالِ machineId واقعی + ذخیره‌سازیِ سفت در فایلِ سیستم.

<br>

برای شروع فقط این دو را بگو: **۱)** شماره‌ی تماسی که در صفحه‌ی قفل بیفتد چیست؟ **۲)** مدتِ دمو ۷ روز و لایسنس ۱ سال درست است یا عدد دیگری می‌خواهی؟

</div>
