/**
 * آداپتورِ ذخیره‌سازی — تنها نقطه‌ای که می‌داند داده «کجا» ذخیره می‌شود.
 *
 * - داخلِ Electron: از پلِ `window.electronStore` استفاده می‌شود و داده در یک
 *   فایلِ واقعیِ JSON روی دیسک می‌رود (پایدار، قابلِ بکاپ، مبنای لایسنس).
 * - در مرورگر (توسعه/دمو): همان `localStorage` مثلِ قبل.
 *
 * بقیه‌ی برنامه فقط این فایل را می‌بیند و از محلِ ذخیره بی‌خبر است.
 *
 * 🔴 قاعده‌ی مهمِ این لایه: «نبودِ داده» و «خرابیِ داده» دو چیزِ متفاوت‌اند و
 * هرگز نباید یکی گرفته شوند. اگر خواندن شکست بخورد و ما آن را «خالی» بفهمیم،
 * لایه‌ی بالاتر با خیالِ راحت داده‌ی خالی را روی داده‌ی سالمِ خراب‌خوانده‌شده
 * می‌نویسد و سوابق برای همیشه می‌رود. برای همین خروجیِ خواندن سه‌حالته است.
 */

/** نتیجه‌ی خواندنِ یک کلید: مقدار داریم / کلید اصلاً نبوده / خواندن شکست خورد. */
export type RawRead =
  | { status: 'ok'; value: string }
  | { status: 'empty' }
  | { status: 'error'; message?: string };

/** خطای ذخیره‌سازی که باید به کاربر نشان داده شود. */
export interface StorageError {
  key: string;
  message: string;
}

/** مسیرها و فهرستِ بکاپ‌های خودکار (فقط در نسخه‌ی دسکتاپ). */
export interface StorageInfo {
  dataPath: string;
  backupDir: string;
  backups: string[];
}

interface ElectronStoreBridge {
  get(key: string): RawRead;
  set(key: string, value: string): void;
  onError(handler: (error: StorageError) => void): void;
  info(): Promise<StorageInfo>;
}

declare global {
  interface Window {
    electronStore?: ElectronStoreBridge;
    electronEnv?: { isElectron: boolean };
  }
}

const bridge = typeof window !== 'undefined' ? window.electronStore : undefined;

/** آیا برنامه داخلِ Electron اجرا می‌شود؟ */
export const isElectron = !!bridge;

/** خواندنِ مقدارِ خام. خروجی سه‌حالته است — به توضیحِ بالای فایل نگاه کن. */
export function readRaw(key: string): RawRead {
  try {
    if (bridge) {
      const result = bridge.get(key);
      // پلِ قدیمی/ناشناخته: اگر شکلِ پاسخ آن چیزی نبود که انتظار داریم، آن را
      // «خطا» حساب می‌کنیم نه «خالی» — چون حدسِ اشتباه اینجا یعنی ازدست‌رفتنِ داده.
      return result && typeof result.status === 'string' ? result : { status: 'error' };
    }
    const raw = localStorage.getItem(key);
    return raw === null ? { status: 'empty' } : { status: 'ok', value: raw };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * نوشتنِ مقدارِ خام. `false` یعنی نوشتن قطعاً شکست خورد.
 *
 * ⚠️ در نسخه‌ی دسکتاپ نوشتن ناهمگام است، پس `true` فقط یعنی «درخواست فرستاده شد»؛
 * شکستِ واقعیِ دیسک از راهِ `subscribeStorageErrors` گزارش می‌شود.
 */
export function saveRaw(key: string, value: string): boolean {
  try {
    if (bridge) bridge.set(key, value);
    else localStorage.setItem(key, value);
    return true;
  } catch (error) {
    notifyLocalError({ key, message: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

// ---- کانالِ گزارشِ خطای ذخیره‌سازی ----
// بدونِ این، شکستِ نوشتن بی‌صدا بلعیده می‌شد و صندوقدار تا آخرِ شب نمی‌فهمید که
// هیچ‌کدام از قبض‌های امروز ذخیره نشده‌اند.

type ErrorHandler = (error: StorageError) => void;
const handlers = new Set<ErrorHandler>();
let bridgeHooked = false;

function notifyLocalError(error: StorageError): void {
  for (const handler of handlers) handler(error);
}

/** اشتراک در خطاهای ذخیره‌سازی؛ تابعِ برگشتی اشتراک را لغو می‌کند. */
export function subscribeStorageErrors(handler: ErrorHandler): () => void {
  handlers.add(handler);
  if (bridge && !bridgeHooked) {
    bridgeHooked = true;
    bridge.onError((error) => notifyLocalError(error));
  }
  return () => {
    handlers.delete(handler);
  };
}

/** مسیرِ فایلِ داده و فهرستِ بکاپ‌های خودکار؛ در مرورگر `null`. */
export async function getStorageInfo(): Promise<StorageInfo | null> {
  if (!bridge) return null;
  try {
    return await bridge.info();
  } catch {
    return null;
  }
}

export {};
