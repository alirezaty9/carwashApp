import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, useCallback, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X, ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { toPersianDigits, toEnglishDigits } from '../utils/format';

/**
 * اجزای مشترکِ ظاهری.
 *
 * قاعده‌ی رنگ در کلِ برنامه: رنگ فقط «حالت» را می‌گوید، نه تزئین.
 *   accent → تعامل (دکمه‌ی اصلی، تبِ فعال، فوکوس، انتخاب‌شده)
 *   ok     → تأیید/فعال          danger → ابطال/حذف/خطا        warn → هشدار
 * مبلغ‌ها هیچ رنگی ندارند؛ با اندازه و وزن و عددِ هم‌عرض برجسته می‌شوند.
 */
export type Tone = 'neutral' | 'accent' | 'ok' | 'danger' | 'warn';

/** کلاس‌های «متن/زمینه/خط» هر تُن — یک جا تعریف تا همه‌ی چیپ‌ها و کادرها یکی باشند. */
const TONE_SURFACE: Record<Tone, string> = {
  neutral: 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-muted)]',
  accent: 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)]',
  ok: 'bg-[var(--ok-soft)] border-[var(--ok-border)] text-[var(--ok-text)]',
  danger: 'bg-[var(--danger-soft)] border-[var(--danger-border)] text-[var(--danger-text)]',
  warn: 'bg-[var(--warn-soft)] border-[var(--warn-border)] text-[var(--warn-text)]',
};

/** نوع پیام اعلان */
export type NoticeType = 'success' | 'error' | 'info';
export interface Notice {
  message: string;
  type: NoticeType;
}

/** هوکِ ساده برای مدیریت اعلان‌های موقت */
export function useNotification() {
  const [notice, setNotice] = useState<Notice | null>(null);
  // تایمرِ پیامِ قبلی لغو می‌شود، وگرنه وقتی دو پیام پشتِ‌سرِهم بیایند، تایمرِ اولی
  // دومی را زودتر از موعد پاک می‌کند.
  const timerRef = useRef<number | null>(null);
  const notify = useCallback((message: string, type: NoticeType = 'info') => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setNotice({ message, type });
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setNotice(null);
    }, 4000);
  }, []);
  return { notice, notify };
}

/**
 * نوار اعلانِ شناور بالای صفحه.
 * زمینه‌اش مات است (نه ته‌رنگِ نیمه‌شفاف) تا هر چیزی که زیرش باشد متنِ پیام را
 * ناخوانا نکند؛ رنگ فقط در نوارِ کناری و آیکن دیده می‌شود.
 */
export function NotificationBar({ notice }: { notice: Notice | null }) {
  if (!notice) return null;
  const tone: Tone = notice.type === 'success' ? 'ok' : notice.type === 'error' ? 'danger' : 'accent';
  const accents: Record<Tone, string> = {
    neutral: 'text-[var(--text-muted)] border-r-[var(--border-strong)]',
    accent: 'text-[var(--accent-text)] border-r-[var(--accent)]',
    ok: 'text-[var(--ok-text)] border-r-[var(--ok-strong)]',
    danger: 'text-[var(--danger-text)] border-r-[var(--danger-strong)]',
    warn: 'text-[var(--warn-text)] border-r-[var(--warn-strong)]',
  };
  const Icon = notice.type === 'success' ? CheckCircle : notice.type === 'error' ? AlertCircle : Info;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`no-print fixed top-4 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[92%] px-4 py-3 rounded-xl flex items-start gap-3
        bg-[var(--surface)] border border-[var(--border)] border-r-[3px] shadow-[var(--elev-float)] animate-fade-in ${accents[tone]}`}
    >
      <Icon className="w-[18px] h-[18px] shrink-0 mt-[3px]" />
      <div className="text-[13px] font-medium leading-relaxed text-[var(--text)]">{notice.message}</div>
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
        <div className="border-b border-[var(--border)] pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-lg text-[var(--text)] leading-snug">{title}</h2>}
            {/* توضیح حداکثر ~۷۵ کاراکتر در هر سطر می‌ماند؛ سطرِ بلندتر از این خوانده نمی‌شود */}
            {subtitle && (
              <p className="text-[13px] text-[var(--text-muted)] mt-1.5 leading-relaxed max-w-[68ch]">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
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
        className={`cw-card w-full ${maxWidth} p-6 flex flex-col gap-5 shadow-[var(--elev-float)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * فیلدِ ورودی با برچسب.
 *
 * 🔴 ساختار عمداً ثابت است: `<label>` باید دقیقاً «خواهرِ قبلیِ» خودِ کنترل بماند،
 * چون تست‌ها ورودی را از روی همین رابطه پیدا می‌کنند.
 */
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
  // برچسب‌های گام‌دارِ فرمِ قبض («۱) شماره‌ی مشتری») یک دنباله‌ی واقعی‌اند، پس
  // شماره‌شان را جدا و با رنگِ اکسنت نشان می‌دهیم تا ترتیبِ پرکردنِ فرم از یک
  // نگاه پیدا باشد. متنِ نهایی تغییری نمی‌کند.
  const step = /^\s*([۰-۹0-9]+)\)\s*(.*)$/.exec(label);
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
        {step ? (
          <>
            <span className="text-[var(--accent-text)] font-semibold">{step[1]})</span> {step[2]}
          </>
        ) : (
          label
        )}
        {required && <span className="text-[var(--danger-text)] mr-1">*</span>}
        {hint && <span className="text-[var(--text-faint)] font-normal mr-1">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

/**
 * ورودیِ عددیِ کاربرپسند — یک نقطه‌ی متمرکز برای همه‌ی ورودی‌های عددی (قیمت،
 * موجودی، درصد، تخفیف، انعام و ...). سه رفتارِ مهم را یک‌جا فراهم می‌کند:
 *  ۱) ارقامِ فارسی/عربی را می‌پذیرد و خودکار به عددِ درست تبدیل می‌کند
 *     (چون <input type="number"> اصلاً ارقامِ فارسی را قبول نمی‌کند).
 *  ۲) هنگام نمایش، عدد را با جداکننده‌ی هزارگانِ فارسی نشان می‌دهد (۱۲٬۵۰۰).
 *  ۳) با گرفتنِ فوکوس (یک یا دو کلیک) کلِ متن را انتخاب می‌کند تا کاربر بتواند
 *     بی‌دردسر مقدارِ تازه را تایپ کند و رقمِ قبلی را پاک نکند.
 * برخلافِ type="number"، این ورودی متنی است پس در الکترونِ ویندوز هم قابلِ کلیک
 * و ویرایش است و رفتارِ اسکرول/فلش هم آن را به‌هم نمی‌ریزد.
 */
export function NumberInput({
  value,
  onValueChange,
  thousands = true,
  selectOnFocus = true,
  className = '',
  ...rest
}: {
  value: number;
  onValueChange: (n: number) => void;
  /** نمایش با جداکننده‌ی هزارگان (برای مبالغ). برای شمارنده/درصد خاموش کنید. */
  thousands?: boolean;
  selectOnFocus?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>) {
  // مقدارِ صفر را خالی نشان می‌دهیم تا placeholder («۰») دیده شود و کاربر روی صفرِ
  // اضافه تایپ نکند؛ هر مقدارِ دیگر با/بدون جداکننده‌ی هزارگان.
  const display = value ? (thousands ? new Intl.NumberFormat('fa-IR').format(value) : toPersianDigits(value)) : '';
  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={(e) => {
        const digits = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
        onValueChange(digits ? Number(digits) : 0);
      }}
      onFocus={(e) => {
        if (selectOnFocus) e.target.select();
      }}
      className={className}
      {...rest}
    />
  );
}

/** کلاس‌های مشترک ورودی‌ها برای یکدستی و DRY */
export const inputClass =
  'w-full bg-[var(--field-bg)] text-[var(--field-text)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm font-medium ' +
  'placeholder-[var(--text-faint)] placeholder:font-normal hover:border-[var(--field-hover-border)] ' +
  'focus:border-[var(--accent)] outline-none transition-colors';

/** کلاس‌های ورودیِ فشرده‌ی داخلِ جدول‌ها (ماتریسِ قیمت، انبار) */
export const cellInputClass =
  'w-full bg-[var(--field-bg)] text-[var(--field-text)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[13px] font-medium ' +
  'hover:border-[var(--field-hover-border)] focus:border-[var(--accent)] outline-none transition-colors';

/* ---------------------------------------------------------------
   جدول‌ها — پنج جدولِ برنامه (تاریخچه‌ی قبض، تاریخچه‌ی فروش، ماتریسِ قیمت،
   انبار، دستمزد) قبلاً هرکدام کمی متفاوت استایل شده بودند. این چند کلاس
   همه‌شان را یکدست می‌کند.
--------------------------------------------------------------- */
export const tableWrapClass = 'overflow-x-auto border border-[var(--border)] rounded-xl';
export const tableClass = 'w-full text-right border-collapse text-[13px]';
export const theadRowClass =
  'bg-[var(--surface-2)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-muted)]';
export const tbodyClass = 'divide-y divide-[var(--border)]';
export const rowHoverClass = 'hover:bg-[var(--surface-2)] transition-colors';

/** اسکلتِ مشترکِ همه‌ی دکمه‌ها — اندازه و گردی و چیدمان یکی می‌ماند */
const BTN_BASE = 'inline-flex items-center justify-center gap-2 text-sm px-5 py-2.5 rounded-xl cursor-pointer';

/** دکمه‌ی اصلی — عملِ قطعیِ هر صفحه. در هر صفحه فقط یکی از این باید باشد. */
export function PrimaryButton({ children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`cw-primary ${BTN_BASE} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** دکمه‌ی خنثی (ثانویه) */
export function GhostButton({ children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${BTN_BASE} font-semibold px-4 border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]
        hover:text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)]
        disabled:opacity-45 disabled:cursor-not-allowed transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** دکمه‌ی عملِ برگشت‌ناپذیر (ابطال، حذف، ریست) */
export function DangerButton({ children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`cw-danger ${BTN_BASE} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** دکمه‌ی فقط-آیکن (چاپ، حذف، کم/زیاد، به‌روزرسانی) */
export function IconButton({
  children,
  tone = 'neutral',
  className = '',
  ...rest
}: { tone?: 'neutral' | 'accent' | 'danger' } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    neutral: 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]',
    accent: 'text-[var(--accent-text)] hover:bg-[var(--accent-soft)]',
    danger: 'text-[var(--danger-text)] hover:bg-[var(--danger-soft)]',
  };
  return (
    <button
      className={`inline-flex items-center justify-center p-2 rounded-lg cursor-pointer transition-colors
        disabled:opacity-40 disabled:cursor-not-allowed ${tones[tone]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** چیپِ وضعیت (فعال / باطل / ناموجود / …) — کوچک، فقط برای نشان‌دادنِ حالت */
export function StatusPill({
  tone = 'neutral',
  icon: Icon,
  children,
  className = '',
}: {
  tone?: Tone;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold w-fit whitespace-nowrap ${TONE_SURFACE[tone]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}

/** برچسبِ شمارشِ کنارِ تیترِ کارت‌ها («مجموع: ۱۲ قبض») */
export function CountBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap">
      {children}
    </span>
  );
}

/**
 * کادرِ توضیح/هشدار. جای ~۱۳ کادرِ دست‌سازِ قبلی را می‌گیرد که هرکدام کمی با
 * بقیه فرق داشتند. رنگ فقط از نوارِ کناری و آیکن می‌آید؛ متن همیشه با رنگِ
 * متنِ عادی نوشته می‌شود تا در هر دو تم خوانا بماند.
 */
export function Callout({
  tone = 'accent',
  icon: Icon,
  title,
  children,
  className = '',
}: {
  tone?: Tone;
  icon?: LucideIcon;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const edge: Record<Tone, string> = {
    neutral: 'border-r-[var(--border-strong)] text-[var(--text-muted)]',
    accent: 'border-r-[var(--accent)] text-[var(--accent-text)]',
    ok: 'border-r-[var(--ok-strong)] text-[var(--ok-text)]',
    danger: 'border-r-[var(--danger-strong)] text-[var(--danger-text)]',
    warn: 'border-r-[var(--warn-strong)] text-[var(--warn-text)]',
  };
  return (
    <div
      className={`rounded-xl border border-[var(--border)] border-r-[3px] bg-[var(--surface-2)] p-3.5 flex items-start gap-2.5 ${edge[tone]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0 mt-[3px]" />}
      <div className="min-w-0 flex-1">
        {title && <div className="text-[13px] font-semibold mb-1">{title}</div>}
        {children && <div className="text-[13px] leading-relaxed text-[var(--text-muted)]">{children}</div>}
      </div>
    </div>
  );
}

/** کادرِ «چیزی اینجا نیست» — خالی‌بودن یک دعوت به عمل است، نه یک بن‌بست */
export function EmptyState({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[var(--border)]">
      <Icon className="w-10 h-10 text-[var(--text-faint)] mx-auto mb-3" strokeWidth={1.5} />
      <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">{children}</p>
    </div>
  );
}

/**
 * نوارِ زبانه‌ی قرص‌شکل (pill) — برای زیرمنوها و انتخابِ بازه؛ آیکن اختیاری.
 * زبانه‌ی فعال عمداً «پُرِ فیروزه‌ای» نیست: بلندترین عنصرِ هر صفحه باید دکمه‌ی
 * ثبت باشد، نه منویی که همیشه روی صفحه است.
 */
export function PillTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; icon?: LucideIcon }[];
  active: T;
  // NoInfer یعنی «نوعِ تب را از روی این پارامتر حدس نزن». بدونِ آن، TypeScript
  // از شکلِ تابعِ setState یک نوعِ نامناسب برمی‌داشت و در نهایت به string عقب‌نشینی
  // می‌کرد — یعنی شناسه‌ی تب‌ها عملاً بررسی نمی‌شد و یک تایپِ اشتباه لو نمی‌رفت.
  onChange: (id: NoInfer<T>) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 bg-[var(--surface)] p-1.5 rounded-2xl border border-[var(--border)]">
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] cursor-pointer transition-colors ${
              isActive
                ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] font-semibold'
                : 'text-[var(--text-muted)] font-medium hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
            }`}
          >
            {t.icon && <t.icon className="w-4 h-4 shrink-0" />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * کارتِ آماریِ خلاصه.
 * عددِ آماری همیشه با جوهرِ عادی نوشته می‌شود نه با رنگ — رنگ را برای «حالت»
 * نگه داشته‌ایم. فقط کاشیِ آیکن می‌تواند تُن بگیرد، آن هم وقتی واقعاً معنا دارد.
 */
export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  /** واحد (مثلِ «تومان») — ریز و کم‌رنگ کنارِ عدد، تا خودِ عدد کوتاه و خوانا بماند. */
  unit?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <span className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">{label}</span>
        {/* 🔴 عدد هرگز بریده نمی‌شود: مبلغِ «...»دار یعنی عددی که خوانده نمی‌شود.
            به‌جایش در عرضِ کم، خودِ فونت کوچک‌تر می‌شود و عدد کامل می‌ماند. */}
        <span className="cw-amount block text-lg xl:text-xl leading-none whitespace-nowrap">
          {value}
          {unit && <span className="text-[11px] font-medium text-[var(--text-muted)] mr-1">{unit}</span>}
        </span>
      </div>
      <div className={`w-10 h-10 grid place-items-center rounded-xl border shrink-0 ${TONE_SURFACE[tone]}`}>
        <Icon className="w-[18px] h-[18px]" />
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
    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] text-[var(--text-muted)] ' +
    'hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors';
  return (
    <div className="flex items-center justify-center gap-3 pt-1">
      <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronRight className="w-4 h-4" /> قبلی
      </button>
      <span className="text-xs font-medium text-[var(--text-muted)] tabular-nums">
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
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
      <h3 className="text-base text-[var(--text)]">{title}</h3>
      <IconButton onClick={onClose} title="بستن" aria-label="بستن">
        <X className="w-[18px] h-[18px]" />
      </IconButton>
    </div>
  );
}
