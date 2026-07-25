/**
 * پیکربندیِ Playwright — ابزارِ تستِ E2E («سرتاسری»).
 *
 * تستِ E2E یعنی یک مرورگرِ واقعی باز می‌شود، آدرسِ اپ را می‌گیرد و مثلِ یک کاربرِ
 * واقعی کلیک/تایپ می‌کند و نتیجه را روی صفحه می‌سنجد. این بالاترین سطحِ اطمینان است
 * چون کلِ زنجیره (React + store + محاسبات + DOM) را با هم تست می‌کند.
 *
 * نکته: نسخه‌ی مرورگریِ اپ را تست می‌کنیم (سرورِ Vite روی پورت ۳۰۰۰). چون در مرورگر
 * پلِ الکترون نیست، لایسنس خودکار «licensed/dev» می‌شود و اپ مستقیم بالا می‌آید؛ پس
 * همه‌ی جریان‌های صندوق/پنل بدونِ نیاز به نصبِ ویندوز قابلِ تست‌اند.
 *
 * قبل از اولین اجرا یک‌بار مرورگرها را نصب کن:  npx playwright install chromium
 *
 * ⚠️ اگر دانلودِ مرورگرِ Playwright به‌خاطرِ تحریم/فیلتر جواب نداد (خطای 403
 * «not available in your location»)، دو راه داری:
 *   ۱) از کرومِ نصب‌شده‌ی سیستم استفاده کن: در projects پایین به‌جای chromium بگذار
 *      `use: { channel: 'chrome' }` (اگر Google Chrome روی سیستم نصب باشد، بدونِ
 *      دانلود اجرا می‌شود). یا با متغیرِ محیطی: `PWTEST_CHANNEL=chrome npm run test:e2e`.
 *   ۲) اصلاً E2E اجرا نکن — تست‌های «یکپارچگیِ کامپوننتی» (src/components/**.test.tsx)
 *      همان جریان‌های کاربری را در jsdom و بدونِ مرورگر با `npm test` پوشش می‌دهند.
 */
import { defineConfig, devices } from '@playwright/test';

// اگر PWTEST_CHANNEL ست شده باشد (مثلاً chrome)، از همان کانالِ نصب‌شده استفاده کن.
const channel = process.env.PWTEST_CHANNEL;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], ...(channel ? { channel } : {}) } }],
  // Playwright خودش سرورِ Vite را بالا می‌آورد و بعدِ تست‌ها می‌بندد.
  webServer: {
    command: 'npx vite --port 3000 --strictPort',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
