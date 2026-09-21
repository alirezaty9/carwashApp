import { FormEvent, useState } from 'react';
import { KeyRound, Lock, LogOut, ShieldAlert } from 'lucide-react';
import { User } from '../../types';
import { validateNewPassword } from '../../auth';
import { BRAND } from '../../brand';
import { YatashMark } from '../brand/YatashLogo';
import { Callout, inputClass, PrimaryButton, GhostButton } from '../common';

/**
 * دروازه‌ی اجباریِ تغییرِ رمز.
 *
 * چرا هست: رمزِ اولیه داخلِ کدِ برنامه نوشته شده و روی هر نصبی یکسان است. تا وقتی
 * مشتری عوضش نکند، عملاً هیچ قفلی روی صندوق و گزارش‌های مالی نیست. این صفحه تا
 * گذاشتنِ رمزِ نو اجازه‌ی ورود به برنامه را نمی‌دهد.
 *
 * ورودِ پشتیبانیِ یاتاش (با رمزِ مادر) عمداً از این مسیر معاف است — تصمیمش در App
 * گرفته می‌شود، نه اینجا.
 */
export default function ForcePasswordChange({
  user,
  onSubmit,
  onCancel,
}: {
  user: User;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const problem = validateNewPassword(password, confirm);
    if (problem) {
      setError(problem);
      return;
    }
    onSubmit(password.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="cw-card w-full max-w-md p-7 flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-border)]">
            <KeyRound className="w-7 h-7 text-[var(--accent-text)]" />
          </div>
          <h1 className="text-2xl text-[var(--text)]">یک رمزِ تازه بگذارید</h1>
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
            خوش آمدید، {user.name}. شما هنوز با رمزِ پیش‌فرضِ برنامه وارد می‌شوید.
          </p>
        </div>

        <Callout tone="danger" icon={ShieldAlert}>
          رمزِ پیش‌فرض روی همه‌ی نصب‌ها یکسان است. تا آن را عوض نکنید، هر کسی که این رمز را بداند به صندوق و
          گزارش‌های مالیِ شما دسترسی دارد.
        </Callout>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">رمزِ جدید</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-faint)] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="رمزِ تازه را وارد کنید"
                className={`${inputClass} pr-9`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">تکرارِ رمزِ جدید</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-faint)] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setError('');
                }}
                placeholder="همان رمز را دوباره بزنید"
                className={`${inputClass} pr-9`}
              />
            </div>
            {error && <p className="text-xs font-medium text-[var(--danger-text)] mt-2">{error}</p>}
          </div>

          <PrimaryButton type="submit" className="w-full py-3">
            <KeyRound className="w-4 h-4" /> ثبتِ رمز و ورود
          </PrimaryButton>

          <GhostButton type="button" onClick={onCancel} className="w-full">
            <LogOut className="w-4 h-4" /> بازگشت به صفحه‌ی ورود
          </GhostButton>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[var(--text-faint)] pt-2 border-t border-[var(--border)]">
          {BRAND.poweredByFa}
          <YatashMark size={13} />
        </div>
      </div>
    </div>
  );
}
