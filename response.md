<div dir="rtl" align="right">

# 🧾 گزارش تغییرات — تخفیف + رنگ قیمت‌ها + placeholder ها

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ هر سه درخواست انجام شد: (۱) اینپوت تخفیف در پایین فرم که از مبلغ کل کم می‌شود، (۲) رنگ قیمت‌ها از آبی/فیروزه‌ای به مشکی تغییر کرد، (۳) placeholder ها معمولی‌تر (نازک‌تر و کوچک‌تر) شدند.</div>

<br>

---

<br>

## ۱) 🧭 اپ چطور کار می‌کند؟

این یک سیستمِ صندوق (POS) کارواش است. جریانِ صدور قبض:

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">لایه</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">فایل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">مسئولیت</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">UI فرم قبض</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">src/components/pos/NewReceipt.tsx</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">گرفتنِ ورودی‌ها (مشتری، تیپ، خدمات، تخفیف) و محاسبه‌ی مبلغ</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">منطق/داده</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">src/data/store.ts</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">ساختِ رکوردِ قبض، محاسبه‌ی نهاییِ مبلغ و ذخیره‌سازی</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">مدلِ داده</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">src/types.ts</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">تعریفِ شکلِ قبض (Receipt)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">چاپ فیش</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">src/components/print/PrintReceipt.tsx</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فیشِ حرارتیِ ۸۰mm هنگام چاپ</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">استایلِ مشترک</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">common.tsx + index.css</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کلاسِ اینپوت‌ها و متغیرهای رنگیِ تم (روشن/تیره)</td>
    </tr>
  </tbody>
</table>

<br>

**مسیر:** کاربر فرم را پر می‌کند → `total` در NewReceipt محاسبه می‌شود → با «ثبت و چاپ»، تابعِ `createReceipt` در store مبلغِ نهایی را دوباره امن محاسبه و قبض را ذخیره می‌کند → قبض به `PrintReceipt` می‌رود و چاپ می‌شود.

<br>

---

<br>

## ۲) 🔧 تک‌تکِ تغییرات

### 🟢 الف) اینپوت تخفیف (پایینِ فرم، بالای دکمه‌ی ثبت)

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">فایل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه شد</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چرا</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">NewReceipt.tsx</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">state جدید <code>discount</code> + فیلدِ «۷) تخفیف» + محاسبه‌ی <code>total = subtotal − discountValue</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مبلغی که کاربر می‌زند از مبلغِ کل کم شود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">store.ts</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>discount</code> به ورودی افزوده شد؛ سمتِ store هم <code>total = subtotal − discount</code> و در قبض ذخیره می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مبلغِ ذخیره‌شده و گزارش‌ها هم درست باشند، نه فقط نمایش</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">types.ts</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فیلدِ اختیاریِ <code>discount?: number</code> به Receipt</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">اختیاری‌بودن یعنی قبض‌های قدیمی بدون خطا کار می‌کنند</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">PrintReceipt.tsx</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">اگر تخفیف باشد، دو ردیفِ «جمع خدمات» و «تخفیف» روی فیش چاپ می‌شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مشتری تخفیفِ اعمال‌شده را روی فیش ببیند</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ محافظت در برابر خطا: تخفیف بین <b>صفر</b> و <b>جمعِ خدمات</b> محدود شده تا مبلغ هرگز منفی نشود. اعداد فارسی هم پشتیبانی می‌شوند (با <code>toEnglishDigits</code> تبدیل می‌شوند).</div>

<br>

**نمونه‌ی عینی:**

```text
جمع خدمات: ۱۵۰٬۰۰۰ تومان
کاربر در اینپوت تخفیف می‌زند: ۲۰۰۰۰
────────────────────────────
مبلغ قابل پرداخت: ۱۳۰٬۰۰۰ تومان
(روی چیپِ مبلغ هم خطِ «جمع خدمات — تخفیف» نمایش داده می‌شود)
```

<br>

### 🟢 ب) رنگِ قیمت‌ها مشکی شد (قبلاً آبی/فیروزه‌ای بود)

در `src/index.css` متغیرِ `--price` (رنگِ متنِ همه‌ی قیمت‌ها) عوض شد:

```css
/* قبل */  --price: #06B6D4;    /* آبیِ فیروزه‌ای */
/* بعد */  --price: var(--text); /* مشکی در تمِ روشن، سفید در تمِ تیره */
```

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ چرا <code>var(--text)</code> و نه مستقیماً <code>#000</code>؟ چون اپ تمِ تیره هم دارد و مشکیِ ثابت در تمِ تیره نامرئی می‌شد. این روش در تمِ روشن مشکی و در تمِ تیره سفید نشان می‌دهد. ته‌رنگِ ملایمِ فیروزه‌ای فقط برای <b>پس‌زمینه‌ی چیپِ مبلغ</b> حفظ شد.</div>

<br>

### 🟢 ج) placeholder ها معمولی شدند

در `src/components/common.tsx` به `inputClass` اضافه شد:

```text
placeholder:font-normal   → نازک به‌جای بولد
placeholder:text-xs        → کمی کوچک‌تر
```

قبلاً placeholder از `font-semibold` و `text-sm`ِ خودِ اینپوت ارث می‌برد و درشت/بولد دیده می‌شد؛ حالا فقط متنِ واقعیِ ورودی بولد است و راهنما ظریف.

<br>

---

<br>

## ۳) ⚖️ جایگزین‌ها و انتخاب

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">تصمیم</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">جایگزین</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چرا این روش</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">تخفیف در store هم اعمال شد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">فقط در UI کم شود</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">اگر فقط UI بود، مبلغِ ذخیره‌شده و گزارشِ درآمد اشتباه می‌شد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>--price: var(--text)</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مشکیِ ثابت <code>#000</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">سازگاری با هر دو تمِ روشن/تیره</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ در این محیط <code>node</code>/<code>bun</code> نصب نبود، پس <code>tsc</code> اجرا نشد. تغییرات از نظر تایپ امن‌اند (همه‌ی فیلدهای جدید اختیاری‌اند). یک‌بار روی سیستمِ خودتان اجرا و بصری بررسی کنید.</div>

<br>

## ۴) 📌 قدم بعدیِ پیشنهادی

- افزودنِ «تخفیفِ درصدی» (مثلاً ۱۰٪) کنارِ تخفیفِ مبلغی.
- ستونِ «تخفیف» در صفحه‌ی گزارش‌ها برای جمعِ کلِ تخفیف‌های داده‌شده.

</div>
