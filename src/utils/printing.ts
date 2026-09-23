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

import { logStep } from './techLog';

/**
 * عرضِ رولِ کاغذ. دو اندازه‌ی رایجِ پرینترهای فیش‌زن.
 * این اندازه قابلِ تشخیصِ خودکار نیست — خودِ دستگاه هیچ‌جا اعلامش نمی‌کند — پس
 * از تنظیماتِ برنامه خوانده می‌شود.
 */
export type PaperWidth = '58' | '80';

interface PaperSpec {
  /** عرضِ اسمیِ رول (همان عددی که روی جعبه‌ی کاغذ نوشته شده) */
  rollMm: number;
  /**
   * عرضی که سرِ چاپگر واقعاً می‌سوزاند — نه عرضِ رول.
   * چند میلی‌متر از هر طرفِ کاغذ فیزیکاً بیرونِ سرِ چاپگر است و هرگز چاپ نمی‌شود.
   */
  printableMm: number;
  /** تعدادِ نقطه‌ی هر خط در تراکمِ استانداردِ ۲۰۳ نقطه بر اینچ */
  dotsPerLine: number;
}

const PAPER_SPECS: Record<PaperWidth, PaperSpec> = {
  '58': { rollMm: 58, printableMm: 48, dotsPerLine: 384 },
  '80': { rollMm: 80, printableMm: 72, dotsPerLine: 576 },
};

/**
 * 🔴 پیش‌فرض عمداً «باریک» است.
 * اگر اندازه اشتباه باشد، دو نتیجه‌ی خیلی نابرابر دارد: فیشِ باریک روی کاغذِ پهن
 * فقط حاشیه‌ی خالی می‌گذارد و کامل خوانده می‌شود، ولی فیشِ پهن روی کاغذِ باریک
 * از لبه بیرون می‌زند و مبلغ و شماره‌ی قبض بریده می‌شوند. پس حدسِ ایمن، باریک است.
 */
export const DEFAULT_PAPER_WIDTH: PaperWidth = '58';

/** مشخصاتِ کاغذ را از روی تنظیمات می‌دهد؛ مقدارِ ناشناخته یا نبود، به پیش‌فرضِ ایمن می‌افتد. */
export const paperSpec = (width?: string): PaperSpec =>
  PAPER_SPECS[width as PaperWidth] ?? PAPER_SPECS[DEFAULT_PAPER_WIDTH];

/** فهرستِ اندازه‌ها برای نمایش در تنظیمات. */
export const PAPER_OPTIONS: { id: PaperWidth; rollMm: number; printableMm: number }[] = (
  Object.keys(PAPER_SPECS) as PaperWidth[]
).map((id) => ({ id, rollMm: PAPER_SPECS[id].rollMm, printableMm: PAPER_SPECS[id].printableMm }));

/** حاشیه‌ی داخلیِ فیش تا متن به لبه‌ی کاغذ نچسبد. */
const RECEIPT_PADDING_MM = 2;

/**
 * فاصله‌ی سرِ چاپگر تا لبه‌ی برش. بدونِ این مقدار کاغذِ اضافه، آخرین خطوطِ فیش
 * داخلِ دستگاه می‌مانند و هنگامِ کندنِ کاغذ خوانده نمی‌شوند.
 */
const TEAR_OFF_TAIL_MM = 15;

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
  /**
   * توضیحِ اینکه فیش دقیقاً به کجا تحویل شد.
   * چرا لازم است: «موفق» یعنی سیستم‌عامل کار را پذیرفت، نه اینکه کاغذ بیرون آمد.
   * اگر چیزی چاپ نشد، کاربر باید بداند دنبالِ ادامه‌ی ماجرا کجا بگردد.
   */
  note?: string;
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
  /** ابزارِ موقتِ گزارشِ فنی */
  environment?(): Promise<Record<string, unknown>>;
  saveLog?(text: string): Promise<{ success: boolean; path?: string; reason?: string }>;
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
function applyPaperVars(spec: PaperSpec): void {
  const root = document.documentElement;
  root.style.setProperty('--cw-paper-width', `${spec.printableMm}mm`);
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
function applyPageSize(spec: PaperSpec, heightMm: number): void {
  let style = document.getElementById(PAGE_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = PAGE_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `@page { size: ${spec.printableMm}mm ${heightMm}mm; margin: 0; }`;
}

/**
 * آماده‌سازیِ چاپ در مسیرِ سیستم‌عامل: منتظرِ رندر می‌ماند، ارتفاعِ فیش را می‌سنجد و
 * اندازه‌ی برگه را اعلام می‌کند.
 */
export async function preparePrintPage(spec: PaperSpec): Promise<PrintPageSize> {
  applyPaperVars(spec);
  await waitForLayout();
  const heightMm = measureReceiptHeightMm();
  applyPageSize(spec, heightMm);
  return {
    widthMm: spec.printableMm,
    heightMm,
    widthMicrons: spec.printableMm * 1000,
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
export function printPreparedReceipt(
  mode: PrintMode,
  printerName: string,
  paperWidth?: string,
): Promise<PrintOutcome> {
  return enqueuePrintJob(() => runPrintJob(mode, printerName, paperSpec(paperWidth)));
}

const MODE_LABELS: Record<PrintMode, string> = {
  thermal: 'چاپِ حرارتیِ مستقیم',
  dialog: 'با پنجره‌ی چاپ',
  silent: 'چاپِ معمولی',
  off: 'بدونِ پرینتر',
};

async function runPrintJob(mode: PrintMode, printerName: string, spec: PaperSpec): Promise<PrintOutcome> {
  logStep(
    '▶️ درخواستِ چاپ',
    `حالت=${MODE_LABELS[mode]} · پرینترِ انتخاب‌شده=${printerName || '(انتخاب نشده)'} · ` +
      `کاغذ=${spec.rollMm}mm (عرضِ چاپ ${spec.printableMm}mm / ${spec.dotsPerLine} نقطه)`,
  );

  if (mode === 'off') {
    logStep('چاپ انجام نشد', 'حالتِ چاپ روی «بدونِ پرینتر» است', 'warn');
    return { success: false, reason: 'print-disabled' };
  }

  // مسیرِ حرارتی اصلاً وارد زنجیره‌ی چاپِ سیستم‌عامل نمی‌شود، پس نه اندازه‌ی برگه
  // لازم دارد و نه درایور.
  if (mode === 'thermal') return printThermalReceipt(printerName, spec);

  let page: PrintPageSize;
  try {
    page = await preparePrintPage(spec);
    logStep('اندازه‌ی برگه اعلام شد', `${page.widthMm}×${page.heightMm} میلی‌متر`);
  } catch (error) {
    logStep('🔴 آماده‌سازیِ فیش شکست خورد', errorText(error), 'error');
    return { success: false, reason: `prepare-failed: ${errorText(error)}` };
  }

  const bridge = getPrinterBridge();
  if (!bridge) {
    logStep('🟡 اجرا در مرورگر', 'پلِ سیستمی وجود ندارد؛ پنجره‌ی چاپِ مرورگر باز می‌شود', 'warn');
    // مرورگر: پلِ سیستمی وجود ندارد و تنها راه، پنجره‌ی چاپِ خودِ مرورگر است.
    // در نسخه‌ی دسکتاپ هرگز به اینجا نمی‌رسیم.
    window.print();
    return { success: true, reason: 'browser-print' };
  }

  try {
    const outcome = await bridge.print({ deviceName: printerName || undefined, page, silent: mode === 'silent' });
    logStep(
      outcome.success ? '✅ کارِ چاپ تحویلِ سیستم شد' : '🔴 کارِ چاپ رد شد',
      outcome.reason || 'بدونِ پیام',
      outcome.success ? 'ok' : 'error',
    );
    return outcome;
  } catch (error) {
    logStep('🔴 ارتباط با بخشِ سیستمی قطع شد', errorText(error), 'error');
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
export async function printThermalReceipt(printerName: string, spec: PaperSpec): Promise<PrintOutcome> {
  const bridge = getPrinterBridge();
  if (!bridge?.thermalBegin || !bridge.thermalCapture || !bridge.thermalFinish) {
    logStep('🔴 چاپِ حرارتی در دسترس نیست', 'این قابلیت فقط در نسخه‌ی دسکتاپ کار می‌کند', 'error');
    return { success: false, reason: 'no-bridge' };
  }

  applyPaperVars(spec);
  await waitForLayout();

  const area = document.querySelector<HTMLElement>('.print-area');
  if (!area) {
    logStep('🔴 ناحیه‌ی چاپ خالی است', 'هیچ فیشی روی ناحیه‌ی چاپ ننشسته بود', 'error');
    return { success: false, reason: 'empty-print-area' };
  }
  logStep('ناحیه‌ی چاپ پیدا شد', `متنِ فیش: ${area.innerText.trim().length} کاراکتر`);

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
    const zoom = Math.max(1, spec.dotsPerLine / (layout.width * pixelRatio));
    const viewportHeight = window.innerHeight;
    const totalHeight = layout.height * zoom;

    const sliceCount = Math.max(1, Math.ceil(totalHeight / viewportHeight));
    logStep(
      'آماده‌سازیِ تصویرِ فیش',
      `کاغذ=${spec.rollMm}mm/${spec.dotsPerLine} نقطه · اندازه‌ی چیدمان=${Math.round(layout.width)}×${Math.round(layout.height)} · ` +
        `تراکمِ نمایشگر=${pixelRatio} · ` +
        `بزرگ‌نمایی=${zoom.toFixed(3)} · ارتفاعِ کل=${Math.round(totalHeight)} پیکسل · ` +
        `ارتفاعِ پنجره=${viewportHeight} · تعدادِ تکه=${sliceCount}`,
    );

    const begin = await bridge.thermalBegin();
    if (!begin.success) {
      logStep('🔴 شروعِ چاپِ حرارتی رد شد', begin.reason, 'error');
      return begin;
    }

    let index = 0;
    for (let offset = 0; offset < totalHeight; offset += viewportHeight) {
      index += 1;
      area.style.transform = `translateY(${-offset}px) scale(${zoom})`;
      await nextFrame();

      const rect = area.getBoundingClientRect();
      const top = Math.max(0, rect.top);
      const height = Math.min(viewportHeight, rect.bottom) - top;
      logStep(
        `تکه‌ی ${index} از ${sliceCount}`,
        `جابه‌جایی=${Math.round(offset)} · ناحیه: چپ=${Math.round(rect.left)} بالا=${Math.round(top)} ` +
          `عرض=${Math.round(rect.width)} ارتفاع=${Math.round(height)}`,
      );
      if (height < 1) {
        logStep('تکه‌ی خالی — پایانِ عکس‌برداری', undefined, 'warn');
        break;
      }

      const captured = await bridge.thermalCapture({
        rect: { x: Math.max(0, rect.left), y: top, width: rect.width, height },
        dotsPerLine: spec.dotsPerLine,
      });
      if (!captured.success) {
        logStep('🔴 عکس‌برداری از تکه شکست خورد', captured.reason, 'error');
        return captured;
      }
    }

    const outcome = await bridge.thermalFinish({ deviceName: printerName || undefined });
    logStep(
      outcome.success ? '✅ پایانِ چاپِ حرارتی' : '🔴 چاپِ حرارتی ناموفق',
      outcome.success ? outcome.note : outcome.reason,
      outcome.success ? 'ok' : 'error',
    );
    return outcome;
  } catch (error) {
    logStep('🔴 خطای غیرمنتظره در چاپِ حرارتی', errorText(error), 'error');
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

  if (outcome.success) {
    return {
      type: 'success',
      text: outcome.note
        ? `${outcome.note} اگر کاغذی بیرون نیامد، صفِ چاپ و پورتِ پرینتر را در تنظیماتِ سیستم بررسی کنید.`
        : 'فیش به پرینتر فرستاده شد.',
    };
  }

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
