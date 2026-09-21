import { Receipt } from '../../types';
import { getFormattedJalali, getJalaliDateParts } from '../../utils/jalali';

/**
 * فیشِ نمونه برای دکمه‌ی «چاپِ آزمایشی» در تنظیماتِ پرینتر.
 *
 * چرا لازم است: تا قبل از این، تنها راهِ امتحانِ پرینتر «صدورِ یک قبضِ واقعی» بود —
 * یعنی برای هر بار تست، یک قبضِ الکی در سوابقِ مالی ثبت می‌شد. این فیش هیچ‌جا ذخیره
 * نمی‌شود و فقط برای یک بار چاپ ساخته می‌شود.
 */
export function createSampleReceipt(): Receipt {
  const now = new Date();
  const { year, month, day } = getJalaliDateParts(now);

  return {
    id: 'sample-print-test',
    receiptNumber: 0,
    customerPhone: '۰۹۱۲۰۰۰۰۰۰۰',
    customerName: 'چاپِ آزمایشی',
    carModel: 'نمونه',
    tierId: 'sample',
    tierName: 'نمونه',
    services: [{ id: 'sample-service', name: 'خطِ آزمایشیِ خدمات', price: 500_000 }],
    price: 500_000,
    date: now.toISOString(),
    jalaliDate: getFormattedJalali(now, true),
    jalaliYear: year,
    jalaliMonth: month,
    jalaliDay: day,
    status: 'active',
    notes: 'این یک فیشِ آزمایشی است و در سوابق ثبت نشده.',
  };
}
