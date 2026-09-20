/**
 * منطقِ احراز هویتِ برنامه — قواعدِ رمز یک‌جا جمع شده‌اند تا همه‌ی جاهایی که رمز
 * تعیین می‌شود (ساختِ کاربرِ نو، تغییرِ رمز توسطِ مدیر، دروازه‌ی اجباریِ تغییرِ رمز)
 * از یک قاعده تغذیه کنند و با هم واگرا نشوند.
 *
 * 🔑 «رمزِ مادر» (Master Password): یک رمزِ ثابتِ پشتیبانی که همیشه — علاوه بر
 * رمزِ خودِ کاربر — اجازه‌ی ورود می‌دهد. کاربردش: اگر مشتری رمزش را فراموش کرد،
 * یاتاش در صفحه‌ی ورود کاربرِ او را انتخاب و این رمز را می‌زند، بعد از
 * «پنلِ مدیریت ← تبِ کاربران» رمزِ تازه برایش می‌گذارد.
 *
 * ⚠️ هشدارِ امنیتی (مهم): این رمز داخلِ کد جاسازی شده و در نسخه‌ی نصب‌شده هم هست.
 * پس یک «راهِ پشتیبانی» است، نه یک قفلِ نفوذناپذیر؛ کسی که کد/برنامه را باز کند
 * می‌تواند پیدایش کند. برای این کاربرد (پشتیبانیِ محلی) قابل‌قبول است. اگر روزی
 * خواستی امن‌تر شود، می‌شود آن را از machineId مشتق کرد تا برای هر دستگاه فرق کند.
 */
export const MASTER_PASSWORD = 'Yatash@Master#9K7q!Zx';

/** رمزِ پیش‌فرضِ اولین اجرا؛ مشتری بعد از ورود آن را عوض می‌کند. */
export const DEFAULT_ADMIN_PIN = 'yatash';

/**
 * اعتبارسنجیِ ورودِ کاربر: رمزِ خودِ کاربر یا رمزِ مادرِ یاتاش را می‌پذیرد.
 *
 * 🔴 رمزِ خالی هرگز پذیرفته نمی‌شود — حتی اگر رمزِ ذخیره‌شده هم خالی باشد. بدونِ
 * این شرط، یک حسابِ بی‌رمز یعنی هرکسی با زدنِ دکمه‌ی «ورود» وارد می‌شود. لایه‌های
 * بالاتر جلوی ساختنِ رمزِ خالی را می‌گیرند؛ این‌جا آخرین خطِ دفاع است.
 */
export function isUserPasswordValid(input: string, userPassword: string): boolean {
  const value = input.trim();
  if (!value) return false;
  return value === userPassword.trim() || value === MASTER_PASSWORD;
}

/** آیا ورود با رمزِ مادر انجام شده؟ (برای معاف‌کردنِ یاتاش از اجبارِ تغییرِ رمز) */
export const isMasterPassword = (input: string): boolean => input.trim() === MASTER_PASSWORD;

/** آیا این کاربر هنوز روی رمزِ پیش‌فرضِ کارخانه است و باید عوضش کند؟ */
export const needsPasswordChange = (userPassword: string): boolean =>
  userPassword === DEFAULT_ADMIN_PIN;

/** کمینه‌ی طولِ رمزِ جدید — کوتاه‌تر از این عملاً هیچ محافظتی نیست. */
export const MIN_PASSWORD_LENGTH = 4;

/**
 * قواعدِ خودِ رمز (بدونِ کاریِ به «تکرارِ رمز»). اگر ایرادی بود پیامِ فارسی
 * برمی‌گرداند، وگرنه null.
 *
 * این تابع تنها مرجعِ «چه رمزی قابلِ قبول است» در کلِ برنامه است — هم فرمِ ساختِ
 * کاربرِ نو، هم کادرِ رمز در پنلِ کاربران، و هم صفحه‌ی اجباریِ تغییرِ رمز از آن
 * استفاده می‌کنند.
 */
export function validatePasswordValue(password: string): string | null {
  const value = password.trim();
  if (!value) return 'رمز نمی‌تواند خالی باشد.';
  if (value.length < MIN_PASSWORD_LENGTH) return `رمز باید حداقل ${MIN_PASSWORD_LENGTH} کاراکتر باشد.`;
  if (value === DEFAULT_ADMIN_PIN) return 'رمزِ پیش‌فرض قابلِ استفاده نیست؛ یک رمزِ دیگر بگذارید.';
  if (value === MASTER_PASSWORD) return 'این رمز رزرو شده است؛ رمزِ دیگری بگذارید.';
  return null;
}

/** قواعدِ رمزِ جدید + بررسیِ یکسان بودنِ «تکرارِ رمز». */
export function validateNewPassword(password: string, confirm: string): string | null {
  const problem = validatePasswordValue(password);
  if (problem) return problem;
  if (password.trim() !== confirm.trim()) return 'دو رمز یکسان نیستند.';
  return null;
}
