import { useMemo } from 'react';
import { DollarSign, FileText, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import { Store } from '../../data/store';
import { formatCurrencyToman, formatToman, toPersianDigits } from '../../utils/format';
import { getJalaliDateParts, JALALI_MONTH_NAMES } from '../../utils/jalali';
import { activeReceipts, isOnJalaliDay, sumRevenue } from '../../utils/receipts';
import { useJalaliToday } from '../../utils/useJalaliToday';
import { SectionCard, StatCard } from '../common';

export default function Reports({ store }: { store: Store }) {
  const { receipts, sales } = store;
  // «امروز» زنده است: اگر صفحه از دیشب باز مانده باشد، بعد از نیمه‌شب خودش
  // به‌روز می‌شود و «درآمد امروز» دیگر عددِ دیروز را نشان نمی‌دهد.
  const today = useJalaliToday();

  const active = useMemo(() => activeReceipts(receipts), [receipts]);
  const voided = useMemo(() => receipts.filter((r) => r.status === 'voided'), [receipts]);

  const todayRevenue = sumRevenue(active.filter((r) => isOnJalaliDay(r, today)));

  const monthRevenue = sumRevenue(
    active.filter((r) => r.jalaliYear === today.year && r.jalaliMonth === today.month),
  );

  // درآمدِ فروشِ لوازم جانبی (جدا از شست‌وشو) — فقط فروش‌های فعال
  const activeSales = useMemo(() => sales.filter((s) => s.status === 'active'), [sales]);
  const salesTodayRevenue = activeSales
    .filter((s) => s.jalaliYear === today.year && s.jalaliMonth === today.month && s.jalaliDay === today.day)
    .reduce((sum, s) => sum + s.total, 0);
  const salesMonthRevenue = activeSales
    .filter((s) => s.jalaliYear === today.year && s.jalaliMonth === today.month)
    .reduce((sum, s) => sum + s.total, 0);

  // درآمد ۷ روز اخیر
  const daily = useMemo(() => {
    const out: { dayName: string; day: number; month: number; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const p = getJalaliDateParts(d);
      const value = sumRevenue(active.filter((r) => isOnJalaliDay(r, p)));
      out.push({ dayName: d.toLocaleDateString('fa-IR', { weekday: 'long' }), day: p.day, month: p.month, value });
    }
    return out;
    // وابسته به `today` تا با عوض شدنِ روز، نمودارِ ۷ روزه هم بلغزد
  }, [active, today]);

  const monthly = useMemo(
    () =>
      JALALI_MONTH_NAMES.map((name, i) => ({
        name,
        value: sumRevenue(active.filter((r) => r.jalaliYear === today.year && r.jalaliMonth === i + 1)),
      })),
    [active, today.year],
  );

  const maxDaily = Math.max(...daily.map((d) => d.value), 100000);
  const maxMonthly = Math.max(...monthly.map((m) => m.value), 100000);

  // کاشیِ آیکن فقط جایی تُن می‌گیرد که واقعاً معنا دارد؛ عددِ آماری همیشه با
  // جوهرِ عادی نوشته می‌شود، چون رنگ در این برنامه فقط «حالت» را می‌گوید.
  const stats = [
    { label: 'درآمد امروز', value: formatToman(todayRevenue), unit: 'تومان', icon: DollarSign, tone: 'accent' as const },
    { label: 'درآمد ماه جاری', value: formatToman(monthRevenue), unit: 'تومان', icon: TrendingUp, tone: 'accent' as const },
    { label: 'قبوض فعال', value: toPersianDigits(active.length), unit: 'قبض', icon: FileText, tone: 'neutral' as const },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* کارت‌های خلاصه — درآمدِ شست‌وشو */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} unit={s.unit} icon={s.icon} tone={s.tone} />
        ))}
      </div>

      {/* درآمدِ فروشِ لوازم جانبی (جدا از شست‌وشو) */}
      <SectionCard title="فروش لوازم جانبی">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="فروش امروز" value={formatToman(salesTodayRevenue)} unit="تومان" icon={ShoppingCart} tone="accent" />
          <StatCard label="فروش ماه جاری" value={formatToman(salesMonthRevenue)} unit="تومان" icon={TrendingUp} tone="accent" />
          <StatCard
            label="تعداد فاکتورهای فعال"
            value={toPersianDigits(activeSales.length)}
            unit="فاکتور"
            icon={Package}
          />
        </div>
      </SectionCard>

      {/* نمودار ۷ روز اخیر — یک سری داده، پس یک رنگ و بدونِ راهنمای رنگ.
          عدد فقط هنگامِ نگه‌داشتنِ نشانگر روی میله می‌آید؛ نوشتنِ عدد روی هر
          میله نمودار را به یک جدولِ شلوغ تبدیل می‌کند. */}
      <SectionCard title="درآمد روزانه (۷ روز اخیر)">
        <div className="h-48 flex items-end gap-2 sm:gap-4 border-b border-[var(--border)]">
          {daily.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group min-w-0">
              <span className="opacity-0 group-hover:opacity-100 bg-[var(--surface-3)] border border-[var(--border)] text-[var(--text)] text-[11px] font-medium tabular-nums px-2 py-1 rounded-lg mb-1.5 transition-opacity text-center whitespace-nowrap">
                {formatCurrencyToman(d.value)}
              </span>
              <div
                style={{ height: `${(d.value / maxDaily) * 100}%` }}
                className="w-full bg-[var(--chart-bar)] rounded-t-[4px] transition-[height] duration-500 min-h-[3px]"
              />
              <span className="text-[11px] text-[var(--text-muted)] font-medium mt-2 truncate max-w-full">{d.dayName}</span>
              <span className="text-[11px] text-[var(--text-faint)] mt-0.5 whitespace-nowrap">
                {toPersianDigits(d.day)} {JALALI_MONTH_NAMES[d.month - 1]}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* نمودار ماهانه */}
      <SectionCard title={`درآمد ماهانه (سال ${toPersianDigits(today.year)})`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
          {monthly.map((m, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline gap-3 text-xs">
                <span className="text-[var(--text-muted)]">{m.name}</span>
                <span className="font-semibold text-[var(--text)] tabular-nums">{formatCurrencyToman(m.value)}</span>
              </div>
              <div className="w-full bg-[var(--chart-track)] h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(m.value / maxMonthly) * 100}%` }}
                  className="bg-[var(--chart-bar)] h-full rounded-full transition-[width] duration-700"
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* گزارش ابطال */}
      <SectionCard title="سلامت قبوض">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
          <div className="flex justify-between items-center gap-3 p-3.5 rounded-xl border border-[var(--border)]">
            <span className="text-[var(--text-muted)]">قبوض فعال</span>
            <span className="font-semibold text-[var(--ok-text)] tabular-nums">{toPersianDigits(active.length)}</span>
          </div>
          <div className="flex justify-between items-center gap-3 p-3.5 rounded-xl border border-[var(--border)]">
            <span className="text-[var(--text-muted)]">قبوض باطل‌شده</span>
            <span className="font-semibold text-[var(--danger-text)] tabular-nums">{toPersianDigits(voided.length)}</span>
          </div>
          <div className="flex justify-between items-center gap-3 p-3.5 rounded-xl border border-[var(--border)]">
            <span className="text-[var(--text-muted)]">نرخ ابطال</span>
            <span className="font-semibold text-[var(--text)] tabular-nums">
              {receipts.length > 0 ? toPersianDigits(Math.round((voided.length / receipts.length) * 100)) : '۰'}٪
            </span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
