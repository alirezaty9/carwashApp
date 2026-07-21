import { KeyRound, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { SectionCard } from '../components/common';
import { toPersianDigits } from '../utils/format';
import { useLicense } from './useLicense';
import { ActivationCard } from './LicenseGate';

/** نمایشِ وضعیتِ لایسنس و امکانِ فعال‌سازی/تمدید در پنل مدیریت. */
export default function LicenseSettings() {
  const { status, importLicense } = useLicense();

  const badge = (() => {
    switch (status.state) {
      case 'licensed':
        return { icon: ShieldCheck, text: 'لایسنسِ فعال', cls: 'text-[var(--money-text)] bg-[var(--money-soft)] border-[var(--money-border)]' };
      case 'trial':
        return { icon: Sparkles, text: 'نسخه‌ی آزمایشی', cls: 'text-[var(--accent-text)] bg-[var(--accent-soft)] border-[var(--accent-border)]' };
      case 'loading':
        return { icon: KeyRound, text: 'در حال بررسی...', cls: 'text-[var(--text-muted)] bg-[var(--surface-2)] border-[var(--border)]' };
      default:
        return { icon: AlertTriangle, text: 'بدون لایسنسِ معتبر', cls: 'text-[var(--danger-text)] bg-[var(--danger-soft)] border-[var(--danger-border)]' };
    }
  })();

  const BadgeIcon = badge.icon;
  const expiryDate = status.expiresAt ? status.expiresAt.slice(0, 10) : '—';

  return (
    <SectionCard
      title="لایسنس و فعال‌سازی"
      subtitle="وضعیتِ لایسنسِ این دستگاه، کدِ دستگاه برای ارسال به یاتاش، و فعال‌سازی/تمدید."
    >
      {/* وضعیت */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[var(--text-muted)]">وضعیت</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.cls}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            {badge.text}
          </span>
        </div>
        <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[var(--text-muted)]">روزهای باقی‌مانده</span>
          <span className="text-base font-black text-[var(--text)] font-mono">
            {status.state === 'trial' || status.state === 'licensed' ? `${toPersianDigits(status.daysLeft ?? 0)} روز` : '—'}
          </span>
        </div>
        <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[var(--text-muted)]">اعتبار تا</span>
          <span className="text-xs font-bold text-[var(--text)] font-mono">{expiryDate}</span>
        </div>
      </div>

      {/* فعال‌سازی / تمدید */}
      <div className="border-t border-[var(--border)] pt-5">
        <ActivationCard machineId={status.machineId} importLicense={importLicense} />
      </div>
    </SectionCard>
  );
}
