/**
 * تست‌های تبدیلِ تاریخِ میلادی → شمسی.
 *
 * این تست‌ها مهم‌اند چون یک باگِ واقعی همین‌جا پیدا شد: عنصرِ آخرِ آرایه‌ی روزهای
 * ماه‌های میلادی اشتباه (۳۳۵ به‌جای ۳۳۴) بود و همه‌ی تاریخ‌های «دسامبر» را یک روز
 * جلو می‌انداخت. تستِ «regression» یعنی تستی که یک باگِ رفع‌شده را برای همیشه قفل
 * می‌کند تا دوباره برنگردد.
 */
import { describe, it, expect } from 'vitest';
import { gregorianToJalali, getJalaliDateParts, getFormattedJalali, JALALI_MONTH_NAMES } from './jalali';

describe('gregorianToJalali — تاریخ‌های مرجع', () => {
  const cases: [number, number, number, [number, number, number]][] = [
    [2021, 3, 21, [1400, 1, 1]], // نوروزِ ۱۴۰۰
    [2024, 3, 20, [1403, 1, 1]], // نوروزِ ۱۴۰۳
    [2026, 3, 21, [1405, 1, 1]], // نوروزِ ۱۴۰۵
    [2020, 2, 29, [1398, 12, 10]], // سالِ کبیسه‌ی میلادی
    [2000, 1, 1, [1378, 10, 11]],
    [2026, 7, 25, [1405, 5, 3]],
  ];
  it.each(cases)('%i-%i-%i', (gy, gm, gd, expected) => {
    expect(gregorianToJalali(gy, gm, gd)).toEqual(expected);
  });
});

describe('🐛 regression: باگِ ماهِ دسامبر (۳۳۵ → ۳۳۴)', () => {
  it('اول دسامبر ۲۰۲۵ باید ۱۰ آذر باشد، نه ۱۱ آذر', () => {
    expect(gregorianToJalali(2025, 12, 1)).toEqual([1404, 9, 10]);
  });
  it('۲۱ دسامبر ۲۰۲۵ باید ۳۰ آذر باشد، نه ۱ دی (مرزِ ماه اشتباه نشود)', () => {
    // اگر باگ برگردد، این تاریخ به ماهِ «دی» می‌رفت و گزارشِ ماهانه را جابه‌جا می‌کرد.
    expect(gregorianToJalali(2025, 12, 21)).toEqual([1404, 9, 30]);
  });
  it('۳۱ دسامبر ۲۰۲۵ باید ۱۰ دی باشد', () => {
    expect(gregorianToJalali(2025, 12, 31)).toEqual([1404, 10, 10]);
  });
  it('روزهای دسامبر پیوسته و بدونِ پرش‌اند (نه ۹/۹ سپس ۹/۱۱)', () => {
    expect(gregorianToJalali(2025, 11, 30)).toEqual([1404, 9, 9]);
    expect(gregorianToJalali(2025, 12, 1)).toEqual([1404, 9, 10]); // نه ۱۱
  });
});

describe('getJalaliDateParts و getFormattedJalali', () => {
  it('parts را از یک Date می‌گیرد', () => {
    // new Date(year, monthIndex, day) — ماه از صفر شروع می‌شود (۶ = جولای)
    expect(getJalaliDateParts(new Date(2026, 6, 25))).toEqual({ year: 1405, month: 5, day: 3 });
  });
  it('بدونِ زمان، رشته‌ی شمسیِ صفرپرشده با ارقامِ فارسی می‌سازد', () => {
    expect(getFormattedJalali(new Date(2026, 6, 25, 10, 30), false)).toBe('۱۴۰۵/۰۵/۰۳');
  });
  it('نامِ ۱۲ ماهِ شمسی کامل است', () => {
    expect(JALALI_MONTH_NAMES).toHaveLength(12);
    expect(JALALI_MONTH_NAMES[0]).toBe('فروردین');
    expect(JALALI_MONTH_NAMES[11]).toBe('اسفند');
  });
});
