/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { CarFront, Droplets, ShieldCheck, Sun, Moon, ArrowRight, Package, LogOut, User as UserIcon, AlertTriangle, X } from 'lucide-react';
import { Receipt, Sale, User } from './types';
import { useCarwashStore } from './data/store';
import { getJalaliDateParts, JALALI_MONTH_NAMES } from './utils/jalali';
import { toPersianDigits } from './utils/format';
import { describePrintOutcome, printPreparedReceipt, savePrintPreview, PrintReport } from './utils/printing';
import { startSystemLogBridge } from './utils/printLog';
import { needsPasswordChange } from './auth';
import { NotificationBar, useNotification, PillTabs } from './components/common';
import NewReceipt from './components/pos/NewReceipt';
import NewSale from './components/pos/NewSale';
import AdminPanel from './components/admin/AdminPanel';
import LoginScreen from './components/auth/LoginScreen';
import ForcePasswordChange from './components/auth/ForcePasswordChange';
import PrintReceipt from './components/print/PrintReceipt';
import PrintSale from './components/print/PrintSale';
import { createSampleReceipt } from './components/print/sampleReceipt';
import SplashScreen from './components/brand/SplashScreen';
import StorageGate from './components/StorageGate';
import BrandWatermark from './components/brand/BrandWatermark';
import { YatashMark } from './components/brand/YatashLogo';
import { BRAND } from './brand';
import { useLicense } from './license/useLicense';
import LicenseGate from './license/LicenseGate';

type Mode = 'pos' | 'admin';
type PosTab = 'wash' | 'sale';
type Theme = 'dark' | 'light';

/**
 * مکثِ کوتاه بینِ «نشاندنِ فیش روی ناحیه‌ی چاپ» و «اندازه‌گیری و چاپ».
 * بدونِ این مکث، اندازه‌گیری روی ناحیه‌ی چاپِ خالی یا نیمه‌آماده انجام می‌شود.
 */
const PRINT_RENDER_SETTLE_MS = 250;

const POS_TABS: { id: PosTab; label: string; icon: typeof Droplets }[] = [
  { id: 'wash', label: 'قبض شست‌وشو', icon: Droplets },
  { id: 'sale', label: 'فروش لوازم', icon: Package },
];

export default function App() {
  const store = useCarwashStore();
  const { notice, notify } = useNotification();
  const { status: licenseStatus, importLicense } = useLicense();

  const [mode, setMode] = useState<Mode>('pos');
  const [posTab, setPosTab] = useState<PosTab>('wash');

  // کاربرِ واردشده. عمداً پایدار (persist) نمی‌شود تا هر بار باز شدنِ برنامه، کاربر
  // دوباره خودش را انتخاب و رمز بزند (هم امن‌تر، هم رهگیریِ ابطال دقیق می‌ماند).
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // آیا ورود با رمزِ پشتیبانیِ یاتاش بوده؟ در آن حالت اجبارِ تغییرِ رمز اعمال نمی‌شود،
  // وگرنه پشتیبان مجبور می‌شد رمزِ مشتری را عوض کند تا وارد برنامه شود.
  const [viaMaster, setViaMaster] = useState(false);

  // دروازه‌ی اجباریِ تغییرِ رمز: تا وقتی کاربر روی رمزِ پیش‌فرضِ کارخانه است،
  // به صندوق راه داده نمی‌شود. رمزِ پیش‌فرض روی همه‌ی نصب‌ها یکسان است.
  const mustChangePassword = !!currentUser && !viaMaster && needsPasswordChange(currentUser.password);

  const handleLogin = (user: User, master: boolean) => {
    setViaMaster(master);
    setCurrentUser(user);
  };

  // رمزِ نو هم در انبارِ کاربران و هم در نسخه‌ی درون‌حافظه‌ای به‌روز می‌شود؛
  // بدونِ دومی، دروازه بسته نمی‌ماند چون هنوز رمزِ قدیمی را می‌بیند.
  const handlePasswordChange = (password: string) => {
    if (!currentUser) return;
    store.setUserPassword(currentUser.id, password);
    setCurrentUser({ ...currentUser, password });
    notify('رمزِ شما با موفقیت تغییر کرد', 'success');
  };

  // گزارشِ مسیرِ چاپ: قدم‌هایی که بخشِ سیستمیِ برنامه می‌فرستد را هم به گزارشِ
  // داخلِ اپ وصل می‌کند تا هر دو سمتِ ماجرا در یک کادر دیده شوند.
  useEffect(() => {
    startSystemLogBridge();
  }, []);

  // تم روشن/تیره — روی <html data-theme> اعمال و در localStorage ذخیره می‌شود
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('cw2_theme') as Theme) || 'dark',
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('cw2_theme', theme);
  }, [theme]);

  // چاپ — دو نوع قبض جدا داریم (شست‌وشو / فروشِ لوازم).
  const [printTarget, setPrintTarget] = useState<Receipt | null>(null);
  const [printSaleTarget, setPrintSaleTarget] = useState<Sale | null>(null);

  const runPrint = () => {
    const { printMode, printerName } = store.config;
    if (printMode === 'off') return;
    // مکثِ کوتاه تا React ناحیه‌ی چاپ را با فیشِ تازه پر کند؛ بعد اندازه‌ی دقیقِ
    // برگه سنجیده و اعلام می‌شود تا پرینترِ رولی کاغذِ اضافه بیرون ندهد.
    window.setTimeout(() => {
      void printPreparedReceipt(printMode, printerName).then((outcome) => {
        // چاپِ موفق خودش را روی کاغذ نشان می‌دهد و پیام لازم ندارد؛ ولی هر شکست یا
        // هر هشدار باید دیده شود. بی‌صدا ماندنِ شکستِ چاپ همان چیزی است که باعث
        // می‌شد صندوقدار فکر کند «برنامه هیچ واکنشی نشان نمی‌دهد».
        const report = describePrintOutcome(outcome);
        if (report.type !== 'success') notify(report.text, report.type);
      });
    }, PRINT_RENDER_SETTLE_MS);
  };

  const handlePrint = (r: Receipt) => {
    setPrintSaleTarget(null);
    setPrintTarget(r);
    runPrint();
  };
  const handlePrintSale = (s: Sale) => {
    setPrintTarget(null);
    setPrintSaleTarget(s);
    runPrint();
  };

  /**
   * چاپِ آزمایشی از تنظیماتِ پرینتر — یک فیشِ نمونه که هیچ‌جا ذخیره نمی‌شود.
   * نتیجه‌اش به‌جای اعلانِ گذرا، برگردانده می‌شود تا همان‌جا در صفحه‌ی تنظیمات
   * بماند و کاربر فرصتِ خواندنش را داشته باشد.
   */
  const handleTestPrint = async (kind: 'print' | 'pdf'): Promise<PrintReport> => {
    const { printMode, printerName } = store.config;
    setPrintSaleTarget(null);
    setPrintTarget(createSampleReceipt());
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, PRINT_RENDER_SETTLE_MS);
    });

    if (kind === 'pdf') {
      const preview = await savePrintPreview();
      return preview.success
        ? {
            type: 'success',
            text: `فایلِ پیش‌نمایش ساخته شد: ${preview.path} — بازش کنید. اگر فیش داخلش درست و خوانا بود، ساختِ فیش در برنامه سالم است و ایراد سمتِ پرینتر یا درایور است.`,
          }
        : {
            type: 'error',
            text: `ساختِ فایلِ پیش‌نمایش انجام نشد.${preview.reason ? ` (جزئیات: ${preview.reason})` : ''}`,
          };
    }

    return describePrintOutcome(await printPreparedReceipt(printMode, printerName));
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

  // ورود به پنل — فقط ادمین. صندوقدار اصلاً این دکمه را ندارد.
  const isAdmin = currentUser?.role === 'admin';
  const goAdmin = () => {
    if (isAdmin) setMode('admin');
  };
  const leaveAdmin = () => setMode('pos');
  const logout = () => {
    setMode('pos');
    setCurrentUser(null);
    setViaMaster(false);
  };

  return (
    <>
      <SplashScreen />
      <BrandWatermark />

      <LicenseGate status={licenseStatus} importLicense={importLicense}>
        <StorageGate
          failedKeys={store.loadFailedKeys}
          frozen={store.writesFrozen}
          onRestore={store.importData}
          onAcceptDataLoss={store.acceptDataLoss}
        >
        {!currentUser ? (
          /* تا وقتی کاربری وارد نشده، صفحه‌ی ورود نشان داده می‌شود. */
          <LoginScreen users={store.users} shopName={store.config.shopName} onLogin={handleLogin} />
        ) : mustChangePassword ? (
          /* رمزِ پیش‌فرض هنوز عوض نشده → تا گذاشتنِ رمزِ نو، برنامه باز نمی‌شود. */
          <ForcePasswordChange user={currentUser} onSubmit={handlePasswordChange} onCancel={logout} />
        ) : (
          <div className="no-print min-h-screen flex flex-col antialiased">
            <NotificationBar notice={notice} />

            {/* 🔴 نوارِ شکستِ ذخیره‌سازی — تا وقتی کاربر نبندد سرِ جایش می‌ماند.
                بدونِ این، خرابیِ دیسک بی‌صدا می‌ماند و کارِ کلِ روز از دست می‌رفت. */}
            {store.saveError && (
              <div className="bg-[var(--danger-strong)] text-white px-4 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold leading-relaxed">
                    ذخیره‌سازی روی دیسک انجام نمی‌شود! قبض‌های جدید ممکن است بعد از بستنِ برنامه از بین بروند.
                    هرچه زودتر از «پنلِ مدیریت ← تنظیمات و بکاپ» یک نسخه‌ی پشتیبان بگیرید و با پشتیبانی تماس
                    بگیرید. (علت: {store.saveError.message})
                  </span>
                </div>
                <button
                  onClick={store.dismissSaveError}
                  title="بستنِ پیام"
                  className="p-1 rounded-lg hover:bg-white/15 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ===== هدر ===== */}
            <header className="bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-40 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.6)]">
              <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                {/* برند: برای ادمین لینکِ پنل است؛ برای صندوقدار فقط عنوان. */}
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={goAdmin}
                    title="ورود به پنل مدیریت"
                    className="flex items-center gap-3 rounded-2xl -mr-1 pr-1 pl-2 py-1 cursor-pointer hover:bg-[var(--surface-2)] transition-all group"
                  >
                    <div className="cw-badge p-2.5 rounded-2xl relative">
                      <CarFront className="w-6 h-6 relative z-10" strokeWidth={2.2} />
                      <Droplets className="w-3 h-3 absolute top-1 left-1 z-10 text-white/75" strokeWidth={2.4} />
                      <ShieldCheck className="w-3 h-3 absolute -bottom-1 -left-1 bg-[var(--surface)] text-[var(--text-muted)] rounded-full p-[1px] border border-[var(--border)]" />
                    </div>
                    <h1 className="font-display text-2xl text-[var(--text)] leading-none group-hover:text-[var(--accent-text)] transition-colors">
                      {store.config.shopName}
                    </h1>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 -mr-1 pr-1 pl-2 py-1">
                    <div className="cw-badge p-2.5 rounded-2xl relative">
                      <CarFront className="w-6 h-6 relative z-10" strokeWidth={2.2} />
                      <Droplets className="w-3 h-3 absolute top-1 left-1 z-10 text-white/75" strokeWidth={2.4} />
                    </div>
                    <h1 className="font-display text-2xl text-[var(--text)] leading-none">{store.config.shopName}</h1>
                  </div>
                )}

                {/* کنترل‌ها */}
                <div className="flex items-center gap-2">
                  {/* تغییر تم */}
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    title={theme === 'dark' ? 'تمِ روشن' : 'تمِ تیره'}
                    className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer transition-all"
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>

                  {/* ساعت زنده */}
                  <div className="hidden lg:flex flex-col leading-tight items-end bg-[var(--surface-2)] px-3.5 py-1.5 rounded-xl border border-[var(--border)]">
                    <span className="text-[13px] font-bold text-[var(--text)] font-mono tabular-nums">{timeLabel}</span>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)]">{dateLabel}</span>
                  </div>

                  {/* کاربرِ واردشده + نقش */}
                  <div className="hidden sm:flex items-center gap-2 bg-[var(--surface-2)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
                    {isAdmin ? (
                      <ShieldCheck className="w-4 h-4 text-[var(--accent-text)]" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-bold text-[var(--text)]">{currentUser.name}</span>
                      <span className="text-[10px] font-semibold text-[var(--text-muted)]">{isAdmin ? 'مدیر' : 'صندوقدار'}</span>
                    </div>
                  </div>

                  {/* بازگشت به صندوق — فقط در پنل مدیریت */}
                  {mode === 'admin' && (
                    <button
                      onClick={leaveAdmin}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                      بازگشت به صندوق
                    </button>
                  )}

                  {/* خروج از حساب */}
                  <button
                    onClick={logout}
                    title="خروج و تعویضِ کاربر"
                    className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--danger-text)] hover:bg-[var(--surface-2)] cursor-pointer transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </header>

            {/* ===== محتوا ===== */}
            <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col justify-center gap-6">
              {mode === 'admin' && isAdmin ? (
                <AdminPanel
                  store={store}
                  notify={notify}
                  onPrint={handlePrint}
                  onPrintSale={handlePrintSale}
                  onTestPrint={handleTestPrint}
                  currentUser={currentUser}
                />
              ) : (
                <div className="flex flex-col gap-6">
                  <PillTabs tabs={POS_TABS} active={posTab} onChange={setPosTab} />
                  {posTab === 'wash' ? (
                    <NewReceipt store={store} notify={notify} onPrint={handlePrint} />
                  ) : (
                    <NewSale store={store} notify={notify} onPrintSale={handlePrintSale} />
                  )}
                </div>
              )}
            </main>

            <footer className="py-6 max-w-6xl mx-auto w-full border-t border-[var(--border)]">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] text-[var(--text-faint)] font-semibold">
                <span>{store.config.shopName} • سیستم آفلاین صدور قبض</span>
                <span className="opacity-40">|</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-[var(--text-muted)]">
                  {BRAND.poweredByFa}
                  <YatashMark size={14} />
                </span>
              </div>
            </footer>
          </div>
        )}
        </StorageGate>
      </LicenseGate>

      {/* ناحیه‌ی چاپ (خواهرِ بخش اصلی تا در چاپ محو نشود) — فقط یکی از دو هدف پر است */}
      <PrintReceipt receipt={printTarget} config={store.config} />
      <PrintSale sale={printSaleTarget} config={store.config} />
    </>
  );
}
