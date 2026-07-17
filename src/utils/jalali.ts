export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 335];
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

export function toPersianDigits(n: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n
    .toString()
    .replace(/[0-9]/g, (w) => farsiDigits[parseInt(w, 10)]);
}

export function toEnglishDigits(str: string): string {
  const farsiDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  
  let out = str;
  for (let i = 0; i < 10; i++) {
    out = out.replace(farsiDigits[i], i.toString()).replace(arabicDigits[i], i.toString());
  }
  return out;
}

export function getJalaliDateParts(date: Date): { year: number; month: number; day: number } {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const [year, month, day] = gregorianToJalali(gy, gm, gd);
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
  'اسفند'
];

export function getFormattedJalali(date: Date, includeTime = true): string {
  const { year, month, day } = getJalaliDateParts(date);
  const monthName = JALALI_MONTH_NAMES[month - 1];
  
  const paddedMonth = month.toString().padStart(2, '0');
  const paddedDay = day.toString().padStart(2, '0');
  
  const dateStr = `${toPersianDigits(year)}/${toPersianDigits(paddedMonth)}/${toPersianDigits(paddedDay)}`;
  
  if (includeTime) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${dateStr} ساعت ${toPersianDigits(hours)}:${toPersianDigits(minutes)}`;
  }
  
  return dateStr;
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${formatted} ریال`;
}

export function formatCurrencyToman(amount: number): string {
  const toman = Math.floor(amount / 10);
  const formatted = new Intl.NumberFormat('fa-IR').format(toman);
  return `${formatted} تومان`;
}
