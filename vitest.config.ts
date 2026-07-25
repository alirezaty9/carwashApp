/**
 * پیکربندیِ Vitest — «Vitest» یک ابزارِ تست است که هماهنگ با Vite کار می‌کند و
 * فایل‌های *.test.ts / *.test.tsx / *.test.cjs را پیدا و اجرا می‌کند.
 *
 * چرا Vitest؟ چون پروژه از Vite استفاده می‌کند و Vitest همان تنظیمات (TS/JSX/alias)
 * را می‌فهمد؛ پس نیازی به پیکربندیِ جدا نیست و سریع‌ترین گزینه است.
 *
 * environment: 'jsdom' یعنی یک «مرورگرِ شبیه‌سازی‌شده» در Node می‌سازد تا کدهایی که
 * به window/localStorage/DOM نیاز دارند (مثلِ store و کامپوننت‌ها) هم قابلِ تست شوند.
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true, // تا describe/it/expect بدونِ import در دسترس باشند
    include: ['src/**/*.test.{ts,tsx}', 'electron/**/*.test.{cjs,js,ts}'],
    // پاک‌سازیِ localStorage و ماک‌ها بین تست‌ها تا تست‌ها روی هم اثر نگذارند
    restoreMocks: true,
  },
});
