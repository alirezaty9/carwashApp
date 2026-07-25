/**
 * تست‌های E2E صفحه‌ی صندوق (صدور قبضِ شست‌وشو).
 * هر تست در یک مرورگرِ تازه با حافظه‌ی خالی اجرا می‌شود (داده‌ی پیش‌فرض seed می‌شود).
 */
import { test, expect } from '@playwright/test';
import { tomanOf, fieldInput, stubPrint, waitForPos } from './helpers';

test.beforeEach(async ({ page }) => {
  await stubPrint(page);
  await page.goto('/');
  await waitForPos(page);
});

test('اپ بالا می‌آید و صفحه‌ی قبض دیده می‌شود', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'ثبت و چاپ قبض' })).toBeVisible();
});

test('صدور یک قبضِ کامل → پیامِ موفقیت و پاک‌شدنِ فرم', async ({ page }) => {
  await page.getByPlaceholder('۰۹۱۲۳۴۵۶۷۸۹').fill('09120000000');
  await page.getByPlaceholder('نام و نام خانوادگی').fill('کاربر تست');
  await page.getByText('روشویی (نظافت بدنه)').click(); // انتخابِ خدمت
  await page.getByRole('button', { name: 'ثبت و چاپ قبض' }).click();

  await expect(page.getByText(/قبض شماره/)).toBeVisible();
  // فرم باید ریست شود
  await expect(page.getByPlaceholder('۰۹۱۲۳۴۵۶۷۸۹')).toHaveValue('');
});

test('🟢 انعام در مبلغِ کل حساب نمی‌شود ولی جدا نمایش داده می‌شود', async ({ page }) => {
  await page.getByText('روشویی (نظافت بدنه)').click(); // بهای سواری = ۴۰٬۰۰۰ تومان
  const total = page.locator('.cw-total');
  const before = await tomanOf(total);
  expect(before).toBe(40000);

  await fieldInput(page, 'انعام کارگر').fill('۵۰۰۰'); // انعام با ارقامِ فارسی
  await expect(page.getByText('انعام کارگر (جدا از مبلغ کل)')).toBeVisible();

  const after = await tomanOf(total);
  expect(after).toBe(before); // مبلغِ کل تغییر نکرد
});

test('🟢 تخفیف با ارقامِ فارسی مبلغِ کل را کم می‌کند', async ({ page }) => {
  await page.getByText('روشویی (نظافت بدنه)').click(); // ۴۰٬۰۰۰ تومان
  const total = page.locator('.cw-total');
  expect(await tomanOf(total)).toBe(40000);

  await fieldInput(page, 'تخفیف (تومان)').fill('۵۰۰۰'); // تخفیفِ ۵۰۰۰ تومان
  expect(await tomanOf(total)).toBe(35000); // ثابت می‌کند ارقامِ فارسی درست پردازش شد
});

test('فروش لوازم: انتخابِ کالا و ثبت فاکتور', async ({ page }) => {
  await page.getByRole('button', { name: 'فروش لوازم' }).click();
  await page.getByText('شامپو بدنه خودرو').click();
  await page.getByRole('button', { name: 'ثبت و چاپ فاکتور' }).click();
  await expect(page.getByText(/فروش شماره/)).toBeVisible();
});
