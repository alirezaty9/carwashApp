import { useMemo } from 'react';
import { DollarSign, FileText, TrendingUp } from 'lucide-react';
import { Store } from '../../data/store';
import {
  formatCurrencyToman,
  getJalaliDateParts,
  JALALI_MONTH_NAMES,
  toPersianDigits,
} from '../../utils/jalali';
import { SectionCard } from '../common';

export default function Reports({ store }: { store: Store }) {
  const { receipts } = store;
  const today = useMemo(() => getJalaliDateParts(new Date()), []);

  const active = useMemo(() => receipts.filter((r) => r.status === 'active'), [receipts]);
  const voided = useMemo(() => receipts.filter((r) => r.status === 'voided'), [receipts]);

  const todayRevenue = active
    .filter((r) => r.jalaliYear === today.year && r.jalaliMonth === today.month && r.jalaliDay === today.day)
    .reduce((s, r) => s + r.price, 0);

  const monthRevenue = active
    .filter((r) => r.jalaliYear === today.year && r.jalaliMonth === today.month)
    .reduce((s, r) => s + r.price, 0);

  // درآمد ۷ روز اخیر
  const daily = useMemo(() => {
    const out: { dayName: string; day: number; month: number; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const p = getJalaliDateParts(d);
      const value = active
        .filter((r) => r.jalaliYear === p.year && r.jalaliMonth === p.month && r.jalaliDay === p.day)
        .reduce((s, r) => s + r.price, 0);
      out.push({ dayName: d.toLocaleDateString('fa-IR', { weekday: 'long' }), day: p.day, month: p.month, value });
    }
    return out;
  }, [active]);

  const monthly = useMemo(
    () =>
      JALALI_MONTH_NAMES.map((name, i) => ({
        name,
        value: active
          .filter((r) => r.jalaliYear === today.year && r.jalaliMonth === i + 1)
          .reduce((s, r) => s + r.price, 0),
      })),
    [active, today.year],
  );

  const maxDaily = Math.max(...daily.map((d) => d.value), 100000);
  const maxMonthly = Math.max(...monthly.map((m) => m.value), 100000);

  const stats = [
    { label: 'درآمد امروز', value: formatCurrencyToman(todayRevenue), icon: DollarSign, color: 'text-[var(--price)] bg-[var(--price-soft)] border-[var(--price-border)]' },
    { label: 'درآمد ماه جاری', value: formatCurrencyToman(monthRevenue), icon: TrendingUp, color: 'text-[var(--price)] bg-[var(--price-soft)] border-[var(--price-border)]' },
    { label: 'قبوض فعال', value: `${toPersianDigits(active.length)} قبض`, icon: FileText, color: 'text-[var(--text-muted)] bg-[var(--surface-2)] border-[var(--border)]' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* کارت‌های خلاصه */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[var(--text-muted)] font-bold block mb-1">{s.label}</span>
              <span className="text-lg font-black text-[var(--text)] font-mono">{s.value}</span>
            </div>
            <div className={`p-3 rounded-xl border ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* نمودار ۷ روز اخیر */}
      <SectionCard title="درآمد روزانه (۷ روز اخیر)">
        <div className="h-48 flex items-end gap-3 sm:gap-6 border-b border-[var(--border)] pb-2">
          {daily.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="opacity-0 group-hover:opacity-100 bg-[var(--surface-2)] text-[var(--text)] text-[10px] px-2 py-1 rounded mb-1 transition-all text-center">
                {formatCurrencyToman(d.value)}
              </span>
              <div style={{ height: `${(d.value / maxDaily) * 100}%` }} className="w-full bg-[var(--price-strong)] rounded-t-lg transition-all duration-500 min-h-[4px]" />
              <span className="text-[10px] text-[var(--text-muted)] font-bold mt-2 truncate max-w-full">{d.dayName}</span>
              <span className="text-[9px] text-[var(--text-faint)] mt-0.5">
                {toPersianDigits(d.day)} {JALALI_MONTH_NAMES[d.month - 1]}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* نمودار ماهانه */}
      <SectionCard title={`درآمد ماهانه (سال ${toPersianDigits(today.year)})`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthly.map((m, i) => (
            <div key={i} className="flex flex-col gap-1.5 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[var(--text-muted)]">{m.name}</span>
                <span className="font-black text-[var(--text)] font-mono">{formatCurrencyToman(m.value)}</span>
              </div>
              <div className="w-full bg-[var(--surface)] h-2.5 rounded-full overflow-hidden">
                <div style={{ width: `${(m.value / maxMonthly) * 100}%` }} className="bg-[var(--price-strong)] h-full rounded-full transition-all duration-700" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* گزارش ابطال */}
      <SectionCard title="سلامت قبوض">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
          <div className="flex justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <span className="text-[var(--text-muted)]">قبوض فعال</span>
            <span className="text-[var(--money-text)]">{toPersianDigits(active.length)}</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <span className="text-[var(--text-muted)]">قبوض باطل‌شده</span>
            <span className="text-[var(--danger-text)]">{toPersianDigits(voided.length)}</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <span className="text-[var(--text-muted)]">نرخ ابطال</span>
            <span className="text-[var(--text)] font-mono">
              {receipts.length > 0 ? toPersianDigits(Math.round((voided.length / receipts.length) * 100)) : '۰'}٪
            </span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
