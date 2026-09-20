// پروسه‌ی «Main» الکترون — مغزِ برنامه‌ی دسکتاپ.
// این فایل با Node اجرا می‌شود (نه در مرورگر)، پس به فایل‌ها و سیستم‌عامل دسترسی دارد.
// پسوندِ .cjs یعنی CommonJS (چون package.json روی "type":"module" است و باید require کار کند).
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const license = require('./license.cjs');

// electron-store: کتابخانه‌ای که داده را در یک فایلِ JSON داخلِ پوشه‌ی userData
// (مثلاً C:\Users\<user>\AppData\Roaming\Yatash Carwash) نگه می‌دارد.
// این فایل با بستنِ برنامه پاک نمی‌شود و پایه‌ی بکاپ و لایسنس است.
const STORE_NAME = 'yatash-carwash-data';
const USER_DATA_DIR = app.getPath('userData');
const DATA_FILE = path.join(USER_DATA_DIR, `${STORE_NAME}.json`);
const BACKUP_DIR = path.join(USER_DATA_DIR, 'backups');
const BACKUP_KEEP_DAYS = 7;

// ============================================================================
// راه‌اندازیِ امنِ انبارِ داده.
//
// اگر فایلِ داده خراب باشد (قطعِ برقِ وسطِ نوشتن، سکتورِ خراب، ویرایشِ دستی)،
// electron-store به‌طور پیش‌فرض خطا می‌دهد. وسوسه‌ی ساده این است که بگوییم
// «فایلِ خراب را پاک کن و از نو شروع کن» — ولی این دقیقاً یعنی نابودیِ سوابقِ
// مالیِ کارواش. پس به‌جایش:
//   ۱) فایلِ خراب را با نامِ تاریخ‌دار کنار می‌گذاریم (هیچ‌وقت پاک نمی‌شود)،
//   ۲) پرچمِ `storeBroken` را بالا می‌بریم تا رابطِ کاربری «خالی» بالا نیاید و
//      روی چیزی ننویسد، بلکه صفحه‌ی بازیابی نشان دهد.
// ============================================================================
let store = null;
let storeBroken = null; // پیامِ خطا، یا null اگر همه‌چیز سالم است

function quarantineCorruptFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const quarantined = path.join(USER_DATA_DIR, `${STORE_NAME}.corrupt-${stamp}.json`);
    fs.copyFileSync(DATA_FILE, quarantined);
    return quarantined;
  } catch {
    return null;
  }
}

function openStore() {
  try {
    store = new Store({ name: STORE_NAME });
    return;
  } catch (error) {
    // فایل خراب است. اول نسخه‌اش را امن کن، بعد یک انبارِ تازه باز کن تا برنامه
    // بالا بیاید و بتواند صفحه‌ی بازیابی را نشان دهد.
    const quarantined = quarantineCorruptFile();
    storeBroken =
      (error && error.message ? error.message : String(error)) +
      (quarantined ? ` | نسخه‌ی خراب اینجا نگه داشته شد: ${quarantined}` : '');
    try {
      store = new Store({ name: STORE_NAME, clearInvalidConfig: true });
    } catch {
      // حتی انبارِ تازه هم باز نشد (دیسکِ فقط‌خواندنی و مانندِ آن). یک انبارِ
      // موقتِ درون‌حافظه‌ای می‌گذاریم تا برنامه بالا بیاید و پیامِ خطا را نشان
      // دهد؛ وگرنه پنجره اصلاً باز نمی‌شود و کاربر هیچ سرنخی ندارد.
      store = createMemoryStore();
    }
  }
}

/** انبارِ اضطراریِ درون‌حافظه‌ای — فقط تا برنامه بتواند پیامِ خطا را نشان دهد. */
function createMemoryStore() {
  const data = new Map();
  return {
    path: DATA_FILE,
    get: (key) => data.get(key),
    set: (key, value) => data.set(key, value),
    delete: (key) => data.delete(key),
  };
}

/**
 * بکاپِ خودکارِ روزانه.
 *
 * در اولین اجرای هر روز، یک کپیِ تاریخ‌دار از فایلِ داده در پوشه‌ی `backups`
 * ساخته می‌شود و فقط ۷ نسخه‌ی آخر نگه داشته می‌شود. چون این کار «قبل از» بالا
 * آمدنِ پنجره انجام می‌شود، نسخه‌ی گرفته‌شده همان وضعیتِ پایانِ روزِ قبل است.
 *
 * هیچ خطایی اینجا نباید جلوی بالا آمدنِ برنامه را بگیرد — بکاپ یک تورِ ایمنیِ
 * اضافه است، نه شرطِ کار کردنِ صندوق.
 */
function makeDailyBackup() {
  try {
    // اگر فایلِ امروز خراب است، از آن بکاپ نمی‌گیریم — وگرنه یکی از هفت جای
    // پشتیبان با یک نسخه‌ی بی‌مصرف پر می‌شود. نسخه‌ی خراب جداگانه قرنطینه شده است.
    if (storeBroken) return;
    if (!fs.existsSync(DATA_FILE)) return;
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const target = path.join(BACKUP_DIR, `${STORE_NAME}-${stamp}.json`);
    if (!fs.existsSync(target)) fs.copyFileSync(DATA_FILE, target);
    pruneOldBackups();
  } catch {
    /* بکاپ نگرفتن نباید برنامه را زمین بزند */
  }
}

function listBackups() {
  try {
    return fs
      .readdirSync(BACKUP_DIR)
      .filter((name) => name.startsWith(`${STORE_NAME}-`) && name.endsWith('.json'))
      .sort(); // نامِ تاریخ‌دار، پس ترتیبِ الفبایی = ترتیبِ زمانی
  } catch {
    return [];
  }
}

function pruneOldBackups() {
  const files = listBackups();
  for (const name of files.slice(0, Math.max(0, files.length - BACKUP_KEEP_DAYS))) {
    try {
      fs.unlinkSync(path.join(BACKUP_DIR, name));
    } catch {
      /* اگر پاک نشد مهم نیست */
    }
  }
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#0F172A',
    autoHideMenuBar: true, // نوارِ منوی پیش‌فرضِ الکترون پنهان می‌شود
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      // امنیت: رِندرِر (UI) نباید مستقیم به Node دسترسی داشته باشد؛
      // فقط از پلِ امنِ preload استفاده می‌کند.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // برای اجرای preload با require لازم است
      // امنیت: در نسخه‌ی نصب‌شده DevTools خاموش است تا کاربر نتواند از کنسول
      // به window.electronStore/داده‌ها دست بزند. در توسعه روشن می‌ماند.
      devTools: !app.isPackaged,
    },
  });

  // امنیت: جلوی باز شدنِ پنجره‌ی جدید و رفتن به آدرس‌های بیرونی را بگیر
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost:3000') && !url.startsWith('file://')) {
      event.preventDefault();
    }
  });

  const distIndex = path.join(__dirname, '..', 'dist', 'index.html');

  if (app.isPackaged) {
    // حالتِ نصب‌شده: فایل‌های بیلدشده‌ی Vite را از دیسک بارگذاری کن
    mainWindow.loadFile(distIndex);
  } else {
    // حالتِ توسعه: اول به سرورِ زنده‌ی Vite وصل شو (HMR فعال).
    // اگر سرورِ توسعه بالا نبود (مثلاً «electron .» بدونِ «npm run dev» اجرا شد)،
    // به‌جای پنجره‌ی خطای ERR_CONNECTION_REFUSED، بیلدِ ساخته‌شده‌ی dist/ را نشان بده.
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      if (fs.existsSync(distIndex)) {
        mainWindow.loadFile(distIndex);
      } else {
        console.error(
          '[Yatash] سرورِ توسعه بالا نیست و بیلدی هم در dist/ نیست.\n' +
            'برای اجرا در حالتِ توسعه: «npm run dev»  |  برای دیدنِ بیلد: اول «npm run build».',
        );
      }
    });
  }
}

// ---- کانال‌های IPC برای ذخیره‌سازی ----
// پلِ عمومیِ ذخیره‌سازی فقط برای داده‌ی برنامه است. کلیدهای «license:*» از این‌جا
// قابلِ دست‌کاری نیستند تا کاربر نتواند تریال را ریست یا لایسنس را جعل کند؛
// آن‌ها فقط از طریقِ مدیرِ لایسنس (با اعتبارسنجیِ امضا) قابلِ تغییرند.
const isProtectedKey = (key) => typeof key !== 'string' || key.startsWith('license:');

// get همگام است (sendSync) تا در لحظه‌ی راه‌اندازیِ React مقدارِ اولیه در دسترس باشد.
// پاسخ سه‌حالته است؛ «خالی» و «خطا» عمداً از هم جدا شده‌اند تا رابطِ کاربری نتواند
// داده‌ی خراب را با داده‌ی نداشته اشتباه بگیرد و رویش بنویسد.
ipcMain.on('storage:get', (event, key) => {
  if (isProtectedKey(key)) {
    event.returnValue = { status: 'empty' };
    return;
  }
  if (storeBroken || !store) {
    event.returnValue = { status: 'error', message: storeBroken || 'انبارِ داده باز نشد.' };
    return;
  }
  try {
    const value = store.get(key);
    event.returnValue =
      value === undefined || value === null ? { status: 'empty' } : { status: 'ok', value: String(value) };
  } catch (error) {
    event.returnValue = { status: 'error', message: error && error.message ? error.message : String(error) };
  }
});

ipcMain.on('storage:set', (event, { key, value } = {}) => {
  if (isProtectedKey(key) || !store) return;
  try {
    store.set(key, value);
  } catch (error) {
    // شکستِ نوشتن (دیسکِ پر، فایلِ قفل‌شده، نبودِ دسترسی) هرگز نباید بی‌صدا بماند:
    // وگرنه صندوقدار تا آخرِ شب فکر می‌کند قبض‌ها ثبت شده‌اند.
    if (!event.sender.isDestroyed()) {
      event.sender.send('storage:error', {
        key,
        message: error && error.message ? error.message : String(error),
      });
    }
  }
});

// مسیرِ فایلِ داده و فهرستِ بکاپ‌های خودکار — برای نمایش در «تنظیمات و بکاپ»
ipcMain.handle('storage:info', () => ({
  dataPath: DATA_FILE,
  backupDir: BACKUP_DIR,
  backups: listBackups(),
}));

// ---- کانال‌های IPC لایسنس ----
// ثبتشان پایینِ فایل و بعد از باز شدنِ انبار انجام می‌شود (داخلِ app.whenReady).

// ---- کانال‌های IPC پرینتر ----
// لیستِ پرینترهای نصب‌شده روی سیستم را برمی‌گرداند تا کاربر در تنظیمات انتخاب کند.
ipcMain.handle('printer:list', async (event) => {
  const wc = BrowserWindow.fromWebContents(event.sender)?.webContents;
  if (!wc) return [];
  try {
    const printers = await wc.getPrintersAsync();
    return printers.map((p) => ({ name: p.name, displayName: p.displayName, isDefault: p.isDefault }));
  } catch {
    return [];
  }
});

// کف و سقفِ ایمنِ اندازه‌ی برگه بر حسبِ میکرون (هر میلی‌متر = ۱۰۰۰ میکرون).
// UI از بیرونِ این پروسه می‌آید، پس عددش همین‌جا در مرزِ ورودی اعتبارسنجی می‌شود؛
// وگرنه یک عددِ خراب می‌تواند به پرینترِ رولی بگوید نیم‌متر کاغذ بیرون بدهد.
const MIN_PAGE_MICRONS = 20_000; // ۲ سانتی‌متر
const MAX_PAGE_MICRONS = 500_000; // ۵۰ سانتی‌متر

const toPageSize = (page) => {
  if (!page) return undefined;
  const width = Number(page.widthMicrons);
  const height = Number(page.heightMicrons);
  const inRange = (v) => Number.isFinite(v) && v >= MIN_PAGE_MICRONS && v <= MAX_PAGE_MICRONS;
  if (!inRange(width) || !inRange(height)) return undefined;
  return { width: Math.round(width), height: Math.round(height) };
};

// چاپِ مستقیم (بدونِ پنجره) به یک پرینترِ مشخص.
// اندازه‌ی برگه صریحاً اعلام می‌شود؛ بدونِ آن کروم اندازه‌ی پیش‌فرضِ درایور را
// برمی‌دارد که روی پرینترِ حرارتی یعنی رولِ پیوسته و کاغذِ بی‌پایان.
ipcMain.handle('printer:print', async (event, { deviceName, page } = {}) => {
  const wc = BrowserWindow.fromWebContents(event.sender)?.webContents;
  if (!wc) return { success: false, reason: 'no-window' };
  const pageSize = toPageSize(page);
  return new Promise((resolve) => {
    wc.print(
      {
        silent: true,
        deviceName: deviceName || undefined,
        printBackground: true,
        margins: { marginType: 'none' },
        // ۱۰۰ یعنی «کوچک نکن» — جلوی «fit to page»ِ درایور را می‌گیرد که
        // وگرنه فیش را ریز و ناخوانا می‌کند.
        scaleFactor: 100,
        ...(pageSize ? { pageSize } : {}),
      },
      (success, reason) => resolve({ success, reason }),
    );
  });
});

app.whenReady().then(() => {
  openStore();
  // ترتیب مهم است: بکاپ «قبل از» باز شدنِ پنجره گرفته می‌شود، تا نسخه‌ی
  // ذخیره‌شده همان وضعیتِ پایانِ روزِ قبل باشد، نه وضعیتِ بعد از کارِ امروز.
  makeDailyBackup();
  license.register(ipcMain, store);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // در ویندوز/لینوکس با بستنِ آخرین پنجره برنامه تمام می‌شود
  if (process.platform !== 'darwin') app.quit();
});
