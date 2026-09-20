/**
 * تستِ منطقِ احراز هویت: رمزِ ورودِ کاربر، رمزِ مادرِ پشتیبانی، و قواعدِ رمزِ جدید.
 *
 * چرا این قواعد اینجا تست می‌شوند و نه در کامپوننت: چون سه جای برنامه (ساختِ کاربرِ
 * نو، تغییرِ رمز توسطِ مدیر، صفحه‌ی اجباریِ تغییرِ رمز) از همین یک تابع تغذیه
 * می‌کنند. اگر این قاعده بشکند، هر سه جا هم‌زمان می‌شکنند.
 */
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ADMIN_PIN,
  isUserPasswordValid,
  MASTER_PASSWORD,
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
  validatePasswordValue,
} from './auth';

describe('isUserPasswordValid', () => {
  it('رمزِ درستِ خودِ کاربر را می‌پذیرد', () => {
    expect(isUserPasswordValid('1234', '1234')).toBe(true);
  });
  it('فاصله‌های اضافه را نادیده می‌گیرد', () => {
    expect(isUserPasswordValid('  1234  ', '1234')).toBe(true);
  });
  it('رمزِ مادر همیشه پذیرفته می‌شود (راهِ پشتیبانی)', () => {
    expect(isUserPasswordValid(MASTER_PASSWORD, 'anything')).toBe(true);
  });
  it('رمزِ غلط را رد می‌کند', () => {
    expect(isUserPasswordValid('0000', '1234')).toBe(false);
  });

  // 🔴 هسته‌ی ایرادِ امنیتی‌ای که رفع شد: اگر حسابی به هر دلیلی رمزِ خالی داشته
  // باشد، نباید با زدنِ دکمه‌ی «ورود» بدونِ تایپِ چیزی باز شود.
  it('🛡️ ورودیِ خالی را رد می‌کند حتی اگر رمزِ ذخیره‌شده هم خالی باشد', () => {
    expect(isUserPasswordValid('', '')).toBe(false);
    expect(isUserPasswordValid('   ', '')).toBe(false);
  });
  it('🛡️ برای حسابِ بی‌رمز، هیچ رمزی جز رمزِ مادر کار نمی‌کند', () => {
    expect(isUserPasswordValid('x', '')).toBe(false);
    expect(isUserPasswordValid(MASTER_PASSWORD, '')).toBe(true);
  });
});

describe('validatePasswordValue (قاعده‌ی واحدِ رمز)', () => {
  it('رمزِ سالم را قبول می‌کند (null یعنی بدونِ ایراد)', () => {
    expect(validatePasswordValue('1234')).toBeNull();
    expect(validatePasswordValue('رمزِ قوی')).toBeNull();
  });

  it('🛡️ رمزِ خالی یا فقط‌فاصله را رد می‌کند', () => {
    expect(validatePasswordValue('')).toBe('رمز نمی‌تواند خالی باشد.');
    expect(validatePasswordValue('    ')).toBe('رمز نمی‌تواند خالی باشد.');
  });

  it('رمزِ کوتاه‌تر از حداقل را رد می‌کند', () => {
    const short = 'a'.repeat(MIN_PASSWORD_LENGTH - 1);
    expect(validatePasswordValue(short)).toContain(`${MIN_PASSWORD_LENGTH}`);
  });

  it('دقیقاً به‌اندازه‌ی حداقل را قبول می‌کند (مرزِ پایین)', () => {
    expect(validatePasswordValue('a'.repeat(MIN_PASSWORD_LENGTH))).toBeNull();
  });

  it('رمزِ پیش‌فرضِ کارخانه را رد می‌کند', () => {
    expect(validatePasswordValue(DEFAULT_ADMIN_PIN)).toContain('پیش‌فرض');
  });

  it('رمزِ مادرِ پشتیبانی را رد می‌کند (نباید رمزِ یک کاربر شود)', () => {
    expect(validatePasswordValue(MASTER_PASSWORD)).toContain('رزرو');
  });

  it('فاصله‌ی دو طرف را در سنجشِ طول حساب نمی‌کند', () => {
    expect(validatePasswordValue('  ab  ')).toContain(`${MIN_PASSWORD_LENGTH}`);
  });
});

describe('validateNewPassword (قواعدِ رمز + تکرارِ رمز)', () => {
  it('رمزِ سالم با تکرارِ درست پذیرفته می‌شود', () => {
    expect(validateNewPassword('1234', '1234')).toBeNull();
  });

  it('ناهماهنگیِ تکرار را می‌گیرد', () => {
    expect(validateNewPassword('1234', '4321')).toBe('دو رمز یکسان نیستند.');
  });

  it('همه‌ی قواعدِ پایه را هم اعمال می‌کند (یک منبعِ حقیقت)', () => {
    expect(validateNewPassword('', '')).toBe('رمز نمی‌تواند خالی باشد.');
    expect(validateNewPassword(DEFAULT_ADMIN_PIN, DEFAULT_ADMIN_PIN)).toContain('پیش‌فرض');
    expect(validateNewPassword('12', '12')).toContain(`${MIN_PASSWORD_LENGTH}`);
  });

  it('ایرادِ خودِ رمز بر ایرادِ تکرار مقدم است (پیامِ دقیق‌تر)', () => {
    // هر دو ایراد هم‌زمان: هم خالی است هم با تکرار نمی‌خواند
    expect(validateNewPassword('', 'x')).toBe('رمز نمی‌تواند خالی باشد.');
  });
});
