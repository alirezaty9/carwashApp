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

// ============================ دستمزد کارگرها ============================
// این منطق قبلاً داخلِ کامپوننتِ WorkerPayroll بود؛ اینجا به یک تابعِ خالص منتقل شد
// تا هم قابلِ تست باشد هم قابلِ استفاده‌ی مجدد (جداسازیِ منطق از UI).

export interface WorkerPayrollRow {
  name: string;
  count: number;
  revenue: number; // جمعِ مبلغِ قبض‌ها (ریال)
  commission: number; // جمعِ پورسانت (ریال)
  tip: number; // جمعِ انعام (ریال) — جدا از پورسانت
}

export interface WorkerPayrollResult {
  rows: WorkerPayrollRow[];
  totals: { count: number; revenue: number; commission: number; tip: number };
  /** سهمِ خالصِ کارواش = درآمد − پورسانت. انعام دخالت ندارد چون پولِ کارواش نیست. */
  shopShare: number;
}

/**
 * تجمیعِ کارکردِ کارگرها از یک فهرست قبض (که قبلاً بر اساسِ بازه فیلتر شده).
 * پورسانت و انعام را جدا نگه می‌دارد و ردیف‌ها را بر اساسِ کلِ دریافتیِ کارگر
 * (پورسانت + انعام) نزولی مرتب می‌کند.
 */
export function aggregateWorkerPayroll(receipts: Receipt[]): WorkerPayrollResult {
  const map = new Map<string, WorkerPayrollRow>();
  for (const r of receipts) {
    const key = r.workerId ?? '__none__';
    const name = r.workerName ?? 'بدون کارگر';
    const cur = map.get(key) ?? { name, count: 0, revenue: 0, commission: 0, tip: 0 };
    cur.count += 1;
    cur.revenue += r.price;
    cur.commission += r.workerCommission ?? 0;
    cur.tip += r.tip ?? 0;
    map.set(key, cur);
  }
  const rows = Array.from(map.values()).sort((a, b) => b.commission + b.tip - (a.commission + a.tip));
  const totals = {
    count: receipts.length,
    revenue: sumRevenue(receipts),
    commission: receipts.reduce((s, r) => s + (r.workerCommission ?? 0), 0),
    tip: receipts.reduce((s, r) => s + (r.tip ?? 0), 0),
  };
  return { rows, totals, shopShare: totals.revenue - totals.commission };
}
