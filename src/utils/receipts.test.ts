/**
 * تست‌های فیلترِ بازه‌ی زمانیِ گزارش‌ها (امروز/هفته/ماه/کل) و جمع‌ها.
 * این منطق پایه‌ی همه‌ی گزارش‌ها و «دستمزد کارگرها» است، پس درست‌بودنش مهم است.
 */
import { describe, it, expect } from 'vitest';
import { Receipt } from '../types';
import {
  activeReceipts,
  sumRevenue,
  isOnJalaliDay,
  filterReceiptsByPeriod,
  jalaliToday,
  aggregateWorkerPayroll,
} from './receipts';

const today = jalaliToday();

// سازنده‌ی قبضِ نمونه با مقادیرِ پیش‌فرضِ «امروز» که با over قابلِ بازنویسی است.
function rcp(over: Partial<Receipt> = {}): Receipt {
  return {
    id: Math.random().toString(36),
    receiptNumber: 1000,
    customerPhone: '0912',
    customerName: 'x',
    carModel: 'x',
    tierId: 't',
    tierName: 't',
    services: [],
    price: 100000,
    date: new Date().toISOString(),
    jalaliDate: '',
    jalaliYear: today.year,
    jalaliMonth: today.month,
    jalaliDay: today.day,
    status: 'active',
    ...over,
  } as Receipt;
}

describe('activeReceipts و sumRevenue', () => {
  it('فقط قبض‌های فعال را نگه می‌دارد', () => {
    const list = [rcp(), rcp({ status: 'voided' }), rcp()];
    expect(activeReceipts(list)).toHaveLength(2);
  });
  it('جمعِ مبلغ‌ها را درست حساب می‌کند', () => {
    expect(sumRevenue([rcp({ price: 100000 }), rcp({ price: 250000 })])).toBe(350000);
    expect(sumRevenue([])).toBe(0);
  });
});

describe('isOnJalaliDay', () => {
  it('برای همان روز true و برای روزِ دیگر false است', () => {
    expect(isOnJalaliDay(rcp(), today)).toBe(true);
    expect(isOnJalaliDay(rcp({ jalaliDay: today.day + 1 }), today)).toBe(false);
  });
});

describe('filterReceiptsByPeriod', () => {
  it('«today» فقط قبضِ فعالِ امروز را برمی‌گرداند', () => {
    const list = [
      rcp(), // امروز، فعال ✅
      rcp({ jalaliDay: today.day === 1 ? 2 : 1 }), // روزِ دیگر ❌
      rcp({ status: 'voided' }), // امروز ولی باطل ❌
    ];
    expect(filterReceiptsByPeriod(list, 'today', today)).toHaveLength(1);
  });

  it('«month» قبض‌های همان ماه (روزِ متفاوت) را شامل و ماهِ دیگر را رد می‌کند', () => {
    const otherMonth = today.month === 1 ? 2 : 1;
    const list = [
      rcp({ jalaliDay: 1 }),
      rcp({ jalaliDay: 28 }),
      rcp({ jalaliMonth: otherMonth }), // ماهِ دیگر ❌
    ];
    expect(filterReceiptsByPeriod(list, 'month', today)).toHaveLength(2);
  });

  it('«all» همه‌ی فعال‌ها را (بی‌توجه به تاریخ) می‌دهد و باطل‌ها را رد می‌کند', () => {
    const list = [rcp({ jalaliYear: 1300 }), rcp(), rcp({ status: 'voided' })];
    expect(filterReceiptsByPeriod(list, 'all', today)).toHaveLength(2);
  });

  it('«week» قبضِ ۱۰روزِ پیش را رد و قبضِ امروز را قبول می‌کند', () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const list = [rcp(), rcp({ date: tenDaysAgo.toISOString() })];
    expect(filterReceiptsByPeriod(list, 'week', today)).toHaveLength(1);
  });
});

describe('aggregateWorkerPayroll (دستمزد کارگرها)', () => {
  it('پورسانت و انعام را جدا و به‌تفکیکِ کارگر جمع می‌کند', () => {
    const list = [
      rcp({ workerId: 'w1', workerName: 'اکبری', price: 400000, workerCommission: 160000, tip: 50000 }),
      rcp({ workerId: 'w1', workerName: 'اکبری', price: 300000, workerCommission: 100000 }),
      rcp({ workerId: 'w2', workerName: 'محمدی', price: 200000, workerCommission: 80000, tip: 20000 }),
    ];
    const { rows, totals, shopShare } = aggregateWorkerPayroll(list);

    expect(totals.revenue).toBe(900000);
    expect(totals.commission).toBe(340000);
    expect(totals.tip).toBe(70000);
    // 🟢 انعام در سهمِ کارواش دخالت ندارد (فقط درآمد منهای پورسانت)
    expect(shopShare).toBe(900000 - 340000);

    const akbari = rows.find((r) => r.name === 'اکبری')!;
    expect(akbari.count).toBe(2);
    expect(akbari.commission).toBe(260000);
    expect(akbari.tip).toBe(50000);
  });

  it('قبضِ بدونِ کارگر زیرِ «بدون کارگر» جمع می‌شود', () => {
    const { rows } = aggregateWorkerPayroll([
      rcp({ workerId: undefined, workerName: undefined, tip: 10000, workerCommission: 0 }),
    ]);
    expect(rows[0].name).toBe('بدون کارگر');
    expect(rows[0].tip).toBe(10000);
  });
});
