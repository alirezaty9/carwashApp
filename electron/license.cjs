// مدیرِ لایسنسِ آفلاین — کاملاً در پروسه‌ی Main اجرا می‌شود چون به crypto،
// مشخصاتِ سخت‌افزار و فایلِ ذخیره‌سازی دسترسی دارد. UI فقط از طریقِ IPC می‌پرسد.
const crypto = require('crypto');
const os = require('os');

// ⚠️ کلیدِ عمومیِ یاتاش.
// این مقدار را با خروجیِ دستورِ `node tools/license-gen.cjs keygen` جایگزین کن.
// کلیدِ خصوصی هرگز اینجا/در گیت نمی‌آید؛ فقط پیشِ یاتاش می‌ماند.
// تا وقتی جایگزین نشود، لایسنسِ سالانه تأیید نمی‌شود ولی تریالِ ۷روزه کار می‌کند.
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAEkY/9yCJ8Hvyp5BYyOnNECGOYCnOoXPCb7WpOq3DUlg=
-----END PUBLIC KEY-----`;

const TRIAL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const KEYS = {
  firstRun: 'license:firstRun', // زمانِ اولین اجرا (مبنای تریال)
  lastSeen: 'license:lastSeen', // آخرین زمانِ دیده‌شده (ضدِ دستکاریِ ساعت)
  file: 'license:file',         // محتوای فایلِ لایسنسِ واردشده
};

/** اثرِ انگشتِ دستگاه: ترکیبِ مشخصاتِ نسبتاً ثابت، سپس hash (SHA-256، ۳۲ کاراکتر). */
function getMachineId() {
  const nets = os.networkInterfaces();
  // همه‌ی MACهای فیزیکی را جمع می‌کنیم، سپس یکتا و مرتب می‌کنیم و کوچک‌ترین را برمی‌داریم.
  // چرا؟ ترتیبِ کلیدهای networkInterfaces تضمین‌شده نیست و با اضافه/کم‌شدنِ آداپتور
  // (VPN، USB‌وای‌فای، مجازی‌ساز) عوض می‌شود؛ اگر «اولین» MAC را بگیریم، ممکن است
  // machineId بی‌دلیل تغییر کند و لایسنسِ مشتری ناگهان «نامعتبر» شود. مرتب‌سازی این
  // ناپایداری را کم می‌کند (تا وقتی همان آداپتور باقی است، شناسه ثابت می‌ماند).
  const macs = [];
  for (const name of Object.keys(nets)) {
    for (const ni of nets[name] || []) {
      if (!ni.internal && ni.mac && ni.mac !== '00:00:00:00:00:00') macs.push(ni.mac);
    }
  }
  const mac = Array.from(new Set(macs)).sort()[0] || '';
  const raw = [os.hostname(), os.platform(), os.arch(), mac].join('|');
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

/** سریال‌سازیِ قطعیِ payload با ترتیبِ ثابتِ فیلدها (باید با ابزارِ صدور یکی باشد). */
function canonicalPayload(p) {
  return JSON.stringify({
    customer: p.customer,
    machineId: p.machineId,
    type: p.type,
    issuedAt: p.issuedAt,
    expiresAt: p.expiresAt,
  });
}

/** بررسیِ امضای Ed25519 با کلیدِ عمومی. */
function verifySignature(payload, signatureB64) {
  try {
    if (PUBLIC_KEY.includes('REPLACE_WITH')) return false; // کلید هنوز ست نشده
    const msg = Buffer.from(canonicalPayload(payload), 'utf8');
    const sig = Buffer.from(signatureB64, 'base64');
    return crypto.verify(null, msg, PUBLIC_KEY, sig);
  } catch {
    return false;
  }
}

const daysLeftUntil = (ms, from) => Math.max(0, Math.ceil((ms - from) / DAY_MS));

/** وضعیتِ فعلیِ لایسنس را محاسبه می‌کند (و تریال/زمان را در فایل به‌روز می‌کند). */
function computeStatus(store) {
  const machineId = getMachineId();
  const now = Date.now();

  // «ساعتِ سقفی» (monotonic): زمانِ مؤثر هیچ‌وقت از بیشترین زمانی که تا حالا دیده‌ایم
  // عقب‌تر نمی‌رود. نتیجه:
  //  - عقب‌کشیدنِ ساعت (هر مقدار: ۱ روز یا ۷۰ روز) هیچ سودی ندارد، چون تریال/لایسنس
  //    با effectiveNow سنجیده می‌شود که همان سقف است؛ پس منقضی‌بودن باطل نمی‌شود.
  //  - جلو‌کشیدنِ ساعت (مثلاً ۵ سال) → effectiveNow جلو می‌پرد → تریال/لایسنس منقضی و قفل.
  // تنها استثناء: اگر ساعت خیلی زیاد (>۱۸۰ روز) عقب‌تر از سقف باشد، یعنی احتمالاً قبلاً
  // اشتباهاً خیلی جلو تنظیم شده و حالا اصلاح شده؛ سقف را پایین می‌آوریم تا قفلِ دائمیِ
  // اشتباهی رخ ندهد. (این آستانه‌ی بزرگ، حفره‌ی عقب‌کشیدنِ کوچک/متوسط را باز نمی‌کند.)
  const HEAL_THRESHOLD = 180 * DAY_MS;
  let lastSeen = Number(store.get(KEYS.lastSeen) || 0);
  if (lastSeen > 0 && lastSeen - now > HEAL_THRESHOLD) {
    lastSeen = now; // خطای بزرگِ ساعتِ گذشته → بازتنظیمِ سقف
  }
  const effectiveNow = Math.max(now, lastSeen);
  store.set(KEYS.lastSeen, effectiveNow);

  // ۱) لایسنسِ سالانه (اگر واردشده باشد)
  const fileRaw = store.get(KEYS.file);
  if (fileRaw) {
    try {
      const lic = JSON.parse(fileRaw);
      const okSig = verifySignature(lic.payload, lic.signature);
      const okMachine = lic.payload.machineId === machineId;
      if (okSig && okMachine) {
        const exp = new Date(lic.payload.expiresAt).getTime();
        if (effectiveNow <= exp) {
          return {
            state: 'licensed',
            type: lic.payload.type,
            customer: lic.payload.customer,
            machineId,
            expiresAt: lic.payload.expiresAt,
            daysLeft: daysLeftUntil(exp, effectiveNow),
          };
        }
        return { state: 'expired', type: lic.payload.type, machineId, expiresAt: lic.payload.expiresAt, daysLeft: 0 };
      }
      return { state: 'invalid', machineId, reason: !okSig ? 'signature' : 'machine' };
    } catch {
      return { state: 'invalid', machineId, reason: 'corrupt' };
    }
  }

  // ۲) تریالِ ۷روزه (خودکار در اولین اجرا)
  let firstRun = Number(store.get(KEYS.firstRun) || 0);
  if (!firstRun) {
    firstRun = effectiveNow;
    store.set(KEYS.firstRun, firstRun);
  }
  const trialExp = firstRun + TRIAL_DAYS * DAY_MS;
  if (effectiveNow <= trialExp) {
    return { state: 'trial', machineId, expiresAt: new Date(trialExp).toISOString(), daysLeft: daysLeftUntil(trialExp, effectiveNow) };
  }
  return { state: 'expired', type: 'trial', machineId, daysLeft: 0 };
}

/** واردکردنِ فایلِ لایسنس (اعتبارسنجی، سپس ذخیره). */
function importLicense(store, fileContent) {
  const machineId = getMachineId();
  let lic;
  try {
    lic = JSON.parse(fileContent);
  } catch {
    return { ok: false, error: 'فایل معتبر نیست (ساختار JSON خراب است).' };
  }
  if (!lic || !lic.payload || !lic.signature) {
    return { ok: false, error: 'ساختارِ فایلِ لایسنس درست نیست.' };
  }
  if (!verifySignature(lic.payload, lic.signature)) {
    return { ok: false, error: 'امضای لایسنس معتبر نیست (احتمالاً کلیدِ عمومی ست نشده یا فایل دستکاری شده).' };
  }
  if (lic.payload.machineId !== machineId) {
    return { ok: false, error: 'این لایسنس برای دستگاهِ دیگری صادر شده است.' };
  }
  store.set(KEYS.file, fileContent);
  return { ok: true };
}

/** ثبتِ کانال‌های IPC (async invoke/handle). */
function register(ipcMain, store) {
  ipcMain.handle('license:getStatus', () => computeStatus(store));
  ipcMain.handle('license:getMachineId', () => getMachineId());
  ipcMain.handle('license:import', (_e, content) => importLicense(store, content));
}

module.exports = { register, getMachineId };
