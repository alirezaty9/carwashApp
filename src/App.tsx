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
import { describePrintOutcome, getPrinterBridge, printPreparedReceipt, PrintReport } from './utils/printing';
import { logStep, startSystemLogBridge } from './utils/techLog';
import { needsPasswordChange } from './auth';
import { NotificationBar, useNotification, PillTabs, GhostButton, IconButton } from './components/common';
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

/**
 * نشانِ کنارِ نامِ کارواش در هدر.
 * قبلاً سه آیکن روی هم سوار بودند (ماشین + قطره + سپر) که در یک کاشیِ ۴۰ پیکسلی
 * فقط شلوغی می‌ساخت. سپر حذف شد چون نقشِ کاربر همین چند سانتی‌متر آن‌طرف‌تر با
 * حروف نوشته شده و تکرارش چیزی اضافه نمی‌کرد.
 */
function ShopMark() {
  return (
    <div className="cw-badge w-10 h-10 rounded-xl grid place-items-center relative shrink-0">
      <CarFront className="w-[22px] h-[22px]" strokeWidth={2} />
      <Droplets className="w-3 h-3 absolute top-1 left-1 opacity-70" strokeWidth={2.4} />
    </div>
  );
}

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

  // گزارشِ فنی (ابزارِ موقتِ دوره‌ی تست): قدم‌های بخشِ سیستمی را به گزارش وصل
  // می‌کند و مشخصاتِ سیستم را همان اولِ کار ثبت می‌کند تا همیشه بالای گزارش باشد.
  useEffect(() => {
    startSystemLogBridge();
    const bridge = getPrinterBridge();
    if (!bridge?.environment) {
      logStep('برنامه در مرورگر اجرا شده', 'قابلیت‌های چاپ و گزارشِ سیستمی در دسترس نیستند', 'warn');
      return;
    }
    void bridge.environment().then((info) => {
      const env = info as Record<string, unknown> & {
        printers?: { name: string; isDefault: boolean; status: number }[];
      };
      logStep(
        'برنامه بالا آمد',
        `سیستم‌عامل=${env.platform}/${env.arch} (${env.osRelease}) · الکترون=${env.electron} · ` +
          `کروم=${env.chrome} · نسخه‌ی برنامه=${env.appVersion} · نصب‌شده=${env.packaged ? 'بله' : 'خیر'}`,
      );
      logStep(
        `پرینترهای سیستم: ${env.printers?.length ?? 0} مورد`,
        env.printers?.length
          ? env.printers.map((p) => `«${p.name}»${p.isDefault ? ' (پیش‌فرض)' : ''} وضعیت=${p.status}`).join(' · ')
          : 'هیچ پرینتری پیدا نشد',
        env.printers?.length ? 'info' : 'warn',
      );
    });
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
        // چاپِ موفق خودش را روی کاغذ نشان می‌دهد؛ فقط شکست باید اعلام شود.
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
   * نتیجه‌اش برگردانده می‌شود تا در همان صفحه‌ی تنظیمات نشان داده شود.
   */
  const handleTestPrint = async (): Promise<PrintReport> => {
    const { printMode, printerName } = store.config;
    logStep('👆 دکمه‌ی «چاپِ آزمایشی» زده شد', `تنظیماتِ فعلی: حالت=${printMode} · پرینتر=${printerName || '(انتخاب نشده)'}`);
    setPrintSaleTarget(null);
    setPrintTarget(createSampleReceipt());
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, PRINT_RENDER_SETTLE_MS);
    });
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

            {/* نوارِ هشدار و هدر با هم می‌چسبند. قبلاً هر دو جداگانه sticky top-0
                بودند و هنگامِ اسکرول دقیقاً روی هم می‌افتادند و هدر را می‌پوشاندند. */}
            <div className="sticky top-0 z-40">
              {/* 🔴 نوارِ شکستِ ذخیره‌سازی — تا وقتی کاربر نبندد سرِ جایش می‌ماند.
                  بدونِ این، خرابیِ دیسک بی‌صدا می‌ماند و کارِ کلِ روز از دست می‌رفت. */}
              {store.saveError && (
                <div className="bg-[var(--danger-strong)] text-white px-4 py-2.5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0 max-w-5xl mx-auto">
                    <AlertTriangle className="w-[18px] h-[18px] shrink-0 mt-0.5" />
                    <span className="text-[13px] font-medium leading-relaxed">
                      ذخیره‌سازی روی دیسک انجام نمی‌شود! قبض‌های جدید ممکن است بعد از بستنِ برنامه از بین بروند.
                      هرچه زودتر از «پنلِ مدیریت ← تنظیمات و بکاپ» یک نسخه‌ی پشتیبان بگیرید و با پشتیبانی تماس
                      بگیرید. (علت: {store.saveError.message})
                    </span>
                  </div>
                  <button
                    onClick={store.dismissSaveError}
                    title="بستنِ پیام"
                    aria-label="بستنِ پیام"
                    className="p-1 rounded-lg hover:bg-white/20 cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ===== هدر ===== */}
              <header className="bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border)]">
                <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  {/* برند: برای ادمین لینکِ پنل است؛ برای صندوقدار فقط عنوان. */}
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={goAdmin}
                      title="ورود به پنل مدیریت"
                      className="group flex items-center gap-3 rounded-xl -mr-2 px-2 py-1.5 cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <ShopMark />
                      <h1 className="text-xl text-[var(--text)] leading-none group-hover:text-[var(--accent-text)] transition-colors">
                        {store.config.shopName}
                      </h1>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 py-1.5">
                      <ShopMark />
                      <h1 className="text-xl text-[var(--text)] leading-none">{store.config.shopName}</h1>
                    </div>
                  )}

                  {/* کنترل‌ها — متنِ ساده به‌جای کادرهای تودرتو، تا هدر شلوغ نشود */}
                  <div className="flex items-center gap-3">
                    {/* ساعت زنده */}
                    <div className="hidden lg:flex flex-col leading-tight items-end">
                      <span className="text-sm font-semibold text-[var(--text)] tabular-nums">{timeLabel}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">{dateLabel}</span>
                    </div>

                    <span className="hidden lg:block w-px h-8 bg-[var(--border)]" />

                    {/* کاربرِ واردشده + نقش */}
                    <div className="hidden sm:flex items-center gap-2">
                      {isAdmin ? (
                        <ShieldCheck className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      )}
                      <div className="flex flex-col leading-tight">
                        <span className="text-[13px] font-semibold text-[var(--text)]">{currentUser.name}</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{isAdmin ? 'مدیر' : 'صندوقدار'}</span>
                      </div>
                    </div>

                    <span className="w-px h-8 bg-[var(--border)]" />

                    {/* بازگشت به صندوق — فقط در پنل مدیریت */}
                    {mode === 'admin' && (
                      <GhostButton onClick={leaveAdmin} className="!py-2">
                        <ArrowRight className="w-4 h-4" />
                        بازگشت به صندوق
                      </GhostButton>
                    )}

                    <IconButton
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      title={theme === 'dark' ? 'تمِ روشن' : 'تمِ تیره'}
                      aria-label={theme === 'dark' ? 'تمِ روشن' : 'تمِ تیره'}
                    >
                      {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                    </IconButton>

                    <IconButton tone="danger" onClick={logout} title="خروج و تعویضِ کاربر" aria-label="خروج و تعویضِ کاربر">
                      <LogOut className="w-[18px] h-[18px]" />
                    </IconButton>
                  </div>
                </div>
              </header>
            </div>

            {/* ===== محتوا ===== */}
            {/* از بالا چیده می‌شود، نه وسطِ صفحه: با عمودی‌چین‌کردن، هر بار که فرم
                کوتاه/بلند می‌شد کلِ صفحه بالا و پایین می‌پرید. */}
            <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col gap-5">
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
                <div className="flex flex-col gap-5">
                  <PillTabs tabs={POS_TABS} active={posTab} onChange={setPosTab} />
                  {posTab === 'wash' ? (
                    <NewReceipt store={store} notify={notify} onPrint={handlePrint} />
                  ) : (
                    <NewSale store={store} notify={notify} onPrintSale={handlePrintSale} />
                  )}
                </div>
              )}
            </main>

            <footer className="border-t border-[var(--border)]">
              <div className="max-w-6xl mx-auto w-full px-4 py-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[var(--text-faint)]">
                <span>سیستم آفلاین صدور قبض</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-muted)]">
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
