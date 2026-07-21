import { ReactNode, useRef, useState } from 'react';
import { KeyRound, Copy, Check, Upload, ShieldAlert, Clock, Sparkles } from 'lucide-react';
import { BRAND } from '../brand';
import { YatashMark } from '../components/brand/YatashLogo';
import { toPersianDigits } from '../utils/format';
import { PrimaryButton, GhostButton } from '../components/common';
import { LicenseStatus } from './useLicense';

type ImportFn = (content: string) => Promise<{ ok: boolean; error?: string }>;

/** پیامِ خطای هر «reason» به زبانِ ساده. */
const REASON_TEXT: Record<string, string> = {
  signature: 'امضای لایسنس معتبر نیست.',
  machine: 'این لایسنس برای دستگاهِ دیگری صادر شده است.',
  corrupt: 'فایلِ لایسنس خراب است.',
  clock: 'ساعتِ سیستم دستکاری شده است؛ آن را درست کنید.',
};

/** کارتِ فعال‌سازی: نمایشِ machineId + بارگذاریِ فایلِ لایسنس. مشترک بین قفل و بنرِ تریال. */
function ActivationCard({
  machineId,
  importLicense,
  onDone,
}: {
  machineId?: string;
  importLicense: ImportFn;
  onDone?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const copyId = async () => {
    if (!machineId) return;
    try {
      await navigator.clipboard.writeText(machineId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* اگر کلیپ‌بورد در دسترس نبود بی‌صدا رد می‌شویم */
    }
  };

  const onFile = async (file: File) => {
    setBusy(true);
    setError('');
    try {
      const text = await file.text();
      const result = await importLicense(text);
      if (!result.ok) setError(result.error || 'فعال‌سازی ناموفق بود.');
      else onDone?.();
    } catch {
      setError('خواندنِ فایل ناموفق بود.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* کدِ دستگاه */}
      <div>
        <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">
          کدِ دستگاهِ شما (این را برای یاتاش بفرستید)
        </label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs font-mono text-[var(--text)] break-all">
            {machineId || '—'}
          </code>
          <GhostButton type="button" onClick={copyId} className="shrink-0">
            {copied ? <Check className="w-4 h-4 text-[var(--money-text)]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'کپی شد' : 'کپی'}
          </GhostButton>
        </div>
      </div>

      {/* بارگذاریِ فایلِ لایسنس */}
      <div>
        <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">
          فایلِ لایسنس (<code>license.dat</code>) را که یاتاش برایتان فرستاده انتخاب کنید
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".dat,.json,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = '';
          }}
        />
        <PrimaryButton type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="w-full">
          <Upload className="w-4 h-4" />
          {busy ? 'در حال بررسی...' : 'انتخاب و فعال‌سازی'}
        </PrimaryButton>
      </div>

      {error && (
        <div className="bg-[var(--danger-soft)] border border-[var(--danger-border)] text-[var(--danger-text)] text-xs font-bold rounded-xl p-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

/** صفحه‌ی تمام‌قدِ قفل — وقتی تریال تمام شده یا لایسنس نامعتبر است. */
function BlockingScreen({ status, importLicense }: { status: LicenseStatus; importLicense: ImportFn }) {
  const isClock = status.reason === 'clock';
  const title = status.state === 'invalid' ? 'لایسنس نامعتبر است' : 'دوره‌ی استفاده به پایان رسید';
  const subtitle = isClock
    ? REASON_TEXT.clock
    : status.state === 'invalid'
      ? REASON_TEXT[status.reason || 'corrupt']
      : 'برای ادامه‌ی کار، لایسنسِ یاتاش را فعال کنید.';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="cw-card w-full max-w-lg p-7 flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 rounded-2xl bg-[var(--danger-soft)] border border-[var(--danger-border)]">
            {isClock ? (
              <Clock className="w-8 h-8 text-[var(--danger-text)]" />
            ) : (
              <KeyRound className="w-8 h-8 text-[var(--danger-text)]" />
            )}
          </div>
          <h1 className="font-display text-2xl text-[var(--text)]">{title}</h1>
          <p className="text-xs font-semibold text-[var(--text-muted)] leading-relaxed max-w-sm">{subtitle}</p>
        </div>

        {!isClock && (
          <div className="border-t border-[var(--border)] pt-5">
            <ActivationCard machineId={status.machineId} importLicense={importLicense} />
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-[var(--text-faint)] pt-2 border-t border-[var(--border)]">
          {BRAND.poweredByFa}
          <YatashMark size={13} />
        </div>
      </div>
    </div>
  );
}

/** بنرِ باریکِ تریال + دکمه‌ی فعال‌سازی (مودال). */
function TrialBanner({ status, importLicense }: { status: LicenseStatus; importLicense: ImportFn }) {
  const [open, setOpen] = useState(false);
  const days = status.daysLeft ?? 0;

  return (
    <>
      <div className="no-print fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-[var(--surface)] border border-[var(--accent-border)] shadow-2xl rounded-full px-4 py-2 animate-fade-in">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-text)]">
          <Sparkles className="w-4 h-4" />
          نسخه‌ی آزمایشی — {toPersianDigits(days)} روز باقی مانده
        </span>
        <button
          onClick={() => setOpen(true)}
          className="cw-primary text-[11px] px-3 py-1.5 rounded-full cursor-pointer"
        >
          فعال‌سازی لایسنس
        </button>
      </div>

      {open && (
        <div
          className="no-print fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div className="cw-card w-full max-w-md p-6 flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg text-[var(--text)]">فعال‌سازیِ لایسنسِ یاتاش</h3>
            <ActivationCard machineId={status.machineId} importLicense={importLicense} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

/**
 * دروازه‌ی لایسنس: تصمیم می‌گیرد برنامه نمایش داده شود یا صفحه‌ی قفل.
 * - loading: چیزی نشان نده (اسپلش رویش است).
 * - trial: برنامه + بنرِ یادآوری.
 * - licensed: فقط برنامه.
 * - expired/invalid: صفحه‌ی قفل.
 */
export default function LicenseGate({
  status,
  importLicense,
  children,
}: {
  status: LicenseStatus;
  importLicense: ImportFn;
  children: ReactNode;
}) {
  if (status.state === 'loading') return null;

  if (status.state === 'expired' || status.state === 'invalid') {
    return <BlockingScreen status={status} importLicense={importLicense} />;
  }

  return (
    <>
      {children}
      {status.state === 'trial' && <TrialBanner status={status} importLicense={importLicense} />}
    </>
  );
}
