#!/usr/bin/env node
/**
 * ابزارِ صدورِ لایسنسِ یاتاش — فقط پیشِ یاتاش می‌ماند (نه دستِ کارواش).
 *
 * دستورها (ساده‌ترین راه: از طریقِ npm):
 *   npm run license:keygen           → یک جفت‌کلیدِ نو می‌سازد و کلیدِ عمومی را
 *                                       خودکار در electron/license.cjs می‌گذارد.
 *   npm run license:issue            → تعاملی می‌پرسد (کد دستگاه، نام مشتری) و
 *                                       license.dat را می‌سازد.
 *
 * یا مستقیم:
 *   node tools/license-gen.cjs issue --machine <id> --customer "نام" --days 365
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// مسیرها را نسبت به خودِ فایل می‌گیریم تا از هر پوشه‌ای اجرا شود درست کار کند.
const ROOT = path.join(__dirname, '..');
const PRIVATE_PATH = path.join(ROOT, 'yatash-private.pem');
const LICENSE_CJS = path.join(ROOT, 'electron', 'license.cjs');

/** باید دقیقاً با canonicalPayload در electron/license.cjs یکسان باشد. */
function canonicalPayload(p) {
  return JSON.stringify({
    customer: p.customer,
    machineId: p.machineId,
    type: p.type,
    issuedAt: p.issuedAt,
    expiresAt: p.expiresAt,
  });
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(String(answer).trim());
    });
  });
}

function keygen(args) {
  // محافظت: اگر کلیدِ خصوصی از قبل هست، بدونِ --force بازنویسی نکن،
  // چون ساختِ کلیدِ نو همه‌ی لایسنس‌های قبلی را باطل می‌کند.
  if (fs.existsSync(PRIVATE_PATH) && !args.force) {
    console.error('⚠️  کلیدِ خصوصی از قبل وجود دارد:', PRIVATE_PATH);
    console.error('   ساختِ کلیدِ نو همه‌ی لایسنس‌های صادرشده‌ی قبلی را باطل می‌کند.');
    console.error('   اگر واقعاً می‌خواهی کلیدِ نو بسازی، با --force اجرا کن.');
    process.exit(1);
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' }).trim();

  fs.writeFileSync(PRIVATE_PATH, privPem, { mode: 0o600 });

  // کلیدِ عمومی را خودکار داخلِ electron/license.cjs جایگزین می‌کنیم (بدونِ کپی/پیستِ دستی).
  let src = fs.readFileSync(LICENSE_CJS, 'utf8');
  const replaced = src.replace(/const PUBLIC_KEY = `[\s\S]*?`;/, 'const PUBLIC_KEY = `' + pubPem + '`;');
  if (replaced === src) {
    console.error('❌ نتوانستم PUBLIC_KEY را در license.cjs پیدا/جایگزین کنم. دستی جایگزین کن:\n');
    console.error(pubPem);
  } else {
    fs.writeFileSync(LICENSE_CJS, replaced);
  }

  console.log('\n✅ جفت‌کلیدِ نو ساخته شد.');
  console.log('🔒 کلیدِ خصوصی:', PRIVATE_PATH);
  console.log('🔑 کلیدِ عمومی هم خودکار در electron/license.cjs گذاشته شد.');
  console.log('\n🛟 خیلی مهم: از فایلِ yatash-private.pem یک پشتیبان بگیر و جایی امن');
  console.log('   بیرونِ پوشه‌ی پروژه نگه دار. اگر گمش کنی، باید کلیدِ نو بسازی و همه‌ی');
  console.log('   مشتری‌ها را دوباره فعال کنی.\n');
}

async function issue(args) {
  if (!fs.existsSync(PRIVATE_PATH) && !args.key) {
    console.error('❌ کلیدِ خصوصی پیدا نشد:', PRIVATE_PATH);
    console.error('   اول «npm run license:keygen» را اجرا کن.');
    process.exit(1);
  }

  // اگر کد دستگاه/نام داده نشده، تعاملی بپرس (تا لازم نباشد دستورِ طولانی را حفظ کنی).
  const machine = args.machine || (await ask('کد دستگاهِ مشتری را وارد کن: '));
  if (!machine) {
    console.error('❌ کد دستگاه لازم است.');
    process.exit(1);
  }
  const customer = args.customer || (await ask('نام مشتری (اختیاری): ')) || 'بدون‌نام';

  const type = args.type || 'annual';
  const days = Number(args.days || (type === 'annual' ? 365 : 7));
  const now = new Date();
  const exp = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const iso = (d) => d.toISOString().slice(0, 10);

  const payload = { customer, machineId: machine, type, issuedAt: iso(now), expiresAt: iso(exp) };

  const keyPath = args.key || PRIVATE_PATH;
  const privateKey = crypto.createPrivateKey(fs.readFileSync(keyPath));
  const signature = crypto.sign(null, Buffer.from(canonicalPayload(payload), 'utf8'), privateKey);

  const license = { payload, signature: signature.toString('base64') };
  const outPath = path.resolve(args.out || path.join(ROOT, 'license.dat'));
  fs.writeFileSync(outPath, JSON.stringify(license, null, 2));

  console.log('\n✅ لایسنس صادر شد.');
  console.log('📄 فایل:', outPath);
  console.log('👤 مشتری:', payload.customer);
  console.log('🖥️  دستگاه:', payload.machineId);
  console.log(`📅 اعتبار تا: ${payload.expiresAt} (${days} روز)\n`);
}

(async () => {
  const [, , cmd, ...rest] = process.argv;
  const args = parseArgs(rest);
  if (cmd === 'keygen') keygen(args);
  else if (cmd === 'issue') await issue(args);
  else {
    console.log('استفاده:');
    console.log('  npm run license:keygen              (ساختِ کلید + گذاشتنِ خودکارِ کلیدِ عمومی)');
    console.log('  npm run license:issue               (تعاملی: می‌پرسد و license.dat می‌سازد)');
    console.log('  node tools/license-gen.cjs issue --machine <id> --customer "نام" --days 365');
  }
})();
