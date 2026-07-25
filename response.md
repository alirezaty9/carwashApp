<div dir="rtl" align="right">

# 🎨 بهترکردنِ UI بخشِ «کاربران و دسترسی»

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:10px 14px;border-radius:6px">
✅ UI این بخش را کاملاً بازچینش کردم. مشکل این بود که همه‌چیز در <b>یک ردیفِ افقیِ شلوغ</b> با <code>flex-wrap</code> چپانده شده بود و موقعِ شکستنِ خط به‌هم می‌ریخت («یه جوری» بود). حالا هر کاربر یک <b>کارتِ تمیزِ دو‌طبقه</b> با آواتارِ نقش، نامِ برجسته، و کنترل‌های برچسب‌دار است. فقط فایلِ <code>UsersManager.tsx</code> تغییر کرد — منطق و داده دست‌نخورده.
</div>

<br>

---

<br>

## ۱) 🧭 مشکلِ UI قبلی دقیقاً چه بود؟

هر کاربر یک ردیفِ افقی بود که این‌همه چیز را کنارِ هم می‌چید: آیکن + ورودیِ نام + ورودیِ رمز + منوی نقش + دکمه‌ی فعال + برچسب «(شما)» + دکمه‌ی حذف.

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">ایراد</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چرا بد بود</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۷ عنصر در یک خط</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">در عرضِ کم، <code>flex-wrap</code> عناصر را نامرتب می‌شکست؛ رمز می‌افتاد زیرِ نام، دکمه‌ها جابه‌جا می‌شدند</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">بدونِ سلسله‌مراتب</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">نام (مهم) و رمز (فرعی) هم‌اندازه و هم‌وزن بودند؛ چشم نمی‌دانست کجا را نگاه کند</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">بدونِ برچسب</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">دو ورودیِ متنیِ کنارِ هم بودند بی هیچ لیبلی؛ معلوم نبود کدام «نام» است کدام «رمز»</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">نقش با <code>&lt;select&gt;</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">برای فقط ۲ گزینه، منوی کشویی کلیکِ اضافه می‌خواهد و نقشِ فعلی سریع دیده نمی‌شود</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۲) 🖼️ طراحیِ جدید — کارتِ دو‌طبقه

هر کاربر حالا یک کارتِ مستقل است با دو طبقه که با یک خط از هم جدا شده‌اند:

```text
┌──────────────────────────────────────────────────────────┐
│  ┌────┐                                                    │
│  │ 🛡️ │  ماهان                              [ ⏻ فعال ]     │  ← طبقه‌ی ۱: هویت
│  └────┘  مدیر — دسترسی کامل  [شما]                          │
│  ────────────────────────────────────────────────────────  │
│  رمز عبور              نقش                                  │  ← طبقه‌ی ۲: اعتبارنامه
│  [ •••••••  👁 ]      [ صندوقدار | مدیر ]      [ 🗑 حذف ]   │
└──────────────────────────────────────────────────────────┘
```

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">بخش</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چه چیزی و چرا</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">🟦 آواتارِ نقش</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">مربعِ رنگیِ گوشه‌گرد با آیکن: مدیر = سپرِ آبی (<code>accent</code>)، صندوقدار = آدمکِ خاکستری. با یک نگاه نقش معلوم است</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">نامِ برجسته</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">ورودیِ نام حالا بزرگ و بولد و بی‌کادر است (شبیهِ عنوان)؛ با hover و focus روشن می‌شود که «قابلِ ویرایش» است</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">زیرنویسِ نقش</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">زیرِ نام یک خطِ کوچک: «مدیر — دسترسی کامل» یا «صندوقدار — فقط صندوق»؛ کاربر بدونِ حدس می‌فهمد این نقش چه اجازه‌ای دارد</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">برچسبِ «شما»</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">از متنِ خالی به یک نشانِ رنگیِ کوچک تبدیل شد تا کاربرِ فعلی سریع پیدا شود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">⏻ دکمه‌ی وضعیت</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">با آیکنِ <code>Power</code>؛ فعال = سبز، غیرفعال = خاکستری. کارتِ غیرفعال کل‌اش کم‌رنگ (<code>opacity</code>) می‌شود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">رمز + نقش (برچسب‌دار)</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">در طبقه‌ی دوم، هرکدام لیبلِ کوچکِ خودش را دارد؛ دیگر ابهامی نیست</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۳) 🔀 انتخابگرِ نقش: از `select` به «سگمنت» (دو دکمه)

منوی کشوی نقش را با یک **کنترلِ سگمنتی** (دو دکمه‌ی چسبیده) جایگزین کردم — کامپوننتِ کوچکِ `RoleSegment` که هم در فرمِ افزودن و هم در هر کارت استفاده می‌شود (DRY).

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:10px 14px;border-radius:6px">
ℹ️ <b>سگمنت (segmented control) چیست؟</b> یک ردیف از دو-سه دکمه‌ی چسبیده که فقط یکی‌شان «روشن» است — مثلِ کلیدِ چراغِ چند‌حالته. برای گزینه‌های کم (۲ تا ۳ تا) از منوی کشویی بهتر است چون: ۱) گزینه‌ها همیشه دیده می‌شوند، ۲) با یک کلیک عوض می‌شود نه دو کلیک، ۳) نقشِ فعلی برجسته و واضح است. در پروژه‌ی تو دقیقاً همان استایلِ <code>cw-primary</code> (دکمه‌ی اصلی) را برای حالتِ فعال به ارث می‌برد تا با بقیه‌ی اپ یکدست بماند.
</div>

<br>

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:10px 14px;border-radius:6px">
✅ <b>بهبودِ ظریفِ نگهبان:</b> اگر کاربری «آخرین مدیرِ فعال» باشد، دکمه‌ی «صندوقدار» در سگمنتِ او <b>خاکستری و غیرفعال</b> می‌شود (با راهنمای «آخرین مدیرِ فعال»). یعنی کاربر جلوی چشمش می‌بیند که نمی‌شود — نه اینکه کلیک کند و بعد پیامِ خطا بگیرد. البته منطقِ اصلیِ نگهبان همچنان در <code>store.ts</code> هست (این فقط لایه‌ی UI است، نه جایگزینِ امنیت).
</div>

<br>

---

<br>

## ۴) ➕ فرمِ «افزودنِ کاربر» تمیزتر شد

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">قبل</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">بعد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">۴ ستونِ فشرده در یک خط، بدونِ عنوان</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">کارتِ جدا با هدرِ «➕ افزودنِ کاربرِ جدید»؛ نام و رمز کنارِ هم، نقش به‌صورتِ سگمنتِ تمام‌عرض زیرشان</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">فقط با کلیکِ دکمه اضافه می‌شد</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">با زدنِ <b>Enter</b> در فیلدِ نام یا رمز هم اضافه می‌شود (سریع‌تر)</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۵) 🧩 چه چیزهایی را رعایت کردم؟

- **بدونِ کتابخانه‌ی جدید:** فقط از همان توکن‌های رنگیِ تمِ پروژه (<code>--accent-*</code>، <code>--money-*</code>، <code>--danger-*</code>، <code>--surface</code>، ...) و کامپوننت‌های موجود (<code>SectionCard</code>، <code>inputClass</code>، <code>PrimaryButton</code>) استفاده کردم؛ پس تمِ تیره/روشن خودکار درست می‌ماند.
- **آیکنِ تازه:** فقط یک آیکنِ جدید از همان <code>lucide-react</code> اضافه شد: <code>Power</code> (برای دکمه‌ی فعال/غیرفعال). <code>lucide-react</code> همان کتابخانه‌ی آیکنِ فعلیِ پروژه است.
- **DRY:** منطقِ انتخابِ نقش در یک کامپوننتِ کوچک (<code>RoleSegment</code>) جمع شد و دو جا استفاده می‌شود.
- **a11y (دسترس‌پذیری):** روی ورودیِ نام <code>aria-label</code> گذاشتم (چون لیبلِ دیداری ندارد) و دکمه‌ها <code>title</code> دارند.

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:10px 14px;border-radius:6px">
⚠️ <b>یک نکته درباره‌ی بررسی:</b> در این محیط <code>node</code> نصب نبود، برای همین نتوانستم <code>tsc</code> یا تست‌ها را اجرا کنم. ولی امضای توابعِ <code>store</code> را چک کردم: <code>setUserRole</code>/<code>toggleUser</code>/<code>removeUser</code> هر سه <code>boolean</code> برمی‌گردانند و دقیقاً همان‌ها را در <code>guarded()</code> می‌پیچم — پس منطق سالم است. کدِ store دست‌نخورده ماند. برای اطمینانِ کامل روی دستگاهِ خودت یک بار <code>! npm run build</code> بگیر.
</div>

<br>

---

<br>

## ۶) 🚀 چطور ببینم؟

با **مدیر / `yatash`** وارد شو → پنل → تبِ **«کاربران»**. حالا باید کارت‌های تمیز با آواتارِ نقش و سگمنتِ «صندوقدار | مدیر» ببینی. برای ویندوز طبق روال یک بار build بگیر: <code>npm run electron:build:win</code>.

<br>

**فایلِ تغییرکرده:** فقط `src/components/admin/UsersManager.tsx`.

<br>

### 📌 دستورِ Git پیشنهادی

```bash
git add -A && git commit -m "style(users): redesign users & access panel with two-tier cards and segmented role control"
```

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:10px 14px;border-radius:6px">
🧠 <b>چرا این واژه‌ها؟</b> پیشوندِ <code>style</code> است چون تغییر فقط <b>ظاهری/UI</b> بود و <b>رفتار و منطقِ برنامه عوض نشد</b> (کاربران همان‌طور ساخته/حذف می‌شوند، نگهبانِ آخرین‌ادمین همان است). اگر قابلیتِ تازه‌ای اضافه کرده بودم <code>feat</code> می‌شد، و اگر باگی رفع کرده بودم <code>fix</code>. <code>scope</code> برابرِ <code>users</code> است تا مشخص کند این بازطراحی مربوط به بخشِ کاربران است، نه کلِ اپ.
</div>

</div>
