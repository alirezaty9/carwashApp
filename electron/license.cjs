// مدیرِ لایسنسِ آفلاین — کاملاً در پروسه‌ی Main اجرا می‌شود چون به crypto،
// مشخصاتِ سخت‌افزار و فایلِ ذخیره‌سازی دسترسی دارد. UI فقط از طریقِ IPC می‌پرسد.
const crypto = require('crypto');
const os = require('os');
const fs = require('fs');
const path = require('path');

// ⚠️ کلیدِ عمومیِ یاتاش.
// این مقدار را با خروجیِ دستورِ `node tools/license-gen.cjs keygen` جایگزین کن.
// کلیدِ خصوصی هرگز اینجا/در گیت نمی‌آید؛ فقط پیشِ یاتاش می‌ماند.
// تا وقتی جایگزین نشود، لایسنسِ سالانه تأیید نمی‌شود ولی تریالِ ۷روزه کار می‌کند.
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAjokPsmaa25qDHC1CUK8n802gehB70eOFD5Z4pacUJ1k=
-----END PUBLIC KEY-----`;

const TRIAL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

// «نسخه‌ی تریال» (epoch): هر بار این عدد بالا برود، همه‌ی رکوردهای تریالِ قبلی
// (هم در دیتای اپ و هم در لنگرهای پایدار) نامعتبر می‌شوند و تریالِ ۷روزه برای
// همه از نو شروع می‌شود. epoch=2 چون با تعویضِ جفت‌کلیدِ لایسنس خواستیم
// تریال‌کننده‌های قبلی دوباره مهلتِ تست بگیرند. لایسنسِ سالانه (KEYS.file)
// عمداً epoch ندارد تا با این ریست باطل نشود.
const TRIAL_EPOCH = 2;

const KEYS = {
  firstRun: `license:e${TRIAL_EPOCH}:firstRun`, // زمانِ اولین اجرا (مبنای تریال)
  lastSeen: `license:e${TRIAL_EPOCH}:lastSeen`, // آخرین زمانِ دیده‌شده (ضدِ دستکاریِ ساعت)
  file: 'license:file',                         // محتوای فایلِ لایسنسِ واردشده
};

/**
 * اثرِ انگشتِ نسخه‌های قدیمی: از نامِ کامپیوتر + MAC ساخته می‌شد.
 * دیگر برای نصب‌های تازه استفاده نمی‌شود و فقط برای «مهاجرت» نگه داشته شده — یعنی
 * تشخیصِ اینکه لایسنسی که مشتری از قبل دارد، با فرمولِ قدیمی صادر شده یا نه.
 */
function legacyMachineId() {
  const nets = os.networkInterfaces();
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

// ============================================================================
// «لنگرِ تریال» (Trial Anchor) — ضدِ ریست‌کردنِ تریال با حذف/نصبِ دوباره‌ی اپ.
//
// مشکل: زمانِ اولین اجرا (مبنای ۷ روز) فقط در پوشه‌ی دیتای اپ ذخیره می‌شد؛ با
// حذف/نصبِ دوباره یا پاک‌کردنِ آن پوشه، تریال از صفر شروع می‌شد.
//
// راه‌حل: همان زمان را در چند مسیرِ «پایدارِ» سیستم‌عامل هم می‌نویسیم که با حذفِ اپ
// پاک نمی‌شوند (در ویندوز ProgramData، و یک فایلِ مخفی در پوشه‌ی خانه). موقعِ خواندن،
// «قدیمی‌ترین» زمانِ اولین‌اجرا را از بینِ همه‌ی منابع می‌گیریم؛ پس حتی اگر کاربر یکی
// را پاک کند، بقیه تریال را حفظ می‌کنند و منبعِ سالم دوباره همه را می‌سازد (خوددرمان).
//
// امنیت: هر فایل با HMAC-SHA256 (کلیدِ داخلِ اپ + machineId) امضا می‌شود تا کاربر
// نتواند تاریخ را دستکاری کند؛ اگر امضا نخورد، آن فایل نادیده گرفته می‌شود.
// ⚠️ محدودیت: کاربرِ خیلی حرفه‌ای که همه‌ی این مسیرها را پیدا و پاک کند باز می‌تواند
// ریست کند. تنها راهِ ۱۰۰٪ ضدِ ریست، «فعال‌سازیِ آنلاین» است (که اپ آفلاین است).
// ============================================================================

const ANCHOR_SECRET = 'Yatash-Trial-Anchor-#7Kq2!ZxR';

/**
 * مسیرهای پایدار برای نوشتنِ لنگر (مستقل از پوشه‌ی دیتای اپ).
 * `name` پسوندِ فایل است: `ytc` برای لنگرِ تریال، `ytid` برای شناسه‌ی نصب.
 */
function anchorPaths(name) {
  // فقط برای تست: اگر YATASH_ANCHOR_DIR ست شده باشد، لنگرها را در همان پوشه بنویس
  // تا تست‌ها به مسیرهای واقعیِ سیستم (ProgramData/خانه) دست نزنند و هرمتیک بمانند.
  // در نسخه‌ی واقعی این متغیر هرگز ست نیست، پس رفتار عادی است.
  if (process.env.YATASH_ANCHOR_DIR) {
    const base = process.env.YATASH_ANCHOR_DIR;
    return [path.join(base, 'machine', `.${name}`), path.join(base, `.yatash-${name}`)];
  }
  const list = [];
  // ۱) مسیرِ ماشین‌محور که با حذفِ اپ پاک نمی‌شود
  const machineDir =
    process.platform === 'win32'
      ? process.env.PROGRAMDATA || process.env.ALLUSERSPROFILE || os.homedir()
      : path.join(os.homedir(), '.config');
  list.push(path.join(machineDir, 'Yatash', `.${name}`));
  // ۲) فایلِ مخفی در پوشه‌ی خانه (منبعِ دومِ افزونگی)
  list.push(path.join(os.homedir(), `.yatash-${name}`));
  return list;
}

// ============================================================================
// «شناسه‌ی نصب» (Install ID) — همان چیزی که در UI «کدِ دستگاه» نامیده می‌شود.
//
// تا نسخه‌ی قبل، این کد از نامِ کامپیوتر و آدرسِ کارتِ شبکه ساخته می‌شد. مشکلش این
// بود که با عوض‌کردنِ نامِ کامپیوتر یا زدنِ یک دانگلِ وای‌فایِ USB، کد عوض می‌شد و
// لایسنسِ مشتری ناگهان «برای دستگاهِ دیگری» اعلام می‌شد.
//
// راهِ فعلی ساده‌تر و مطمئن‌تر است: بارِ اول یک عددِ تصادفیِ ۱۲۸بیتی ساخته می‌شود و
// در همان مسیرهای پایداری که لنگرِ تریال می‌نشیند ذخیره می‌گردد. از آن به بعد هرگز
// عوض نمی‌شود — نه با تغییرِ نامِ کامپیوتر، نه با تغییرِ سخت‌افزارِ شبکه.
//
// چرا دو کامپیوتر شناسه‌ی یکسان نمی‌گیرند؟ چون ۱۲۸ بیت تصادفی است؛ احتمالِ برخورد
// عملاً صفر است (بسیار کمتر از احتمالِ خرابیِ هارد).
//
// ⚠️ محدودیت: کسی که فایل‌های شناسه را از کامپیوترِ A به B کپی کند، می‌تواند یک
// لایسنس را روی دو دستگاه اجرا کند. چون اپ آفلاین است و دستگاه‌ها همدیگر را
// نمی‌بینند، این ریسک پذیرفته شده است.
// ============================================================================

const TRIAL_FILE = 'ytc';
const ID_FILE = 'ytid';
const ID_KEY = 'license:installId';
const ID_LENGTH = 32; // ۱۶ بایت به‌صورتِ hex

const idSig = (id) => crypto.createHmac('sha256', ANCHOR_SECRET).update(`id|${id}`).digest('hex');

const isValidId = (v) => typeof v === 'string' && v.length === ID_LENGTH;

/** خواندنِ شناسه از یک فایلِ پایدار؛ اگر نبود/دستکاری شده بود → null. */
function readInstallId(file) {
  try {
    const decoded = Buffer.from(fs.readFileSync(file, 'utf8'), 'base64').toString('utf8');
    const obj = JSON.parse(decoded);
    if (isValidId(obj.i) && obj.s === idSig(obj.i)) return obj.i;
  } catch {
    /* فایل نبود یا خراب بود */
  }
  return null;
}

/** نوشتنِ شناسه در یک فایلِ پایدار (اگر دسترسی نبود، بی‌صدا رد می‌شویم). */
function writeInstallId(file, id) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(JSON.stringify({ i: id, s: idSig(id) }), 'utf8').toString('base64'));
  } catch {
    /* دسترسیِ نوشتن نبود */
  }
}

/**
 * کدِ دستگاه. بارِ اول ساخته می‌شود و از آن به بعد ثابت می‌ماند.
 * `store` اختیاری است تا در تست‌ها بتوان بدونِ انبارِ داده هم صدایش زد.
 */
function getMachineId(store) {
  const files = anchorPaths(ID_FILE);

  // ۱) از پایدارترین منبع شروع کن (مسیرهایی که با حذفِ اپ پاک نمی‌شوند)
  let id = null;
  for (const file of files) {
    id = readInstallId(file);
    if (id) break;
  }

  // ۲) اگر لنگرها پاک شده بودند، از دیتای خودِ اپ بخوان
  if (!id && store && isValidId(store.get(ID_KEY))) id = store.get(ID_KEY);

  // ۳) مهاجرت از نسخه‌های قبل: اگر مشتری لایسنسی دارد که با فرمولِ قدیمیِ
  //    سخت‌افزاری صادر شده، همان کد را به‌عنوان شناسه‌ی نصب می‌پذیریم تا
  //    لایسنسش با به‌روزرسانیِ برنامه باطل نشود.
  if (!id && store) {
    try {
      const lic = JSON.parse(store.get(KEYS.file));
      if (lic && lic.payload && lic.payload.machineId === legacyMachineId()) {
        id = lic.payload.machineId;
      }
    } catch {
      /* لایسنسی در کار نبود */
    }
  }

  // ۴) واقعاً اولین اجراست → یک شناسه‌ی تصادفیِ نو
  if (!id) id = crypto.randomBytes(16).toString('hex');

  // ۵) خوددرمانی: در همه‌ی منابع بنویس تا اگر یکی پاک شد، بقیه نگهش دارند
  for (const file of files) writeInstallId(file, id);
  if (store) store.set(ID_KEY, id);

  return id;
}

/** امضای HMAC برای تشخیصِ دستکاریِ فایلِ لنگر. epoch داخلِ امضاست تا با بالارفتنِ
 *  TRIAL_EPOCH لنگرهای قدیمی «امضانامعتبر» و نادیده گرفته شوند (= ریستِ تریال). */
function anchorSig(firstRun, lastSeen, machineId) {
  return crypto
    .createHmac('sha256', ANCHOR_SECRET)
    .update(`e${TRIAL_EPOCH}|${firstRun}|${lastSeen}|${machineId}`)
    .digest('hex');
}

/** خواندنِ یک فایلِ لنگر؛ اگر نبود/خراب/دستکاری‌شده بود → null. */
function readAnchor(file, machineId) {
  try {
    const decoded = Buffer.from(fs.readFileSync(file, 'utf8'), 'base64').toString('utf8');
    const obj = JSON.parse(decoded);
    const firstRun = Number(obj.f) || 0;
    const lastSeen = Number(obj.l) || 0;
    if (obj.s === anchorSig(firstRun, lastSeen, machineId)) return { firstRun, lastSeen };
  } catch {
    /* فایل نبود یا خراب بود */
  }
  return null;
}

/** نوشتنِ یک فایلِ لنگرِ امضاشده (اگر نشد بی‌صدا رد می‌شویم). */
function writeAnchor(file, firstRun, lastSeen, machineId) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const obj = { f: firstRun, l: lastSeen, s: anchorSig(firstRun, lastSeen, machineId) };
    fs.writeFileSync(file, Buffer.from(JSON.stringify(obj), 'utf8').toString('base64'));
  } catch {
    /* دسترسیِ نوشتن نبود */
  }
}

/**
 * جمع‌آوریِ وضعیتِ تریال از همه‌ی منابع (electron-store + لنگرها).
 * firstRun = قدیمی‌ترین (کوچک‌ترینِ ناصفر)، lastSeen = تازه‌ترین (بزرگ‌ترین).
 */
function collectTrial(store, machineId) {
  const sources = [
    { firstRun: Number(store.get(KEYS.firstRun) || 0), lastSeen: Number(store.get(KEYS.lastSeen) || 0) },
  ];
  for (const p of anchorPaths(TRIAL_FILE)) {
    const a = readAnchor(p, machineId);
    if (a) sources.push(a);
  }
  let firstRun = 0;
  let lastSeen = 0;
  for (const s of sources) {
    if (s.firstRun > 0 && (firstRun === 0 || s.firstRun < firstRun)) firstRun = s.firstRun;
    if (s.lastSeen > lastSeen) lastSeen = s.lastSeen;
  }
  return { firstRun, lastSeen };
}

/** نوشتنِ وضعیتِ تریالِ آشتی‌داده‌شده در همه‌ی منابع (خوددرمانی). */
function persistTrial(store, machineId, firstRun, lastSeen) {
  store.set(KEYS.firstRun, firstRun);
  store.set(KEYS.lastSeen, lastSeen);
  for (const p of anchorPaths(TRIAL_FILE)) writeAnchor(p, firstRun, lastSeen, machineId);
}

/** وضعیتِ فعلیِ لایسنس را محاسبه می‌کند (و تریال/زمان را در فایل به‌روز می‌کند). */
function computeStatus(store) {
  const machineId = getMachineId(store);
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
  // زمانِ اولین‌اجرا و آخرین‌دیده‌شده را از همه‌ی منابع (دیتای اپ + لنگرهای پایدار) می‌خوانیم
  // تا حذف/نصبِ دوباره‌ی اپ نتواند تریال را ریست کند.
  let { firstRun, lastSeen } = collectTrial(store, machineId);
  if (lastSeen > 0 && lastSeen - now > HEAL_THRESHOLD) {
    lastSeen = now; // خطای بزرگِ ساعتِ گذشته → بازتنظیمِ سقف
  }
  const effectiveNow = Math.max(now, lastSeen);
  // اگر هیچ منبعی زمانِ اولین‌اجرا نداشت، یعنی واقعاً اولین اجراست → همین حالا را ثبت کن.
  if (!firstRun) firstRun = effectiveNow;
  // در همه‌ی منابع بنویس (خوددرمانی: منبعِ پاک‌شده دوباره ساخته می‌شود).
  persistTrial(store, machineId, firstRun, effectiveNow);

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

  // ۲) تریالِ ۷روزه (firstRun بالاتر از همه‌ی منابع آشتی داده و ذخیره شده)
  const trialExp = firstRun + TRIAL_DAYS * DAY_MS;
  if (effectiveNow <= trialExp) {
    return { state: 'trial', machineId, expiresAt: new Date(trialExp).toISOString(), daysLeft: daysLeftUntil(trialExp, effectiveNow) };
  }
  return { state: 'expired', type: 'trial', machineId, daysLeft: 0 };
}

/** واردکردنِ فایلِ لایسنس (اعتبارسنجی، سپس ذخیره). */
function importLicense(store, fileContent) {
  const machineId = getMachineId(store);
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
  ipcMain.handle('license:getMachineId', () => getMachineId(store));
  ipcMain.handle('license:import', (_e, content) => importLicense(store, content));
}

// توابعِ داخلی هم export می‌شوند تا در تست‌ها (electron/license.test.cjs) بدونِ
// راه‌اندازیِ کلِ Electron قابلِ بررسی باشند. در کدِ واقعی فقط register استفاده می‌شود.
module.exports = { register, getMachineId, computeStatus, verifySignature, importLicense, canonicalPayload };
