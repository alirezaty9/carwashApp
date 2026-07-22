<div dir="rtl" align="right">

# 🗄️ دیتابیس، ظرفیت و کارایی — پاسخِ کامل + صفحه‌بندی

> اول یک نکته‌ی خیلی مهم را صادقانه بگویم: **ما الان اصلاً SQLite استفاده نمی‌کنیم.** ذخیره‌سازیِ فعلی روی `electron-store` (یک فایلِ JSON) است. این را باید روشن کنم چون کلِ جوابِ «ظرفیت» به آن بستگی دارد. بعد دو خواسته‌ات (تاریخچه‌ی ۱۰تایی + صفحه‌بندی) را که پیاده کردم توضیح می‌دهم.

<br>

---

<br>

## ۱) 🔴 تصحیحِ مهم: الان روی چه چیزی ذخیره می‌کنیم؟

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ در فاز ۳ تصمیم گرفتیم فعلاً با <b>electron-store</b> (فایلِ JSON) شروع کنیم، نه SQLite. پس سؤالِ «SQLite چقدر گنجایش دارد» فعلاً موضوعیت ندارد — ما رویش نیستیم. اگر بعداً مهاجرت کنیم، آن‌وقت آن جواب مهم می‌شود (پایین برایت گفتم).</div>

<br>

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">ویژگی</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">electron-store (الان)</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">SQLite (احتمالِ آینده)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">شکلِ ذخیره</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">یک فایلِ JSON</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">دیتابیسِ واقعی (جدول‌ها)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">خواندنِ داده</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><b>کلِ داده</b> در حافظه بارگذاری می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فقط همان چیزی که کوئری می‌زنی</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">جست‌وجو</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">در حافظه با <code>.filter()</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">با SQL و ایندکس (خیلی سریع)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">ذخیره‌ی هر رکورد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><b>کلِ فایل</b> دوباره نوشته می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فقط همان ردیف</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۲) 🚦 کارایی الان: تا چند رکورد کند نمی‌شود؟

دو گلوگاهِ واقعی داریم (نه خودِ جست‌وجو — آن سریع است):

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">گلوگاه</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چرا کند می‌شود</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">راه‌حل</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۱) رندرِ لیستِ بلند</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مرورگر نمی‌تواند ۱۰۰۰ ردیفِ جدول را یک‌جا روان بکشد → لگ</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✅ <b>صفحه‌بندی</b> (همین حالا اضافه شد)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۲) نوشتنِ فایل روی هر ثبت</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">با ۱۰هزار+ رکورد، فایلِ JSON چند مگابایت می‌شود و هر «ثبتِ قبض» کندتر می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مهاجرت به SQLite (وقتی داده خیلی زیاد شد)</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>عددِ تقریبی (نه دقیق):</b> جست‌وجو در حافظه حتی روی <b>ده‌ها هزار</b> رکورد در چند میلی‌ثانیه انجام می‌شود؛ مشکلی نیست. مشکلِ محسوس از جایی شروع می‌شود که فایلِ JSON بزرگ شود:
<br>• 🟢 <b>تا چند هزار رکورد:</b> کاملاً روان (یک کارواشِ معمولی ۱–۲ سال).
<br>• 🟡 <b>حدود ۱۰ تا ۳۰ هزار:</b> ثبتِ قبض کمی سنگین‌تر، حافظه‌ی بیشتر.
<br>• 🔴 <b>بالای ~۵۰ هزار:</b> وقتِ مهاجرت به SQLite است.</div>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>«رندر» چیست؟</b> یعنی «کشیدنِ عناصر روی صفحه». 🌍 مثلِ نقاشی‌کردنِ ۱۰۰۰ ردیفِ جدول با دست — طول می‌کشد. صفحه‌بندی یعنی هر بار فقط ۱۵ ردیف نقاشی شود، پس همیشه سریع است.</div>

<br>

---

<br>

## ۳) ✅ چه چیزی همین حالا اضافه شد

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">مورد</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">توضیح</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">صفحه‌بندیِ تاریخچه‌ی قبوض</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">هر صفحه ۱۵ ردیف؛ دکمه‌های «قبلی/بعدی» + شماره‌ی صفحه</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">صفحه‌بندیِ فروشِ لوازم</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">همان الگو در تاریخچه‌ی فروش</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">تاریخچه‌ی مشتری</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">هنگام زدنِ شماره، تا <b>۱۰</b> قبضِ اخیر نشان داده می‌شود (با اسکرول)</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ با تغییرِ فیلتر/جست‌وجو، خودکار به صفحه‌ی ۱ برمی‌گردد تا خارج از محدوده نمانی. یک کامپوننتِ مشترکِ <code>Pagination</code> ساختم که هر دو لیست از آن استفاده می‌کنند (پرهیز از کدِ تکراری).</div>

<br>

---

<br>

## ۴) 📚 اگر روزی به SQLite مهاجرت کنیم، ظرفیتش چقدر است؟

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>SQLite</b> یک دیتابیسِ کاملِ داخلِ یک فایل است (بدونِ سرورِ جدا). 💻 برای این اپ عملاً <b>ظرفیتش بی‌نهایت</b> است:</div>

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">سؤال</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">جواب</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">حداکثر حجمِ دیتابیس</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">تا حدودِ ۲۸۱ ترابایت (نظری) — برای کارواش یعنی هیچ‌وقت پُر نمی‌شود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">میلیون‌ها قبض کند نمی‌شود؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">نه، اگر روی <code>customerPhone</code> و تاریخ <b>ایندکس</b> بگذاریم، جست‌وجو در میلی‌ثانیه است</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">چرا سریع می‌ماند؟</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">چون فقط ردیف‌های موردنیاز را می‌خواند (نه کلِ فایل) و حافظه کم می‌ماند</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>«ایندکس» چیست؟</b> 🌍 مثلِ فهرستِ الفباییِ تهِ یک کتاب — به‌جای ورق‌زدنِ کلِ کتاب برای پیداکردنِ یک اسم، مستقیم می‌روی سرِ صفحه. 💻 دیتابیس با ایندکس، مشتری با شماره‌ی X را فوری پیدا می‌کند بدونِ خواندنِ همه‌ی قبض‌ها.</div>

<br>

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ <b>صداقتِ فنی:</b> مهاجرت به SQLite فقط «عوض‌کردنِ فایل» نیست. الان کلِ داده در حافظه بارگذاری و با <code>.filter()</code> جست‌وجو می‌شود. برای گرفتنِ سودِ واقعیِ SQLite، باید نحوه‌ی خواندنِ داده هم عوض شود (به‌جای «همه را بیاور»، «فقط این صفحه/این مشتری را کوئری بزن»). این یک فازِ جداست؛ هر وقت داده‌ات به مرزِ 🔴 رسید، انجامش می‌دهیم.</div>

<br>

---

<br>

## ۵) 💡 توصیه‌ی من (بدونِ مهندسیِ زیادی)

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ فعلاً <b>electron-store + صفحه‌بندی</b> برای یک کارواشِ معمولی <b>سال‌ها</b> کافی است؛ الان مهاجرت زودهنگام است. علائمی که می‌گویند «وقتِ SQLite شده»: ثبتِ قبض محسوس کند شود، یا داده از چند ده‌هزار رکورد بگذرد. آن موقع بگو تا مهاجرت را به‌عنوان یک فاز انجام دهیم (لایه‌ی ذخیره‌سازی‌مان از قبل برای این جداسازی طراحی شده).</div>

<br>

---

<br>

## ۶) 📦 فایل‌های تغییرکرده

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">فایل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه شد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>components/common.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کامپوننتِ مشترکِ <code>Pagination</code></td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>pos/History.tsx</code> · <code>admin/SalesHistory.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">صفحه‌بندی (۱۵ ردیف در هر صفحه) + ریست به صفحه ۱ با تغییرِ فیلتر</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>pos/NewReceipt.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">تاریخچه‌ی مشتری از ۴ به ۱۰ (با اسکرول)</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

```bash
git add -A && git commit -m "feat(history): paginate history lists and show up to 10 customer receipts"
```

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>چرا <code>feat</code>؟</b> صفحه‌بندی یک قابلیتِ جدیدِ کاربری است (کنترل‌های قبلی/بعدی) که تجربه را هم بهتر می‌کند. می‌شد <code>perf</code> هم گذاشت چون به کارایی کمک می‌کند، ولی چون چیزی که کاربر می‌بیند و با آن کار می‌کند اضافه شده، <code>feat</code> دقیق‌تر است. <code>scope</code> برابرِ <code>history</code> چون تغییرها حولِ لیست‌های تاریخچه‌اند.</div>

</div>
