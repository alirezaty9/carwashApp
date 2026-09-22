/**
 * گزارشِ فنیِ برنامه — ابزارِ عیب‌یابی.
 *
 * چرا هست: وقتی چیزی روی یک کامپیوترِ دیگر کار نمی‌کند، تنها راهِ فهمیدنِ علت این
 * است که ببینیم دقیقاً تا کدام قدم پیش رفته و آنجا چه جوابی گرفته. این فایل قدم‌ها
 * را از هر دو سمتِ برنامه جمع می‌کند: سمتِ دیداری (`اپ`) و سمتی که با سیستم‌عامل
 * حرف می‌زند (`سیستم`).
 *
 * 🔴 این یک ابزارِ موقت برای دوره‌ی تست است و بعد از تأییدِ نهایی برداشته می‌شود.
 */

export type LogLevel = 'info' | 'ok' | 'warn' | 'error';
export type LogSource = 'app' | 'system';

export interface LogEntry {
  id: number;
  /** ساعتِ دقیق با میلی‌ثانیه */
  time: string;
  /** فاصله‌ی زمانی از قدمِ قبلی (میلی‌ثانیه) — برای پیداکردنِ جایی که کار کُند می‌شود */
  gapMs: number;
  source: LogSource;
  level: LogLevel;
  step: string;
  detail?: string;
}

interface LogBridge {
  log?: (entry: { level?: LogLevel; step: string; detail?: string }) => void;
  onLog?: (handler: (entry: { level?: LogLevel; step: string; detail?: string }) => void) => void;
}

const bridge = (): LogBridge | undefined => (window as unknown as { printer?: LogBridge }).printer;

/** سقفِ نگه‌داری — بیشتر از این فقط حافظه می‌گیرد و خوانده نمی‌شود. */
const MAX_ENTRIES = 600;

let entries: LogEntry[] = [];
let nextId = 1;
let lastStamp = 0;
let systemBridgeStarted = false;
const listeners = new Set<() => void>();

const pad = (n: number, width = 2) => n.toString().padStart(width, '0');

function push(source: LogSource, level: LogLevel, step: string, detail?: string): void {
  const now = new Date();
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`;
  const stamp = now.getTime();
  const gapMs = lastStamp === 0 ? 0 : stamp - lastStamp;
  lastStamp = stamp;

  entries = [...entries, { id: nextId++, time, gapMs, source, level, step, detail }].slice(-MAX_ENTRIES);
  listeners.forEach((listener) => listener());
}

/** ثبتِ یک قدم از سمتِ رابطِ کاربری. */
export function logStep(step: string, detail?: string, level: LogLevel = 'info'): void {
  push('app', level, step, detail);
  bridge()?.log?.({ level, step, detail });
}

/** گوش‌دادن به قدم‌هایی که بخشِ سیستمیِ برنامه گزارش می‌کند (فقط یک‌بار). */
export function startSystemLogBridge(): void {
  const api = bridge();
  if (systemBridgeStarted || !api?.onLog) return;
  systemBridgeStarted = true;
  api.onLog((entry) => push('system', entry.level ?? 'info', entry.step, entry.detail));
}

export const getLogEntries = (): LogEntry[] => entries;

export function subscribeLog(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function clearLog(): void {
  entries = [];
  lastStamp = 0;
  listeners.forEach((listener) => listener());
}

const LEVEL_MARK: Record<LogLevel, string> = { info: '·', ok: 'OK', warn: '!', error: 'XX' };

/** کلِ گزارش به‌صورتِ متنِ ساده — برای کپی‌کردن یا ذخیره در فایل. */
export function logAsText(): string {
  if (entries.length === 0) return 'گزارش خالی است.';
  const header = [
    '=== گزارشِ فنیِ یاتاش ===',
    `تاریخِ ساخت: ${new Date().toISOString()}`,
    `تعدادِ قدم‌ها: ${entries.length}`,
    '',
  ].join('\n');
  const body = entries
    .map((e) => {
      const gap = e.gapMs > 0 ? ` (+${e.gapMs}ms)` : '';
      const src = e.source === 'app' ? 'APP ' : 'SYS ';
      return `${e.time}${gap} ${src} ${LEVEL_MARK[e.level]} ${e.step}${e.detail ? `\n        ${e.detail}` : ''}`;
    })
    .join('\n');
  return `${header}${body}\n`;
}
