import { useMemo, useState } from 'react';
import { Users, Wallet, ReceiptText, PiggyBank, CircleDollarSign, Coins } from 'lucide-react';
import { Store } from '../../data/store';
import { formatToman, toPersianDigits } from '../../utils/format';
import { aggregateWorkerPayroll, filterReceiptsByPeriod, Period, PERIODS } from '../../utils/receipts';
import { useJalaliToday } from '../../utils/useJalaliToday';
import {
  EmptyState,
  PillTabs,
  SectionCard,
  StatCard,
  rowHoverClass,
  tableClass,
  tableWrapClass,
  tbodyClass,
  theadRowClass,
} from '../common';

/**
 * دستمزد و کارکردِ کارگرها.
 * برای هر بازه: خلاصه‌ی مالیِ کارواش + جدولِ «هر کارگر چقدر کار کرده و چقدر پورسانت طلب دارد».
 * پورسانت از اسنپ‌شاتِ `workerCommission` هر قبض خوانده می‌شود (در لحظه‌ی صدور بر اساسِ ٪ خدمات حساب شده).
 */
export default function WorkerPayroll({ store }: { store: Store }) {
  const { receipts } = store;
  const [period, setPeriod] = useState<Period>('today');
  // «امروز» زنده — بعد از نیمه‌شب خودش عوض می‌شود (صفحه ممکن است شب‌ها باز بماند)
  const today = useJalaliToday();

  // قبض‌های فعالِ داخلِ بازه‌ی انتخابی
  const filtered = useMemo(
    () => filterReceiptsByPeriod(receipts, period, today),
    [receipts, period, today],
  );

  // تجمیعِ کارکرد بر اساسِ کارگر — منطقِ خالص در utils/receipts.ts است (تست‌پذیر).
  // پورسانت و انعام جدا نگه داشته می‌شوند و «سهمِ خالص» = درآمد منهای پورسانت.
  const { rows, totals, shopShare } = useMemo(() => aggregateWorkerPayroll(filtered), [filtered]);

  // فقط دو کاشی تُن می‌گیرند: «سهمِ کارواش» و «درآمد کل» که عددهای تصمیم‌سازند.
  // بقیه خنثی‌اند تا این دو دیده شوند؛ اگر همه رنگی باشند هیچ‌کدام دیده نمی‌شود.
  const summary = [
    { label: 'درآمد کل', value: formatToman(totals.revenue), unit: 'تومان', icon: CircleDollarSign, tone: 'accent' as const },
    { label: 'پورسانتِ کارگرها', value: formatToman(totals.commission), unit: 'تومان', icon: Wallet, tone: 'neutral' as const },
    { label: 'انعامِ کارگرها', value: formatToman(totals.tip), unit: 'تومان', icon: Coins, tone: 'neutral' as const },
    { label: 'سهمِ خالصِ کارواش', value: formatToman(shopShare), unit: 'تومان', icon: PiggyBank, tone: 'accent' as const },
    { label: 'تعداد قبض', value: toPersianDigits(totals.count), unit: 'قبض', icon: ReceiptText, tone: 'neutral' as const },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* انتخابِ بازه */}
      <PillTabs tabs={PERIODS} active={period} onChange={setPeriod} />

      {/* کارت‌های خلاصه */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {summary.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} unit={s.unit} icon={s.icon} tone={s.tone} />
        ))}
      </div>

      {/* جدولِ کارکردِ کارگرها */}
      <SectionCard
        title="دستمزد و کارکردِ کارگرها"
        subtitle="همه‌ی مبالغ به تومان است. دریافتیِ هر کارگر = پورسانتِ خدمات + انعام (جدا نمایش داده می‌شوند). انعام در درآمد و سهمِ کارواش حساب نمی‌شود؛ مستقیم به کارگر می‌رسد."
      >
        {rows.length === 0 ? (
          <EmptyState icon={Users}>در این بازه قبضی ثبت نشده است.</EmptyState>
        ) : (
          <div className={tableWrapClass}>
            {/* ستونِ آخر («جمعِ دریافتیِ کارگر») تنها عددی است که سرِ ماه به کارگر
                پرداخت می‌شود، پس تنها ستونی است که پررنگ نوشته می‌شود. */}
            <table className={tableClass}>
              <thead>
                <tr className={theadRowClass}>
                  <th className="px-4 py-3 min-w-[160px]">کارگر</th>
                  <th className="px-4 py-3 text-center">تعداد قبض</th>
                  <th className="px-4 py-3 text-center">مجموع فروش</th>
                  <th className="px-4 py-3 text-center">پورسانت</th>
                  <th className="px-4 py-3 text-center">انعام</th>
                  <th className="px-4 py-3 text-center text-[var(--text)]">جمعِ دریافتیِ کارگر</th>
                </tr>
              </thead>
              <tbody className={tbodyClass}>
                {rows.map((r, i) => (
                  <tr key={i} className={rowHoverClass}>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-medium text-[var(--text)]">
                        <Users className="w-4 h-4 text-[var(--text-faint)] shrink-0" />
                        {r.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-[var(--text-muted)]">
                      {toPersianDigits(r.count)}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-[var(--text-muted)]">
                      {formatToman(r.revenue)}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-[var(--text-muted)]">
                      {formatToman(r.commission)}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-[var(--text-muted)]">
                      {formatToman(r.tip)}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums font-semibold text-[var(--text)]">
                      {formatToman(r.commission + r.tip)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[var(--surface-2)] border-t border-[var(--border-strong)] font-semibold text-[var(--text)]">
                  <td className="px-4 py-3">جمع کل</td>
                  <td className="px-4 py-3 text-center tabular-nums">{toPersianDigits(totals.count)}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{formatToman(totals.revenue)}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{formatToman(totals.commission)}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{formatToman(totals.tip)}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{formatToman(totals.commission + totals.tip)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
