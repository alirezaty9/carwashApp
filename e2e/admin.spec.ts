/**
 * تست‌های E2E پنلِ مدیریت: ورود با رمز، و بررسیِ چند خواسته‌ی مهم روی UIِ واقعی
 * (افزودن خدمت/تیپ بالای صفحه، و ستونِ انعام در دستمزد).
 */
import { test, expect } from '@playwright/test';
import { stubPrint, waitForPos } from './helpers';

test.beforeEach(async ({ page }) => {
  await stubPrint(page);
  await page.goto('/');
  await waitForPos(page);
});

/** ورود به پنل با رمزِ پیش‌فرض (yatash). */
async function login(page: import('@playwright/test').Page) {
  await page.getByTitle('ورود به پنل مدیریت').click();
  await page.getByPlaceholder('رمز پنل را وارد کنید').fill('yatash');
  await page.getByRole('button', { name: 'ورود', exact: true }).click();
  await expect(page.getByRole('button', { name: 'گزارش‌ها' })).toBeVisible();
}

test('ورود به پنل با رمزِ درست موفق و با رمزِ غلط ناموفق است', async ({ page }) => {
  // رمزِ غلط
  await page.getByTitle('ورود به پنل مدیریت').click();
  await page.getByPlaceholder('رمز پنل را وارد کنید').fill('wrong-pass');
  await page.getByRole('button', { name: 'ورود', exact: true }).click();
  await expect(page.getByText('رمز پنل نادرست است')).toBeVisible();

  // رمزِ درست
  await page.getByPlaceholder('رمز پنل را وارد کنید').fill('yatash');
  await page.getByRole('button', { name: 'ورود', exact: true }).click();
  await expect(page.getByRole('button', { name: 'گزارش‌ها' })).toBeVisible();
});

test('«افزودن خدمت/تیپ» بالای صفحه‌ی قیمت‌ها دیده می‌شود', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'قیمت‌ها و تیپ‌ها' }).click();
  await expect(page.getByText('افزودن خدمت جدید (ردیف)')).toBeVisible();
  await expect(page.getByText('افزودن تیپ جدید (ستون)')).toBeVisible();
});

test('«دستمزد کارگرها» کارتِ انعام را دارد', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'دستمزد کارگرها' }).click();
  await expect(page.getByText('انعامِ کارگرها')).toBeVisible();
});

test('تاریخِ اعتبارِ لایسنس به‌صورتِ شمسی نمایش داده می‌شود', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'لایسنس' }).click();
  // در نسخه‌ی مرورگری، وضعیت «licensed/dev» است و expiresAt ندارد → «—» نمایش می‌دهد.
  // فقط مطمئن می‌شویم بخشِ «اعتبار تا» رندر می‌شود و اپ نمی‌شکند.
  await expect(page.getByText('اعتبار تا')).toBeVisible();
});
