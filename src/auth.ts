/**
 * منطقِ احراز هویتِ پنلِ مدیریت.
 *
 * 🔑 «رمزِ مادر» (Master Password): یک رمزِ ثابتِ پشتیبانی که همیشه — علاوه بر
 * رمزِ خودِ کارواش — پنل را باز می‌کند. کاربردش: اگر مشتری رمزش را فراموش کرد،
 * یاتاش با این رمز وارد می‌شود، رمزِ فعلی را در «تنظیمات → رمز پنل» می‌بیند یا عوض می‌کند.
 *
 * ⚠️ هشدارِ امنیتی (مهم): این رمز داخلِ کد جاسازی شده و در نسخه‌ی نصب‌شده هم هست.
 * پس یک «راهِ پشتیبانی» است، نه یک قفلِ نفوذناپذیر؛ کسی که کد/برنامه را باز کند
 * می‌تواند پیدایش کند. برای این کاربرد (پشتیبانیِ محلی) قابل‌قبول است. اگر روزی
 * خواستی امن‌تر شود، می‌شود آن را از machineId مشتق کرد تا برای هر دستگاه فرق کند.
 */
export const MASTER_PASSWORD = 'Yatash@Master#9K7q!Zx';

/** رمزِ پیش‌فرضِ اولین اجرا؛ مشتری بعد از ورود آن را عوض می‌کند. */
export const DEFAULT_ADMIN_PIN = 'yatash';

/** آیا رمزِ واردشده معتبر است؟ (رمزِ خودِ کارواش یا رمزِ مادرِ یاتاش) */
export function isAdminPasswordValid(input: string, configPin: string): boolean {
  const value = input.trim();
  return value === configPin || value === MASTER_PASSWORD;
}

/**
 * اعتبارسنجیِ ورودِ کاربر: رمزِ خودِ کاربر یا رمزِ مادرِ یاتاش را می‌پذیرد.
 * رمزِ مادر یک راهِ پشتیبانی است (اگر کاربر رمزش را فراموش کرد).
 */
export function isUserPasswordValid(input: string, userPassword: string): boolean {
  const value = input.trim();
  return value === userPassword || value === MASTER_PASSWORD;
}

/** آیا ورود با رمزِ مادر انجام شده؟ (برای معاف‌کردنِ یاتاش از اجبارِ تغییرِ رمز) */
export const isMasterPassword = (input: string): boolean => input.trim() === MASTER_PASSWORD;

/** آیا این کاربر هنوز روی رمزِ پیش‌فرضِ کارخانه است و باید عوضش کند؟ */
export const needsPasswordChange = (userPassword: string): boolean =>
  userPassword === DEFAULT_ADMIN_PIN;

/** کمینه‌ی طولِ رمزِ جدید — کوتاه‌تر از این عملاً هیچ محافظتی نیست. */
export const MIN_PASSWORD_LENGTH = 4;

/**
 * قواعدِ رمزِ جدید. اگر ایرادی بود پیامِ فارسی برمی‌گرداند، وگرنه null.
 * اینجا (نه داخلِ کامپوننت) است تا قاعده یک‌جا بماند و قابلِ تست باشد.
 */
export function validateNewPassword(password: string, confirm: string): string | null {
  const value = password.trim();
  if (value.length < MIN_PASSWORD_LENGTH) return `رمز باید حداقل ${MIN_PASSWORD_LENGTH} کاراکتر باشد.`;
  if (value === DEFAULT_ADMIN_PIN) return 'رمزِ پیش‌فرض قابلِ استفاده نیست؛ یک رمزِ دیگر بگذارید.';
  if (value === MASTER_PASSWORD) return 'این رمز رزرو شده است؛ رمزِ دیگری بگذارید.';
  if (value !== confirm.trim()) return 'دو رمز یکسان نیستند.';
  return null;
}
