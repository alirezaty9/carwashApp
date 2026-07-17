import { ButtonHTMLAttributes, ReactNode, useCallback, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

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
  return (
    <div>
      <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">
        {label} {required && <span className="text-[var(--danger-text)]">*</span>}
        {hint && <span className="text-[var(--text-faint)] font-medium mr-1">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

/** کلاس‌های مشترک ورودی‌ها برای یکدستی و DRY */
export const inputClass =
  'w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-faint)] placeholder:font-normal placeholder:text-xs rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[var(--accent-soft)] focus:border-[var(--accent-strong)] outline-none transition-all';

/** دکمه‌ی اصلی */
export function PrimaryButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`cw-primary text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer ${className}`}
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
      className={`text-[var(--text-muted)] hover:bg-[var(--surface-2)] border border-[var(--border)] font-bold text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${className}`}
      {...rest}
    >
      {children}
    </button>
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
