// پروسه‌ی «Main» الکترون — مغزِ برنامه‌ی دسکتاپ.
// این فایل با Node اجرا می‌شود (نه در مرورگر)، پس به فایل‌ها و سیستم‌عامل دسترسی دارد.
// پسوندِ .cjs یعنی CommonJS (چون package.json روی "type":"module" است و باید require کار کند).
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
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
    },
  });

  if (app.isPackaged) {
    // حالتِ نصب‌شده: فایل‌های بیلدشده‌ی Vite را از دیسک بارگذاری کن
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  } else {
    // حالتِ توسعه: به سرورِ زنده‌ی Vite وصل شو (HMR فعال)
    mainWindow.loadURL('http://localhost:3000');
  }
}

// ---- کانال‌های IPC برای ذخیره‌سازی ----
// get همگام است (sendSync) تا در لحظه‌ی راه‌اندازیِ React مقدارِ اولیه در دسترس باشد.
ipcMain.on('storage:get', (event, key) => {
  event.returnValue = store.get(key) ?? null;
});
ipcMain.on('storage:set', (_event, { key, value }) => {
  store.set(key, value);
});
ipcMain.on('storage:delete', (_event, key) => {
  store.delete(key);
});

// ---- کانال‌های IPC لایسنس ----
license.register(ipcMain, store);

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
