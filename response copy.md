<div dir="rtl" align="right">

# ✅ چاپ درست شد — کلِ ماجرا، از صفر تا صد

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ <b>وضعیتِ نهایی:</b> چاپ روی لینوکس تأیید شد. بررسیِ نهاییِ کد انجام شد و یک ایرادِ احتمالی که پیدا کردم رفع شد. نسخه‌ی ویندوزی هم ساخته شد — ولی نه به شکلِ «فایلِ نصبی»، که علتش را پایین کامل توضیح داده‌ام.</div>

<br>

# بخشِ ۱ — ماجرا به زبانِ کاملاً ساده

اگر هیچ چیز از این حوزه ندانی، این بخش کافی است.

<br>

## 🏭 اول ببینیم «چاپ» اصلاً یعنی چه

وقتی در هر برنامه‌ای دکمه‌ی چاپ را می‌زنی، کاغذ مستقیماً از برنامه بیرون نمی‌آید. یک **زنجیره‌ی چهارنفره** در کار است:

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">نفر</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کارش چیست</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">مثالِ روزمره</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۱. برنامه (اپِ تو)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">می‌گوید «این فیش را چاپ کن»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مشتری که سفارش می‌دهد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۲. سیستم‌عامل (ویندوز/لینوکس)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">سفارش را می‌گیرد و به یک زبانِ واسط ترجمه می‌کند</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">پیشخدمت که سفارش را می‌نویسد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۳. <b>درایور</b></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">آن زبانِ واسط را به زبانِ <b>همان مدلِ خاصِ پرینتر</b> ترجمه می‌کند</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مترجمی که سفارش را به زبانِ آشپز می‌گوید</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۴. پرینتر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">اجرا می‌کند</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">آشپز</td>
    </tr>
  </tbody>
</table>

**نکته‌ی کلیدی:** نفرِ سوم (درایور) برای **هر مدلِ پرینتر جداگانه** نوشته می‌شود. ویندوز و لینوکس صدها درایورِ آماده دارند و وقتی پرینتری را وصل می‌کنی، از خودِ دستگاه می‌پرسند «تو چه مدلی هستی؟» و بعد مترجمِ مناسبش را برمی‌دارند.

<br>

## 🔴 ایرادِ اصلی: این پرینتر اسمِ خودش را نمی‌گوید

بررسی کردم و این را **با اطلاعاتِ خودِ دستگاه** تأیید کردم:

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">سیستم‌عامل چه می‌پرسد</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">این پرینتر چه جواب می‌دهد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">سازنده‌ات کیست؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔴 (خالی)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">مدلت چیست؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔴 (خالی)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">شماره‌ی سریالت؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🔴 (خالی)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">اصلاً پرینتری؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 بله (تنها چیزی که می‌گوید)</td>
    </tr>
  </tbody>
</table>

پس سیستم‌عامل می‌ماند با دستگاهی که فقط می‌گوید «من یک پرینترم» و بس. نتیجه: **هیچ مترجمی برایش پیدا نمی‌شود.** در ویندوز خودت دستی گذاشتی روی `Generic / Text Only`، و در لینوکس هم — بدونِ اینکه تو کاری کنی — همین اتفاق افتاد و صفی ساخت با نامِ `Unknown` (یعنی «ناشناخته») بدونِ هیچ مترجمی.

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ <b>پس تقصیرِ تو نبود و تقصیرِ برنامه هم نبود.</b> دو سیستم‌عاملِ کاملاً متفاوت، مستقل از هم، به یک بن‌بست رسیدند — چون علت یکی بود: پرینتر خودش را معرفی نمی‌کند.</div>

<br>

## 📜 چرا «کد» چاپ می‌شد؟

وقتی مترجم (نفرِ سوم) وجود ندارد، آن **متنِ واسط** که سیستم‌عامل نوشته بود، دست‌نخورده به پرینتر می‌رسد. پرینتر هم که فقط بلد است هر چه رسید را حرف‌به‌حرف بکوبد روی کاغذ، **همان متن را چاپ می‌کند**.

آن متن، یک برنامه‌ی کوچک به زبانی به نامِ **PostScript** است که دستورِ کشیدنِ فیش را توصیف می‌کند — برای همین پر از `ifelse` و `for` بود.

> 🌍 **آنالوژی:** به جای اینکه عکسی را چاپ کنی، **دستورالعملِ نقاشیِ** آن عکس چاپ شده: «قلمِ سیاه را بردار · از نقطه‌ی ۱۲ به ۴۰ خط بکش · اگر این شرط بود، تکرار کن…». چند هزار خط دستور برای یک فیشِ ساده. برای همین هم بی‌پایان بود و هم هیچ شباهتی به فیش نداشت.

<br>

## 📏 ایرادِ دوم: اندازه‌ی کاغذ

عکسی که از پنجره‌ی چاپ فرستادی، ایرادِ دومی را هم لو داد: خانه‌ی `Paper size` روی **`US Letter`** بود، یعنی برگه‌ی ۲۱.۶ × ۲۷.۹ سانتی‌متری.

برنامه می‌گفت «این فیش ۷.۲ × ۱۳.۳ سانت است»، ولی در آن حالتِ چاپ، **حرفِ آن پنجره مقدم است**. پس هر فیش روی یک برگه‌ی ۲۸ سانتی می‌رفت — یعنی بیش از دو برابرِ کاغذ، آن هم روی رولِ پیوسته که خودش هیچ‌وقت «تمام» نمی‌شود.

<br>

## 🛠️ راهِ حلی که ساختیم

به‌جای اینکه منتظرِ مترجم بمانیم، **خودِ برنامه مترجم شد**:

`فیش ← برنامه خودش از آن عکس می‌گیرد ← عکس را به نقطه‌های ریزِ سیاه‌وسفید تبدیل می‌کند ← مستقیم به پرینتر می‌گوید «این نقطه‌ها را بسوزان»`

پرینترهای حرارتی یک زبانِ مشترکِ ساده دارند (اسمش **ESC/POS** است) که تقریباً همه‌شان بلدند و برای فهمیدنش به هیچ درایوری نیاز ندارند. همان آزمایشی که خودت زدی و `YATASH TEST OK` چاپ شد، دقیقاً حرف‌زدن با همین زبان بود.

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>چرا «عکس» و نه «متن»؟</b> اگر فیش را به‌صورتِ متن می‌فرستادیم، شکلِ حروف به فونتِ داخلیِ خودِ پرینتر وابسته می‌شد و فارسی روی بیشترِ این دستگاه‌ها به‌هم‌ریخته یا جدا-جدا درمی‌آید. در روشِ تصویری، حروف را <b>همان موتوری می‌کشد که روی صفحه‌ی برنامه می‌بینی</b> — پس فارسی همیشه درست است و ظاهرِ فیش هم عیناً همان می‌ماند.</div>

<br>

---

<br>

# بخشِ ۲ — همان ماجرا، این‌بار فنی

<br>

## 🔬 زنجیره‌ی چاپ، دقیق‌تر

`اپ (موتورِ Chromium) ← ترجمه به PostScript ← فیلترهای CUPS/درایور ← دستورهای اختصاصیِ پرینتر ← کاغذ`

- **مرحله‌ی دوم:** موتورِ نمایشِ برنامه (همان که صفحات وب را می‌کشد) فیش را به‌صورتِ یک سندِ برداری توصیف می‌کند.
- **مرحله‌ی سوم — جایی که شکست:** سیستمِ چاپِ لینوکس (CUPS) برای هر صف یک فایلِ تنظیمات دارد به نامِ **PPD** که می‌گوید این پرینتر چه زبانی می‌فهمد و چه فیلترهایی باید اجرا شوند. صفِ ما `Unknown.ppd` داشت: یک قالبِ عمومیِ بدونِ هیچ فیلترِ تبدیلی. نتیجه: خروجیِ مرحله‌ی دوم **بدونِ تبدیل** به دستگاه رفت.
- **مرحله‌ی چهارم:** پرینترِ حرارتی که منتظرِ بایت‌های ESC/POS بود، آن بایت‌ها را به‌عنوانِ کاراکترِ متنی تفسیر کرد و چاپشان کرد.

**چرا PPD عمومی شد؟** چون توصیفگرهای USB دستگاه خالی‌اند: `idVendor=1fc9`، `idProduct=2016`، و رشته‌های `manufacturer`/`product`/`serial` و حتی `ieee1284_id` همه تهی. تطبیقِ خودکارِ درایور دقیقاً روی همین رشته‌ها انجام می‌شود.

<br>

## 🧱 معماریِ راه‌حل

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">مرحله</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه می‌کند</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چرا این‌طور</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۱. عکس‌برداری</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">ناحیه‌ی فیش برای چند لحظه در گوشه‌ی پنجره نشان داده و از آن عکس گرفته می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">عکس فقط از ناحیه‌ی دیده‌شده ممکن است؛ برای همین آن چشمکِ کوتاه را می‌بینی</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۲. بزرگ‌نمایی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فیش دقیقاً تا عرضِ ۵۷۶ نقطه بزرگ می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">۷۲ میلی‌متر ÷ ۲۵.۴ × ۲۰۳ نقطه‌بر‌اینچ ≈ ۵۷۶. بزرگ‌نمایی <b>قبل از</b> رندر انجام می‌شود تا حروف تیز بمانند، نه اینکه عکسِ کوچک را کش بدهیم</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۳. تکه‌تکه کردن</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فیشِ بزرگ‌شده بلندتر از پنجره است، پس مرحله‌به‌مرحله بالا کشیده و عکس گرفته می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">محدودیتِ عکس‌برداری از صفحه؛ تکه‌ها بعداً پشتِ‌سرِهم چاپ می‌شوند و روی رولِ پیوسته درزی دیده نمی‌شود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۴. دو‌رنگ‌سازی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">روشناییِ هر پیکسل حساب و با یک آستانه به «سیاه/سفید» تبدیل می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">سرِ چاپگرِ حرارتی طیفِ خاکستری ندارد: هر نقطه یا می‌سوزد یا نمی‌سوزد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۵. بسته‌بندی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">نقطه‌ها در قالبِ فرمانِ «چاپِ تصویر» بسته‌بندی می‌شوند، در باندهای ۱۲۸ خطی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">حافظه‌ی این دستگاه‌ها کوچک است؛ یک فرمانِ غول‌آسا می‌تواند نیمه‌کاره رها شود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۶. ارسالِ خام</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">بایت‌ها بدونِ هیچ تبدیلی به دستگاه می‌رسند</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">هر ترجمه‌ی اضافه دقیقاً همان چیزی است که اول ماجرا خرابش کرد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۷. پایان</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">چند خط کاغذ جلو می‌رود و فرمانِ برش فرستاده می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">لبه‌ی برش چند میلی‌متر جلوتر از سرِ چاپگر است؛ بدونِ آن، آخرین سطرها داخلِ دستگاه می‌مانند</td>
    </tr>
  </tbody>
</table>

<br>

## 🚚 مسیرِ ارسال روی هر سیستم‌عامل

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">سیستم‌عامل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">روش</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">وضعیت</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">لینوکس / مک</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">سیستمِ چاپ با گزینه‌ی «دست‌نخورده» (raw)؛ اگر در دسترس نبود، نوشتنِ مستقیم روی خودِ دستگاه</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 <b>امتحان شد و جواب داد</b></td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">ویندوز</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">صفِ چاپِ خودِ ویندوز با نوعِ دادهٔ <code>RAW</code>، از راهِ توابعِ داخلیِ ویندوز</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟡 نوشته شده، <b>هنوز امتحان نشده</b></td>
    </tr>
  </tbody>
</table>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ برای ویندوز عمداً از هیچ کتابخانه‌ی جانبی استفاده نکردم و از ابزارِ داخلیِ خودِ ویندوز کمک گرفتم. دلیلش: کتابخانه‌های آماده‌ی این کار همگی «کدِ کامپایل‌شده‌ی مخصوصِ هر ویندوز» دارند که هم حجمِ نصبی را بالا می‌برد و هم موقعِ نصب روی کامپیوترِ مشتری می‌تواند بشکند.</div>

<br>

---

<br>

# بخشِ ۳ — چرا این‌قدر طول کشید

این مهم‌ترین درسِ ماجراست و ارزشِ گفتن دارد:

<div style="background:#fff5f5;border-right:4px solid #e03131;color:#7d1a1a;padding:8px 12px;border-radius:6px">🔴 <b>مشکل اصلاً سخت نبود — نامرئی بود.</b> برنامه طوری نوشته شده بود که جوابِ سیستم‌عامل را می‌گرفت و <b>بی‌صدا دور می‌ریخت</b>. پیامِ سبزِ «برای چاپ ارسال شد» هم قبل از شروعِ چاپ نوشته می‌شد. پس هیچ‌کس — نه تو، نه من — نمی‌توانست بفهمد کجای زنجیره شکسته.</div>

ترتیبِ واقعیِ اتفاقات را نگاه کن:

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">مرحله</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه شد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">قبل از گزارشِ چاپ</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">روزها حدس و آزمون‌وخطا، بدونِ هیچ سرنخی</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">بعد از اضافه‌شدنِ گزارشِ چاپ</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">همان اولین لاگ ثابت کرد سمتِ برنامه سالم است (۴۰۰ کاراکتر محتوا، ارتفاعِ ۱۳۳ میلی‌متر، تحویلِ بدونِ خطا)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">یک قدم بعد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">عکسِ پنجره‌ی چاپ + توضیحِ «کدها» → هر دو علت قطعی شد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">یک قدم بعد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">یک دستورِ یک‌خطی ثابت کرد پرینتر ESC/POS را می‌فهمد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">و بعد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">راهِ حل ساخته شد و همان بارِ اول جواب داد</td>
    </tr>
  </tbody>
</table>

**نتیجه‌ای که برای بقیه‌ی پروژه هم به‌کار می‌آید:** کادرِ «گزارشِ چاپ» و دکمه‌ی «ذخیره به‌صورتِ PDF» سرِ جایشان ماندند. مشتریِ بعدی که گفت «چاپ نمی‌شود»، به‌جای یک ساعت حدس، می‌گویی «برو تنظیمات، گزارش را کپی کن و بفرست».

<br>

---

<br>

# بخشِ ۴ — بررسیِ نهاییِ کد

کلِ چیزی که این چند نوبت نوشته شد را دوباره خواندم. نتیجه:

## 🔧 یک ایراد پیدا کردم و رفعش کردم

> **📍 کدام قسمتِ اپ:** پشتِ صحنه، در مسیرِ چاپ.
> **🔴 ایراد:** چاپِ حرارتی فیش را تکه‌تکه می‌سازد و تکه‌ها تا لحظه‌ی ارسال کنارِ هم انبار می‌شوند. اگر صندوقدار **دو قبض را خیلی سریع پشتِ‌سرِهم** ثبت می‌کرد، تکه‌های دو فیشِ مختلف می‌توانستند با هم قاطی شوند و یک فیشِ درهم‌ریخته بیرون بیاید.
> **✅ رفع:** حالا کارهای چاپ در یک صف می‌نشینند و هر کدام فقط بعد از تمام‌شدنِ قبلی شروع می‌شود.
> **💥 چرا مهم بود:** این دقیقاً همان نوع باگی است که در آزمایشِ آرام هرگز دیده نمی‌شود و در شلوغیِ ظهرِ کارواش خودش را نشان می‌دهد.

## ✅ چیزهایی که بررسی و تأیید شدند

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">مورد</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">نتیجه</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">هر شکستِ چاپ به کاربر گزارش می‌شود؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 بله — در هر شاخه‌ی خطا یک پیامِ فارسی هست</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">اگر وسطِ کار خطایی رخ دهد، فیش روی صفحه گیر نمی‌کند؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 بله — پاک‌سازی در بخشی انجام می‌شود که حتی با خطا هم حتماً اجرا می‌شود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">فیشِ آزمایشی در سوابقِ مالی ثبت نمی‌شود؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 بله — فقط در حافظه ساخته می‌شود و هیچ‌جا ذخیره نمی‌شود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">کدِ مرده یا باقی‌مانده‌ی آزمایشی جا مانده؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 نه — بررسی شد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">آن «تلاشِ دومِ» خطرناکِ نوبتِ قبل برداشته شد؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 بله — می‌توانست یک رولِ کاغذ را هدر بدهد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">بررسیِ نوعِ داده‌ها روی کلِ پروژه</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 بدونِ خطا</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">صحتِ نگارشِ فایل‌های سیستمی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 هر چهار فایل سالم</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">محتوای بسته‌ی ویندوزی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 تأیید شد که فایل‌های تازه داخلش هستند</td>
    </tr>
  </tbody>
</table>

## ⚠️ چیزهایی که هنوز تأییدِ عملی ندارند

- **مسیرِ ویندوزیِ ارسالِ خام** — کدش نوشته شده، ولی تا روی ویندوز امتحان نشود نمی‌توانم بگویم کار می‌کند. این اولین چیزی است که باید آنجا تست کنی.
- **کیفیتِ چاپ روی رول‌های مختلف** — دو عدد (تیزی و پررنگی) قابلِ تنظیم‌اند. اگر فیش کم‌رنگ یا پخش بود، بگو تا تنظیمشان کنم.

<br>

---

<br>

# بخشِ ۵ — بیلدِ ویندوز

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ <b>این را باید صریح بگویم:</b> طبقِ خواسته‌ات پوشه‌ی بیلدهای قبلی را پاک کردم، ولی <b>فایلِ نصبیِ <code>.exe</code> ساخته نشد</b> — چون ساختنِ فایلِ نصبیِ ویندوز روی لینوکس به ابزاری به نامِ <code>wine</code> نیاز دارد که روی این کامپیوتر نصب نیست. دو بار تلاش کردم و بارِ سوم را طبقِ قاعده‌ی خودمان متوقف کردم و سراغِ راهِ دیگر رفتم.</div>

**راهی که رفتم:** به‌جای فایلِ نصبی، **نسخه‌ی قابلِ حمل** ساخته شد. یعنی همان برنامه‌ی کاملِ ویندوزی، ولی بدونِ نصب‌کننده — کپی می‌کنی و مستقیم اجرا می‌کنی. **برای تستِ تو دقیقاً همان کار را می‌کند.**

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه چیزی ساخته شد</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کجاست</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه کارش کنی</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">فایلِ فشرده (۱۰۶ مگابایت)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>release/Yatash-Carwash-win-x64.zip</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">روی فلش بریز، در ویندوز از حالتِ فشرده دربیاور</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">همان، دربازشده (۲۶۲ مگابایت)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>release/win-unpacked/</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">اگر فلش جا دارد، مستقیم خودِ پوشه را ببر</td>
    </tr>
  </tbody>
</table>

**در ویندوز:** داخلِ پوشه، فایلِ **`Yatash Carwash.exe`** را اجرا کن. همین. (ویندوز ممکن است یک اخطارِ «ناشرِ ناشناس» بدهد — روی `More info` و بعد `Run anyway` بزن. این اخطار برای هر برنامه‌ی امضانشده‌ای می‌آید و ربطی به سالم‌بودنِ برنامه ندارد.)

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>یک تغییرِ کوچک در تنظیماتِ ساخت:</b> یک گزینه اضافه کردم که مرحله‌ی «امضای دیجیتالِ فایلِ اجرایی» را رد کند، چون همان مرحله هم به <code>wine</code> نیاز داشت و این نسخه اصلاً امضای دیجیتال ندارد. بدونِ این گزینه، حتی نسخه‌ی قابلِ حمل هم ساخته نمی‌شد.</div>

<br>

---

<br>

## ✅ چطور خودت امتحانش کنی (روی ویندوز)

### گام ۱ — بردن به ویندوز
**📍 کجا:** پوشه‌ی `release` در پروژه
**▶️ چه بزن:** فایلِ `Yatash-Carwash-win-x64.zip` را روی فلش کپی کن.

### گام ۲ — اجرا در ویندوز
**📍 کجا:** ویندوز
**▶️ چه بزن:** فایل را از حالتِ فشرده دربیاور، واردِ پوشه‌ی `win-unpacked` شو و `Yatash Carwash.exe` را اجرا کن.
**🆘 اگر اخطارِ آبیِ ویندوز آمد:** `More info` ← `Run anyway`.

### گام ۳ — تنظیمِ پرینتر
**📍 کجا:** برنامه ← بالای صفحه روی نامِ کارواش ← «تنظیمات و بکاپ» ← «پرینتر و چاپ»
**▶️ چه بزن:** **«چاپِ حرارتی (پیشنهادی)»** و بعد پرینترت را از لیستِ «پرینترِ مقصد» انتخاب کن.
**👀 باید چه ببینی:** پرینترِ حرارتی در لیست باشد — با همان نامی که در `Printers & scanners`ِ ویندوز دارد.

### گام ۴ — چاپِ آزمایشی
**▶️ چه بزن:** دکمه‌ی «چاپِ آزمایشی»
**👀 باید چه ببینی:** همان فیشِ تمیزی که روی لینوکس دیدی.
**🆘 اگر نشد:** «کپیِ گزارش» را بزن و متنش را برایم بفرست. مسیرِ ویندوزی تنها چیزی است که هنوز امتحان نشده، پس اگر جایی بشکند همین‌جاست.

<br>

---

<br>

## ❓ تصمیم‌های با تو

**۱. برای ساختِ فایلِ نصبیِ واقعی (`.exe`)، `wine` را نصب کنم؟**
   - 🟢 **پیشنهادِ من:** بله، ولی **بعد از** اینکه تستِ ویندوز را با همین نسخه‌ی قابلِ حمل انجام دادی. نصبش یک دستور است و باید خودت بزنی چون رمزِ مدیر می‌خواهد: `sudo apt install wine64`. بعدش من دوباره `npm run electron:build:win` را می‌زنم و فایلِ نصبی ساخته می‌شود.
   - ⚪ **گزینه‌ی دیگر:** بیلدِ نهایی را روی خودِ ویندوز بگیری — آنجا هیچ ابزارِ اضافه‌ای لازم نیست.
   - 📌 **اگر جواب ندهی:** فقط نسخه‌ی قابلِ حمل داری، که برای تست کافی است ولی برای تحویل به مشتری مناسب نیست.

**۲. ظاهرِ فیشِ چاپ‌شده چطور بود — حروف تیز بودند یا محو؟**
   - 🟢 **پیشنهادِ من:** الان که چاپِ موفق داری، یک نگاهِ دقیق به فیش بینداز. اگر همه‌چیز خوانا بود، تمام. اگر محو یا خیلی سیاه بود بگو — هر کدام یک عدد است و در چند دقیقه تنظیم می‌شود.
   - 📌 **اگر جواب ندهی:** با تنظیماتِ فعلی جلو می‌رویم.

**۳. پرینتر ۸۰ میلی‌متری است یا ۵۸ میلی‌متری؟**
   - 🟢 **پیشنهادِ من:** چون فیش درست و اندازه درآمد، تقریباً مطمئنم **۸۰ میلی‌متری** است (فرضِ من همین بود). فقط تأیید کن.
   - 📌 **اگر جواب ندهی:** روی همین می‌ماند.

**۴. عکسی که برایم فرستادی هنوز در پوشه‌ی پروژه است.**
   - 🟢 **پیشنهادِ من:** پاکش کن یا از پروژه ببرش بیرون — وگرنه در اولین `git commit` وارد تاریخچه‌ی پروژه می‌شود و دیگر به‌راحتی بیرون نمی‌آید. نامش: `Screenshot from 2026-09-22 02-09-37.png`. خودم پاکش نکردم چون فایلِ توست.
   - 📌 **اگر جواب ندهی:** همان‌جا می‌ماند و احتمالاً commit می‌شود.

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ ضمناً <b>۵ سؤالِ قدیمی‌تر</b> هنوز در <code>pending.md</code> منتظرند — مهم‌ترینشان <b>آیکنِ برنامه</b> است که حالا وقتِ خوبی برای تصمیم‌گیری‌اش است، چون به‌هرحال باید یک بیلدِ نهاییِ دیگر بگیری.</div>

<br>

---

<br>

## 📋 خلاصه — فقط همین‌ها را انجام بده

**۱. من چه کردم** (تو کاری نداری):
- بررسیِ نهاییِ کد انجام شد و یک ایرادِ واقعی پیدا و رفع شد: دو چاپِ پشتِ‌سرِهم دیگر نمی‌توانند در هم بریزند.
- بیلدهای قبلی پاک شدند و نسخه‌ی تازه‌ی ویندوزی ساخته شد (به‌صورتِ قابلِ حمل، نه فایلِ نصبی — علتش بالا).
- تأیید کردم فایل‌های تازه واقعاً داخلِ بسته‌ی ویندوزی هستند.
- یک گزینه به تنظیماتِ ساخت اضافه شد تا بیلدِ ویندوزی روی لینوکس ممکن باشد.

**۲. تو باید این‌ها را به ترتیب اجرا کنی:**
```bash
# ✅ هیچ دستوری لازم نیست — بیلد از قبل ساخته و آماده است.
# فقط اگر بعداً فایلِ نصبیِ واقعی خواستی، اول این را بزن (رمزِ مدیر می‌خواهد):
sudo apt install wine64
# و بعد به من بگو تا دوباره بیلد بگیرم.
```

**۳. اگر کاری بیرونِ ترمینال مانده:**
- [ ] `release/Yatash-Carwash-win-x64.zip` را روی فلش بریز و به ویندوز ببر.
- [ ] در ویندوز از حالتِ فشرده دربیاور و `Yatash Carwash.exe` را اجرا کن.
- [ ] تنظیمات ← پرینتر و چاپ ← «چاپِ حرارتی» ← پرینتر را انتخاب کن ← «چاپِ آزمایشی».
- [ ] نتیجه را بگو؛ اگر نشد، «کپیِ گزارش» را بفرست.
- [ ] عکسِ `Screenshot from 2026-09-22 02-09-37.png` را از پوشه‌ی پروژه بردار.

<br>

```bash
git add -A && git commit -m "feat(print): driverless thermal (ESC/POS) printing with diagnostics and serialized jobs"
```

**چرا این واژه‌ها؟** `feat` یعنی **قابلیتِ تازه** — چون راهِ چاپِ جدیدی اضافه شده که قبلاً اصلاً وجود نداشت؛ اگر `fix` می‌نوشتم، در تاریخچه به‌نظر می‌آمد فقط یک باگِ کوچک تعمیر شده. `scope` داخلِ پرانتز یعنی «این تغییر کدام بخشِ برنامه را دست زده»؛ اینجا `print` است تا ماه‌ها بعد با یک نگاه معلوم باشد سراغِ کدام قسمت برویم. ادامه‌ی پیام هم دو کارِ فرعی را نام می‌برد: ابزارهای عیب‌یابی و صفِ کارهای چاپ.

⚠️ **قبل از زدنِ این دستور، تکلیفِ آن فایلِ عکس را روشن کن** (سؤالِ ۴ بالا) — وگرنه همراهِ کد وارد تاریخچه‌ی پروژه می‌شود.

</div>
