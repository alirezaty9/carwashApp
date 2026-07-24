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
// این فایل با بستنِ برنامه پاک نمی‌شود و پایه‌ی بکاپ و لایسنسِ فازهای بعد است.
const store = new Store({ name: 'yatash-carwash-data' });

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
ipcMain.on('storage:get', (event, key) => {
  event.returnValue = isProtectedKey(key) ? null : (store.get(key) ?? null);
});
ipcMain.on('storage:set', (_event, { key, value }) => {
  if (isProtectedKey(key)) return;
  store.set(key, value);
});
ipcMain.on('storage:delete', (_event, key) => {
  if (isProtectedKey(key)) return;
  store.delete(key);
});

// ---- کانال‌های IPC لایسنس ----
license.register(ipcMain, store);

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

// چاپِ مستقیم (بدونِ پنجره) به یک پرینترِ مشخص. صفحه از CSS چاپ (print-area) پیروی می‌کند.
ipcMain.handle('printer:print', async (event, { deviceName }) => {
  const wc = BrowserWindow.fromWebContents(event.sender)?.webContents;
  if (!wc) return { success: false, reason: 'no-window' };
  return new Promise((resolve) => {
    wc.print(
      {
        silent: true,
        deviceName: deviceName || undefined,
        printBackground: true,
        margins: { marginType: 'none' },
      },
      (success, reason) => resolve({ success, reason }),
    );
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // در ویندوز/لینوکس با بستنِ آخرین پنجره برنامه تمام می‌شود
  if (process.platform !== 'darwin') app.quit();
});
