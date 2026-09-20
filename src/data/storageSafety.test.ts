/**
 * 🔴 تستِ مهم‌ترین اصلاحِ ایمنیِ داده: «یخِ ذخیره‌سازی».
 *
 * سناریوی واقعی که این تست بازسازی می‌کند:
 *   ۱) کارواش ماه‌ها قبض ثبت کرده است.
 *   ۲) فایلِ اطلاعات خراب می‌شود (قطعِ برقِ وسطِ نوشتن، سکتورِ خراب، ویرایشِ دستی).
 *   ۳) برنامه باز می‌شود.
 *
 * رفتارِ قدیمی: «خراب» را «خالی» می‌فهمید، خالی بالا می‌آمد، و چون ذخیره‌سازی
 * خودکار است همان ثانیه‌ی اول فهرستِ خالی را روی داده‌ی خراب می‌نوشت — یعنی
 * نابودیِ قطعیِ سوابق.
 *
 * رفتارِ درست (که اینجا تست می‌شود): نوشتن یخ می‌زند و تا تصمیمِ کاربر حتی یک
 * بایت هم روی فایل نوشته نمی‌شود.
 *
 * چرا بدونِ ماک تست‌پذیر است: در محیطِ تست، لایه‌ی ذخیره‌سازی روی localStorage
 * می‌نشیند. پس کافی است یک مقدارِ خرابِ واقعی داخلش بگذاریم — دقیقاً همان چیزی
 * که در نسخه‌ی نصب‌شده روی فایلِ دیسک اتفاق می‌افتد.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCarwashStore } from './store';

const RECEIPTS_KEY = 'cw2_receipts';
const CONFIG_KEY = 'cw2_config';
const CORRUPT = '{"این فایل خراب است';

beforeEach(() => localStorage.clear());

/** یک بکاپِ کمینه‌ی معتبر برای آزمایشِ مسیرِ بازیابی. */
const healthyBackup = {
  tiers: [{ id: 'tier-sedan', name: 'سواری' }],
  services: [{ id: 'srv-1', name: 'روشویی', prices: { 'tier-sedan': 400000 } }],
  workers: [],
  customers: [],
  receipts: [
    {
      id: 'r-restored',
      receiptNumber: 5001,
      price: 400000,
      services: [],
      status: 'active',
    },
  ],
  products: [],
  sales: [],
};

describe('🔴 یخِ ذخیره‌سازی هنگامِ خرابیِ داده', () => {
  it('خرابیِ فایل باعثِ یخ‌زدنِ نوشتن می‌شود و کلیدِ خراب گزارش می‌گردد', () => {
    localStorage.setItem(RECEIPTS_KEY, CORRUPT);

    const { result } = renderHook(() => useCarwashStore());

    expect(result.current.writesFrozen).toBe(true);
    expect(result.current.loadFailedKeys).toContain(RECEIPTS_KEY);
  });

  it('🔴 داده‌ی خراب بازنویسی نمی‌شود (هسته‌ی ایراد)', () => {
    localStorage.setItem(RECEIPTS_KEY, CORRUPT);

    renderHook(() => useCarwashStore());

    // اگر ذخیره‌سازیِ خودکار اجرا شده بود، اینجا «[]» می‌دیدیم و سوابق رفته بود.
    expect(localStorage.getItem(RECEIPTS_KEY)).toBe(CORRUPT);
  });

  it('🔴 بقیه‌ی کلیدهای سالم هم در حالتِ یخ دست نمی‌خورند', () => {
    localStorage.setItem(RECEIPTS_KEY, CORRUPT);

    renderHook(() => useCarwashStore());

    // هیچ کلیدِ دیگری هم نباید ساخته شده باشد؛ یخ سراسری است نه فقط روی کلیدِ خراب.
    expect(localStorage.getItem(CONFIG_KEY)).toBeNull();
  });

  it('خرابیِ هر کلیدِ دیگری هم همین محافظت را فعال می‌کند', () => {
    localStorage.setItem(CONFIG_KEY, CORRUPT);

    const { result } = renderHook(() => useCarwashStore());

    expect(result.current.writesFrozen).toBe(true);
    expect(result.current.loadFailedKeys).toContain(CONFIG_KEY);
    expect(localStorage.getItem(CONFIG_KEY)).toBe(CORRUPT);
  });
});

describe('🟢 دادهٔ سالم نباید یخ بزند', () => {
  it('اولین اجرا (هیچ داده‌ای نیست) یخ نمی‌زند و می‌نویسد', () => {
    const { result } = renderHook(() => useCarwashStore());

    expect(result.current.writesFrozen).toBe(false);
    expect(result.current.loadFailedKeys).toHaveLength(0);
    // ذخیره‌سازیِ خودکار اجرا شده و مقدارِ پیش‌فرض روی دیسک نشسته است
    expect(localStorage.getItem(RECEIPTS_KEY)).toBe('[]');
  });

  it('دادهٔ سالمِ قبلی خوانده می‌شود و یخ نمی‌زند', () => {
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(healthyBackup.receipts));

    const { result } = renderHook(() => useCarwashStore());

    expect(result.current.writesFrozen).toBe(false);
    expect(result.current.receipts).toHaveLength(1);
    expect(result.current.receipts[0].receiptNumber).toBe(5001);
  });
});

describe('🔓 راه‌های خروج از حالتِ یخ', () => {
  it('بازیابی از بکاپِ سالم، داده را برمی‌گرداند و نوشتن را آزاد می‌کند', () => {
    localStorage.setItem(RECEIPTS_KEY, CORRUPT);
    const { result } = renderHook(() => useCarwashStore());
    expect(result.current.writesFrozen).toBe(true);

    let ok: any = null;
    act(() => {
      ok = result.current.importData(healthyBackup as any);
    });

    expect(ok).toBe(true);
    expect(result.current.writesFrozen).toBe(false);
    expect(result.current.receipts[0].receiptNumber).toBe(5001);
    // حالا که آزاد شده، داده‌ی بازیابی‌شده واقعاً روی دیسک نوشته می‌شود
    expect(JSON.parse(localStorage.getItem(RECEIPTS_KEY)!)[0].id).toBe('r-restored');
  });

  it('بکاپِ نامعتبر یخ را باز نمی‌کند (داده‌ی خراب همچنان محفوظ است)', () => {
    localStorage.setItem(RECEIPTS_KEY, CORRUPT);
    const { result } = renderHook(() => useCarwashStore());

    let ok: any = null;
    act(() => {
      ok = result.current.importData({ tiers: [], services: [] } as any);
    });

    expect(ok).toBe(false);
    expect(result.current.writesFrozen).toBe(true);
    expect(localStorage.getItem(RECEIPTS_KEY)).toBe(CORRUPT);
  });

  it('پذیرشِ صریحِ کاربر («از نو شروع کن») یخ را باز می‌کند', () => {
    localStorage.setItem(RECEIPTS_KEY, CORRUPT);
    const { result } = renderHook(() => useCarwashStore());
    expect(result.current.writesFrozen).toBe(true);

    act(() => result.current.acceptDataLoss());

    expect(result.current.writesFrozen).toBe(false);
    // فقط بعد از این تصمیمِ آگاهانه است که بازنویسی مجاز می‌شود
    expect(localStorage.getItem(RECEIPTS_KEY)).toBe('[]');
  });
});
