import { ButtonHTMLAttributes, ReactNode, useCallback, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X, ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { toPersianDigits } from '../utils/format';

/** نوع پیام اعلان */
export type NoticeType = 'success' | 'error' | 'info';
export interface Notice {
  message: string;
  type: NoticeType;
}

/** هوکِ ساده برای مدیریت اعلان‌های موقت */
export function useNotification() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const notify = useCallback((message: string, type: NoticeType = 'info') => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 4000);
  }, []);
  return { notice, notify };
}

/** نوار اعلانِ شناور بالای صفحه */
export function NotificationBar({ notice }: { notice: Notice | null }) {
  if (!notice) return null;
  const styles: Record<NoticeType, string> = {
    success: 'bg-[var(--money-soft)] border-[var(--money-border)] text-[var(--money-text)]',
    error: 'bg-[var(--danger-soft)] border-[var(--danger-border)] text-[var(--danger-text)]',
    info: 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)]',
  };
  const Icon = notice.type === 'success' ? CheckCircle : notice.type === 'error' ? AlertCircle : Info;
  return (
    <div
      className={`no-print fixed top-4 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[92%] p-3.5 rounded-xl flex items-start gap-3 border shadow-2xl animate-fade-in ${styles[notice.type]}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <div className="text-xs font-semibold leading-relaxed">{notice.message}</div>
    </div>
  );
}

/** کارتِ بخش با تیتر و توضیح */
export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`cw-card p-5 sm:p-6 flex flex-col gap-5 ${className}`}>
      {(title || action) && (
        <div className="border-b border-[var(--border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-xl text-[var(--text)] leading-tight">{title}</h2>}
            {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/** مودالِ عمومی */
export function Modal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-md',
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="no-print fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`cw-card w-full ${maxWidth} p-6 flex flex-col gap-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/** فیلدِ ورودی با برچسب */
export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  // تیترِ گام‌های شماره‌دار (که با رقمِ فارسی یا انگلیسی شروع می‌شوند: ۱، ۲، ... ۸ ...)
  // به‌صورتِ خودکار آبی می‌شوند — بدون نیاز به تنظیمِ دستی برای هر فیلد.
  const isNumbered = /^\s*[۰-۹0-9]/.test(label);
  return (
    <div>
      <label className={`block text-xs font-bold mb-2 ${isNumbered ? 'text-[#7f8081]' : 'text-[var(--text-muted)]'}`}>
        {label} {required && <span className="text-[var(--danger-text)]">*</span>}
        {hint && <span className="text-[var(--text-faint)] font-medium mr-1">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

/** کلاس‌های مشترک ورودی‌ها برای یکدستی و DRY */
export const inputClass =
  'w-full bg-[var(--field-bg)] text-[var(--field-text)] border border-[var(--border)] placeholder-[var(--text-faint)] placeholder:font-normal placeholder:text-xs rounded-xl px-3.5 py-2.5 text-sm font-semibold hover:bg-[var(--field-hover-bg)] focus:bg-[var(--field-bg)] focus:ring-4 focus:ring-[var(--accent-soft)] focus:border-[var(--accent-strong)] outline-none transition-all';

/** دکمه‌ی اصلی */
export function PrimaryButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`cw-primary text-sm px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer font-bold ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** دکمه‌ی خنثی (ثانویه) */
export function GhostButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] border border-[var(--border)] font-bold text-sm px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** نوارِ زبانه‌ی قرص‌شکل (pill) — برای زیرمنوها و انتخابِ بازه؛ آیکن اختیاری */
export function PillTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; icon?: LucideIcon }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 bg-[var(--surface)] p-2 rounded-2xl border border-[var(--border)]">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            active === t.id ? 'cw-primary' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
          }`}
        >
          {t.icon && <t.icon className="w-4 h-4" />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** کارتِ آماریِ خلاصه (برچسب + مقدار + آیکنِ رنگی) */
export function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="group bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-[var(--card-shadow)] flex items-center justify-between gap-3 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="min-w-0">
        <span className="text-[11px] text-[var(--text-muted)] font-bold block mb-1.5 tracking-wide">{label}</span>
        <span className="text-lg font-black text-[var(--text)] font-mono tabular-nums leading-none">{value}</span>
      </div>
      <div className={`p-3 rounded-2xl border shrink-0 transition-transform duration-200 group-hover:scale-105 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

/**
 * نوارِ صفحه‌بندی — برای لیست‌های بلند تا یک‌جا هزاران ردیف رندر نشود.
 * والد فقط ردیف‌های همان صفحه را می‌بُرد؛ این کامپوننت دکمه‌های قبلی/بعدی را می‌سازد.
 */
export function Pagination({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return null;
  const btn =
    'px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all';
  return (
    <div className="flex items-center justify-center gap-3 pt-1">
      <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronRight className="w-4 h-4" /> قبلی
      </button>
      <span className="text-xs font-bold text-[var(--text-muted)] font-mono">
        صفحه {toPersianDigits(page)} از {toPersianDigits(pageCount)}
      </span>
      <button type="button" className={btn} disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
        بعدی <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
}

/** هدرِ مودال با آیکن و امکان بستن */
export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
      <h3 className="font-display text-lg text-[var(--text)]">{title}</h3>
      <button onClick={onClose} className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-lg cursor-pointer">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
