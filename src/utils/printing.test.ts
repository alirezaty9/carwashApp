/**
 * تست‌های واحدِ اندازه‌ی کاغذِ پرینتر.
 *
 * چرا این تست مهم است: اگر اندازه‌ی کاغذ اشتباه انتخاب شود، دو نتیجه‌ی خیلی
 * نابرابر دارد. فیشِ باریک روی کاغذِ پهن فقط حاشیه‌ی خالی می‌گذارد و کامل خوانده
 * می‌شود؛ ولی فیشِ پهن روی کاغذِ باریک از لبه بیرون می‌زند و مبلغ و شماره‌ی قبض
 * بریده می‌شوند. پس هر مسیرِ نامشخصی باید به «باریک» بیفتد، نه «پهن».
 */
import { describe, it, expect } from 'vitest';
import { DEFAULT_PAPER_WIDTH, PAPER_OPTIONS, paperSpec } from './printing';

describe('اندازه‌ی کاغذ', () => {
  it('رولِ ۵۸ میلی‌متری: عرضِ چاپ ۴۸ میلی‌متر و ۳۸۴ نقطه', () => {
    const spec = paperSpec('58');
    expect(spec.rollMm).toBe(58);
    expect(spec.printableMm).toBe(48);
    expect(spec.dotsPerLine).toBe(384);
  });

  it('رولِ ۸۰ میلی‌متری: عرضِ چاپ ۷۲ میلی‌متر و ۵۷۶ نقطه', () => {
    const spec = paperSpec('80');
    expect(spec.rollMm).toBe(80);
    expect(spec.printableMm).toBe(72);
    expect(spec.dotsPerLine).toBe(576);
  });

  it('تعدادِ نقطه‌ها با عرضِ چاپ در تراکمِ ۲۰۳ نقطه‌بر‌اینچ می‌خواند', () => {
    // ۴۸ میلی‌متر ÷ ۲۵.۴ × ۲۰۳ ≈ ۳۸۳.۶ و ۷۲ میلی‌متر ≈ ۵۷۵.۴ — گِردشده به مضربِ ۸
    for (const option of PAPER_OPTIONS) {
      const spec = paperSpec(option.id);
      const expected = Math.round((spec.printableMm / 25.4) * 203);
      expect(Math.abs(spec.dotsPerLine - expected)).toBeLessThanOrEqual(8);
      // هر بایت هشت نقطه است، پس تعدادِ نقطه‌ها باید بر ۸ بخش‌پذیر باشد
      expect(spec.dotsPerLine % 8).toBe(0);
    }
  });

  it('🔴 تنظیماتِ قدیمی که اصلاً این مقدار را ندارند، به اندازه‌ی باریک می‌افتند', () => {
    expect(paperSpec(undefined)).toEqual(paperSpec(DEFAULT_PAPER_WIDTH));
    expect(paperSpec('')).toEqual(paperSpec(DEFAULT_PAPER_WIDTH));
  });

  it('🔴 مقدارِ نامعتبر هم به اندازه‌ی باریک می‌افتد، نه پهن', () => {
    expect(paperSpec('110')).toEqual(paperSpec('58'));
    expect(paperSpec('هرچیزی')).toEqual(paperSpec('58'));
  });

  it('پیش‌فرض، باریک است (انتخابِ ایمن)', () => {
    expect(DEFAULT_PAPER_WIDTH).toBe('58');
    expect(paperSpec(DEFAULT_PAPER_WIDTH).printableMm).toBe(48);
  });

  it('هر دو اندازه در فهرستِ تنظیمات هستند', () => {
    expect(PAPER_OPTIONS.map((o) => o.id).sort()).toEqual(['58', '80']);
  });
});
