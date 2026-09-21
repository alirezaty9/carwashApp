/**
 * هندسه‌ی چاپِ فیش روی پرینترِ حرارتیِ رولی + مسیرهای رساندنِ فیش به پرینتر.
 *
 * دو مسیرِ جدا اینجا هست:
 *   ۱) «حرارتیِ مستقیم» — فیش به تصویر تبدیل و با زبانِ خودِ پرینتر فرستاده می‌شود.
 *      برای پرینترهای فیش‌زن که درایورِ اختصاصی ندارند؛ مسیرِ اصلی و پیش‌فرض.
 *   ۲) مسیرِ چاپِ سیستم‌عامل — برای پرینترهای معمولی که درایورِ خودشان نصب است.
 *      در این مسیر اندازه‌ی برگه باید صریح اعلام شود، وگرنه اندازه‌ی پیش‌فرضِ
 *      درایور («رولِ پیوسته») حاکم می‌شود و برای یک فیشِ ۱۰ سانتی متری کاغذ
 *      بیرون می‌آید.
 */

/**
 * عرضی که سرِ چاپگر واقعاً می‌سوزاند — نه عرضِ رول.
 * رولِ ۸۰mm فقط ۷۲mm وسطش چاپ می‌شود و ۴mm هر طرف فیزیکاً بیرونِ سرِ چاپگر است.
 * (برای پرینترِ ۵۸mm این عدد ۴۸ است.)
 */
export const PAPER_PRINTABLE_WIDTH_MM = 72;

/** حاشیه‌ی داخلیِ فیش تا متن به لبه‌ی کاغذ نچسبد. */
export const RECEIPT_PADDING_MM = 2;

/**
 * فاصله‌ی سرِ چاپگر تا لبه‌ی برش. بدونِ این مقدار کاغذِ اضافه، آخرین خطوطِ فیش
 * داخلِ دستگاه می‌مانند و هنگامِ کندنِ کاغذ خوانده نمی‌شوند.
 */
export const TEAR_OFF_TAIL_MM = 15;

/** سقف و کفِ ایمنیِ طولِ برگه — تا هیچ خطای اندازه‌گیری یک رولِ کامل را بیرون ندهد. */
const MIN_PAGE_HEIGHT_MM = 40;
const MAX_PAGE_HEIGHT_MM = 400;

/** در CSS همیشه ۹۶ پیکسل = ۱ اینچ = ۲۵.۴ میلی‌متر، مستقل از مانیتور. */
const CSS_PX_PER_MM = 96 / 25.4;

/** کلاسی که موقتاً روی <html> می‌نشیند تا ناحیه‌ی چاپ قابلِ اندازه‌گیری شود. */
const MEASURING_CLASS = 'cw-measuring';

/** کلاسی که موقعِ عکس‌برداریِ چاپِ حرارتی روی <html> می‌نشیند (تعریفش در index.css). */
const CAPTURING_CLASS = 'cw-capturing';

/** تگِ <style>ی که قانونِ @page را نگه می‌دارد؛ هر بار بازنویسی می‌شود. */
const PAGE_STYLE_ID = 'cw-print-page-size';

/**
 * تعدادِ نقطه‌هایی که سرِ چاپگرِ یک پرینترِ ۸۰ میلی‌متری در هر خط می‌سوزاند.
 * فیش دقیقاً با همین عرض عکس‌برداری می‌شود تا نه کشیده شود و نه لبه‌اش بیفتد.
 */
const THERMAL_DOTS_PER_LINE = 576;

/** اندازه‌ی نهاییِ برگه — میلی‌متر برای CSS، میکرون برای الکترون. */
export interface PrintPageSize {
  widthMm: number;
  heightMm: number;
  widthMicrons: number;
  heightMicrons: number;
}

export interface PrinterInfo {
  name: string;
  displayName: string;
  isDefault: boolean;
}

/** حالتِ چاپِ انتخاب‌شده در «پنلِ مدیریت ← تنظیمات ← پرینتر و چاپ». */
export type PrintMode = 'thermal' | 'dialog' | 'silent' | 'off';

/** نتیجه‌ی یک کارِ چاپ — همیشه پر می‌شود، حتی وقتی چاپ اصلاً شروع نشده. */
export interface PrintOutcome {
  success: boolean;
  /** پیامِ خامِ سیستم‌عامل؛ برای تشخیصِ علت، نه برای نمایشِ مستقیم. */
  reason?: string;
}

export interface PrinterBridge {
  list(): Promise<PrinterInfo[]>;
  print(options: { deviceName?: string; page: PrintPageSize; silent: boolean }): Promise<PrintOutcome>;
  /** سه مرحله‌ی چاپِ حرارتیِ مستقیم — فقط در نسخه‌ی دسکتاپ. */
  thermalBegin?(): Promise<PrintOutcome>;
  thermalCapture?(options: {
    rect: { x: number; y: number; width: number; height: number };
    dotsPerLine: number;
  }): Promise<PrintOutcome>;
  thermalFinish?(options: { deviceName?: string }): Promise<PrintOutcome>;
}

/** پلِ پرینتر فقط در نسخه‌ی دسکتاپ وجود دارد؛ در مرورگر undefined است. */
export const getPrinterBridge = (): PrinterBridge | undefined =>
  (window as unknown as { printer?: PrinterBridge }).printer;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * عرضِ کاغذ را به‌صورتِ متغیرِ CSS روی ریشه‌ی سند می‌نشاند تا هم ناحیه‌ی چاپ و هم
 * مرحله‌ی اندازه‌گیری از یک عددِ واحد تغذیه شوند (یک منبعِ حقیقت).
 */
function applyPaperVars(): void {
  const root = document.documentElement;
  root.style.setProperty('--cw-paper-width', `${PAPER_PRINTABLE_WIDTH_MM}mm`);
  root.style.setProperty('--cw-receipt-padding', `${RECEIPT_PADDING_MM}mm`);
}

/**
 * صبر تا فونت‌ها بارگذاری و آخرین تغییرِ React روی صفحه نشسته باشد.
 * بدونِ این، ارتفاع با فونتِ جایگزین اندازه‌گیری می‌شود و چند میلی‌متر خطا دارد.
 */
async function waitForLayout(): Promise<void> {
  try {
    await document.fonts?.ready;
  } catch {
    // محیط‌هایی که Font Loading API ندارند — اندازه‌گیری با فونتِ فعلی ادامه می‌یابد
  }
  await new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 0);
  });
}

/** یک فریمِ کامل صبر می‌کند تا تغییرِ ظاهری واقعاً روی صفحه نشسته باشد. */
const nextFrame = () =>
  new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame !== 'function') {
      setTimeout(resolve, 16);
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

/**
 * ارتفاعِ واقعیِ فیشِ رندرشده را بر حسبِ میلی‌متر می‌دهد.
 * ناحیه‌ی چاپ معمولاً پنهان است، پس موقتاً با کلاسِ اندازه‌گیری بیرونِ کادرِ دید
 * چیده می‌شود، اندازه خوانده می‌شود، و بلافاصله دوباره پنهان می‌گردد.
 */
export function measureReceiptHeightMm(): number {
  const area = document.querySelector<HTMLElement>('.print-area');
  if (!area) return MIN_PAGE_HEIGHT_MM;

  const root = document.documentElement;
  root.classList.add(MEASURING_CLASS);
  const heightPx = area.getBoundingClientRect().height;
  root.classList.remove(MEASURING_CLASS);

  const heightMm = Math.ceil(heightPx / CSS_PX_PER_MM) + TEAR_OFF_TAIL_MM;
  return clamp(heightMm, MIN_PAGE_HEIGHT_MM, MAX_PAGE_HEIGHT_MM);
}

/** قانونِ @page را با اندازه‌ی دقیقِ همین فیش بازنویسی می‌کند. */
function applyPageSize(heightMm: number): void {
  let style = document.getElementById(PAGE_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = PAGE_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `@page { size: ${PAPER_PRINTABLE_WIDTH_MM}mm ${heightMm}mm; margin: 0; }`;
}

/**
 * آماده‌سازیِ چاپ در مسیرِ سیستم‌عامل: منتظرِ رندر می‌ماند، ارتفاعِ فیش را می‌سنجد و
 * اندازه‌ی برگه را اعلام می‌کند.
 */
export async function preparePrintPage(): Promise<PrintPageSize> {
  applyPaperVars();
  await waitForLayout();
  const heightMm = measureReceiptHeightMm();
  applyPageSize(heightMm);
  return {
    widthMm: PAPER_PRINTABLE_WIDTH_MM,
    heightMm,
    widthMicrons: PAPER_PRINTABLE_WIDTH_MM * 1000,
    heightMicrons: heightMm * 1000,
  };
}

/**
 * صفِ کارهای چاپ — هر کارِ چاپ فقط بعد از تمام‌شدنِ کارِ قبلی شروع می‌شود.
 *
 * چرا لازم است: مسیرِ حرارتی فیش را تکه‌تکه عکس می‌گیرد و تکه‌ها تا لحظه‌ی ارسال
 * کنارِ هم انبار می‌شوند. اگر دو چاپ هم‌زمان شروع شوند (مثلاً دو قبضِ پشتِ‌سرِهم)،
 * تکه‌های دو فیش با هم قاطی می‌شد و یک فیشِ درهم‌ریخته بیرون می‌آمد.
 */
let printChain: Promise<unknown> = Promise.resolve();

function enqueuePrintJob<T>(task: () => Promise<T>): Promise<T> {
  // شکستِ کارِ قبلی نباید جلوی کارِ بعدی را بگیرد، پس هر دو شاخه به `task` می‌روند.
  const next = printChain.then(task, task);
  printChain = next.catch(() => undefined);
  return next;
}

/**
 * چاپِ فیشی که همین حالا روی ناحیه‌ی چاپ نشسته است.
 *
 * چرا مسیرِ سیستمی از پروسه‌ی اصلی می‌گذرد (و نه `window.print()` مرورگر):
 * `window.print()` هیچ خبری از سرنوشتِ کار نمی‌دهد — نه موفقیت، نه علتِ شکست —
 * پس هر شکستی بی‌صدا می‌ماند. مسیرِ پروسه‌ی اصلی همیشه یک جوابِ صریح برمی‌گرداند.
 */
export function printPreparedReceipt(mode: PrintMode, printerName: string): Promise<PrintOutcome> {
  return enqueuePrintJob(() => runPrintJob(mode, printerName));
}

async function runPrintJob(mode: PrintMode, printerName: string): Promise<PrintOutcome> {
  if (mode === 'off') return { success: false, reason: 'print-disabled' };

  // مسیرِ حرارتی اصلاً وارد زنجیره‌ی چاپِ سیستم‌عامل نمی‌شود، پس نه اندازه‌ی برگه
  // لازم دارد و نه درایور.
  if (mode === 'thermal') return printThermalReceipt(printerName);

  let page: PrintPageSize;
  try {
    page = await preparePrintPage();
  } catch (error) {
    return { success: false, reason: `prepare-failed: ${errorText(error)}` };
  }

  const bridge = getPrinterBridge();
  if (!bridge) {
    // مرورگر: پلِ سیستمی وجود ندارد و تنها راه، پنجره‌ی چاپِ خودِ مرورگر است.
    // در نسخه‌ی دسکتاپ هرگز به اینجا نمی‌رسیم.
    window.print();
    return { success: true, reason: 'browser-print' };
  }

  try {
    return await bridge.print({ deviceName: printerName || undefined, page, silent: mode === 'silent' });
  } catch (error) {
    return { success: false, reason: errorText(error) };
  }
}

/**
 * چاپِ حرارتیِ مستقیم — راهِ اصلیِ چاپ روی پرینترهای فیش‌زن.
 *
 * چرا این راه: پرینترهای فیش‌زنِ ارزان مدلِ خودشان را به سیستم‌عامل اعلام نمی‌کنند،
 * پس هیچ درایورِ مخصوصی برایشان نصب نمی‌شود و مسیرِ معمولِ چاپ به‌جای فیش، کدهای
 * خامِ زبانِ صفحه‌بندی را روی کاغذ می‌ریزد. اینجا خودمان فیش را به تصویر تبدیل
 * می‌کنیم و با زبانِ خودِ پرینتر می‌فرستیم؛ پس هیچ درایوری در میان نیست.
 *
 * چرا تصویر و نه متن: شکلِ حروفِ فارسی در روشِ متنی به فونتِ داخلیِ پرینتر وابسته
 * می‌شد و روی بیشترِ این دستگاه‌ها به‌هم‌ریخته درمی‌آمد.
 *
 * چرا تکه‌تکه: فیش بعد از بزرگ‌نمایی (تا برسد به تراکمِ نقطه‌ی پرینتر) بلندتر از
 * خودِ پنجره می‌شود و عکسِ صفحه فقط از ناحیه‌ی دیده‌شده گرفته می‌شود.
 */
export async function printThermalReceipt(printerName: string): Promise<PrintOutcome> {
  const bridge = getPrinterBridge();
  if (!bridge?.thermalBegin || !bridge.thermalCapture || !bridge.thermalFinish) {
    return { success: false, reason: 'no-bridge' };
  }

  applyPaperVars();
  await waitForLayout();

  const area = document.querySelector<HTMLElement>('.print-area');
  if (!area) return { success: false, reason: 'empty-print-area' };

  const root = document.documentElement;
  const previousTransform = area.style.transform;
  root.classList.add(CAPTURING_CLASS);

  try {
    await nextFrame();
    const layout = area.getBoundingClientRect();
    if (layout.width < 1 || layout.height < 1) {
      return { success: false, reason: 'empty-print-area' };
    }

    // عکسِ صفحه با تراکمِ خودِ نمایشگر گرفته می‌شود؛ پس بزرگ‌نمایی باید همان را هم
    // حساب کند تا در نهایت دقیقاً به عرضِ موردنیازِ پرینتر برسیم و حروف تیز بمانند.
    const pixelRatio = window.devicePixelRatio || 1;
    const zoom = Math.max(1, THERMAL_DOTS_PER_LINE / (layout.width * pixelRatio));
    const viewportHeight = window.innerHeight;
    const totalHeight = layout.height * zoom;

    const begin = await bridge.thermalBegin();
    if (!begin.success) return begin;

    for (let offset = 0; offset < totalHeight; offset += viewportHeight) {
      area.style.transform = `translateY(${-offset}px) scale(${zoom})`;
      await nextFrame();

      const rect = area.getBoundingClientRect();
      const top = Math.max(0, rect.top);
      const height = Math.min(viewportHeight, rect.bottom) - top;
      if (height < 1) break;

      const captured = await bridge.thermalCapture({
        rect: { x: Math.max(0, rect.left), y: top, width: rect.width, height },
        dotsPerLine: THERMAL_DOTS_PER_LINE,
      });
      if (!captured.success) return captured;
    }

    return await bridge.thermalFinish({ deviceName: printerName || undefined });
  } catch (error) {
    return { success: false, reason: errorText(error) };
  } finally {
    // هر اتفاقی افتاد، فیش باید از روی صفحه برداشته شود؛ وگرنه گوشه‌ی پنجره برای
    // همیشه با یک فیشِ سفید پوشیده می‌ماند.
    area.style.transform = previousTransform;
    root.classList.remove(CAPTURING_CLASS);
  }
}

/** پیامِ آماده‌ی نمایش برای کاربر، ساخته‌شده از نتیجه‌ی خامِ چاپ. */
export interface PrintReport {
  text: string;
  type: 'success' | 'error' | 'info';
}

const has = (reason: string, ...needles: string[]) => needles.some((n) => reason.includes(n));

/**
 * پیامِ خامِ سیستم‌عامل را به یک جمله‌ی قابلِ فهم و «قابلِ اقدام» ترجمه می‌کند.
 * پیامِ خام هم در انتهای متن می‌آید، چون تنها سرنخِ پشتیبانی برای علت‌های ناشناخته است.
 */
export function describePrintOutcome(outcome: PrintOutcome): PrintReport {
  const reason = (outcome.reason || '').toLowerCase();

  if (outcome.success) return { type: 'success', text: 'فیش به پرینتر فرستاده شد.' };

  if (reason === 'print-disabled') {
    return { type: 'info', text: 'چاپ در تنظیمات روی «بدونِ پرینتر» است، پس چیزی چاپ نشد.' };
  }
  if (has(reason, 'cancel')) {
    return { type: 'info', text: 'چاپ لغو شد؛ پنجره‌ی چاپ بدونِ تأیید بسته شد.' };
  }
  if (has(reason, 'devicename', 'invalid or does not support')) {
    return {
      type: 'error',
      text: 'پرینترِ انتخاب‌شده پیدا نشد. در «تنظیمات ← پرینتر و چاپ» دکمه‌ی به‌روزرسانیِ لیست را بزنید و دوباره پرینتر را انتخاب کنید.',
    };
  }
  if (has(reason, 'no valid printer', 'no printer')) {
    return {
      type: 'error',
      text: 'هیچ پرینترِ آماده‌ای پیدا نشد. پرینتر را روشن کنید، کابلش را چک کنید و مطمئن شوید در تنظیماتِ پرینترهای سیستم دیده می‌شود.',
    };
  }
  if (has(reason, 'invalid print settings', 'page size')) {
    return {
      type: 'error',
      text: 'درایورِ پرینتر تنظیماتِ کاغذِ فیش را نپذیرفت. اگر پرینترتان فیش‌زن است، حالتِ «چاپِ حرارتی» را انتخاب کنید.',
    };
  }
  if (has(reason, 'empty-print-area')) {
    return {
      type: 'error',
      text: 'فیشی برای چاپ آماده نشده بود، پس چیزی به پرینتر نرفت. یک‌بار دیگر امتحان کنید؛ اگر تکرار شد به پشتیبانی بگویید.',
    };
  }
  if (has(reason, 'no-bridge')) {
    return { type: 'error', text: 'این حالتِ چاپ فقط در نسخه‌ی نصب‌شده‌ی برنامه (اپِ دسکتاپ) کار می‌کند.' };
  }
  if (has(reason, 'prepare-failed')) {
    return {
      type: 'error',
      text: `آماده‌سازیِ فیش برای چاپ انجام نشد، پس چیزی به پرینتر فرستاده نشد. (جزئیات: ${outcome.reason})`,
    };
  }
  if (has(reason, 'no-window')) {
    return { type: 'error', text: 'پنجره‌ی برنامه برای چاپ در دسترس نبود. برنامه را ببندید و دوباره باز کنید.' };
  }

  return {
    type: 'error',
    text: `چاپ انجام نشد${outcome.reason ? ` — پیامِ سیستم: «${outcome.reason}»` : ''}. پرینتر را روشن و متصل نگه دارید و دوباره امتحان کنید.`,
  };
}
