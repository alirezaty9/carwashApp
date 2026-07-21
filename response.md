<div dir="rtl" align="right">

# 🔵 فاز ۲ انجام شد — برندینگ یاتاش (وایت‌لیبل)

> برندِ سازنده «یاتاش» به‌شکلِ حرفه‌ای و ثابت به برنامه اضافه شد: **اسپلش‌اسکرینِ باز شدن، واترمارکِ ملایمِ پس‌زمینه، فوترِ «قدرت‌گرفته از یاتاش»، خطِ برند روی فاکتورهای چاپی و عنوانِ تبِ مرورگر.** نامِ خودِ کارواش (در تنظیمات) دست‌نخورده و جدا ماند.

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ <b>لوگو موقتی است:</b> چون لوگو/رنگِ رسمیِ یاتاش را نداشتم، یک لوگوی <b>متنیِ SVG تمیز</b> (قطره‌ی آب در نشانِ فیروزه‌ای) ساختم و همه‌ی رنگ/نام را در یک فایلِ <code>src/brand.ts</code> متمرکز کردم. هر وقت لوگوی واقعی را دادی، فقط همان یک فایل عوض می‌شود و کلِ برنامه هماهنگ به‌روز می‌شود.</div>

<br>

---

<br>

## ۱) 🎯 مفهومِ «وایت‌لیبل» که پیاده شد

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ دو «هویت» در برنامه از هم جدا شدند: <b>سازنده</b> (یاتاش، ثابت، همه‌جا) و <b>مشتری</b> (نامِ کارواش، در تنظیماتِ هر کارواش). این‌طوری یاتاش می‌تواند همین یک نرم‌افزار را به هر کارواش بفروشد؛ برندِ یاتاش می‌ماند ولی بالای قبضِ هرکس نامِ مغازه‌ی خودش است.</div>

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">جا</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه چیزی نشان داده می‌شود</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کدام هویت</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">هدرِ بالای صفحه</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">نامِ کارواش (<code>config.shopName</code>)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مشتری</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">اسپلش هنگام باز شدن</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">لوگو + «یاتاش» + شعار</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">سازنده</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">پس‌زمینه</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">واترمارکِ محوِ یاتاش</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">سازنده</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">فوتر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">نامِ کارواش + «قدرت‌گرفته از یاتاش»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">هر دو</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">فاکتورِ چاپی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">نامِ کارواش بالا + خطِ «قدرت‌گرفته از یاتاش» پایین</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">هر دو</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۲) 📦 تک‌تکِ تغییرات (فایل به فایل)

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
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/brand.ts</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🆕 جدید</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">تنها منبعِ حقیقتِ برند: نام (فا/en)، شعار، متنِ «قدرت‌گرفته از»، رنگ‌های گرادیانِ لوگو</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>components/brand/YatashLogo.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🆕 جدید</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">دو کامپوننت: <code>YatashMark</code> (نشانِ SVG قطره) و <code>YatashLogo</code> (نشان + وردمارک)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>components/brand/SplashScreen.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🆕 جدید</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">اسپلشِ باز شدن؛ بعد از ~۱٫۹ ثانیه محو و از DOM حذف می‌شود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>components/brand/BrandWatermark.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🆕 جدید</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">واترمارکِ ثابتِ پس‌زمینه (بسیار کم‌رنگ، بدونِ تداخل با کلیک)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/App.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✏️ تغییر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">رندرِ اسپلش و واترمارک؛ بازطراحیِ فوتر با نشانِ یاتاش</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>print/PrintReceipt.tsx</code> و <code>PrintSale.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✏️ تغییر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">خطِ «قدرت‌گرفته از یاتاش · YATASH» در پایینِ فاکتور</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/index.css</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✏️ تغییر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">دو انیمیشنِ اسپلش (<code>cw-splash-in</code> / <code>cw-splash-out</code>)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>index.html</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✏️ تغییر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">عنوانِ تب: «یاتاش | سامانه مدیریت کارواش» + <code>lang="fa" dir="rtl"</code></td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۳) 💡 چند نکته‌ی فنیِ ظریف

### ۳.۱) چرا همه‌چیز در `brand.ts` متمرکز شد؟

اصلِ **DRY** (پرهیز از تکرار): نامِ «یاتاش»، رنگ و شعار در ۵ جا استفاده می‌شوند. اگر هرکدام را دستی می‌نوشتم، تغییرِ برند یعنی گشتن در کلِ کد. حالا:

```ts
// فقط این را عوض کن، همه‌جا به‌روز می‌شود
export const BRAND = { nameFa: 'یاتاش', gradientFrom: '#22D3EE', ... };
```

<br>

### ۳.۲) واترمارک چطور مزاحمِ کار نمی‌شود؟

سه ترفند: `fixed inset-0 -z-10` (پشتِ محتوا)، `pointer-events-none` (کلیک از آن رد می‌شود و به دکمه‌ی زیرش می‌رسد)، و `opacity` حدودِ ۰٪–۴٪ (فقط ته‌رنگ). کلاسِ `no-print` هم دارد تا در چاپ ظاهر نشود.

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b><code>pointer-events: none</code> چیست؟</b> 🌍 مثلِ یک شیشه‌ی نامرئی که دستت از آن رد می‌شود — می‌بینی‌اش ولی نمی‌گیردت. 💻 اینجا باعث می‌شود واترمارک فقط دیده شود ولی جلوی کلیکِ دکمه‌های زیرش را نگیرد.</div>

<br>

### ۳.۳) اسپلش چطور فقط یک‌بار و تمیز می‌رود؟

با `useState` + `useEffect` + `setTimeout`: بعد از ۱٫۹ ثانیه `gone=true` می‌شود و کامپوننت `null` برمی‌گرداند (از DOM حذف). انیمیشنِ محو در CSS با `animation-delay` هماهنگ است تا اول نرم محو شود، بعد حذف.

<br>

### ۳.۴) لوگو چرا SVG است نه عکس؟

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>SVG</b> تصویرِ «برداری» است (با فرمول رسم می‌شود، نه پیکسل). 🌍 مثلِ نقاشی با خط‌کش و پرگار به‌جای موزاییک — هرچقدر بزرگش کنی تار نمی‌شود. 💻 پس همین یک لوگو هم در اسپلشِ ۹۶ پیکسلی تیز است، هم در فوترِ ۱۴ پیکسلی، بدونِ فایلِ عکسِ اضافه.</div>

<br>

---

<br>

## ۴) ⚙️ چطور برند را با لوگوی واقعیِ یاتاش عوض کنیم؟

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">می‌خواهی...</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">کجا</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">رنگِ لوگو را عوض کنی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>brand.ts</code> → <code>gradientFrom</code> / <code>gradientTo</code></td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">نام/شعار را عوض کنی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>brand.ts</code> → <code>nameFa</code> / <code>taglineFa</code></td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">خودِ شکلِ لوگو را عوض کنی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>YatashLogo.tsx</code> → <code>&lt;path&gt;</code> داخلِ <code>YatashMark</code> (یا فایلِ SVG واقعی را جایگزین کن)</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۵) 📌 قدم بعدی

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ اول با <code>! npm run dev</code> ببین اسپلش/واترمارک/فوتر به سلیقه‌ات هست یا نه (شدت واترمارک، سرعت اسپلش، رنگ). اگر لوگوی واقعیِ یاتاش را داری بفرست تا جایگزین کنم.</div>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ بعد از تأیید، می‌رویم <b>فاز ۳ (Electron + نصبِ ویندوز)</b> — سنگین‌ترین فازِ زیرساختی: بسته‌بندیِ اپ به <code>.exe</code> و مهاجرتِ ذخیره‌سازی. آن‌جا چون فایل‌های پیکربندیِ سیستمی اضافه می‌شود، قبلش دقیق توضیح می‌دهم.</div>

<br>

---

<br>

```bash
git add -A && git commit -m "feat: add Yatash branding (splash, watermark, footer, SVG logo, receipt brand line)"
```

</div>
