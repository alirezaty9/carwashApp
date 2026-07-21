/**
 * توابعِ نمایش و تبدیلِ عدد/پول.
 *
 * قراردادِ پول (مهم): مبالغ در سراسرِ برنامه به **ریال** ذخیره می‌شوند و همیشه
 * به **تومان** نمایش داده می‌شوند (÷۱۰). هر ورودی‌ای که کاربر به تومان می‌زند،
 * قبل از ذخیره باید با `tomanToRial` به ریال تبدیل شود.
 */

const FARSI_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** تبدیلِ ارقامِ لاتین به فارسی (برای نمایش) */
export function toPersianDigits(n: number | string): string {
  return n.toString().replace(/[0-9]/g, (d) => FARSI_DIGITS[Number(d)]);
}

/** تبدیلِ ارقامِ فارسی/عربی به لاتین (برای پردازشِ ورودی) */
export function toEnglishDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/** ریال → تومان (برای نمایش/ویرایش) */
export const rialToToman = (rial: number): number => Math.floor(rial / 10);

/** تومان → ریال (برای ذخیره‌سازیِ ورودیِ کاربر) */
export const tomanToRial = (toman: number): number => Math.round(toman) * 10;

/** قالب‌بندیِ مبلغِ ذخیره‌شده (ریال) به‌صورتِ «… تومان» با ارقامِ فارسی */
export function formatCurrencyToman(rial: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(rialToToman(rial))} تومان`;
}
