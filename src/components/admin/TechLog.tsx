import { useState, useSyncExternalStore } from 'react';
import { ClipboardCopy, Download, Trash2, RefreshCw, Terminal } from 'lucide-react';
import { SectionCard, StatusPill, Callout } from '../common';
import { getPrinterBridge } from '../../utils/printing';
import { clearLog, getLogEntries, logAsText, logStep, LogEntry, LogLevel, subscribeLog } from '../../utils/techLog';

/**
 * تبِ «گزارشِ فنی» — ابزارِ عیب‌یابیِ دوره‌ی تست.
 *
 * هر قدمِ مسیرِ چاپ را با ساعت و فاصله‌ی زمانی نشان می‌دهد: هم قدم‌های سمتِ
 * دیداریِ برنامه و هم قدم‌هایی که بخشِ سیستمی با سیستم‌عامل رد و بدل می‌کند.
 *
 * 🔴 موقتی است و بعد از تأییدِ نهاییِ چاپ روی ویندوز برداشته می‌شود.
 */

const LEVEL_TONE: Record<LogLevel, 'neutral' | 'ok' | 'warn' | 'danger'> = {
  info: 'neutral',
  ok: 'ok',
  warn: 'warn',
  error: 'danger',
};

const LEVEL_LABEL: Record<LogLevel, string> = {
  info: 'اطلاع',
  ok: 'موفق',
  warn: 'هشدار',
  error: 'خطا',
};

export default function TechLog() {
  const entries = useSyncExternalStore(subscribeLog, getLogEntries, getLogEntries);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [onlyProblems, setOnlyProblems] = useState(false);

  const shown = onlyProblems ? entries.filter((e) => e.level === 'warn' || e.level === 'error') : entries;
  const problemCount = entries.filter((e) => e.level === 'error').length;

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(logAsText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const saveToFile = async () => {
    const bridge = getPrinterBridge();
    if (!bridge?.saveLog) return;
    const result = await bridge.saveLog(logAsText());
    setSaved(result.success ? `ذخیره شد: ${result.path}` : `ذخیره نشد: ${result.reason ?? 'علتِ نامشخص'}`);
  };

  /** مشخصاتِ سیستم و فهرستِ پرینترها را دوباره در گزارش می‌نویسد. */
  const refreshEnvironment = async () => {
    const bridge = getPrinterBridge();
    if (!bridge?.environment) {
      logStep('🔴 مشخصاتِ سیستم در دسترس نیست', 'اجرا در مرورگر', 'error');
      return;
    }
    const info = (await bridge.environment()) as Record<string, unknown> & {
      printers?: { name: string; isDefault: boolean; status: number }[];
    };
    logStep(
      'مشخصاتِ سیستم',
      `سیستم‌عامل=${info.platform}/${info.arch} (${info.osRelease}) · الکترون=${info.electron} · ` +
        `کروم=${info.chrome} · نسخه‌ی برنامه=${info.appVersion} · نصب‌شده=${info.packaged ? 'بله' : 'خیر'}`,
    );
    logStep(
      `پرینترهای سیستم: ${info.printers?.length ?? 0} مورد`,
      info.printers?.length
        ? info.printers.map((p) => `«${p.name}»${p.isDefault ? ' (پیش‌فرض)' : ''} وضعیت=${p.status}`).join(' · ')
        : 'هیچ پرینتری پیدا نشد',
      info.printers?.length ? 'info' : 'error',
    );
  };

  return (
    <SectionCard
      title="گزارشِ فنی"
      subtitle="هر قدمِ مسیرِ چاپ با ساعتِ دقیق اینجا ثبت می‌شود. اگر چاپ انجام نشد، دکمه‌ی «ذخیره در فایل» را بزنید و فایل را برای پشتیبانی بفرستید. این تب موقت است و بعد از تأییدِ نهایی برداشته می‌شود."
      action={
        <div className="flex items-center gap-2">
          <StatusPill tone={problemCount > 0 ? 'danger' : 'neutral'}>
            {problemCount > 0 ? `${problemCount} خطا` : `${entries.length} قدم`}
          </StatusPill>
        </div>
      }
    >
      <Callout tone="accent" icon={Terminal} title="چطور استفاده کنید">
        اول «ثبتِ مشخصاتِ سیستم» را بزنید، بعد یک «چاپِ آزمایشی» از تبِ تنظیمات بگیرید، بعد برگردید اینجا و گزارش را
        ذخیره کنید. همه‌ی قدم‌ها به‌ترتیبِ زمان نوشته می‌شوند و عددِ داخلِ پرانتز یعنی چند میلی‌ثانیه از قدمِ قبلی فاصله
        داشته — قدمی که خیلی طول کشیده همان‌جا پیداست.
      </Callout>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={refreshEnvironment}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          ثبتِ مشخصاتِ سیستم
        </button>
        <button
          type="button"
          onClick={saveToFile}
          disabled={entries.length === 0}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] disabled:opacity-50 cursor-pointer transition-colors"
        >
          <Download className="w-4 h-4" />
          ذخیره در فایل
        </button>
        <button
          type="button"
          onClick={copyAll}
          disabled={entries.length === 0}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-50 cursor-pointer transition-colors"
        >
          <ClipboardCopy className="w-4 h-4" />
          {copied ? 'کپی شد' : 'کپیِ گزارش'}
        </button>
        <button
          type="button"
          onClick={() => setOnlyProblems((v) => !v)}
          className={`px-3.5 py-2 rounded-xl text-[13px] font-medium border cursor-pointer transition-colors ${
            onlyProblems
              ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
          }`}
        >
          فقط خطاها و هشدارها
        </button>
        <button
          type="button"
          onClick={() => {
            clearLog();
            setSaved(null);
          }}
          disabled={entries.length === 0}
          title="پاک‌کردنِ گزارش"
          className="p-2 rounded-xl border border-[var(--border)] text-[var(--danger-text)] hover:bg-[var(--danger-soft)] disabled:opacity-50 cursor-pointer transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {saved && (
        <div className="text-[12px] font-medium text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 break-all">
          {saved}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-[13px] text-[var(--text-faint)] py-6 text-center">
          {entries.length === 0 ? 'هنوز چیزی ثبت نشده.' : 'هیچ خطا یا هشداری ثبت نشده.'}
        </p>
      ) : (
        <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] divide-y divide-[var(--border)]">
          {shown.map((entry) => (
            <LogRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function LogRow({ entry }: { entry: LogEntry }) {
  return (
    <div className="flex items-start gap-3 px-3 py-2">
      <span className="text-[11px] font-mono text-[var(--text-faint)] shrink-0 pt-[3px] tabular-nums">
        {entry.time}
        {entry.gapMs > 0 && <span className="block text-[10px]">+{entry.gapMs}ms</span>}
      </span>
      <span
        className={`text-[10px] font-semibold px-1.5 py-[2px] rounded-md shrink-0 mt-[2px] ${
          entry.source === 'app'
            ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
            : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
        }`}
      >
        {entry.source === 'app' ? 'اپ' : 'سیستم'}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[12px] font-semibold text-[var(--text)] leading-relaxed">{entry.step}</p>
          {entry.level !== 'info' && (
            <StatusPill tone={LEVEL_TONE[entry.level]}>{LEVEL_LABEL[entry.level]}</StatusPill>
          )}
        </div>
        {entry.detail && (
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed break-words mt-0.5 font-mono">
            {entry.detail}
          </p>
        )}
      </div>
    </div>
  );
}
