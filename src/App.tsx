/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormEvent, useEffect, useState } from 'react';
import { CarFront, Droplets, ShieldCheck, Lock, Sun, Moon, ArrowRight } from 'lucide-react';
import { Receipt } from './types';
import { useCarwashStore } from './data/store';
import { getJalaliDateParts, JALALI_MONTH_NAMES, toPersianDigits } from './utils/jalali';
import { NotificationBar, useNotification, Modal, ModalHeader, Field, inputClass, PrimaryButton, GhostButton } from './components/common';
import NewReceipt from './components/pos/NewReceipt';
import AdminPanel from './components/admin/AdminPanel';
import PrintReceipt from './components/print/PrintReceipt';

type Mode = 'pos' | 'admin';
type Theme = 'dark' | 'light';

export default function App() {
  const store = useCarwashStore();
  const { notice, notify } = useNotification();

  const [mode, setMode] = useState<Mode>('pos');

  // تم روشن/تیره — روی <html data-theme> اعمال و در localStorage ذخیره می‌شود
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('cw2_theme') as Theme) || 'dark',
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('cw2_theme', theme);
  }, [theme]);

  // چاپ
  const [printTarget, setPrintTarget] = useState<Receipt | null>(null);
  const handlePrint = (r: Receipt) => {
    setPrintTarget(r);
    window.setTimeout(() => window.print(), 250);
  };

  // ساعت زنده — هر ثانیه به‌روز می‌شود (ریل‌تایم)
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  const { year: jYear, month: jMonth, day: jDay } = getJalaliDateParts(now);
  const dateLabel = `${toPersianDigits(jDay)} ${JALALI_MONTH_NAMES[jMonth - 1]} ${toPersianDigits(jYear)}`;
  const pad2 = (n: number) => toPersianDigits(n.toString().padStart(2, '0'));
  const timeLabel = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

  // ورود به پنل مدیریت (با رمز اختیاری)
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pinPrompt, setPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const goAdmin = () => {
    if (!store.config.adminPin || adminUnlocked) {
      setMode('admin');
    } else {
      setPinInput('');
      setPinPrompt(true);
    }
  };

  const submitPin = (e: FormEvent) => {
    e.preventDefault();
    if (pinInput === store.config.adminPin) {
      setAdminUnlocked(true);
      setPinPrompt(false);
      setMode('admin');
    } else {
      notify('رمز پنل نادرست است', 'error');
    }
  };

  const locked = !!store.config.adminPin && !adminUnlocked;

  return (
    <>
      <div className="no-print min-h-screen flex flex-col antialiased">
        <NotificationBar notice={notice} />

        {/* ===== هدر ===== */}
        <header className="bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-40 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.6)]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* برند = لینکِ ورود به پنل مدیریت */}
            <button
              type="button"
              onClick={goAdmin}
              title="ورود به پنل مدیریت"
              className="flex items-center gap-3 rounded-2xl -mr-1 pr-1 pl-2 py-1 cursor-pointer hover:bg-[var(--surface-2)] transition-all group"
            >
              <div className="cw-badge p-2.5 rounded-2xl relative">
                <CarFront className="w-6 h-6 relative z-10" strokeWidth={2.2} />
                <Droplets className="w-3 h-3 absolute top-1 left-1 z-10 text-white/75" strokeWidth={2.4} />
                {locked ? (
                  <Lock className="w-3 h-3 absolute -bottom-1 -left-1 bg-[var(--surface)] text-[var(--text-muted)] rounded-full p-[1px] border border-[var(--border)]" />
                ) : (
                  <ShieldCheck className="w-3 h-3 absolute -bottom-1 -left-1 bg-[var(--surface)] text-[var(--text-muted)] rounded-full p-[1px] border border-[var(--border)]" />
                )}
              </div>
              <h1 className="font-display text-2xl text-[var(--text)] leading-none group-hover:text-[var(--accent-text)] transition-colors">
                {store.config.shopName}
              </h1>
            </button>

            {/* کنترل‌ها */}
            <div className="flex items-center gap-2">
              {/* تغییر تم — جای ساعت */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? 'تمِ روشن' : 'تمِ تیره'}
                className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* ساعت زنده — بدون آیکون، جای دارک‌مود */}
              <div className="hidden md:flex flex-col leading-tight items-end bg-[var(--surface-2)] px-3.5 py-1.5 rounded-xl border border-[var(--border)]">
                <span className="text-[13px] font-bold text-[var(--text)] font-mono tabular-nums">{timeLabel}</span>
                <span className="text-[10px] font-semibold text-[var(--text-muted)]">{dateLabel}</span>
              </div>

              {/* بازگشت به صندوق — فقط در حالتِ پنل مدیریت */}
              {mode === 'admin' && (
                <button
                  onClick={() => setMode('pos')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                  بازگشت به صندوق
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ===== محتوا ===== */}
        <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col justify-center gap-6">
          {mode === 'pos' ? (
            <NewReceipt store={store} notify={notify} onPrint={handlePrint} />
          ) : (
            <AdminPanel store={store} notify={notify} onPrint={handlePrint} />
          )}
        </main>

        <footer className="text-center text-[10px] text-[var(--text-faint)] py-6 max-w-6xl mx-auto w-full border-t border-[var(--border)] font-semibold">
          {store.config.shopName} • سیستم آفلاین صدور قبض • آماده‌ی انتقال به Electron
        </footer>

        {/* مودالِ رمز پنل */}
        <Modal open={pinPrompt} onClose={() => setPinPrompt(false)}>
          <ModalHeader title="ورود به پنل مدیریت" onClose={() => setPinPrompt(false)} />
          <form onSubmit={submitPin} className="flex flex-col gap-4">
            <Field label="رمز عبور">
              <input
                type="password"
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className={inputClass}
                placeholder="رمز پنل را وارد کنید"
              />
            </Field>
            <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
              <GhostButton type="button" onClick={() => setPinPrompt(false)}>انصراف</GhostButton>
              <PrimaryButton type="submit">ورود</PrimaryButton>
            </div>
          </form>
        </Modal>
      </div>

      {/* ناحیه‌ی چاپ (خواهرِ بخش اصلی تا در چاپ محو نشود) */}
      <PrintReceipt receipt={printTarget} config={store.config} />
    </>
  );
}
