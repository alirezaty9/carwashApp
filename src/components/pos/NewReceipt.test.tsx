/**
 * تستِ یکپارچگیِ کامپوننتیِ صفحه‌ی صدور قبض.
 *
 * این نزدیک‌ترین تست به «کاربرِ واقعی» است که بدونِ مرورگر (فقط در Node/jsdom) اجرا
 * می‌شود — جایگزینِ خوبِ E2E وقتی دانلودِ مرورگرِ Playwright ممکن نیست. کامپوننتِ
 * واقعیِ NewReceipt را با یک store واقعی رندر می‌کنیم و مثلِ کاربر کلیک/تایپ می‌کنیم.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { useCarwashStore } from '../../data/store';
import NewReceipt from './NewReceipt';

beforeEach(() => localStorage.clear());

function Harness() {
  const store = useCarwashStore();
  return <NewReceipt store={store} notify={() => {}} onPrint={() => {}} />;
}

/** عددِ تومانِ داخلِ کادرِ «مبلغ کل قابل پرداخت». */
function totalToman(container: HTMLElement): number {
  const el = container.querySelector('.cw-total');
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const only = (el?.textContent || '').replace(/[^۰-۹0-9]/g, '');
  return Number(only.replace(/[۰-۹]/g, (d) => String(fa.indexOf(d))));
}

/** ورودیِ متصل به یک برچسبِ Field (خواهرِ بعدیِ label). */
function fieldInput(container: HTMLElement, labelText: string): HTMLInputElement {
  const label = Array.from(container.querySelectorAll('label')).find((l) =>
    l.textContent?.includes(labelText),
  );
  return label!.nextElementSibling as HTMLInputElement;
}

/** خدمتِ «روشویی» را انتخاب می‌کند (چک‌باکسِ داخلِ همان label). */
function selectRoshuyi(container: HTMLElement) {
  const label = Array.from(container.querySelectorAll('label')).find((l) =>
    l.textContent?.includes('روشویی'),
  );
  fireEvent.click(label!.querySelector('input[type=checkbox]')!);
}

describe('NewReceipt — جریانِ واقعیِ صدور قبض', () => {
  it('انتخابِ تیپ سواری + روشویی مبلغِ کل را درست نشان می‌دهد', () => {
    const { container } = render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'سواری' }));
    selectRoshuyi(container);
    expect(totalToman(container)).toBe(40000); // ۴۰۰۰۰۰ ریال = ۴۰٬۰۰۰ تومان
  });

  it('🟢 انعام مبلغِ کل را تغییر نمی‌دهد ولی جدا نمایش داده می‌شود', () => {
    const { container } = render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'سواری' }));
    selectRoshuyi(container);
    const before = totalToman(container);

    fireEvent.change(fieldInput(container, 'انعام کارگر'), { target: { value: '۵۰۰۰' } });

    expect(totalToman(container)).toBe(before); // مبلغِ کل ثابت ماند
    expect(container.textContent).toContain('انعام کارگر (جدا از مبلغ کل)');
  });

  it('🟢 تخفیف با ارقامِ فارسی مبلغِ کل را کم می‌کند', () => {
    const { container } = render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'سواری' }));
    selectRoshuyi(container);
    expect(totalToman(container)).toBe(40000);

    fireEvent.change(fieldInput(container, 'تخفیف (تومان)'), { target: { value: '۵۰۰۰' } });
    expect(totalToman(container)).toBe(35000); // ۴۰٬۰۰۰ − ۵٬۰۰۰
  });
});
