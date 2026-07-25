/**
 * تست‌های واحد (Unit Test) برای توابعِ عدد/پول.
 *
 * «تستِ واحد» یعنی یک تابعِ کوچک را جدا از بقیه‌ی برنامه صدا می‌زنیم، یک ورودیِ
 * مشخص می‌دهیم و بررسی می‌کنیم خروجی همان چیزی است که انتظار داریم. این ساده‌ترین
 * و پرکاربردترین نوعِ تست است.
 *
 * ساختار: describe = گروهِ تست‌ها | it/test = یک سناریو | expect(...).toBe(...) = ادعا.
 */
import { describe, it, expect } from 'vitest';
import {
  toPersianDigits,
  toEnglishDigits,
  rialToToman,
  tomanToRial,
  formatCurrencyToman,
} from './format';

describe('toPersianDigits', () => {
  it('ارقامِ لاتین را به فارسی تبدیل می‌کند', () => {
    expect(toPersianDigits(1234567890)).toBe('۱۲۳۴۵۶۷۸۹۰');
    expect(toPersianDigits('09120000000')).toBe('۰۹۱۲۰۰۰۰۰۰۰');
  });
  it('کاراکترهای غیرعددی را دست‌نخورده می‌گذارد', () => {
    expect(toPersianDigits('12,500')).toBe('۱۲,۵۰۰');
  });
});

describe('toEnglishDigits', () => {
  it('ارقامِ فارسی را به لاتین تبدیل می‌کند', () => {
    expect(toEnglishDigits('۱۲۳۴۵')).toBe('12345');
  });
  it('ارقامِ عربی را هم تبدیل می‌کند', () => {
    expect(toEnglishDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
  });
  it('ترکیبِ فارسی و لاتین را درست پردازش می‌کند', () => {
    expect(toEnglishDigits('۰9۱2')).toBe('0912');
  });
});

describe('rialToToman / tomanToRial (قراردادِ ریال↔تومان)', () => {
  it('ریال به تومان = تقسیم بر ۱۰', () => {
    expect(rialToToman(125000)).toBe(12500);
    expect(rialToToman(0)).toBe(0);
  });
  it('تومان به ریال = ضرب در ۱۰', () => {
    expect(tomanToRial(12500)).toBe(125000);
  });
  it('رفت‌وبرگشت مقدار را حفظ می‌کند', () => {
    expect(rialToToman(tomanToRial(45000))).toBe(45000);
  });
  it('ورودیِ نامعتبر (NaN/Infinity) را صفر می‌کند (نه خطا)', () => {
    expect(rialToToman(NaN)).toBe(0);
    expect(tomanToRial(NaN)).toBe(0);
    expect(tomanToRial(Infinity)).toBe(0);
  });
  it('عددِ اعشاریِ تومان قبل از ضرب گرد می‌شود', () => {
    expect(tomanToRial(12500.4)).toBe(125000);
    expect(tomanToRial(12500.6)).toBe(125010);
  });
});

describe('formatCurrencyToman', () => {
  it('ریال را به «تومان» با ارقامِ فارسی نمایش می‌دهد', () => {
    const out = formatCurrencyToman(125000); // = ۱۲٬۵۰۰ تومان
    // به‌جای وابستگی به کاراکترِ دقیقِ جداکننده، فقط عددِ داخلش و واژه‌ی تومان را چک می‌کنیم
    expect(out).toContain('تومان');
    expect(toEnglishDigits(out).replace(/[^0-9]/g, '')).toBe('12500');
  });
  it('صفر را «۰ تومان» نشان می‌دهد', () => {
    expect(toEnglishDigits(formatCurrencyToman(0)).replace(/[^0-9]/g, '')).toBe('0');
  });
});
