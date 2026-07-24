<div dir="rtl" align="right">

# ✅ تستِ لایسنس موفق بود — چراغ سبزِ تحویل

<br>

آفرین 👏 اینکه تریال ۷روزه بود و بعد از واردکردنِ فایلِ لایسنس **یک‌ساله** شد، یعنی کلِ زنجیره درست کار می‌کند. این مهم‌ترین موردِ باقی‌مانده بود و حالا **تأیید شد**.

<br>

---

<br>

## ۱) 🧭 این تستِ موفق دقیقاً چه چیزی را ثابت کرد؟

وقتی تریال به یک‌ساله تبدیل شد، یعنی همه‌ی این مراحل **بی‌عیب** اجرا شدند:

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">مرحله</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه چیزی تأیید شد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">جفت‌بودنِ کلیدها</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کلیدِ عمومیِ داخلِ اپ با کلیدِ خصوصیِ <code>yatash-private.pem</code> جفت است — وگرنه امضا رد می‌شد.</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">تأییدِ امضا (Ed25519)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">امضای فایلِ لایسنس معتبر شناخته شد.</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">گرهِ دستگاه</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">شناسه‌ی دستگاهِ داخلِ فایل با machineIdِ همین سیستم خواند.</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">سوییچِ وضعیت</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">اپ از حالتِ <code>trial</code> به <code>licensed</code> رفت و تاریخِ انقضا یک‌ساله شد.</td>
    </tr>
  </tbody>
</table>

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">
✅ <b>یعنی آخرین موردِ بحرانی هم بسته شد.</b> دیگر ریسکی که «لایسنسِ همه‌ی مشتری‌ها رد شود» وجود ندارد.
</div>

<br>

---

<br>

## ۲) 📋 وضعیتِ کلی — همه‌ی کارهای این چند نوبت

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">مورد</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">وضعیت</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">باگِ «NaN تومان» در ورودی‌های عددی</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 رفع</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">قبض/فروشِ تکراری با دوبار-کلیک</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 رفع</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">«شروع شماره‌ی قبض» بی‌اثر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 رفع</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">آلودگیِ داده با بکاپِ خراب</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 رفع</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">قفل‌شدنِ لایسنس با تغییرِ کارت‌شبکه</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 پایدارتر</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">خطای بارگذاری وقتی سرورِ توسعه بالا نیست</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 محافظ اضافه شد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">ریستِ تریال با حذف/نصبِ دوباره</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 لنگرِ پایدار</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">درستیِ کلیدِ لایسنس</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 تست شد و اوکی بود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">بیلدِ ویندوز + لینوکس</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟢 تنظیم شد</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۳) 🚀 چک‌لیستِ نهاییِ قبل از دادن به مشتری

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">
ℹ️ گردشِ کارِ فروش به هر مشتری، این چند قدمِ ساده است:
</div>

<br>

**۱) بیلد بگیر** (هر سیستم روی خودش):

```bash
npm install
npm run electron:build:win      # روی ویندوز → release/Yatash Carwash Setup x.x.x.exe
npm run electron:build:linux    # روی لینوکس → release/*.AppImage و *.deb
```

**۲) نصب روی سیستمِ مشتری** → اپ با **تریالِ ۷روزه** باز می‌شود.

**۳) شناسه‌ی دستگاه را از مشتری بگیر** (اپ در صفحه‌ی لایسنس نشانش می‌دهد).

**۴) لایسنسِ سالانه صادر کن** و فایلش را بده مشتری تا وارد کند:

```bash
npm run license:issue    # machineIdِ مشتری و نامش را می‌پرسد → license.dat
```

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">
✅ همین. مشتری فایل را وارد می‌کند و — دقیقاً مثلِ تستی که تو کردی — اپ یک‌ساله می‌شود.
</div>

<br>

---

<br>

## ۴) 📌 یادآوری‌های کوچک (نه بلاکر)

- 🔵 <b>یک آیکونِ برند</b> (`build/icon.png` ۵۱۲×۵۱۲ و `build/icon.ico`) بگذار تا نصب‌کننده ظاهرِ حرفه‌ای بگیرد.
- 🔵 <b>کلیدِ خصوصی (`yatash-private.pem`) را جای امن نگه دار</b> و از آن بکاپ بگیر — اگر گم شود، دیگر نمی‌توانی برای مشتری‌های فعلی لایسنسِ تمدید صادر کنی. (در بیلد و گیت نمی‌رود؛ چک شده.)
- 🔵 دو موردِ کوچک برای «نسخه‌ی بعد»: هشدارِ خطای ذخیره‌سازی وقتی دیسک پر است، و بازحسابِ ریزِ فیش هنگام ویرایشِ دستیِ مبلغ.

<br>

---

<br>

## 🗂️ تغییرِ کد در این نوبت

هیچ تغییرِ کدی لازم نبود — فقط نتیجه‌ی تستِ موفقِ تو ثبت شد. (حافظه‌ی پروژه هم به‌روز شد تا در نوبت‌های بعد بدانم کلیدِ لایسنس تست‌شده و اوکی است.)

<br>

---

<br>

### 💾 دستورِ Git پیشنهادی

```bash
git add -A && git commit -m "docs: confirm license verification passed; finalize pre-ship notes"
```

**چرا `docs`؟**
- چون در این نوبت **هیچ کدی عوض نشد**؛ فقط مستندات/گزارش (`response.md`) به‌روز شد. برای تغییری که فقط متن/مستندات است، `docs` درست‌ترین پیشوند است — نه `feat` (قابلیتِ جدید نیست) و نه `fix` (باگی رفع نشد).
- اگر بخواهی همه‌ی تغییرهای کدِ نوبت‌های قبل را هم در همین کامیت جمع کنی، بهتر است جدا کامیت کنی؛ ولی اگر همه با هم مانده‌اند، پیشوندِ غالب همان کدِ لایسنس/باگ‌فیکس‌هاست و آن‌وقت `feat`/`fix` مناسب‌تر است.

</div>
