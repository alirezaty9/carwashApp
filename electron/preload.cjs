// پلِ امنِ «preload» — تنها راهِ ارتباطِ UI با پروسه‌ی Main.
// با contextBridge فقط چند تابعِ مشخص و محدود را در اختیارِ UI می‌گذاریم،
// نه کلِ قدرتِ Node. این جداسازی جلوی سوءاستفاده‌های امنیتی را می‌گیرد.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronStore', {
  // همگام: مقدار را همان لحظه برمی‌گرداند (برای بارگذاریِ اولیه‌ی state).
  // خروجی سه‌حالته است: {status:'ok',value} | {status:'empty'} | {status:'error'}
  get: (key) => ipcRenderer.sendSync('storage:get', key),
  // ناهمگام: نوشتن نیازی به انتظار ندارد. اگر نوشتن شکست بخورد، پروسه‌ی Main
  // از کانالِ 'storage:error' خبر می‌دهد (پایین).
  set: (key, value) => ipcRenderer.send('storage:set', { key, value }),
  // گزارشِ شکستِ نوشتن — تا خرابیِ دیسک بی‌صدا نماند
  onError: (handler) => ipcRenderer.on('storage:error', (_event, payload) => handler(payload)),
  // مسیرِ فایلِ داده و فهرستِ بکاپ‌های خودکار (برای نمایش در تنظیمات)
  info: () => ipcRenderer.invoke('storage:info'),
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
  // options = { deviceName, page, silent }
  //   page   = اندازه‌ی دقیقِ برگه‌ی همین فیش (بر حسبِ میکرون)، تا پرینترِ رولی
  //            به‌جای اندازه‌ی پیش‌فرضِ درایور، دقیقاً به‌اندازه‌ی فیش کاغذ بدهد.
  //   silent = بدونِ پنجره‌ی چاپ (چاپِ مستقیم) یا با پنجره.
  // خروجی همیشه { success, reason? } است تا هیچ شکستی بی‌صدا نماند.
  print: (options) => ipcRenderer.invoke('printer:print', options),
  // همان صفحه‌ای که برای چاپ می‌رود، به‌صورتِ فایلِ PDF روی میزِ کار — برای اینکه
  // معلوم شود ایراد از ساختِ فیش است یا از پرینتر.
  preview: (options) => ipcRenderer.invoke('printer:preview', options),
  // ---- چاپِ حرارتیِ مستقیم (بدونِ نیاز به درایور) ----
  // فیش تکه‌تکه عکس گرفته می‌شود، به نقطه‌های سیاه‌وسفید تبدیل و با زبانِ خودِ
  // پرینتر فرستاده می‌شود. سه مرحله دارد چون فیش بلندتر از پنجره است.
  thermalBegin: () => ipcRenderer.invoke('thermal:begin'),
  thermalCapture: (options) => ipcRenderer.invoke('thermal:capture', options),
  thermalFinish: (options) => ipcRenderer.invoke('thermal:finish', options),
  // ---- گزارشِ مسیرِ چاپ ----
  // log   = قدم‌های سمتِ رابطِ کاربری را به ترمینال می‌فرستد.
  // onLog = قدم‌های سمتِ سیستم را به رابطِ کاربری می‌آورد تا در اپ هم دیده شوند.
  log: (entry) => ipcRenderer.send('print:log', entry),
  onLog: (handler) => ipcRenderer.on('print:log-main', (_event, entry) => handler(entry)),
});
