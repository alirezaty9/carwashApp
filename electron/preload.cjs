// پلِ امنِ «preload» — تنها راهِ ارتباطِ UI با پروسه‌ی Main.
// با contextBridge فقط چند تابعِ مشخص و محدود را در اختیارِ UI می‌گذاریم،
// نه کلِ قدرتِ Node. این جداسازی جلوی سوءاستفاده‌های امنیتی را می‌گیرد.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronStore', {
  // همگام: مقدار را همان لحظه برمی‌گرداند (برای بارگذاریِ اولیه‌ی state)
  get: (key) => ipcRenderer.sendSync('storage:get', key),
  // ناهمگام: نوشتن نیازی به انتظار ندارد
  set: (key, value) => ipcRenderer.send('storage:set', { key, value }),
  delete: (key) => ipcRenderer.send('storage:delete', key),
});

// پرچمی ساده تا UI بفهمد داخلِ الکترون اجرا می‌شود یا مرورگر
contextBridge.exposeInMainWorld('electronEnv', { isElectron: true });

// API لایسنس (همه ناهمگام: invoke/handle)
contextBridge.exposeInMainWorld('license', {
  getStatus: () => ipcRenderer.invoke('license:getStatus'),
  getMachineId: () => ipcRenderer.invoke('license:getMachineId'),
  import: (content) => ipcRenderer.invoke('license:import', content),
});

// API پرینتر
contextBridge.exposeInMainWorld('printer', {
  list: () => ipcRenderer.invoke('printer:list'),
  // page = اندازه‌ی دقیقِ برگه‌ی همین فیش (بر حسبِ میکرون)، تا پرینترِ رولی
  // به‌جای اندازه‌ی پیش‌فرضِ درایور، دقیقاً به‌اندازه‌ی فیش کاغذ بدهد.
  printSilent: (deviceName, page) => ipcRenderer.invoke('printer:print', { deviceName, page }),
});
