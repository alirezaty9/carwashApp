import { KeyRound, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { SectionCard, StatusPill } from '../components/common';
import { toPersianDigits } from '../utils/format';
import { getFormattedJalali } from '../utils/jalali';
import { useLicense } from './useLicense';
import { ActivationCard } from './LicenseGate';

/** نمایشِ وضعیتِ لایسنس و امکانِ فعال‌سازی/تمدید در پنل مدیریت. */
export default function LicenseSettings() {
  const { status, importLicense } = useLicense();

  const badge = (() => {
    switch (status.state) {
      case 'licensed':
        return { icon: ShieldCheck, text: 'لایسنسِ فعال', tone: 'ok' as const };
      case 'trial':
        return { icon: Sparkles, text: 'نسخه‌ی آزمایشی', tone: 'accent' as const };
      case 'loading':
        return { icon: KeyRound, text: 'در حال بررسی...', tone: 'neutral' as const };
      default:
        return { icon: AlertTriangle, text: 'بدون لایسنسِ معتبر', tone: 'danger' as const };
    }
  })();

  const BadgeIcon = badge.icon;
  // تاریخِ اعتبار را به‌جای میلادیِ خام (YYYY-MM-DD) به شمسی نشان می‌دهیم.
  const expiryDate = status.expiresAt ? getFormattedJalali(new Date(status.expiresAt), false) : '—';

  return (
    <SectionCard
      title="لایسنس و فعال‌سازی"
      subtitle="وضعیتِ لایسنسِ این دستگاه، کدِ دستگاه برای ارسال به یاتاش، و فعال‌سازی/تمدید."
    >
      {/* وضعیت */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border)] flex items-center justify-between gap-2">
          <span className="text-xs text-[var(--text-muted)]">وضعیت</span>
          <StatusPill tone={badge.tone} icon={BadgeIcon}>
            {badge.text}
          </StatusPill>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] flex items-center justify-between gap-2">
          <span className="text-xs text-[var(--text-muted)]">روزهای باقی‌مانده</span>
          <span className="text-[15px] font-semibold text-[var(--text)] tabular-nums">
            {status.state === 'trial' || status.state === 'licensed' ? `${toPersianDigits(status.daysLeft ?? 0)} روز` : '—'}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] flex items-center justify-between gap-2">
          <span className="text-xs text-[var(--text-muted)]">اعتبار تا</span>
          <span className="text-[13px] font-semibold text-[var(--text)] tabular-nums">{expiryDate}</span>
        </div>
      </div>

      {/* فعال‌سازی / تمدید */}
      <div className="border-t border-[var(--border)] pt-5">
        <ActivationCard machineId={status.machineId} importLicense={importLicense} />
      </div>
    </SectionCard>
  );
}
