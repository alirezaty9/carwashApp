<div dir="rtl" align="right">

# ✅ کلید ساخته شد — حالا سه قدمِ آخر تا فعال‌سازی

> جفت‌کلید با موفقیت ساخته شد و کلیدِ عمومیِ نو **خودکار** در برنامه نشست. حالا فقط سه کارِ کوتاه مانده: **پشتیبان از کلید**، **ری‌استارتِ برنامه**، و **صدور + واردکردنِ لایسنس**. این نوبت کدی تغییر ندادم؛ فقط راهنما.

<br>

---

<br>

## قدم ۱ — 🛟 همین حالا از کلیدِ خصوصی پشتیبان بگیر (خیلی مهم)

کلیدِ خصوصی اینجاست: <code>/home/alireza/Desktop/carwash/yatash-private.pem</code>

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ این فایل بارِ قبل گم شد؛ نگذار دوباره اتفاق بیفتد. یک کپی در جای امنِ بیرونِ پروژه بگذار:
<br><br>
<code>cp yatash-private.pem ~/Documents/yatash-private-BACKUP.pem</code>
<br><br>
اگر این کلید را داشته باشی، هر وقت پروژه پاک/جابه‌جا شد فقط کافی است همین فایل را برگردانی — دیگر لازم نیست کلیدِ نو بسازی و مشتری‌ها را از نو فعال کنی.</div>

<br>

---

<br>

## قدم ۲ — 🔄 برنامه را ری‌استارت کن

چون کلیدِ عمومیِ برنامه عوض شده و پروسه‌ی Electron آن را در لحظه‌ی اجرا می‌خوانَد، باید یک‌بار برنامه بسته و باز شود:

۱. در ترمینالی که <code>npm run dev</code> باز است، <code>Ctrl + C</code> بزن تا بسته شود.  
۲. دوباره اجرا کن:
```bash
npm run dev
```

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ اگر این کار را نکنی، برنامه با کلیدِ <b>قدیمی</b> کار می‌کند و لایسنسِ نو را «امضا نامعتبر» می‌بیند.</div>

<br>

---

<br>

## قدم ۳ — 🎫 لایسنس را بساز و وارد کن

**الف) ساختِ لایسنس** (تعاملی — چیزی حفظ نمی‌کنی):
```bash
npm run license:issue
```
وقتی پرسید، جواب بده:
```text
کد دستگاهِ مشتری را وارد کن:  d6535982048782bc91ab04347ee0b744
نام مشتری (اختیاری):          کارواش تست
```
> ✅ فایلِ <code>license.dat</code> در ریشه‌ی پروژه ساخته می‌شود (سالانه، ۳۶۵ روز).

<br>

**ب) واردکردن در برنامه:**

۱. روی لوگو بزن → واردِ پنل شو (رمز: <code>yatash</code>).  
۲. تبِ <b>«لایسنس»</b> → دکمه‌ی <b>«انتخاب و فعال‌سازی»</b>.  
۳. فایلِ <code>license.dat</code> را انتخاب کن.  

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ نتیجه: وضعیت باید به <b>«لایسنسِ فعال — ۳۶۵ روز»</b> تغییر کند.</div>

<br>

---

<br>

## 🛠️ اگر باز هم «امضا نامعتبر» دیدی

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">علتِ محتمل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">راه‌حل</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">برنامه ری‌استارت نشده</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">قدم ۲ را انجام بده (Ctrl+C و دوباره npm run dev)</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">لایسنس با کلیدِ قدیمی ساخته شده</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">دوباره <code>npm run license:issue</code> بزن (حالا با کلیدِ نو امضا می‌شود)</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## 📌 جمع‌بندی

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ خطِ لوله‌ی لایسنس حالا کامل و ساده است: <code>keygen</code> (یک‌بار) → پشتیبان → <code>issue</code> (هر فروش) → واردکردن. بعد از تستِ موفقِ فعال‌سازی، اگر خواستی می‌رویم سراغِ موردهای اختیاری (آیکونِ اپ، امضای کد، یا فاز ۵).</div>

<br>

---

<br>

```bash
git add -A && git commit -m "chore(license): embed generated Ed25519 public key"
```

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>چرا <code>chore</code>؟</b> تنها تغییرِ ماندگارِ این مرحله، جای‌گرفتنِ مقدارِ کلیدِ عمومی در <code>license.cjs</code> است — یک تغییرِ «تنظیماتی/جانبی»، نه قابلیتِ نو (<code>feat</code>) و نه رفعِ باگ (<code>fix</code>). <code>scope</code> داخلِ پرانتز (<code>license</code>) هم می‌گوید این تغییر مربوط به بخشِ لایسنس است. کلیدِ عمومی امن است و رفتنش در گیت اشکالی ندارد.</div>

</div>
