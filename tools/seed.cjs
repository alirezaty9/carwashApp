#!/usr/bin/env node
/**
 * ساختِ داده‌ی نمونه برای تست (چند صد قبض/فروش/مشتری).
 *
 * اجرا:
 *   node tools/seed.cjs                 # پیش‌فرض: ۳۰۰ قبض، ۱۲۰ فروش، ۶۰ مشتری
 *   node tools/seed.cjs 500 200 80      # قبض، فروش، مشتری دلخواه
 *
 * خروجی: فایلِ seed-backup.json در ریشه‌ی پروژه.
 * بعد در برنامه: تنظیمات و بکاپ → «بازیابی از فایل» → همین فایل را انتخاب کن.
 *
 * ⚠️ «بازیابی» همه‌ی داده‌ی فعلی را جایگزین می‌کند (تنظیمات/رمز دست‌نخورده می‌ماند
 * چون این فایل بخشِ config را ندارد).
 */
const fs = require('fs');
const path = require('path');

// ---------- تبدیلِ تاریخِ میلادی به جلالی (کپی از src/utils/jalali.ts) ----------
function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 335];
  let jy = gy <= 1600 ? 0 : gy - 1600;
  let g_day_no = 365 * jy + Math.floor((jy + 3) / 4) - Math.floor((jy + 99) / 100) + Math.floor((jy + 399) / 400);
  for (let i = 0; i < gm - 1; ++i) g_day_no += g_d_m[i + 1] - g_d_m[i];
  if (gm > 2 && ((jy % 4 === 0 && jy % 100 !== 0) || jy % 400 === 0)) g_day_no++;
  g_day_no += gd - 1;
  let j_day_no = g_day_no - 79;
  const j_np = Math.floor(j_day_no / 12053);
  j_day_no %= 12053;
  jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
  j_day_no %= 1461;
  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }
  let jm = 0;
  for (let i = 0; i < 11 && j_day_no >= (i < 6 ? 31 : 30); ++i) {
    j_day_no -= i < 6 ? 31 : 30;
    jm = i + 1;
  }
  jm++;
  const jd = j_day_no + 1;
  return [jy, jm, jd];
}
const FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toFa = (n) => n.toString().replace(/[0-9]/g, (d) => FA[+d]);
const pad2 = (n) => toFa(n.toString().padStart(2, '0'));
function jalaliParts(date) {
  const [year, month, day] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return { year, month, day };
}
function jalaliStr(date) {
  const { year, month, day } = jalaliParts(date);
  return `${toFa(year)}/${pad2(month)}/${pad2(day)} ساعت ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

// ---------- داده‌های پایه (باید با src/data/defaults.ts هم‌شناسه باشند) ----------
const TIERS = [
  { id: 'tier-sedan', name: 'سواری' },
  { id: 'tier-suv', name: 'شاسی‌بلند / کراس‌اوور' },
  { id: 'tier-heavy', name: 'وانت و خودرو سنگین' },
];
const SERVICES = [
  { id: 'srv-roshuyi', name: 'روشویی (نظافت بدنه)', prices: { 'tier-sedan': 400000, 'tier-suv': 600000, 'tier-heavy': 800000 }, commissionPct: 40 },
  { id: 'srv-jaru', name: 'جارو و نظافت داخل', prices: { 'tier-sedan': 300000, 'tier-suv': 400000, 'tier-heavy': 500000 }, commissionPct: 50 },
  { id: 'srv-toshuyi', name: 'توشویی (شستشوی کامل داخل)', prices: { 'tier-sedan': 800000, 'tier-suv': 1200000, 'tier-heavy': 1500000 }, commissionPct: 40 },
  { id: 'srv-motorshuyi', name: 'موتورشویی', prices: { 'tier-sedan': 500000, 'tier-suv': 700000, 'tier-heavy': 900000 }, commissionPct: 40 },
  { id: 'srv-sefrshuyi', name: 'صفرشویی کامل خودرو', prices: { 'tier-sedan': 2000000, 'tier-suv': 3000000, 'tier-heavy': 4000000 }, commissionPct: 30 },
];
const WORKERS = [
  { id: 'wrk-1', name: 'اکبری', active: true },
  { id: 'wrk-2', name: 'محمدی', active: true },
  { id: 'wrk-3', name: 'رضایی', active: true },
  { id: 'wrk-4', name: 'کریمی', active: true },
];
const PRODUCTS = [
  { id: 'prd-shampoo', name: 'شامپو بدنه خودرو', price: 850000, stock: 120, active: true },
  { id: 'prd-freshener', name: 'خوشبوکننده', price: 250000, stock: 200, active: true },
  { id: 'prd-wiper', name: 'تیغه برف‌پاک‌کن', price: 1200000, stock: 80, active: true },
  { id: 'prd-towel', name: 'دستمال میکروفایبر', price: 350000, stock: 150, active: true },
  { id: 'prd-polish', name: 'واکس و پولیش', price: 1800000, stock: 40, active: true },
];

const FIRST = ['علی', 'رضا', 'محمد', 'حسن', 'حسین', 'مهدی', 'سعید', 'امیر', 'جواد', 'ناصر', 'کاوه', 'سینا', 'پیمان', 'فرهاد', 'مجید', 'وحید', 'یاسر', 'بابک', 'کامران', 'شهرام'];
const LAST = ['احمدی', 'محمدی', 'رضایی', 'کریمی', 'حسینی', 'موسوی', 'اکبری', 'رحیمی', 'جعفری', 'صادقی', 'نوری', 'کاظمی', 'قاسمی', 'یوسفی', 'مرادی'];
const CARS = ['پژو ۲۰۶ سفید', 'پراید نقره‌ای', 'سمند مشکی', 'تیبا سفید', 'دنا خاکستری', 'ال‌۹۰ آبی', 'پژو ۲۰۷', 'هایما S7', 'کوییک سفید', 'شاهین طوسی', 'رانا مشکی', 'سراتو سفید'];

// ---------- ابزارِ تصادفی ----------
const argv = process.argv.slice(2);
const N_RECEIPTS = Number(argv[0]) || 300;
const N_SALES = Number(argv[1]) || 120;
const N_CUSTOMERS = Number(argv[2]) || 60;
const DAY = 24 * 60 * 60 * 1000;

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[rnd(0, arr.length - 1)];
const chance = (p) => Math.random() < p;
let idc = 0;
const uid = (p) => `${p}-seed-${(idc++).toString(36)}-${rnd(1000, 9999)}`;
// تاریخِ تصادفی در ۱۵۰ روزِ گذشته (تا گزارشِ روز/هفته/ماه/سال همه داده داشته باشند)
const randDate = () => new Date(Date.now() - rnd(0, 150) * DAY - rnd(8, 20) * 3600000 - rnd(0, 59) * 60000);

// ---------- مشتری‌ها ----------
const customers = [];
for (let i = 0; i < N_CUSTOMERS; i++) {
  const phone = '09' + rnd(10, 39) + String(rnd(1000000, 9999999));
  customers.push({ phone, name: `${pick(FIRST)} ${pick(LAST)}`, createdAt: randDate().toISOString() });
}
const phones = customers.map((c) => c.phone);

// ---------- قبض‌های شست‌وشو ----------
const receipts = [];
for (let i = 0; i < N_RECEIPTS; i++) {
  const date = randDate();
  const tier = pick(TIERS);
  const chosen = SERVICES.filter(() => chance(0.4));
  if (chosen.length === 0) chosen.push(pick(SERVICES));
  const services = chosen.map((s) => ({ id: s.id, name: s.name, price: s.prices[tier.id] }));
  const subtotal = services.reduce((a, s) => a + s.price, 0);
  const discount = chance(0.15) ? rnd(1, 5) * 50000 : 0;
  const worker = chance(0.8) ? pick(WORKERS) : null;
  const workerCommission = worker
    ? chosen.reduce((a, s) => a + Math.round((s.prices[tier.id] * (s.commissionPct || 0)) / 100), 0)
    : 0;
  const cust = customers[rnd(0, customers.length - 1)];
  const jp = jalaliParts(date);
  const voided = chance(0.07);
  receipts.push({
    id: uid('rcp'),
    receiptNumber: 1000 + i,
    customerPhone: cust.phone,
    customerName: cust.name,
    carModel: pick(CARS),
    tierId: tier.id,
    tierName: tier.name,
    services,
    price: Math.max(0, subtotal - Math.min(discount, subtotal)),
    discount: discount || undefined,
    workerCommission: workerCommission || undefined,
    workerId: worker ? worker.id : undefined,
    workerName: worker ? worker.name : undefined,
    notes: undefined,
    date: date.toISOString(),
    jalaliDate: jalaliStr(date),
    jalaliYear: jp.year,
    jalaliMonth: jp.month,
    jalaliDay: jp.day,
    status: voided ? 'voided' : 'active',
    voidReason: voided ? 'نمونه: انصراف مشتری' : undefined,
  });
}
receipts.sort((a, b) => new Date(b.date) - new Date(a.date)); // جدیدترین اول

// ---------- فروشِ لوازم ----------
const sales = [];
for (let i = 0; i < N_SALES; i++) {
  const date = randDate();
  const chosen = PRODUCTS.filter(() => chance(0.35));
  if (chosen.length === 0) chosen.push(pick(PRODUCTS));
  const items = chosen.map((p) => ({ productId: p.id, name: p.name, price: p.price, qty: rnd(1, 3) }));
  const subtotal = items.reduce((a, it) => a + it.price * it.qty, 0);
  const discount = chance(0.12) ? rnd(1, 3) * 50000 : 0;
  const jp = jalaliParts(date);
  const voided = chance(0.06);
  sales.push({
    id: uid('sal'),
    saleNumber: i + 1,
    items,
    total: Math.max(0, subtotal - Math.min(discount, subtotal)),
    discount: discount || undefined,
    customerPhone: chance(0.5) ? pick(phones) : undefined,
    notes: undefined,
    date: date.toISOString(),
    jalaliDate: jalaliStr(date),
    jalaliYear: jp.year,
    jalaliMonth: jp.month,
    jalaliDay: jp.day,
    status: voided ? 'voided' : 'active',
    voidReason: voided ? 'نمونه: مرجوعی' : undefined,
  });
}
sales.sort((a, b) => new Date(b.date) - new Date(a.date));

// ---------- فایلِ بکاپ (بدونِ config تا تنظیمات/رمز دست‌نخورده بماند) ----------
const backup = {
  version: '2.0',
  exportedAt: new Date().toISOString(),
  tiers: TIERS,
  services: SERVICES,
  workers: WORKERS,
  customers,
  receipts,
  products: PRODUCTS,
  sales,
};

const out = path.join(__dirname, '..', 'seed-backup.json');
fs.writeFileSync(out, JSON.stringify(backup, null, 2));
console.log('\n✅ داده‌ی نمونه ساخته شد.');
console.log(`📄 فایل: ${out}`);
console.log(`   قبض‌ها: ${receipts.length} | فروش لوازم: ${sales.length} | مشتری‌ها: ${customers.length}`);
console.log('\n👉 حالا در برنامه: تنظیمات و بکاپ → «بازیابی از فایل» → همین فایل را انتخاب کن.');
console.log('   (بازیابی همه‌ی داده‌ی فعلی را جایگزین می‌کند؛ تنظیمات و رمز دست‌نخورده می‌ماند.)\n');
