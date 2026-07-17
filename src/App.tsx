/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormEvent, useEffect, useState } from 'react';
import { Car, ShieldCheck, Lock, Clock, Sun, Moon, ArrowRight } from 'lucide-react';
import { Receipt } from './types';
import { useCarwashStore } from './data/store';
import { getFormattedJalali } from './utils/jalali';
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

  // ساعت زنده
  const [liveTime, setLiveTime] = useState('');
  useEffect(() => {
    const tick = () => setLiveTime(getFormattedJalali(new Date(), true));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

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
            {/* برند */}
            <div className="flex items-center gap-3">
              <div className="cw-badge p-2.5 rounded-2xl">
                <Car className="w-6 h-6 relative z-10" />
              </div>
              <div>
                <h1 className="font-display text-2xl text-[var(--text)] leading-none">{store.config.shopName}</h1>
                <p className="text-[11px] text-[var(--accent-text)] font-medium mt-1 tracking-wide">
                  {mode === 'admin' ? 'پنل مدیریت' : 'صندوقِ صدور قبض'}
                </p>
              </div>
            </div>

            {/* کنترل‌ها */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 bg-[var(--surface-2)] text-[var(--text-muted)] px-3 py-2 rounded-xl text-[11px] font-semibold border border-[var(--border)]">
                <Clock className="w-4 h-4" />
                <span>{liveTime}</span>
              </div>

              {/* تغییر تم */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? 'تمِ روشن' : 'تمِ تیره'}
                className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* ورود / بازگشت */}
              {mode === 'pos' ? (
                <button
                  onClick={goAdmin}
                  className="cw-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
                >
                  {locked ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  پنل مدیریت
                </button>
              ) : (
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
        <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col gap-6">
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
