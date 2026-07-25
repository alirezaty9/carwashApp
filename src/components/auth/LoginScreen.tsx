import { FormEvent, useState } from 'react';
import { ShieldCheck, User as UserIcon, ArrowRight, LogIn, Lock } from 'lucide-react';
import { User } from '../../types';
import { isUserPasswordValid } from '../../auth';
import { BRAND } from '../../brand';
import { YatashMark } from '../brand/YatashLogo';
import { inputClass, PrimaryButton, GhostButton } from '../common';

/**
 * صفحه‌ی ورود: کاربر نامش را از فهرست انتخاب می‌کند (یوزرنیم تایپ نمی‌شود)، بعد رمزش
 * را می‌زند. نقشِ کاربر (ادمین/صندوقدار) روی هر کاشی نشان داده می‌شود.
 */
export default function LoginScreen({
  users,
  shopName,
  onLogin,
}: {
  users: User[];
  shopName: string;
  onLogin: (user: User) => void;
}) {
  const activeUsers = users.filter((u) => u.active);
  const [selected, setSelected] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (isUserPasswordValid(password, selected.password)) {
      onLogin(selected);
    } else {
      setError('رمز نادرست است');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="cw-card w-full max-w-md p-7 flex flex-col gap-6 animate-fade-in">
        {/* برند */}
        <div className="flex flex-col items-center text-center gap-2">
          <YatashMark size={54} />
          <h1 className="font-display text-2xl text-[var(--text)]">{shopName}</h1>
          <p className="text-xs font-semibold text-[var(--text-muted)]">برای ورود، کاربرِ خود را انتخاب کنید</p>
        </div>

        {!selected ? (
          /* ===== گام ۱: انتخابِ کاربر ===== */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeUsers.length === 0 && (
              <p className="col-span-full text-center text-xs text-[var(--danger-text)] font-bold py-6">
                هیچ کاربرِ فعالی نیست.
              </p>
            )}
            {activeUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelected(u);
                  setPassword('');
                  setError('');
                }}
                className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--field-bg)] hover:border-[var(--field-hover-border)] hover:bg-[var(--field-hover-bg)] cursor-pointer transition-all text-right"
              >
                <div className="p-2.5 rounded-xl bg-[var(--surface-2)] shrink-0">
                  {u.role === 'admin' ? (
                    <ShieldCheck className="w-5 h-5 text-[var(--accent-text)]" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-[var(--text-muted)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[var(--field-text)] truncate">{u.name}</div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)]">
                    {u.role === 'admin' ? 'مدیر' : 'صندوقدار'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* ===== گام ۲: رمزِ کاربرِ انتخاب‌شده ===== */
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="p-2 rounded-lg bg-[var(--surface)] shrink-0">
                {selected.role === 'admin' ? (
                  <ShieldCheck className="w-5 h-5 text-[var(--accent-text)]" />
                ) : (
                  <UserIcon className="w-5 h-5 text-[var(--text-muted)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[var(--text)] truncate">{selected.name}</div>
                <div className="text-[10px] font-bold text-[var(--text-muted)]">
                  {selected.role === 'admin' ? 'مدیر' : 'صندوقدار'}
                </div>
              </div>
              <GhostButton
                type="button"
                onClick={() => {
                  setSelected(null);
                  setError('');
                }}
                className="shrink-0 !px-3 !py-2"
              >
                <ArrowRight className="w-4 h-4" /> تغییر
              </GhostButton>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">رمز عبور</label>
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
                  placeholder="رمز خود را وارد کنید"
                  className={`${inputClass} pr-9`}
                />
              </div>
              {error && <p className="text-[11px] font-bold text-[var(--danger-text)] mt-2">{error}</p>}
            </div>

            <PrimaryButton type="submit" className="w-full py-3">
              <LogIn className="w-4 h-4" /> ورود
            </PrimaryButton>
          </form>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-[var(--text-faint)] pt-2 border-t border-[var(--border)]">
          {BRAND.poweredByFa}
          <YatashMark size={13} />
        </div>
      </div>
    </div>
  );
}
