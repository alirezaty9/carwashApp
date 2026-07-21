/**
 * آداپتورِ ذخیره‌سازی — تنها نقطه‌ای که می‌داند داده «کجا» ذخیره می‌شود.
 *
 * - داخلِ Electron: از پلِ `window.electronStore` استفاده می‌شود و داده در یک
 *   فایلِ واقعیِ JSON روی دیسک می‌رود (پایدار، قابلِ بکاپ، مبنای لایسنسِ بعدی).
 * - در مرورگر (توسعه/دمو): همان `localStorage` مثلِ قبل.
 *
 * بقیه‌ی برنامه فقط `loadRaw`/`saveRaw` را می‌بیند و از محلِ ذخیره بی‌خبر است
 * (جداسازیِ لایه‌ی داده از UI). مقادیر رشته‌ی JSON هستند تا رفتار در هر دو حالت یکسان بماند.
 */

interface ElectronStoreBridge {
  get(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
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

/** خواندنِ مقدارِ خام (رشته) یا null اگر نبود */
export function loadRaw(key: string): string | null {
  try {
    if (bridge) return bridge.get(key);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** نوشتنِ مقدارِ خام (رشته) */
export function saveRaw(key: string, value: string): void {
  try {
    if (bridge) bridge.set(key, value);
    else localStorage.setItem(key, value);
  } catch {
    /* اگر حافظه پر بود بی‌صدا رد می‌شویم */
  }
}

/** حذفِ یک کلید */
export function deleteRaw(key: string): void {
  try {
    if (bridge) bridge.delete(key);
    else localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

export {};
