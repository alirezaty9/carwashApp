<div dir="rtl" align="right">

# 🧾 ابطالِ فاکتورِ لوازم + 🔢 اصلاحِ فونتِ اعداد + 🌫️ بلورِ اسپلش

> یک راهنما و دو اصلاح: **(۱)** جای ابطالِ فاکتورِ فروشِ لوازم را نشانت می‌دهم. **(۲)** چرا اعداد «یه جوری» بودند و چطور درستش کردم. **(۳)** پس‌زمینه‌ی اسپلشِ یاتاش را محوتر و بلورتر کردم.

<br>

---

<br>

## ۱) 🧾 چطور فاکتورِ فروشِ لوازم را ابطال کنم؟

فاکتورِ فروشِ لوازم جدا از قبضِ شست‌وشوست، پس جای ابطالش هم جداست. مسیرِ دقیق:

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">گام</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کار</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۱</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">روی <b>لوگو</b> بزن → واردِ پنل مدیریت شو (رمز: <code>yatash</code>)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۲</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">تبِ <b>«لوازم جانبی»</b> را بزن</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۳</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">زیرتبِ <b>«فروش‌ها»</b> را انتخاب کن (کنارِ «انبار و کالاها»)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۴</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">روی ردیفِ فاکتور، دکمه‌ی <b>✕ قرمز</b> («ابطال») را بزن</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۵</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">علتِ ابطال را بنویس و «تایید ابطال» را بزن</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ نکته‌ی مهم: با ابطالِ فاکتور، <b>موجودیِ کالاها دوباره به انبار برمی‌گردد</b> (مثلاً اگر ۲ خوشبوکننده فروخته بودی، ۲ عدد به موجودی اضافه می‌شود). فاکتورِ باطل‌شده با خطِ قرمز و برچسبِ «باطل» می‌ماند (پاک نمی‌شود، برای سابقه).</div>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ همان‌جا در «فروش‌ها» می‌توانی جستجو کنی (شماره فاکتور، نامِ کالا، تلفن) و فاکتور را دوباره <b>چاپ</b> کنی.</div>

<br>

---

<br>

## ۲) 🔢 چرا اعداد «یه جوری» بودند؟ (و اصلاحش)

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>ریشه‌ی مشکل:</b> اعداد کلاسِ <code>font-mono</code> داشتند و در تنظیماتِ فونت، «فالبکِ» آن روی <b>مونواسپیس</b> بود. مونواسپیس یعنی فونتِ تایپ‌رایتری/کدنویسی (شبیهِ Courier) که همه‌ی کاراکترها هم‌عرض‌اند. اگر به هر دلیلی وزیرمتن برای اعداد لود نمی‌شد، عددها به آن فونتِ زشتِ مونواسپیس می‌افتادند — و «یه جوری» دیده می‌شدند.</div>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>نکته:</b> وزیرمتن اصلاً فونتِ مونواسپیس نیست؛ یک فونتِ «سنس» (معمولی) است. پس گذاشتنِ فالبکِ مونواسپیس از اول اشتباه بود.</div>

<br>

**چه کردم:** فالبکِ فونتِ اعداد را از مونواسپیس به **سنس** تغییر دادم:

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">قبل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">بعد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>"Vazirmatn", ui-monospace, monospace</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>"Vazirmatn", ui-sans-serif, system-ui, sans-serif</code></td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ نتیجه: اعداد <b>همیشه وزیرمتن</b> هستند؛ و اگر یک‌بار وزیر لود نشد، به‌جای Courierِ زشت، یک فونتِ سنسِ تمیز (هم‌شکلِ متن) می‌آید. هم‌ترازیِ ستون‌های عددی در جدول‌ها هم حفظ شد (<code>tabular-nums</code> دست‌نخورده ماند).</div>

<br>

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ اگر بعد از این باز هم اعداد فرق داشتند، یعنی احتمالاً فایل‌های فونتِ وزیر روی سیستمِ تو لود نمی‌شوند. برای مطمئن‌شدن، در برنامه <code>Ctrl+Shift+R</code> بزن (ری‌فرشِ کامل) و اگر باز هم بود بگو تا مسیرِ لودِ فونت را با هم بررسی کنیم.</div>

<br>

---

<br>

## ۳) 🌫️ اسپلشِ یاتاش — بلورتر و کم‌پیداتر

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ به صفحه‌ی بازشدنِ برنامه دو چیز اضافه کردم: یک <b>backdrop-blur</b> (بلورِ پشت) و یک لایه‌ی <b>تقریباً مات</b> (۹۴٪) روی پس‌زمینه. حالا موقعِ باز شدن، لوگوی یاتاش روی یک زمینه‌ی محو و بلورِ فیروزه‌ای می‌نشیند و برنامه‌ی پشتش تقریباً پیدا نیست.</div>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b><code>backdrop-blur</code> چیست؟</b> 🌍 مثلِ شیشه‌ی مات/بخارگرفته‌ی حمام — چیزی که پشتش است را محو و نرم نشان می‌دهد. 💻 اینجا باعث می‌شود UIِ پشتِ اسپلش تار و کم‌جزئیات دیده شود.</div>

<br>

---

<br>

## ۴) 📦 فایل‌های تغییرکرده

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">فایل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه شد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/index.css</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فالبکِ فونتِ اعداد از مونواسپیس به سنس</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/components/brand/SplashScreen.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">بلورِ پشت + لایه‌ی مات برای کم‌پیداییِ پس‌زمینه</td>
    </tr>
  </tbody>
</table>

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ ابطالِ فاکتور نیازی به تغییرِ کد نداشت؛ از قبل ساخته شده بود، فقط جایش را نشانت دادم.</div>

<br>

---

<br>

## ۵) 👀 امتحان

```bash
npm run dev
```
> اسپلش را موقعِ باز شدن ببین (بلورتر شده)، و به اعداد در گزارش‌ها/قبض نگاه کن (باید تمیزتر و هم‌شکلِ متن باشند).

<br>

---

<br>

```bash
git add -A && git commit -m "fix(ui): use sans fallback for numeric font and strengthen splash blur"
```

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>چرا <code>fix</code>؟</b> بخشِ اصلی، <b>رفعِ یک عیبِ ظاهری</b> است (افتادنِ اعداد به فونتِ مونواسپیسِ نامناسب)، پس <code>fix</code> درست است نه <code>style</code> (که برای تغییرِ سلیقه‌ایِ ظاهر است، نه رفعِ خرابی). <code>scope</code> برابرِ <code>ui</code> چون تغییر در لایه‌ی رابط کاربری است.</div>

</div>
