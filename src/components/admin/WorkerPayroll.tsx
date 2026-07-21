import { useMemo, useState } from 'react';
import { Users, Wallet, ReceiptText, PiggyBank, CircleDollarSign } from 'lucide-react';
import { Store } from '../../data/store';
import { formatCurrencyToman, toPersianDigits } from '../../utils/format';
import { filterReceiptsByPeriod, jalaliToday, Period, PERIODS, sumRevenue } from '../../utils/receipts';
import { PillTabs, SectionCard, StatCard } from '../common';

/**
 * دستمزد و کارکردِ کارگرها.
 * برای هر بازه: خلاصه‌ی مالیِ کارواش + جدولِ «هر کارگر چقدر کار کرده و چقدر پورسانت طلب دارد».
 * پورسانت از اسنپ‌شاتِ `workerCommission` هر قبض خوانده می‌شود (در لحظه‌ی صدور بر اساسِ ٪ خدمات حساب شده).
 */
export default function WorkerPayroll({ store }: { store: Store }) {
  const { receipts } = store;
  const [period, setPeriod] = useState<Period>('today');
  const today = useMemo(() => jalaliToday(), []);

  // قبض‌های فعالِ داخلِ بازه‌ی انتخابی
  const filtered = useMemo(
    () => filterReceiptsByPeriod(receipts, period, today),
    [receipts, period, today],
  );

  // تجمیعِ کارکرد بر اساسِ کارگر
  const rows = useMemo(() => {
    const map = new Map<string, { name: string; count: number; revenue: number; commission: number }>();
    for (const r of filtered) {
      const key = r.workerId ?? '__none__';
      const name = r.workerName ?? 'بدون کارگر';
      const cur = map.get(key) ?? { name, count: 0, revenue: 0, commission: 0 };
      cur.count += 1;
      cur.revenue += r.price;
      cur.commission += r.workerCommission ?? 0;
      map.set(key, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.commission - a.commission);
  }, [filtered]);

  const totals = useMemo(
    () => ({
      count: filtered.length,
      revenue: sumRevenue(filtered),
      commission: filtered.reduce((s, r) => s + (r.workerCommission ?? 0), 0),
    }),
    [filtered],
  );
  const shopShare = totals.revenue - totals.commission;

  const summary = [
    { label: 'درآمد کل', value: formatCurrencyToman(totals.revenue), icon: CircleDollarSign, color: 'text-[var(--price)] bg-[var(--price-soft)] border-[var(--price-border)]' },
    { label: 'پورسانتِ کارگرها', value: formatCurrencyToman(totals.commission), icon: Wallet, color: 'text-[var(--money-text)] bg-[var(--money-soft)] border-[var(--money-border)]' },
    { label: 'سهمِ خالصِ کارواش', value: formatCurrencyToman(shopShare), icon: PiggyBank, color: 'text-[var(--accent-text)] bg-[var(--accent-soft)] border-[var(--accent-border)]' },
    { label: 'تعداد قبض', value: `${toPersianDigits(totals.count)} قبض`, icon: ReceiptText, color: 'text-[var(--text-muted)] bg-[var(--surface-2)] border-[var(--border)]' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* انتخابِ بازه */}
      <PillTabs tabs={PERIODS} active={period} onChange={setPeriod} />

      {/* کارت‌های خلاصه */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} />
        ))}
      </div>

      {/* جدولِ کارکردِ کارگرها */}
      <SectionCard
        title="دستمزد و کارکردِ کارگرها"
        subtitle="پورسانتِ هر کارگر بر اساسِ درصدِ خدماتِ انجام‌شده. «سهمِ خالص» یعنی درآمد منهای پورسانتِ کارگرها."
      >
        {rows.length === 0 ? (
          <p className="text-center text-xs text-[var(--text-faint)] py-8">در این بازه قبضی ثبت نشده است.</p>
        ) : (
          <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 font-bold text-[var(--text-muted)] min-w-[160px]">کارگر</th>
                  <th className="px-4 py-3 font-bold text-[var(--text-muted)] text-center">تعداد قبض</th>
                  <th className="px-4 py-3 font-bold text-[var(--text-muted)] text-center">مجموع فروش</th>
                  <th className="px-4 py-3 font-bold text-[var(--money-text)] text-center">پورسانتِ قابل پرداخت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-[var(--surface-2)]">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-bold text-[var(--text)]">
                        <Users className="w-4 h-4 text-[var(--text-faint)] shrink-0" />
                        {r.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-[var(--text-muted)]">
                      {toPersianDigits(r.count)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-[var(--text)]">
                      {formatCurrencyToman(r.revenue)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-black text-[var(--money-text)]">
                      {formatCurrencyToman(r.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[var(--bg)] border-t-2 border-[var(--border)] font-black">
                  <td className="px-4 py-3 text-[var(--text)]">جمع کل</td>
                  <td className="px-4 py-3 text-center font-mono text-[var(--text)]">{toPersianDigits(totals.count)}</td>
                  <td className="px-4 py-3 text-center font-mono text-[var(--text)]">{formatCurrencyToman(totals.revenue)}</td>
                  <td className="px-4 py-3 text-center font-mono text-[var(--money-text)]">{formatCurrencyToman(totals.commission)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
