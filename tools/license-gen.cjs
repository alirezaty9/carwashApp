#!/usr/bin/env node
/**
 * ابزارِ صدورِ لایسنسِ یاتاش — فقط پیشِ یاتاش می‌ماند (نه دستِ کارواش).
 *
 * دو دستور:
 *   1) keygen  → یک جفت‌کلیدِ Ed25519 می‌سازد:
 *               - yatash-private.pem  (خصوصی، محرمانه — امن نگه دار، هرگز commit نکن)
 *               - و کلیدِ عمومی را چاپ می‌کند تا در electron/license.cjs بگذاری
 *
 *   2) issue   → یک فایلِ لایسنسِ امضاشده برای یک دستگاه می‌سازد:
 *      node tools/license-gen.cjs issue \
 *           --machine <machineId> --customer "کارواش نمونه" \
 *           --type annual --days 365 --out license.dat
 *
 * نکته: این فایل با Node اجرا می‌شود (سیستمِ یاتاش)، نه داخلِ برنامه.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PRIVATE_PATH_DEFAULT = path.join(process.cwd(), 'yatash-private.pem');

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

function keygen() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' });

  fs.writeFileSync(PRIVATE_PATH_DEFAULT, privPem, { mode: 0o600 });
  console.log('\n✅ جفت‌کلید ساخته شد.');
  console.log(`🔒 کلیدِ خصوصی ذخیره شد در: ${PRIVATE_PATH_DEFAULT}`);
  console.log('   (این فایل را امن نگه دار و هرگز در گیت/برنامه نگذار.)\n');
  console.log('👇 این کلیدِ عمومی را کپی کن و در electron/license.cjs جای PUBLIC_KEY بگذار:\n');
  console.log(pubPem);
}

function issue(args) {
  const keyPath = args.key || PRIVATE_PATH_DEFAULT;
  if (!fs.existsSync(keyPath)) {
    console.error(`❌ کلیدِ خصوصی پیدا نشد: ${keyPath}\n   اول «keygen» را اجرا کن.`);
    process.exit(1);
  }
  if (!args.machine) {
    console.error('❌ --machine لازم است (machineId که کارواش از برنامه‌اش می‌فرستد).');
    process.exit(1);
  }

  const type = args.type || 'annual';
  const days = Number(args.days || (type === 'annual' ? 365 : 7));
  const now = new Date();
  const exp = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const iso = (d) => d.toISOString().slice(0, 10);

  const payload = {
    customer: args.customer || 'بدون‌نام',
    machineId: args.machine,
    type,
    issuedAt: iso(now),
    expiresAt: iso(exp),
  };

  const privateKey = crypto.createPrivateKey(fs.readFileSync(keyPath));
  const signature = crypto.sign(null, Buffer.from(canonicalPayload(payload), 'utf8'), privateKey);

  const license = { payload, signature: signature.toString('base64') };
  const outPath = args.out || 'license.dat';
  fs.writeFileSync(outPath, JSON.stringify(license, null, 2));

  console.log('\n✅ لایسنس صادر شد.');
  console.log(`📄 فایل: ${outPath}`);
  console.log(`👤 مشتری: ${payload.customer}`);
  console.log(`🖥️  دستگاه: ${payload.machineId}`);
  console.log(`📅 اعتبار تا: ${payload.expiresAt} (${days} روز)\n`);
}

const [, , cmd, ...rest] = process.argv;
if (cmd === 'keygen') {
  keygen();
} else if (cmd === 'issue') {
  issue(parseArgs(rest));
} else {
  console.log('استفاده:');
  console.log('  node tools/license-gen.cjs keygen');
  console.log('  node tools/license-gen.cjs issue --machine <id> --customer "نام" --type annual --days 365 --out license.dat');
}
