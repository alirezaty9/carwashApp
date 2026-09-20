/**
 * هندسه‌ی چاپِ فیش روی پرینترِ حرارتیِ رولی + پلِ ارتباط با پرینترِ سیستم.
 *
 * چرا این فایل هست: کروم (موتورِ چاپِ الکترون) وقتی اندازه‌ی برگه را صریح نداند،
 * اندازه‌ی پیش‌فرضِ درایورِ ویندوز را برمی‌دارد. درایورهای پرینترِ حرارتی معمولاً
 * پیش‌فرضشان «رولِ پیوسته» با طولِ بسیار بلند است؛ نتیجه‌اش این می‌شود که برای یک
 * فیشِ ۱۰ سانتی، متری کاغذ بیرون می‌آید. پس اندازه‌ی برگه باید در لحظه‌ی چاپ و
 * دقیقاً به‌اندازه‌ی همان فیش اعلام شود — کارِ همین فایل.
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

export interface PrinterBridge {
  list(): Promise<PrinterInfo[]>;
  printSilent(deviceName: string, page: PrintPageSize): Promise<{ success: boolean; reason?: string }>;
}

/** پلِ پرینتر فقط در نسخه‌ی دسکتاپ وجود دارد؛ در مرورگر undefined است. */
export const getPrinterBridge = (): PrinterBridge | undefined =>
  (window as unknown as { printer?: PrinterBridge }).printer;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
 * کلِ آماده‌سازیِ چاپ: منتظرِ رندر می‌ماند، ارتفاعِ فیش را می‌سنجد، اندازه‌ی برگه را
 * اعلام می‌کند و همان اندازه را برمی‌گرداند تا در حالتِ «چاپِ مستقیم» هم به
 * موتورِ چاپ داده شود.
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
