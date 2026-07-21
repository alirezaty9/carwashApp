/**
 * کمک‌توابعِ مشترکِ گزارش‌گیری روی قبض‌ها.
 * فیلترِ بازه‌ی زمانی بینِ «گزارش‌ها» و «دستمزد کارگرها» مشترک است و اینجا متمرکز شده تا تکرار نشود.
 */
import { Receipt } from '../types';
import { getJalaliDateParts } from './jalali';

/** بازه‌ی زمانیِ گزارش */
export type Period = 'today' | 'week' | 'month' | 'all';

export const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'امروز' },
  { id: 'week', label: '۷ روز اخیر' },
  { id: 'month', label: 'این ماه' },
  { id: 'all', label: 'کل' },
];

type JalaliDay = { year: number; month: number; day: number };

/** فقط قبض‌های فعال (باطل‌نشده) */
export const activeReceipts = (receipts: Receipt[]): Receipt[] =>
  receipts.filter((r) => r.status === 'active');

/** جمعِ مبلغِ قبض‌ها (ریال) */
export const sumRevenue = (receipts: Receipt[]): number =>
  receipts.reduce((s, r) => s + r.price, 0);

/** آیا قبض در همان روزِ جلالیِ داده‌شده است؟ */
export const isOnJalaliDay = (r: Receipt, d: JalaliDay): boolean =>
  r.jalaliYear === d.year && r.jalaliMonth === d.month && r.jalaliDay === d.day;

/**
 * قبض‌های فعالِ داخلِ یک بازه.
 * `today` را از بیرون می‌گیریم تا در طولِ عمرِ کامپوننت ثابت بماند (memoized).
 */
export function filterReceiptsByPeriod(receipts: Receipt[], period: Period, today: JalaliDay): Receipt[] {
  const active = activeReceipts(receipts);
  if (period === 'all') return active;
  if (period === 'month') return active.filter((r) => r.jalaliYear === today.year && r.jalaliMonth === today.month);
  if (period === 'today') return active.filter((r) => isOnJalaliDay(r, today));

  // ۷ روز اخیر بر اساسِ تاریخِ میلادیِ ذخیره‌شده
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);
  return active.filter((r) => new Date(r.date) >= since);
}

/** بخشِ جلالیِ «امروز» — میان‌بُرِ پرکاربرد */
export const jalaliToday = (): JalaliDay => getJalaliDateParts(new Date());
