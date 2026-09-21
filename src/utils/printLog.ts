/**
 * گزارشِ قدم‌به‌قدمِ مسیرِ چاپ.
 *
 * چرا این فایل هست: چاپ از چند لایه‌ی جدا رد می‌شود (رابطِ کاربری ← بخشِ ویندوزیِ
 * برنامه ← خودِ سیستم‌عامل ← درایورِ پرینتر) و وقتی چیزی چاپ نمی‌شود، بدونِ دیدنِ
 * مرزِ بینِ این لایه‌ها نمی‌شود فهمید کدامشان کار را زمین گذاشته. این فایل هر قدم
 * را در دو جا ثبت می‌کند:
 *   ۱) داخلِ خودِ برنامه (کادرِ «گزارشِ چاپ» در تنظیماتِ پرینتر)،
 *   ۲) در ترمینالی که برنامه از آن اجرا شده — از راهِ بخشِ ویندوزی/لینوکسیِ برنامه.
 */

export type PrintLogSource = 'app' | 'system';

export interface PrintLogEntry {
  id: number;
  /** ساعتِ دقیق، تا فاصله‌ی بینِ قدم‌ها هم دیده شود. */
  time: string;
  /** `app` = بخشِ دیداریِ برنامه · `system` = بخشی که با سیستم‌عامل حرف می‌زند. */
  source: PrintLogSource;
  step: string;
  detail?: string;
}

/**
 * پلِ لاگ — عمداً اینجا جداگانه و حداقلی تعریف شده تا این فایل به فایلِ چاپ
 * وابسته نشود (وگرنه دو فایل به هم وابسته می‌شدند و ترتیبِ بارگذاری شکننده می‌شد).
 */
interface LogBridge {
  log?: (entry: { step: string; detail?: string }) => void;
  onLog?: (handler: (entry: { step: string; detail?: string }) => void) => void;
}

const bridge = (): LogBridge | undefined => (window as unknown as { printer?: LogBridge }).printer;

/** سقفِ نگه‌داریِ گزارش — بیشتر از این فقط حافظه می‌گیرد و خوانده نمی‌شود. */
const MAX_ENTRIES = 200;

let entries: PrintLogEntry[] = [];
let nextId = 1;
let systemBridgeStarted = false;
const listeners = new Set<() => void>();

const pad = (n: number, width = 2) => n.toString().padStart(width, '0');

function timestamp(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`;
}

function push(source: PrintLogSource, step: string, detail?: string): void {
  entries = [...entries, { id: nextId++, time: timestamp(), source, step, detail }].slice(-MAX_ENTRIES);
  listeners.forEach((listener) => listener());
}

/** ثبتِ یک قدم از سمتِ رابطِ کاربری — هم در اپ، هم در ترمینال. */
export function logPrintStep(step: string, detail?: string): void {
  push('app', step, detail);
  // ترمینال فقط از راهِ بخشِ سیستمیِ برنامه در دسترس است؛ در مرورگر این پل نیست.
  bridge()?.log?.({ step, detail });
}

/**
 * گوش‌دادن به قدم‌هایی که بخشِ سیستمیِ برنامه گزارش می‌کند (مثلِ جوابِ خامِ چاپ).
 * فقط یک‌بار در کلِ عمرِ برنامه برقرار می‌شود.
 */
export function startSystemLogBridge(): void {
  const api = bridge();
  if (systemBridgeStarted || !api?.onLog) return;
  systemBridgeStarted = true;
  api.onLog((entry) => push('system', entry.step, entry.detail));
}

export const getPrintLog = (): PrintLogEntry[] => entries;

export function subscribePrintLog(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function clearPrintLog(): void {
  entries = [];
  listeners.forEach((listener) => listener());
}

/** کلِ گزارش به‌صورتِ متنِ ساده — برای کپی‌کردن و فرستادن به پشتیبانی. */
export function printLogAsText(): string {
  if (entries.length === 0) return 'گزارشِ چاپ خالی است.';
  return entries
    .map((e) => `${e.time} [${e.source === 'app' ? 'اپ' : 'سیستم'}] ${e.step}${e.detail ? ` | ${e.detail}` : ''}`)
    .join('\n');
}
