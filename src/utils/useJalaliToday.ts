import { useEffect, useState } from 'react';
import { getJalaliDateParts } from './jalali';

/** روزِ جلالی — همان شکلی که گزارش‌ها برای فیلترِ بازه لازم دارند. */
export interface JalaliDay {
  year: number;
  month: number;
  day: number;
}

/** هر یک دقیقه یک‌بار چک می‌کنیم روز عوض شده یا نه. برای تقویم کافی است. */
const CHECK_INTERVAL_MS = 60_000;

const sameDay = (a: JalaliDay, b: JalaliDay): boolean =>
  a.year === b.year && a.month === b.month && a.day === b.day;

/**
 * «امروز» به‌صورتِ زنده.
 *
 * چرا لازم است: کامپیوترِ کارواش معمولاً خاموش نمی‌شود و ممکن است صفحه‌ی گزارش‌ها
 * از دیشب باز مانده باشد. اگر «امروز» فقط یک‌بار در لحظه‌ی باز شدنِ صفحه حساب شود،
 * بعد از نیمه‌شب کارتِ «درآمد امروز» هنوز عددهای دیروز را نشان می‌دهد — در حالی که
 * ساعت و تاریخِ بالای صفحه روزِ جدید را می‌گوید و دو جای برنامه دو حرفِ متفاوت می‌زنند.
 *
 * نکته‌ی مهمِ پیاده‌سازی: فقط وقتی شیءِ تازه برگردانده می‌شود که روز **واقعاً** عوض
 * شده باشد. وگرنه هر دقیقه یک مرجعِ جدید ساخته می‌شد و همه‌ی محاسبه‌های گزارش
 * (که به این مقدار وابسته‌اند) بی‌دلیل از نو اجرا می‌شدند.
 */
export function useJalaliToday(): JalaliDay {
  const [today, setToday] = useState<JalaliDay>(() => getJalaliDateParts(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setToday((prev) => {
        const next = getJalaliDateParts(new Date());
        return sameDay(prev, next) ? prev : next;
      });
    }, CHECK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return today;
}
