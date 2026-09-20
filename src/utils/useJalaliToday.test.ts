/**
 * تستِ «امروزِ زنده».
 *
 * ایرادی که این هوک رفع کرد: کامپیوترِ کارواش خاموش نمی‌شود و صفحه‌ی گزارش‌ها
 * ممکن است از دیشب باز مانده باشد. قبلاً تاریخِ «امروز» فقط یک‌بار در لحظه‌ی باز
 * شدنِ صفحه حساب می‌شد، پس بعد از نیمه‌شب «درآمد امروز» هنوز عددِ دیروز بود.
 *
 * برای تست، ساعتِ سیستم را دستی جلو می‌بریم (ساعتِ ساختگیِ Vitest) و می‌بینیم
 * هوک خودش متوجهِ تغییرِ روز می‌شود یا نه.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useJalaliToday } from './useJalaliToday';
import { getJalaliDateParts } from './jalali';

const ONE_MINUTE = 60_000;

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useJalaliToday', () => {
  it('در شروع، تاریخِ جلالیِ همین حالا را می‌دهد', () => {
    const now = new Date(2026, 8, 20, 10, 0, 0); // ۲۰ سپتامبر ۲۰۲۶
    vi.setSystemTime(now);

    const { result } = renderHook(() => useJalaliToday());

    expect(result.current).toEqual(getJalaliDateParts(now));
  });

  it('🟢 با عبور از نیمه‌شب، خودش روزِ بعد را می‌گیرد', () => {
    vi.setSystemTime(new Date(2026, 8, 20, 23, 59, 0));
    const { result } = renderHook(() => useJalaliToday());
    const yesterday = result.current;

    // ساعت از نیمه‌شب رد می‌شود و یک دقیقه می‌گذرد
    vi.setSystemTime(new Date(2026, 8, 21, 0, 1, 0));
    act(() => {
      vi.advanceTimersByTime(ONE_MINUTE);
    });

    expect(result.current).toEqual(getJalaliDateParts(new Date(2026, 8, 21, 0, 1, 0)));
    expect(result.current).not.toEqual(yesterday);
  });

  it('🟢 تا وقتی روز عوض نشده، همان مقدارِ قبلی را برمی‌گرداند (بدونِ محاسبه‌ی بی‌دلیل)', () => {
    vi.setSystemTime(new Date(2026, 8, 20, 10, 0, 0));
    const { result } = renderHook(() => useJalaliToday());
    const first = result.current;

    // ده دقیقه می‌گذرد ولی هنوز همان روز است
    vi.setSystemTime(new Date(2026, 8, 20, 10, 10, 0));
    act(() => {
      vi.advanceTimersByTime(10 * ONE_MINUTE);
    });

    // مرجعِ شیء باید دقیقاً همان باشد، وگرنه همه‌ی گزارش‌ها هر دقیقه از نو
    // حساب می‌شوند و روی کامپیوترِ ضعیفِ کارواش کندی حس می‌شود.
    expect(result.current).toBe(first);
  });

  it('عبور از مرزِ ماهِ شمسی را هم درست می‌گیرد', () => {
    // ۲۱ سپتامبر ۲۰۲۶ آخرین روزِ شهریور (۳۱ شهریور) است و روزِ بعد مهر می‌شود
    vi.setSystemTime(new Date(2026, 8, 22, 23, 59, 0));
    const { result } = renderHook(() => useJalaliToday());
    const before = result.current;

    vi.setSystemTime(new Date(2026, 8, 23, 0, 1, 0));
    act(() => {
      vi.advanceTimersByTime(ONE_MINUTE);
    });

    expect(result.current).toEqual(getJalaliDateParts(new Date(2026, 8, 23, 0, 1, 0)));
    expect(result.current).not.toEqual(before);
  });

  it('با برچیده‌شدنِ کامپوننت، تایمر هم متوقف می‌شود (نشتِ حافظه ندارد)', () => {
    vi.setSystemTime(new Date(2026, 8, 20, 10, 0, 0));
    const { unmount } = renderHook(() => useJalaliToday());

    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
