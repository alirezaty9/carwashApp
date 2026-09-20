/**
 * تستِ «تورِ ایمنی».
 *
 * ایرادی که رفع شد: هر خطای غیرمنتظره در هر گوشه‌ی برنامه، کلِ صفحه را سفید
 * می‌کرد. چون در نسخه‌ی نصب‌شده ابزارِ توسعه‌دهنده خاموش است، نه پیامی بود نه
 * سرنخی — نه برای مشتری، نه برای پشتیبانی.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

/** کامپوننتی که عمداً می‌شکند — شبیه‌سازیِ یک باگِ واقعی.
 *  خروجی‌اش `never` است چون هیچ‌وقت به return نمی‌رسد. */
function Broken(): never {
  throw new Error('دادهٔ ناقص در فیش');
}

beforeEach(() => {
  // React خطای گرفته‌شده را به کنسول هم می‌نویسد؛ خاموشش می‌کنیم تا خروجیِ تست کثیف نشود.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('ErrorBoundary', () => {
  it('در حالتِ عادی فقط محتوای داخلش را نشان می‌دهد', () => {
    render(
      <ErrorBoundary>
        <p>صفحه‌ی سالم</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('صفحه‌ی سالم')).toBeTruthy();
  });

  it('🟢 به‌جای صفحه‌ی سفید، پیامِ فارسی نشان می‌دهد', () => {
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByText('برنامه به مشکل خورد')).toBeTruthy();
  });

  it('🟢 به کاربر اطمینان می‌دهد که داده‌اش از بین نرفته', () => {
    const { container } = render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(container.textContent).toContain('اطلاعاتِ ثبت‌شده‌ی شما سرِ جایش است');
  });

  it('🟢 متنِ فنیِ خطا را نشان می‌دهد تا برای پشتیبانی فرستاده شود', () => {
    const { container } = render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(container.textContent).toContain('دادهٔ ناقص در فیش');
  });

  it('دکمه‌ی «شروعِ دوباره» دارد و صفحه را از نو بارگذاری می‌کند', () => {
    const reload = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload },
    });

    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'شروعِ دوباره' }));
    expect(reload).toHaveBeenCalled();
  });
});
