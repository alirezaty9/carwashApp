<div dir="rtl" align="right">

# 📘 راهنمای یاتاش — بیلد گرفتن و لایسنس دادن

> این فایل فقط برای **توست**، نه برای کارواش‌ها. همه‌چیزی که برای ساختنِ نسخه‌ی نصبی و فعال‌سازیِ مشتری‌ها لازم داری اینجاست.
>
> اگر فقط دنبالِ یک کار خاصی، از فهرست برو: [آماده‌سازیِ ویندوز](#۱-یک-بار-برای-همیشه--آماده‌سازیِ-ویندوز) · [بیلد گرفتن](#۳-ساختِ-فایلِ-نصبی) · [لایسنس دادن](#۵-لایسنس-دادن-به-یک-مشتریِ-جدید) · [تمدید](#۶-تمدیدِ-لایسنس) · [مشکلات](#۸-جدولِ-مشکلات-و-راهِ-حل)

<br>

---

<br>

## ۰) 🧠 اول بفهم سیستم چطور کار می‌کند

قبل از دستورها، یک دقیقه وقت بگذار — با فهمیدنِ این بخش، بقیه‌ی راهنما بدیهی می‌شود.

### قفلِ برنامه روی چه چیزی بسته است؟

هر نصب یک **«کدِ دستگاه»** دارد: یک رشته‌ی ۳۲ حرفیِ یکتا که برنامه **بارِ اولِ اجرا به‌صورتِ تصادفی می‌سازد** و بعد برای همیشه نگه می‌دارد. این کد در سه جای مستقل ذخیره می‌شود (دیتای خودِ برنامه + دو مسیرِ پایدارِ ویندوز)، پس حذف و نصبِ دوباره‌ی برنامه هم عوضش نمی‌کند.

لایسنسی که تو صادر می‌کنی **به یک کدِ دستگاهِ مشخص چسبیده است**. اگر مشتری همان فایل را به کارواشِ بغلی بدهد، کار نمی‌کند.

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ <b>از نسخه‌ی ۱.۰.۰ این کد دیگر به سخت‌افزار گره نخورده است.</b> در نسخه‌های قبل از نامِ کامپیوتر و آدرسِ کارتِ شبکه ساخته می‌شد؛ نتیجه‌اش این بود که اگر مشتری نامِ کامپیوترش را عوض می‌کرد یا یک دانگلِ وای‌فایِ USB می‌زد، لایسنسش ناگهان «برای دستگاهِ دیگری» اعلام می‌شد. حالا چون کد تصادفی و ذخیره‌شده است، این اتفاق نمی‌افتد. مشتری‌هایی که از قبل لایسنس دارند هم مشکلی پیدا نمی‌کنند — برنامه کدِ قدیمی‌شان را تشخیص می‌دهد و همان را نگه می‌دارد.</div>

### امضای دیجیتال چیست و چرا لازم است؟

🌍 **آنالوژیِ روزمره:** مثلِ مُهر و امضای محضر. هر کسی می‌تواند یک برگه بنویسد، ولی فقط محضردار می‌تواند مُهرِ معتبر بزند — و هر کسی می‌تواند مُهر را **ببیند و تشخیص دهد** بدونِ اینکه خودش مُهر داشته باشد.

در اینجا دو کلید داریم:

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">کلید</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کجاست</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کارش چیست</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔒 <b>کلیدِ خصوصی</b><br><code>yatash-private.pem</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فقط پیشِ تو، در ریشه‌ی پروژه</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><b>امضا می‌زند.</b> هر کس این را داشته باشد می‌تواند لایسنسِ جعلی بسازد.</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔑 <b>کلیدِ عمومی</b></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">داخلِ کدِ برنامه (<code>electron/license.cjs</code>) — یعنی در نصبیِ هر مشتری</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><b>امضا را تشخیص می‌دهد.</b> با آن نمی‌شود لایسنس ساخت، فقط می‌شود صحتش را بررسی کرد.</td>
    </tr>
  </tbody>
</table>

به همین دلیل برنامه **کاملاً آفلاین** کار می‌کند: برای بررسیِ لایسنس به هیچ سروری وصل نمی‌شود، چون کلیدِ عمومی خودش داخلِ برنامه است.

### سه حالتِ ممکن برای هر نصب

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">حالت</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کِی</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">مشتری چه می‌بیند</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟦 <b>آزمایشی</b></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">۷ روزِ اول بعد از نصب، خودکار</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">همه‌چیز کار می‌کند؛ تعدادِ روزهای باقی‌مانده را می‌بیند</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟩 <b>لایسنس‌دار</b></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">بعد از واردکردنِ فایلی که تو دادی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">همه‌چیز کار می‌کند تا تاریخِ انقضا</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟥 <b>منقضی / نامعتبر</b></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">تریال تمام شده و لایسنسی وارد نشده</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">یک صفحه‌ی قفلِ تمام‌صفحه که فقط اجازه‌ی فعال‌سازی می‌دهد</td>
    </tr>
  </tbody>
</table>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>تریال ضدِ ریست است.</b> برنامه تاریخِ اولین اجرا را علاوه بر پوشه‌ی دیتای خودش، در دو مسیرِ پایدارِ دیگرِ ویندوز هم می‌نویسد. پس حذف و نصبِ دوباره‌ی برنامه، ۷ روز را از نو شروع <b>نمی‌کند</b>. عقب‌کشیدنِ ساعتِ ویندوز هم جواب نمی‌دهد.</div>

<br>

---

<br>

## ۱) 🪟 یک بار برای همیشه — آماده‌سازیِ ویندوز

این بخش را فقط **بارِ اول** روی هر کامپیوترِ ویندوزی انجام می‌دهی.

### گام ۱ — نصبِ Node.js

**📍 کجا:** مرورگر → آدرسِ `https://nodejs.org`
**▶️ چه بزن:** نسخه‌ی **LTS** را دانلود و نصب کن (همه‌ی گزینه‌ها را پیش‌فرض بگذار و Next بزن).
**👀 باید چه ببینی:** بعد از نصب، یک پنجره‌ی `PowerShell` باز کن و بزن `node -v` — باید شماره‌ای مثلِ `v20.x.x` یا بالاتر بدهد.
**🆘 اگر `node شناخته نشد` داد:** پنجره‌ی PowerShell را ببند و دوباره باز کن (مسیرها تازه اضافه شده‌اند).

> **Node.js چیست؟** موتوری است که کدِ جاوااسکریپت را بیرونِ مرورگر اجرا می‌کند. همه‌ی ابزارهای ساختِ این برنامه رویش کار می‌کنند. بدونِ آن هیچ دستوری در این راهنما اجرا نمی‌شود.

<br>

### گام ۲ — بردنِ پوشه‌ی پروژه روی ویندوز

**📍 کجا:** هر جایی از دیسک، مثلاً `D:\yatash\carwash`
**▶️ چه بزن:** کلِ پوشه‌ی پروژه را کپی کن.
**👀 باید چه ببینی:** داخلِ پوشه باید `package.json`، پوشه‌ی `src` و پوشه‌ی `electron` باشد.

<div style="background:#fff5f5;border-right:4px solid #e03131;color:#7d1a1a;padding:8px 12px;border-radius:6px">🔴 <b>حواست به فایلِ <code>yatash-private.pem</code> باشد.</b> این همان کلیدِ خصوصیِ امضاست. اگر آن را با خودت نبری، روی ویندوز <b>نمی‌توانی لایسنس صادر کنی</b>. اگر گمش کنی، مجبوری کلیدِ نو بسازی و <b>همه‌ی مشتری‌های قبلی را دوباره فعال کنی</b>. همین حالا یک نسخه‌ی پشتیبان از آن جایی امن بگذار (فلشِ جدا یا فضای ابریِ خصوصی).</div>

<br>

### گام ۳ — نصبِ کتابخانه‌ها

**📍 کجا:** داخلِ پوشه‌ی پروژه، راست‌کلیک → `Open in Terminal`
**▶️ چه بزن:**
```bash
npm install
```
**👀 باید چه ببینی:** چند دقیقه طول می‌کشد و آخرش خطی شبیهِ `added NNN packages` می‌دهد.
**🆘 اگر خطای دسترسی داد:** PowerShell را با راست‌کلیک → `Run as administrator` باز کن.

<br>

---

<br>

## ۲) 🔐 یک بار برای همیشه — ساختِ کلیدِ امضا

<div style="background:#fff5f5;border-right:4px solid #e03131;color:#7d1a1a;padding:8px 12px;border-radius:6px">🔴🔴 <b>این گام را فقط و فقط یک بار در کلِ عمرِ محصول انجام بده.</b> اگر فایلِ <code>yatash-private.pem</code> از قبل داری (که داری)، <b>این بخش را کامل رد کن</b> و برو بخشِ ۳. ساختِ کلیدِ نو، <b>تمامِ لایسنس‌های صادرشده‌ی قبلی را در یک لحظه باطل می‌کند</b> و برنامه‌ی همه‌ی مشتری‌ها قفل می‌شود.</div>

فقط اگر کلید را گم کرده‌ای یا اولین بار است:

```bash
npm run license:keygen
```

این دستور دو کار می‌کند: فایلِ `yatash-private.pem` را می‌سازد، و کلیدِ عمومیِ متناظرش را **خودکار** داخلِ `electron/license.cjs` می‌گذارد.

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ بعد از ساختِ کلیدِ نو، <b>حتماً باید دوباره بیلد بگیری</b> — چون کلیدِ عمومیِ داخلِ برنامه عوض شده و نصبی‌های قدیمی لایسنس‌های جدید را قبول نمی‌کنند.</div>

<br>

---

<br>

## ۳) 🏗️ ساختِ فایلِ نصبی

این کار را هر بار که تغییری در برنامه دادی انجام می‌دهی.

### گام ۱ — بالا بردنِ شماره‌ی نسخه

**📍 کجا:** فایلِ `package.json` در ریشه‌ی پروژه، خطِ چهارم.
**▶️ چه بزن:** مقدارِ `"version"` را یک پله بالا ببر — مثلاً از `1.0.0` به `1.0.1`.
**👀 باید چه ببینی:** نامِ فایلِ نصبیِ خروجی همین شماره را می‌گیرد، پس بعداً می‌فهمی مشتری کدام نسخه را دارد.

> **قاعده‌ی شماره‌گذاری:** عددِ آخر برای رفعِ باگ (`1.0.0` ← `1.0.1`)، عددِ وسط برای قابلیتِ جدید (`1.0.1` ← `1.1.0`)، عددِ اول برای تغییرِ بزرگ (`1.1.0` ← `2.0.0`).

<br>

### گام ۲ — بررسیِ سلامتِ کد

**▶️ چه بزن:**
```bash
npm run lint
npm test
```
**👀 باید چه ببینی:** دستورِ اول **بدونِ هیچ خروجی** تمام شود. دستورِ دوم باید همه‌ی تست‌ها را سبز نشان دهد.
**🆘 اگر خطا داد:** بیلد نگیر. اول خطا را برطرف کن — یک بیلدِ خراب یعنی یک کارواشِ خراب.

<br>

### گام ۳ — ساختِ نصبی

**▶️ چه بزن:**
```bash
npm run electron:build:win
```
**👀 باید چه ببینی:** چند دقیقه طول می‌کشد. در انتها فایلِ نصبی در پوشه‌ی `release` ساخته می‌شود، با نامی شبیهِ `Yatash Carwash Setup 1.0.1.exe` و حجمِ حدودِ ۷۶ مگابایت.
**🆘 اگر خیلی طول کشید یا خطای دانلود داد:** بارِ اول ابزارهای ساختِ ویندوز دانلود می‌شوند و اینترنت لازم است. دفعه‌های بعد از حافظه‌ی محلی می‌خواند و سریع است.

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>چرا ۷۶ مگابایت؟</b> چون داخلِ نصبی یک مرورگرِ کاملِ کروم و موتورِ Node قرار دارد — برنامه روی آن‌ها اجرا می‌شود. این بخش قابلِ حذف نیست و برای همه‌ی برنامه‌های از این دست (مثلِ VS Code و دیسکورد) هم همین‌طور است. خودِ کدِ برنامه‌ی تو فقط ۳ مگابایت از آن است.</div>

<br>

### گام ۴ — تمیزکاری قبل از بیلدِ بعدی (اختیاری)

اگر خواستی مطمئن شوی هیچ ته‌مانده‌ای از بیلدِ قبلی نمانده:
```bash
npm run clean
```
این دستور پوشه‌های `dist`، `release` و `test-results` را پاک می‌کند. **به کلیدِ خصوصی و داده‌ها کاری ندارد.**

<br>

---

<br>

## ۴) 📤 تحویلِ نصبی به مشتری

فقط **یک فایل** به مشتری می‌دهی: همان `Yatash Carwash Setup <نسخه>.exe` از پوشه‌ی `release`.

**مشتری چه می‌کند:** فایل را اجرا می‌کند → مسیرِ نصب را تأیید می‌کند → برنامه نصب می‌شود و یک میان‌بر روی دسکتاپ می‌سازد.

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ <b>ویندوز احتمالاً هشدار می‌دهد</b> («Windows protected your PC»). دلیلش این است که فایل با گواهیِ رسمیِ ناشر امضا نشده. به مشتری بگو روی <b>More info</b> و بعد <b>Run anyway</b> بزند. اگر خواستی این هشدار برود، باید گواهیِ امضای کد (Code Signing Certificate) بخری — هزینه‌ی سالانه دارد و برای شروع لازم نیست.</div>

**بعد از نصب، مشتری ۷ روز رایگان کار می‌کند.** لازم نیست همان روزِ اول لایسنس بدهی.

<br>

---

<br>

## ۵) 🎫 لایسنس دادن به یک مشتریِ جدید

این چرخه فقط **چهار قدم** دارد و همه‌اش آفلاین است.

### گام ۱ — مشتری کدِ دستگاهش را برایت می‌فرستد

به مشتری بگو این مسیر را برود:

`برنامه ← ورود ← پنلِ مدیریت ← تبِ «لایسنس» ← کادرِ «کدِ دستگاهِ شما» ← دکمه‌ی «کپی»`

**اگر تریالش تمام شده** و برنامه قفل است، همان کادر در **صفحه‌ی قفلِ تمام‌صفحه** هم هست — لازم نیست وارد برنامه شود.

**👀 چیزی که می‌فرستد:** یک رشته‌ی ۳۲ حرفیِ انگلیسی و عددی. با تلگرام/واتساپ برایت بفرستد.

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ <b>حتماً از دکمه‌ی «کپی» استفاده کند، نه تایپِ دستی.</b> یک حرفِ اشتباه یعنی لایسنسی که کار نمی‌کند و تو نمی‌فهمی چرا.</div>

<br>

### گام ۲ — تو لایسنس را صادر می‌کنی

**📍 کجا:** ترمینال، داخلِ پوشه‌ی پروژه، روی ویندوزِ خودت.
**▶️ چه بزن:**
```bash
npm run license:issue
```
**👀 باید چه ببینی:** دو سؤال از تو می‌پرسد:
- `کد دستگاهِ مشتری را وارد کن:` ← همان رشته‌ای که فرستاده را پیست کن
- `نام مشتری (اختیاری):` ← مثلاً «کارواش الماس - آقای رضایی»

بعد پیامِ `✅ لایسنس صادر شد` را می‌بینی به‌همراهِ مسیرِ فایل، نامِ مشتری، و تاریخِ انقضا.

**📄 خروجی:** فایلِ `license.dat` در ریشه‌ی پروژه.

<div style="background:#fff5f5;border-right:4px solid #e03131;color:#7d1a1a;padding:8px 12px;border-radius:6px">🔴 <b>فایلِ <code>license.dat</code> هر بار بازنویسی می‌شود.</b> اگر برای مشتریِ دوم دستور را بزنی، لایسنسِ مشتریِ اول پاک می‌شود. پس بلافاصله بعد از صدور، فایل را برای مشتری بفرست یا با نامِ مشخص جای دیگری ذخیره کن (روشِ بهتر در گامِ بعد).</div>

<br>

### گام ۲ (روشِ بهتر) — صدور با نامِ اختصاصی

اگر چند مشتری داری، به‌جای بالا این را بزن تا فایلِ هر مشتری جدا بماند:

```bash
node tools/license-gen.cjs issue --machine <کد-دستگاه> --customer "کارواش الماس" --days 365 --out "licenses/almas.dat"
```

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">گزینه</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">یعنی چه</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>--machine</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کدِ دستگاهی که مشتری فرستاده (اجباری)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>--customer</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">نامِ مشتری — فقط برای اینکه خودت بعداً بفهمی این لایسنس مالِ کیست</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>--days</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مدتِ اعتبار به روز. <code>365</code> یک سال، <code>30</code> یک ماه، <code>3650</code> ده سال (عملاً دائمی)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>--out</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مسیر و نامِ فایلِ خروجی — تا لایسنسِ مشتریِ قبلی را بازنویسی نکند</td>
    </tr>
  </tbody>
</table>

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ <b>پیشنهاد:</b> یک پوشه‌ی <code>licenses/</code> بساز و فایلِ هر مشتری را با نامِ خودش نگه دار. بعداً برای تمدید، کدِ دستگاه را از داخلِ همان فایل برمی‌داری و لازم نیست دوباره از مشتری بپرسی.</div>

<br>

### گام ۳ — فایل را برای مشتری بفرست

فایلِ `.dat` را با تلگرام/واتساپ/ایمیل بفرست.

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>نگرانِ لو رفتنِ فایل نباش.</b> این فایل به کدِ دستگاهِ همان مشتری قفل است؛ روی هیچ کامپیوترِ دیگری کار نمی‌کند. پس فرستادنش از هر راهی امن است.</div>

<br>

### گام ۴ — مشتری فعالش می‌کند

به مشتری بگو:

`پنلِ مدیریت ← تبِ «لایسنس» ← دکمه‌ی «انتخاب و فعال‌سازی» ← فایلِ license.dat را انتخاب کن`

**👀 بعدش چه می‌بیند:** در همان صفحه، وضعیت به **«لایسنسِ فعال»** تغییر می‌کند و «روزهای باقی‌مانده» و «اعتبار تا» پر می‌شوند.

**اگر برنامه قفل بوده**، همین دکمه در صفحه‌ی قفل هست و بعد از فعال‌سازی برنامه باز می‌شود.

<br>

---

<br>

## ۶) 🔄 تمدیدِ لایسنس

تمدید **دقیقاً همان کارِ صدور** است — لازم نیست چیزی پاک شود.

۱. کدِ دستگاهِ مشتری را از فایلِ لایسنسِ قبلی‌اش بردار (یا دوباره از خودش بگیر — اگر کامپیوترش عوض نشده باشد همان است).
۲. دستورِ صدور را با `--days 365` دوباره بزن.
۳. فایلِ نو را بفرست.
۴. مشتری همان دکمه‌ی «انتخاب و فعال‌سازی» را می‌زند.

فایلِ جدید جای قبلی را می‌گیرد و تاریخِ انقضا جلو می‌رود.

<br>

---

<br>

## ۷) 🔑 رمزها و دسترسیِ پشتیبانی

<div style="background:#fff5f5;border-right:4px solid #e03131;color:#7d1a1a;padding:8px 12px;border-radius:6px">🔴🔴 <b>این بخش رمزِ پشتیبانیِ تو را دارد. این فایل را هرگز به هیچ مشتری‌ای نده و جایی عمومی نگذار.</b> اگر روزی خواستی راهنمایی برای مشتری بنویسی، یک فایلِ جدا بساز و این بخش را داخلش نیاور.</div>

<br>

### رمزِ پیش‌فرضِ اولین اجرا

مشتری بارِ اول با این رمز وارد می‌شود:

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">مورد</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">مقدار</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">کاربرِ پیش‌فرض</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">«مدیر» (نقشِ ادمین)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">رمزِ پیش‌فرض</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>yatash</code></td>
    </tr>
  </tbody>
</table>

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ <b>از نسخه‌ی ۱.۰.۰ به بعد، تغییرِ این رمز اجباری است.</b> وقتی مشتری با رمزِ پیش‌فرض وارد می‌شود، قبل از رسیدن به صندوق یک صفحه‌ی «یک رمزِ تازه بگذارید» می‌آید که تا رمزِ نو نگذارد رد نمی‌شود. پس دیگر لازم نیست یادش بیندازی — خودِ برنامه مجبورش می‌کند.</div>

<br>

### رمزِ مادر — راهِ پشتیبانیِ تو

یک رمزِ ثابتِ پشتیبانی در برنامه هست که **همیشه** کار می‌کند — هم برای پنلِ مدیریت، هم به‌جای رمزِ هر کاربری در صفحه‌ی ورود:

```
Yatash@Master#9K7q!Zx
```

در کد، این مقدار در فایلِ `src/auth.ts` زیرِ نامِ `MASTER_PASSWORD` است.

**کاربردش:** اگر مشتری رمزش را فراموش کرد، در صفحه‌ی ورود کاربرش را انتخاب کن و این رمز را بزن. وارد می‌شوی و از `پنلِ مدیریت ← تبِ «کاربران»` رمزِ نو برایش می‌گذاری.

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>نکته:</b> وقتی با رمزِ مادر وارد می‌شوی، صفحه‌ی اجباریِ تغییرِ رمز <b>برایت نمی‌آید</b> — عمداً این‌طور ساخته شده تا مجبور نشوی رمزِ مشتری را عوض کنی تا فقط بتوانی وارد برنامه شوی.</div>

<div style="background:#fff5f5;border-right:4px solid #e03131;color:#7d1a1a;padding:8px 12px;border-radius:6px">🔴 <b>دو محدودیتِ جدی که باید بدانی:</b> (۱) این رمز روی <b>همه‌ی نصبی‌ها یکسان</b> است — اگر یک نفر بفهمدش، به برنامه‌ی همه‌ی کارواش‌ها دسترسی دارد. (۲) چون داخلِ فایلِ نصبی است، کسی که کمی وارد باشد می‌تواند در چند دقیقه از داخلِ نصبی بیرونش بکشد. <b>یعنی این یک «راهِ پشتیبانی» است، نه یک قفلِ امنیتی.</b> اگر روزی تعدادِ مشتری‌ها زیاد شد، باید به روشِ امن‌ترِ «کدِ بازیابیِ یک‌بارمصرف» تبدیل شود (زیرساختش — همان جفت‌کلیدِ لایسنس — از قبل در پروژه هست).</div>

<br>

---

<br>

## ۸) 🆘 جدولِ مشکلات و راهِ حل

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">مشتری چه می‌گوید</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">علت</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه کن</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">«این لایسنس برای دستگاهِ دیگری صادر شده است»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کدِ دستگاه اشتباه گرفته شده، یا مشتری کامپیوترش را عوض کرده</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کدِ دستگاه را <b>دوباره و با دکمه‌ی کپی</b> بگیر و لایسنسِ نو صادر کن</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">«امضای لایسنس معتبر نیست»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">نصبیِ مشتری با کلیدِ دیگری ساخته شده، یا فایل در مسیرِ ارسال خراب شده</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مطمئن شو نصبیِ مشتری از <b>همین</b> نسخه‌ی پروژه است. فایل را دوباره و به‌صورتِ «فایل» بفرست، نه متنِ کپی‌شده</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">«فایل معتبر نیست (JSON خراب)»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فایل در مسیر خراب شده یا مشتری فایلِ اشتباهی داده</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">دوباره بفرست، ترجیحاً داخلِ یک فایلِ فشرده (zip) تا دست‌نخورده برسد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">«ناگهان گفت لایسنس نامعتبر است، در حالی که کار می‌کرد»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کدِ دستگاه عوض شده. از نسخه‌ی ۱.۰.۰ این فقط وقتی رخ می‌دهد که <b>ویندوز از نو نصب شده</b> یا هر سه محلِ ذخیره‌ی کد پاک شده باشد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کدِ جدید را بگیر و لایسنسِ نو صادر کن (رایگان)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">«رمزم را فراموش کردم»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">—</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">با رمزِ مادر وارد شو و از تبِ «کاربران» رمزِ نو بگذار</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">ویندوز موقعِ نصب هشدار می‌دهد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فایل گواهیِ ناشر ندارد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">More info ← Run anyway. برای حذفِ دائمی باید گواهیِ امضای کد خرید</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">«می‌خواهم برنامه را روی کامپیوترِ دومِ کارواش هم نصب کنم»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">هر کامپیوتر کدِ دستگاهِ جدا دارد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">لایسنسِ جدا برای آن کامپیوتر صادر کن. ⚠️ داده‌ها بینِ دو کامپیوتر همگام نمی‌شوند — هر کدام دیتای خودش را دارد</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۹) 💾 چک‌لیستِ پشتیبان‌گیری — این را جدی بگیر

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه چیزی</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">اگر گمش کنی چه می‌شود</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔴 <code>yatash-private.pem</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><b>فاجعه.</b> دیگر نمی‌توانی برای هیچ‌کس لایسنس صادر یا تمدید کنی. مجبوری کلیدِ نو بسازی، دوباره بیلد بگیری، و به <b>همه‌ی</b> مشتری‌ها نصبیِ جدید و لایسنسِ جدید بدهی.</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟡 کدِ پروژه</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">دیگر نمی‌توانی نسخه‌ی جدید بسازی یا باگ رفع کنی. (اگر روی گیت‌هاب هست، مشکلی نیست.)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 پوشه‌ی <code>licenses/</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">قابلِ جبران — کدِ دستگاه را دوباره از مشتری می‌گیری و لایسنس را از نو صادر می‌کنی.</td>
    </tr>
  </tbody>
</table>

<div style="background:#fff5f5;border-right:4px solid #e03131;color:#7d1a1a;padding:8px 12px;border-radius:6px">🔴 <b>همین امروز از <code>yatash-private.pem</code> پشتیبان بگیر</b> — حداقل در دو جای مستقل (مثلاً یک فلشِ جدا و یک فضای ابریِ خصوصی). این فایل ۱۱۹ بایت است ولی کلِ کسب‌وکارت به آن بسته است. ⚠️ آن را در گیت‌هابِ عمومی نگذار.</div>

<br>

---

<br>

## ۱۰) 📋 کارتِ مرجعِ سریع

**نصبِ اولیه روی ویندوز:**
```bash
npm install
```

**ساختِ نسخه‌ی جدید (بعد از بالا بردنِ شماره‌ی نسخه در package.json):**
```bash
npm run lint
npm test
npm run electron:build:win
```
خروجی: `release\Yatash Carwash Setup <نسخه>.exe`

**صدور یا تمدیدِ لایسنس:**
```bash
npm run license:issue
```
خروجی: `license.dat` — یا با نامِ اختصاصی:
```bash
node tools/license-gen.cjs issue --machine <کد> --customer "نام" --days 365 --out "licenses/<نام>.dat"
```

**پاک‌کردنِ بیلدهای قدیمی:**
```bash
npm run clean
```

</div>
