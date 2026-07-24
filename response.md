<div dir="rtl" align="right">

# 🔌 رفعِ خطای `ERR_CONNECTION_REFUSED` هنگام اجرای الکترون

<br>

## ۱) 🧭 اول از همه: این خطا **باگ نبود**

وقتی زدی `npm run electron:start` این را دیدی:

```
electron: Failed to load URL: http://localhost:3000/ with error: ERR_CONNECTION_REFUSED
```

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">
ℹ️ <b>چه اتفاقی افتاد؟</b> اپِ تو دو تکه دارد: یک «مغز» (پروسه‌ی الکترون) و یک «ظاهر» (React که با ابزارِ Vite ساخته می‌شود). در حالتِ <b>توسعه</b>، مغز، ظاهر را از یک <b>سرورِ زنده‌ی Vite</b> روی آدرسِ <code>localhost:3000</code> می‌گیرد. تو فقط مغز (<code>electron .</code>) را روشن کردی ولی آن سرور بالا نبود؛ برای همین مغز، ظاهرش را پیدا نکرد.
</div>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">
ℹ️ <b>Vite چیست؟</b> ابزارِ ساخت و سرورِ توسعه‌ی فرانت‌اند. در حالتِ توسعه یک سرورِ محلی بالا می‌آورد (اینجا پورتِ ۳۰۰۰) که تغییراتِ کد را زنده نشان می‌دهد؛ در حالتِ نهایی، همه‌چیز را در پوشه‌ی <code>dist/</code> «بیلد» می‌کند. <b>ERR_CONNECTION_REFUSED</b> یعنی «به آن آدرس/پورت وصل شدم ولی کسی جواب نداد» — چون سرور خاموش بود.
</div>

<br>

---

<br>

## ۲) ✅ راهِ درستِ اجرا در حالتِ توسعه

به‌جای `electron:start`، این را بزن:

```bash
npm run dev
```

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">
✅ این دستور <b>هم Vite و هم Electron را با هم</b> بالا می‌آورد (با ابزارِ <code>concurrently</code>) و صبر می‌کند تا پورتِ ۳۰۰۰ آماده شود، بعد الکترون را وصل می‌کند. پس دیگر آن خطا را نمی‌بینی.
</div>

<b><code>npm run electron:start</code> کِی به‌درد می‌خورد؟</b> فقط وقتی خودت جداگانه سرورِ توسعه را بالا آورده باشی، یا (با محافظِ جدیدِ پایین) یک بیلد در <code>dist/</code> داشته باشی.

<br>

---

<br>

## ۳) 🔧 یک محافظِ ایمنی که اضافه کردم (تا این گیجی تکرار نشود)

- **فایل:** `electron/main.cjs` — تابعِ بارگذاریِ پنجره

**رفتارِ قبلی:** اگر در حالتِ توسعه سرورِ ۳۰۰۰ بالا نبود → پنجره‌ی خطا/سفید و پیامِ ترسناک.

**رفتارِ جدید:** اگر اتصال به سرورِ توسعه شکست خورد، به‌جای خطا، **بیلدِ ساخته‌شده‌ی `dist/` را نشان می‌دهد** (اگر موجود باشد). اگر آن هم نبود، یک پیامِ راهنمای واضح در ترمینال چاپ می‌کند.

```js
// قبل:
} else {
  mainWindow.loadURL('http://localhost:3000');   // شکست → ERR_CONNECTION_REFUSED
}

// بعد:
} else {
  mainWindow.loadURL('http://localhost:3000').catch(() => {
    if (fs.existsSync(distIndex)) mainWindow.loadFile(distIndex);   // به بیلد برگرد
    else console.error('[Yatash] سرورِ توسعه بالا نیست و بیلدی هم در dist/ نیست...');
  });
}
```

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">
ℹ️ <b><code>.catch(...)</code> اینجا یعنی چه؟</b> <code>loadURL</code> یک Promise برمی‌گرداند که اگر اتصال شکست بخورد «رد» می‌شود؛ با <code>.catch</code> آن شکست را می‌گیریم و به‌جای خطا، نقشه‌ی جایگزین را اجرا می‌کنیم. <code>fs.existsSync</code> هم فقط چک می‌کند فایلِ بیلد روی دیسک هست یا نه.
</div>

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">
✅ این تغییر برای <b>نسخه‌ی نصب‌شده‌ی مشتری هیچ اثری ندارد</b> (آن‌جا <code>app.isPackaged</code> درست است و مستقیم از <code>dist/</code> می‌خواند). فقط تجربه‌ی توسعه‌ی تو را امن‌تر می‌کند.
</div>

<br>

**حالا برای تستِ سریعِ نسخه‌ی نهایی بدونِ بیلدِ کامل، می‌توانی این کار را بکنی:**

```bash
npm run build          # یک‌بار dist/ را بساز
npm run electron:start # حالا الکترون خودش dist/ را نشان می‌دهد (نه خطا)
```

<br>

---

<br>

## ۴) 🧪 پس لایسنس را چطور تست کنم؟

چون قبلاً گفتم «`npm run electron:start` بزن» و آن به سرور نیاز داشت، راهِ درستش این است:

```bash
npm run license:issue   # machineId خودت را وارد کن → license.dat ساخته می‌شود
npm run dev             # اپ بالا می‌آید؛ در صفحه‌ی لایسنس باید «فعال/معتبر» ببینی
```

اگر «امضا نامعتبر» دیدی → کلیدِ عمومی با کلیدِ خصوصی جفت نیست؛ با `npm run license:keygen` دوباره بساز.

<br>

---

<br>

## 🗂️ فایلِ تغییرکرده

- `electron/main.cjs` — افزودنِ `require('fs')` و بازگشتِ امن به `dist/` وقتی سرورِ توسعه بالا نیست.

<br>

---

<br>

### 💾 دستورِ Git پیشنهادی

```bash
git add -A && git commit -m "fix(electron): fall back to built dist when dev server is unreachable"
```

**چرا `fix(electron)`؟**
- `fix` چون رفتارِ ناخوشایند (پنجره‌ی خطا هنگام نبودِ سرورِ توسعه) را **اصلاح** می‌کند — قابلیتِ جدیدی اضافه نشده که `feat` باشد.
- `scope`ِ `electron` می‌گوید تغییر در لایه‌ی پروسه‌ی اصلیِ دسکتاپ بوده، نه در UI یا داده.
- اگر فقط متنِ پیام را عوض کرده بودم `style`، و اگر منطق را بدونِ تغییرِ رفتار جابه‌جا کرده بودم `refactor` می‌شد؛ ولی اینجا رفتارِ واقعیِ بارگذاری بهتر شده، پس `fix` دقیق‌ترین است.

</div>
