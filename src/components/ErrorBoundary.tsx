import { Component, ErrorInfo, ReactNode } from 'react';

/**
 * «تورِ ایمنیِ» برنامه.
 *
 * چرا هست: اگر هنگامِ ترسیمِ هر قسمتی از برنامه خطایی رخ دهد، React کلِ درخت را
 * برمی‌دارد و کاربر یک پنجره‌ی کاملاً سفید می‌بیند. در نسخه‌ی نصب‌شده ابزارِ
 * توسعه‌دهنده هم عمداً خاموش است، پس نه پیامی هست، نه سرنخی، نه راهی برای ادامه.
 *
 * با این لایه، به‌جای صفحه‌ی سفید یک پرده‌ی فارسی می‌آید که می‌گوید چه شد، چه
 * کار کند، و دکمه‌ی «شروعِ دوباره» دارد. متنِ فنیِ خطا هم نمایش داده می‌شود تا
 * مشتری بتواند از آن عکس بگیرد و برای پشتیبانی بفرستد.
 *
 * مرزِ خطا در React فقط با کامپوننتِ کلاسی ممکن است — تنها کلاسِ برنامه همین است.
 */
interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // در نسخه‌ی نصب‌شده کنسول دیده نمی‌شود، ولی در حالتِ توسعه این تنها جایی است
    // که رد پای کامل خطا (کدام کامپوننت) را نشان می‌دهد.
    console.error('[Yatash] خطای غیرمنتظره:', error, info.componentStack);
  }

  private handleRestart = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
        <div className="cw-card w-full max-w-lg p-7 flex flex-col gap-5 text-right">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 rounded-2xl bg-[var(--danger-soft)] border border-[var(--danger-border)] text-[var(--danger-text)] text-3xl leading-none">
              ⚠️
            </div>
            <h1 className="font-display text-2xl text-[var(--text)]">برنامه به مشکل خورد</h1>
            <p className="text-xs font-semibold text-[var(--text-muted)] leading-relaxed">
              نگران نباشید — اطلاعاتِ ثبت‌شده‌ی شما سرِ جایش است. فقط نمایشِ صفحه متوقف شد.
            </p>
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3">
            <span className="block text-[11px] font-bold text-[var(--text-muted)] mb-1.5">
              متنِ فنیِ خطا (برای پشتیبانی از این قسمت عکس بگیرید):
            </span>
            <code className="block text-[11px] font-mono text-[var(--danger-text)] break-all leading-relaxed">
              {error.message || String(error)}
            </code>
          </div>

          <div className="bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-text)] text-[11px] font-bold rounded-xl p-3 leading-relaxed">
            اول دکمه‌ی «شروعِ دوباره» را بزنید. اگر باز هم همین صفحه آمد، برنامه را کامل ببندید و دوباره باز
            کنید. اگر باز هم تکرار شد، از متنِ بالا عکس بگیرید و برای پشتیبانی بفرستید.
          </div>

          <button
            type="button"
            onClick={this.handleRestart}
            className="cw-primary text-sm px-5 py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer font-bold w-full"
          >
            شروعِ دوباره
          </button>
        </div>
      </div>
    );
  }
}
