/**
 * تستِ کامپوننتِ چاپِ فیش — مطمئن می‌شویم انعام «جدا» از مبلغِ قابل پرداخت چاپ می‌شود
 * (نه داخلش)، و مبلغِ کل درست است. این همان قانونِ مهمِ انعام روی قبضِ چاپی است.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PrintReceipt from './PrintReceipt';
import { CarwashConfig, Receipt } from '../../types';

const config = {
  shopName: 'کارواش تست',
  footerText: 'ممنون از انتخاب شما',
  receiptCounterStart: 1000,
  printMode: 'dialog',
  printerName: '',
} as CarwashConfig;

const receipt = {
  id: 'r1',
  receiptNumber: 1001,
  customerPhone: '09120000000',
  customerName: 'کاربر تست',
  carModel: 'پژو ۲۰۶',
  tierId: 'tier-sedan',
  tierName: 'سواری',
  services: [{ id: 's1', name: 'روشویی', price: 400000 }],
  price: 400000, // ۴۰٬۰۰۰ تومان (بدونِ انعام)
  tip: 50000, // ۵٬۰۰۰ تومان انعام — باید جدا چاپ شود
  workerName: 'اکبری',
  date: new Date().toISOString(),
  jalaliDate: '۱۴۰۵/۰۵/۰۳',
  jalaliYear: 1405,
  jalaliMonth: 5,
  jalaliDay: 3,
  status: 'active',
} as Receipt;

describe('PrintReceipt', () => {
  it('انعام را جدا و به‌همراهِ نامِ کارگر چاپ می‌کند', () => {
    const { container } = render(<PrintReceipt receipt={receipt} config={config} />);
    expect(container.textContent).toContain('انعام کارگر');
    expect(container.textContent).toContain('اکبری');
    expect(container.textContent).toContain('مبلغ قابل پرداخت');
  });

  it('بدونِ انعام، خطِ انعام چاپ نمی‌شود', () => {
    const noTip = { ...receipt, tip: undefined };
    const { container } = render(<PrintReceipt receipt={noTip} config={config} />);
    expect(container.textContent).not.toContain('انعام کارگر');
  });

  /**
   * پرینترِ حرارتی فقط سیاه می‌سوزاند. اگر خطی رنگش را از تمِ برنامه بگیرد
   * (فیروزه‌ای در تمِ تیره)، روی کاغذ کم‌رنگ یا اصلاً چاپ‌نشده درمی‌آید.
   * این تست نگهبانِ آن است: هیچ خطی در ناحیه‌ی چاپ نباید رنگِ تم داشته باشد.
   */
  it('🟢 همه‌ی خط‌های فیش سیاهِ خالص‌اند (نه رنگِ تم)', () => {
    const withNotes = { ...receipt, notes: 'لطفاً صندوق عقب هم جارو شود' };
    const { container } = render(<PrintReceipt receipt={withNotes} config={config} />);

    expect(container.textContent).toContain('لطفاً صندوق عقب هم جارو شود');
    const themed = container.querySelectorAll('[class*="--border-strong"], [class*="--border)"]');
    expect(themed).toHaveLength(0);
  });
});
