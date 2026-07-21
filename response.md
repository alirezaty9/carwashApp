<div dir="rtl" align="right">

# 🔑 سیستمِ رمزِ پنل — رمزِ اولیه، رمزِ مادر، و نمایش/تغییرِ رمز

> رمزِ اولیه‌ی همه `yatash` شد، یک **رمزِ مادرِ پشتیبانی** اضافه شد که همیشه پنل را باز می‌کند، و رمزِ فعلی حالا در تنظیمات **قابلِ دیدن و تغییر** است. همه‌چیز کاملاً **آفلاین** ماند — هیچ چیز آنلاینی اضافه نشد.

<br>

---

<br>

## ۱) 🎯 سه چیزی که خواستی و انجام شد

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">خواسته</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">چطور انجام شد</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">رمزِ اولیه‌ی همه = <code>yatash</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">پیش‌فرضِ برنامه در اولین اجرا؛ مشتری بعد از ورود عوضش می‌کند</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">رمزِ مادر که همیشه کار کند</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">یک رمزِ ثابتِ پشتیبانی که علاوه بر رمزِ مشتری، همیشه پنل را باز می‌کند</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">دیدن و عوض‌کردنِ رمز</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">در «تنظیمات → رمز پنل» با دکمه‌ی 👁️ رمزِ فعلی را می‌بینی و می‌توانی عوض کنی</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۲) 🔐 رمزِ مادر (Master Password) — چطور کار می‌کند

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>رمزِ مادر چیست؟</b> 🌍 مثلِ «کلیدِ یدکِ صاحب‌خانه» — مستأجر کلیدِ خودش را دارد، ولی صاحب‌خانه یک کلیدِ اصلی دارد که همه‌ی درها را باز می‌کند. 💻 اینجا: هر رمزی که مشتری بگذارد، تو با رمزِ مادر همیشه می‌توانی وارد شوی، رمزِ فعلی‌اش را ببینی یا عوض کنی.</div>

<br>

**سناریوی واقعی:** مشتری زنگ می‌زند «رمزِ پنلم یادم رفته!» →  
تو می‌گویی برنامه را باز کند، روی لوگو بزند، و **رمزِ مادر** را وارد کند →  
وارد پنل می‌شوی → «تنظیمات → رمز پنل» → دکمه‌ی 👁️ را می‌زنی → رمزش را می‌بینی و بهش می‌گویی (یا همان‌جا یک رمزِ جدید می‌گذاری).

<br>

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ <b>مقدارِ رمزِ مادر:</b> برای اینکه در گیت لو نرود، اینجا ماسکش می‌کنم:  
<code>Yatash@Master#••••••</code>  
مقدارِ کاملش را <b>در پیامِ چت</b> برایت نوشتم و در فایلِ <code>src/auth.ts</code> تعریف شده. اگر خواستی عوضش کنی، فقط همان یک خط را در <code>src/auth.ts</code> تغییر بده.</div>

<br>

<div style="background:#fff4e6;border-right:4px solid #f08c00;color:#7c3f00;padding:8px 12px;border-radius:6px">⚠️ <b>صداقتِ امنیتی (مهم):</b> رمزِ مادر داخلِ کدِ برنامه جاسازی شده و در نسخه‌ی نصب‌شده هم هست. پس یک «راهِ پشتیبانی» است، نه قفلِ نظامی؛ کسی که برنامه را باز/مهندسیِ‌معکوس کند می‌تواند پیدایش کند. برای این کاربرد (پشتیبانیِ کارواش) قابل‌قبول است. اگر روزی امنیتِ بیشتری خواستی، می‌شود رمزِ مادر را از <code>machineId</code> مشتق کرد تا برای هر دستگاه فرق کند و یکتا باشد.</div>

<br>

---

<br>

## ۳) 🚪 رمزِ اولیه برای مشتریِ جدید

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ در اولین اجرا، پنل با رمزِ <code>yatash</code> قفل است. در پنجره‌ی ورود هم یک راهنما نشان داده می‌شود: «رمزِ اولیه: yatash — بعد از ورود عوضش کنید». به‌محضِ اینکه مشتری رمزش را عوض کند، آن راهنما دیگر ظاهر نمی‌شود.</div>

<br>

---

<br>

## ۴) 📦 تغییراتِ این نوبت

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
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/auth.ts</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">🆕 جدید</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">تعریفِ رمزِ مادر، رمزِ پیش‌فرض، و تابعِ بررسیِ رمز</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/data/defaults.ts</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✏️ تغییر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>adminPin</code> پیش‌فرض از خالی به <code>yatash</code></td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/App.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✏️ تغییر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">پذیرشِ رمزِ مادر در ورود + راهنمای رمزِ اولیه در پنجره‌ی ورود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right"><code>src/components/admin/GeneralSettings.tsx</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">✏️ تغییر</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">دکمه‌ی 👁️ نمایش/پنهانِ رمز کنارِ فیلدِ تغییرِ رمز</td>
    </tr>
  </tbody>
</table>

<br>

<div style="background:#e7f5ff;border-right:4px solid #1c7ed6;color:#0b3d66;padding:8px 12px;border-radius:6px">ℹ️ <b>چرا رمز به‌صورتِ مخفی نمایش داده می‌شود؟</b> فیلد پیش‌فرض ماسک (••••) است تا کارگری که کنارِ دست است رمز را نبیند؛ فقط با زدنِ دکمه‌ی چشم آشکار می‌شود. این تعادلِ «قابلِ دیدن برای مدیر / پنهان از دیگران» است.</div>

<br>

---

<br>

## ۵) 🧪 تستِ سریع

<table dir="rtl" style="border-collapse:collapse;width:100%;font-size:14px">
  <thead>
    <tr>
      <th style="border:1px solid #999;padding:10px;text-align:right">تست</th>
      <th style="border:1px solid #999;padding:10px;text-align:right">انتظار</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">اجرای تازه، ورود با <code>yatash</code></td>
      <td style="border:1px solid #999;padding:10px;text-align:right">وارد پنل می‌شوی؛ راهنمای رمزِ اولیه دیده می‌شود</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">رمز را عوض کن، بعد با رمزِ مادر وارد شو</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">با وجودِ رمزِ جدید، رمزِ مادر هم بازش می‌کند</td>
    </tr>
    <tr>
      <td style="border:1px solid #999;padding:10px;text-align:right">در تنظیمات دکمه‌ی 👁️</td>
      <td style="border:1px solid #999;padding:10px;text-align:right">رمزِ فعلی نمایان می‌شود</td>
    </tr>
  </tbody>
</table>

<br>

---

<br>

## ۶) 📌 قدمِ بعدی

<div style="background:#ebfbee;border-right:4px solid #2f9e44;color:#14532d;padding:8px 12px;border-radius:6px">✅ همه‌چیز آفلاین است و لوگو فعلاً متنی می‌ماند تا لوگوی واقعی را بدهی. تنها موردِ «بالا»ی باقی‌مانده، <b>بسته‌بندیِ فونت‌ها برای آفلاینِ کامل</b> است. برویم سراغش؟</div>

<br>

---

<br>

```bash
git add -A && git commit -m "feat: add master password, default admin pin, and reveal/change password UI"
```

</div>
