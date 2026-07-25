/**
 * تبدیلِ تاریخِ میلادی به جلالی (شمسی) و قالب‌بندیِ آن.
 * فقط منطقِ تاریخ اینجاست؛ توابعِ ارقام/پول در `format.ts` هستند.
 */
import { toPersianDigits } from './format';

export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  // روزهای تجمعیِ ابتدای هر ماهِ میلادی (سالِ غیرکبیسه). عنصرِ آخر باید ۳۳۴ باشد
  // (روزهای قبل از دسامبر = ۳۱+۲۸+۳۱+۳۰+۳۱+۳۰+۳۱+۳۱+۳۰+۳۱+۳۰). قبلاً اشتباهاً ۳۳۵
  // بود که یعنی «نوامبر ۳۱ روز» → همه‌ی تاریخ‌های دسامبر یک روز جلو می‌افتادند
  // (و حتی ماهِ شمسی در مرزِ آذر/دی اشتباه می‌شد و گزارشِ ماهانه را جابه‌جا می‌کرد).
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : gy - 1600;
  let g_day_no = 365 * jy + Math.floor((jy + 3) / 4) - Math.floor((jy + 99) / 100) + Math.floor((jy + 399) / 400);

  for (let i = 0; i < gm - 1; ++i) {
    g_day_no += g_d_m[i + 1] - g_d_m[i];
  }
  if (gm > 2 && ((jy % 4 === 0 && jy % 100 !== 0) || jy % 400 === 0)) {
    g_day_no++;
  }
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

export function getJalaliDateParts(date: Date): { year: number; month: number; day: number } {
  const [year, month, day] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return { year, month, day };
}

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export function getFormattedJalali(date: Date, includeTime = true): string {
  const { year, month, day } = getJalaliDateParts(date);
  const pad = (n: number) => toPersianDigits(n.toString().padStart(2, '0'));

  const dateStr = `${toPersianDigits(year)}/${pad(month)}/${pad(day)}`;
  if (!includeTime) return dateStr;

  return `${dateStr} ساعت ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
