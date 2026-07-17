<div dir="rtl" align="right">

# 🧾 گزارش تغییرات — ساعتِ ریل‌تایم، لوگوی جدید، بوردرِ تیپ و سکشن‌بندی

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ چهار تغییر انجام شد: ساعت واقعاً لحظه‌ای شد، لوگو خفن‌تر شد، پررنگیِ بوردرِ هاورِ تیپ ماشین ملایم شد، و فرمِ قبض به سکشن‌های جدا با خطِ فاصله تقسیم شد.</div>

<br>

---

<br>

## ۱) 🕒 ساعت ریل‌تایم شد (فایل `src/App.tsx`)

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ مشکل: قبلاً تایمر هر <b>۳۰ ثانیه</b> یک‌بار به‌روز می‌شد، برای همین حس می‌شد آپدیت نمی‌شود.</div>

<br>

**راه‌حل:** بازه به <code>۱۰۰۰ms</code> (هر ثانیه) کاهش یافت و <b>ثانیه‌شمار</b> به نمایش اضافه شد تا زنده‌بودنش دیده شود:

```tsx
window.setInterval(tick, 1000);          // به‌جای 30000
timeLabel = `${ساعت}:${دقیقه}:${ثانیه}`; // مثلِ ۱۴:۳۰:۰۵
```

<br>

---

<br>

## ۲) 🚗 لوگوی خفن‌تر

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">قبل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">بعد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">آیکونِ سادهٔ <code>Car</code> روی بَجِ گرادیانی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">آیکونِ <code>CarFront</code> (نمای جلو) + قطرهٔ آب <code>Droplets</code> + جلای شیشه‌ای و سایهٔ عمیق‌تر</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ گرادیانِ بَج سه‌رنگه (فیروزه‌ای→آبی) شد و با یک لایهٔ <code>::after</code> جلای نوریِ بالای بَج اضافه شد (در <code>index.css</code>). قطرهٔ آب حسِ «کارواش/تمیزی» می‌دهد. نشانِ 🛡️/🔒 گوشهٔ لوگو (ورود به پنل) دست‌نخورده ماند.</div>

<br>

---

<br>

## ۳) 🎨 بوردرِ هاورِ تیپ ماشین ملایم شد

در `src/components/pos/NewReceipt.tsx`، رنگِ بوردرِ هاورِ دکمه‌های تیپ از <code>border-strong</code> (شفافیت ۰٫۴۵ = پررنگ) به <code>accent-border</code> (شفافیت ۰٫۳۲ = ملایم) تغییر کرد. فقط همین بخش عوض شد، طبقِ درخواست.

<br>

---

<br>

## ۴) 🧩 سکشن‌بندیِ فرم (بدون تغییر استایلِ فیلدها)

فرمِ قبض به چهار سکشنِ جدا تقسیم شد که با یک <b>خطِ کامل</b> و فاصلهٔ بیشتر (<code>gap-7</code>) از هم جدا می‌شوند:

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">سکشن</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">محتوا</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۱</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">گام‌های ۱، ۲ و ۳ در یک ردیف + پنلِ سوابقِ مشتری</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۲</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">گام ۴ (تیپ ماشین) — تنها</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۳</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">گام ۵ (خدمات) — تنها</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۴</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">گام ۶ و ۷ (کارگر + تخفیف) + توضیحات</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ فقط سه المانِ <code>&lt;div className="border-t border-[var(--border)]"&gt;</code> بین سکشن‌ها اضافه شد و فاصلهٔ فرم از <code>gap-6</code> به <code>gap-7</code> رفت. هیچ استایلی روی خودِ فیلدها تغییر نکرد. بخشِ «جمع و ثبت» هم از قبل خطِ بالایی داشت و به‌عنوان جداکنندهٔ آخر عمل می‌کند.</div>

<br>

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ در این محیط <code>node</code>/<code>bun</code> نبود و <code>tsc</code> اجرا نشد؛ تغییرات امن‌اند. لطفاً بصری چک کن.</div>

</div>
