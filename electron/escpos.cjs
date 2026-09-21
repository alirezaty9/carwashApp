'use strict';

/**
 * زبانِ ESC/POS — زبانی که پرینترهای حرارتیِ فیش‌زن بدونِ هیچ درایوری می‌فهمند.
 *
 * چرا این فایل هست: مسیرِ معمولِ چاپ (فرستادنِ یک صفحه‌ی گرافیکی به سیستم‌عامل)
 * به یک «مترجم» احتیاج دارد که فقط درایورِ مخصوصِ همان پرینتر می‌تواند باشد. این
 * پرینترها مدلِ خودشان را به سیستم‌عامل اعلام نمی‌کنند، پس چنین درایوری هرگز
 * خودکار نصب نمی‌شود و نتیجه‌اش چاپِ کدهای خامِ PostScript روی کاغذ است.
 *
 * راهِ حل: خودمان مترجم باشیم. فیش را به یک تصویرِ سیاه‌وسفید تبدیل می‌کنیم و با
 * فرمانِ «چاپِ تصویر»ِ ESC/POS مستقیم به دستگاه می‌فرستیم. مزیتش این است که ظاهرِ
 * فیش و شکلِ حروفِ فارسی دقیقاً همانی می‌ماند که روی صفحه دیده می‌شود، چون خودِ
 * موتورِ نمایش آن را کشیده است — نه فونتِ داخلیِ پرینتر.
 */

const ESC = 0x1b;
const GS = 0x1d;

/**
 * عرضِ چاپِ پرینترهای ۸۰ میلی‌متری بر حسبِ «نقطه».
 * سرِ چاپگر ۷۲ میلی‌متر می‌سوزاند و با تراکمِ ۲۰۳ نقطه بر اینچ:
 * ۷۲ ÷ ۲۵.۴ × ۲۰۳ ≈ ۵۷۶ نقطه. این عدد روی تقریباً همه‌ی این دستگاه‌ها ثابت است.
 */
const DOTS_PER_LINE = 576;

/** پرینترهای ۵۸ میلی‌متری نصفِ این عرض را دارند. */
const DOTS_PER_LINE_58MM = 384;

/** آستانه‌ی سیاه‌شدن: روشنایی کمتر از این عدد یعنی «نقطه را بسوزان». */
const DEFAULT_THRESHOLD = 170;

/**
 * سقفِ ارتفاعِ هر «باند». تصویرِ فیش تکه‌تکه فرستاده می‌شود چون حافظه‌ی این
 * دستگاه‌ها کوچک است و یک فرمانِ بسیار بزرگ می‌تواند نیمه‌کاره رها شود.
 */
const BAND_ROWS = 128;

const COMMANDS = {
  /** راه‌اندازیِ مجدد: تنظیماتِ قبلی را پاک می‌کند تا فیشِ نو از حالتِ تمیز شروع شود. */
  init: () => Buffer.from([ESC, 0x40]),
  /** جلو دادنِ کاغذ به اندازه‌ی n خط. */
  feed: (lines) => Buffer.from([ESC, 0x64, Math.max(0, Math.min(255, lines))]),
  /**
   * برشِ کاغذ. اگر دستگاه برنده نداشته باشد این فرمان را بی‌اثر نادیده می‌گیرد،
   * پس فرستادنش بی‌خطر است.
   */
  cut: () => Buffer.from([GS, 0x56, 0x42, 0x00]),
};

/**
 * تبدیلِ پیکسل‌های خام به نقشه‌ی تک‌بیتی (هر بیت = یک نقطه‌ی سیاه یا سفید).
 *
 * ورودی BGRA است (ترتیبِ رنگ در خروجیِ الکترون: آبی، سبز، قرمز، شفافیت).
 * روشناییِ هر پیکسل با وزنِ استانداردِ چشمِ انسان حساب می‌شود؛ پیکسلِ شفاف
 * «سفید» در نظر گرفته می‌شود چون کاغذ سفید است.
 */
function bgraToMonochrome(bgra, width, height, threshold = DEFAULT_THRESHOLD) {
  const bytesPerRow = Math.ceil(width / 8);
  const mono = Buffer.alloc(bytesPerRow * height, 0);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const alpha = bgra[i + 3];
      if (alpha < 128) continue; // شفاف = کاغذِ سفید = نقطه‌ای سوزانده نمی‌شود

      const luminance = 0.114 * bgra[i] + 0.587 * bgra[i + 1] + 0.299 * bgra[i + 2];
      if (luminance >= threshold) continue; // روشن = سفید

      // بیتِ پرارزش سمتِ چپ است: اولین پیکسلِ هر بایت، بیتِ ۷ آن بایت می‌شود.
      mono[y * bytesPerRow + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }

  return { mono, bytesPerRow };
}

/**
 * فرمانِ «چاپِ تصویر» (GS v 0) برای یک تکه از تصویر.
 * ساختارِ فرمان: شناسه + حالت + عرض (بر حسبِ بایت) + ارتفاع (بر حسبِ خط) + داده.
 * عرض و ارتفاع هر کدام دو بایت‌اند: اول بایتِ کم‌ارزش، بعد بایتِ پرارزش.
 */
function rasterCommand(rows, bytesPerRow, rowCount) {
  const header = Buffer.from([
    GS,
    0x76,
    0x30,
    0x00, // حالتِ عادی (بدونِ بزرگ‌نمایی)
    bytesPerRow & 0xff,
    (bytesPerRow >> 8) & 0xff,
    rowCount & 0xff,
    (rowCount >> 8) & 0xff,
  ]);
  return Buffer.concat([header, rows]);
}

/**
 * یک تکه‌ی تصویرِ فیش را به فرمان‌های آماده‌ی ارسال تبدیل می‌کند.
 * خروجی چند فرمانِ پشتِ‌سرِهم است، هر کدام حداکثر به اندازه‌ی یک باند.
 */
function imageToRaster({ bgra, width, height, threshold = DEFAULT_THRESHOLD }) {
  if (!width || !height) return Buffer.alloc(0);

  const { mono, bytesPerRow } = bgraToMonochrome(bgra, width, height, threshold);
  const parts = [];

  for (let start = 0; start < height; start += BAND_ROWS) {
    const rowCount = Math.min(BAND_ROWS, height - start);
    const slice = mono.subarray(start * bytesPerRow, (start + rowCount) * bytesPerRow);
    parts.push(rasterCommand(slice, bytesPerRow, rowCount));
  }

  return Buffer.concat(parts);
}

/**
 * بسته‌بندیِ نهایی: راه‌اندازی + تصویرِ فیش + کاغذِ اضافه تا لبه‌ی برش + برش.
 *
 * چرا کاغذِ اضافه لازم است: لبه‌ی برشِ دستگاه چند میلی‌متر جلوتر از سرِ چاپگر است.
 * بدونِ این چند خط، آخرین سطرهای فیش داخلِ دستگاه می‌مانند و خوانده نمی‌شوند.
 */
function buildReceiptJob(rasterParts, { feedLines = 4, cut = true } = {}) {
  const chunks = [COMMANDS.init(), ...rasterParts, COMMANDS.feed(feedLines)];
  if (cut) chunks.push(COMMANDS.cut());
  return Buffer.concat(chunks);
}

module.exports = {
  DOTS_PER_LINE,
  DOTS_PER_LINE_58MM,
  DEFAULT_THRESHOLD,
  BAND_ROWS,
  COMMANDS,
  bgraToMonochrome,
  imageToRaster,
  buildReceiptJob,
};
