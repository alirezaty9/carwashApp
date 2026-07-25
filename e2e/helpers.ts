/** کمک‌توابعِ مشترکِ تست‌های E2E. */
import { Page, Locator, expect } from '@playwright/test';

/** ارقامِ فارسی/جداکننده را از یک متن پاک و به عددِ لاتین تبدیل می‌کند. */
export function digitsToNumber(text: string): number {
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const only = text.replace(/[^۰-۹0-9]/g, '');
  const en = only.replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)));
  return Number(en || '0');
}

/** مقدارِ تومانِ داخلِ یک عنصر (مثلِ کادرِ «مبلغ کل») را برمی‌گرداند. */
export async function tomanOf(loc: Locator): Promise<number> {
  return digitsToNumber(await loc.innerText());
}

/**
 * ورودیِ متصل به یک برچسبِ Field را پیدا می‌کند. چون برچسب و ورودی «خواهر»‌اند
 * (label بعدش input/select می‌آید)، با following-sibling سراغش می‌رویم.
 */
export function fieldInput(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: labelText }).locator('xpath=following-sibling::input');
}

/**
 * پیش از هر تست: window.print را خنثی می‌کنیم تا هنگامِ «ثبت قبض» پنجره‌ی چاپِ
 * سیستم باز/بلاک نشود و تست روان پیش برود.
 */
export async function stubPrint(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // @ts-ignore
    window.print = () => {};
  });
}

/** صفحه‌ی صندوق تا آماده‌شدن (کادرِ مبلغِ کل دیده شود) صبر می‌کند. */
export async function waitForPos(page: Page): Promise<void> {
  await expect(page.getByText('مبلغ کل قابل پرداخت')).toBeVisible();
}
