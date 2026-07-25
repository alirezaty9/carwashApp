/**
 * تست‌های E2E ورود/نقش و پنلِ مدیریت روی UIِ واقعی.
 */
import { test, expect } from '@playwright/test';
import { stubPrint, waitForPos, loginAs, enterAdminPanel } from './helpers';

test.beforeEach(async ({ page }) => {
  await stubPrint(page);
  await page.goto('/');
});

test('ورود با رمزِ غلط رد و با رمزِ درست قبول می‌شود', async ({ page }) => {
  await page.getByRole('button', { name: 'مدیر' }).first().click();
  await page.getByPlaceholder('رمز خود را وارد کنید').fill('wrong-pass');
  await page.getByRole('button', { name: 'ورود' }).click();
  await expect(page.getByText('رمز نادرست است')).toBeVisible();

  await page.getByPlaceholder('رمز خود را وارد کنید').fill('yatash');
  await page.getByRole('button', { name: 'ورود' }).click();
  await waitForPos(page); // بعد از ورود، صندوق باز می‌شود
});

test('ادمین می‌تواند وارد پنل مدیریت شود', async ({ page }) => {
  await enterAdminPanel(page);
  await expect(page.getByRole('button', { name: 'کاربران' })).toBeVisible();
});

test('«افزودن خدمت/تیپ» بالای صفحه‌ی قیمت‌ها دیده می‌شود', async ({ page }) => {
  await enterAdminPanel(page);
  await page.getByRole('button', { name: 'قیمت‌ها و تیپ‌ها' }).click();
  await expect(page.getByText('افزودن خدمت جدید (ردیف)')).toBeVisible();
  await expect(page.getByText('افزودن تیپ جدید (ستون)')).toBeVisible();
});

test('«دستمزد کارگرها» کارتِ انعام را دارد', async ({ page }) => {
  await enterAdminPanel(page);
  await page.getByRole('button', { name: 'دستمزد کارگرها' }).click();
  await expect(page.getByText('انعامِ کارگرها')).toBeVisible();
});

test('ساختنِ کاربرِ صندوقدار و ورود با او (بدونِ دسترسیِ ادمین)', async ({ page }) => {
  // ادمین یک صندوقدار می‌سازد
  await enterAdminPanel(page);
  await page.getByRole('button', { name: 'کاربران' }).click();
  await page.getByPlaceholder('مثال: ماهان').fill('صندوق‌دار تست');
  await page.getByPlaceholder('رمز').fill('1234');
  await page.getByRole('button', { name: 'افزودن' }).click();
  await expect(page.getByText('کاربرِ جدید اضافه شد')).toBeVisible();

  // خروج و ورود با صندوقدار
  await page.getByTitle('خروج و تعویضِ کاربر').click();
  await loginAs(page, 'صندوق‌دار تست', '1234');
  await waitForPos(page);

  // صندوقدار نباید دکمه‌ی ورود به پنل داشته باشد
  await expect(page.getByTitle('ورود به پنل مدیریت')).toHaveCount(0);
});
