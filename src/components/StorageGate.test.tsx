/**
 * تستِ پرده‌ی بازیابیِ داده.
 *
 * این همان چیزی است که به‌جای «صندوقِ خالی» می‌آید وقتی خواندنِ اطلاعات شکست
 * خورده است. مهم‌ترین نکته‌اش: تا کاربر یکی از دو راه را انتخاب نکند، برنامه
 * پشتِ این پرده می‌ماند و چیزی روی داده‌ی قبلی نوشته نمی‌شود.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StorageGate from './StorageGate';

const noop = () => true;

describe('StorageGate', () => {
  it('وقتی داده سالم است، فقط برنامه را نشان می‌دهد', () => {
    render(
      <StorageGate failedKeys={[]} frozen={false} onRestore={noop} onAcceptDataLoss={() => {}}>
        <p>صندوق</p>
      </StorageGate>,
    );
    expect(screen.getByText('صندوق')).toBeTruthy();
    expect(screen.queryByText('اطلاعاتِ برنامه خوانده نشد')).toBeNull();
  });

  it('🔴 در حالتِ یخ، برنامه را پنهان و پرده‌ی بازیابی را نشان می‌دهد', () => {
    render(
      <StorageGate failedKeys={['cw2_receipts']} frozen onRestore={noop} onAcceptDataLoss={() => {}}>
        <p>صندوق</p>
      </StorageGate>,
    );
    expect(screen.queryByText('صندوق')).toBeNull();
    expect(screen.getByText('اطلاعاتِ برنامه خوانده نشد')).toBeTruthy();
  });

  it('🟢 اول از همه به کاربر می‌گوید داده‌اش پاک نشده', () => {
    const { container } = render(
      <StorageGate failedKeys={['cw2_receipts']} frozen onRestore={noop} onAcceptDataLoss={() => {}}>
        <p>صندوق</p>
      </StorageGate>,
    );
    expect(container.textContent).toContain('هیچ داده‌ای پاک نشده است');
  });

  it('هر دو راهِ خروج را پیش می‌گذارد (بازیابی و شروعِ دوباره)', () => {
    render(
      <StorageGate failedKeys={['cw2_receipts']} frozen onRestore={noop} onAcceptDataLoss={() => {}}>
        <p>صندوق</p>
      </StorageGate>,
    );
    expect(screen.getByRole('button', { name: /انتخابِ فایلِ پشتیبان/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /شروعِ دوباره با اطلاعاتِ خالی/ })).toBeTruthy();
  });

  it('🛡️ «شروعِ دوباره» تأییدِ دومرحله‌ای دارد (یک کلیکِ اتفاقی کافی نیست)', () => {
    const onAcceptDataLoss = vi.fn();
    render(
      <StorageGate failedKeys={['cw2_receipts']} frozen onRestore={noop} onAcceptDataLoss={onAcceptDataLoss}>
        <p>صندوق</p>
      </StorageGate>,
    );

    // کلیکِ اول فقط تأیید را باز می‌کند
    fireEvent.click(screen.getByRole('button', { name: /شروعِ دوباره با اطلاعاتِ خالی/ }));
    expect(onAcceptDataLoss).not.toHaveBeenCalled();

    // کلیکِ دوم روی تأیید، تصمیم را قطعی می‌کند
    fireEvent.click(screen.getByRole('button', { name: 'بله، می‌پذیرم و از نو شروع کن' }));
    expect(onAcceptDataLoss).toHaveBeenCalledTimes(1);
  });

  it('با «انصراف» می‌شود از تأیید برگشت', () => {
    const onAcceptDataLoss = vi.fn();
    render(
      <StorageGate failedKeys={['cw2_receipts']} frozen onRestore={noop} onAcceptDataLoss={onAcceptDataLoss}>
        <p>صندوق</p>
      </StorageGate>,
    );

    fireEvent.click(screen.getByRole('button', { name: /شروعِ دوباره با اطلاعاتِ خالی/ }));
    fireEvent.click(screen.getByRole('button', { name: 'انصراف' }));

    expect(onAcceptDataLoss).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /شروعِ دوباره با اطلاعاتِ خالی/ })).toBeTruthy();
  });

  it('با بازیابیِ موفق، برنامه دوباره نمایش داده می‌شود', () => {
    // «frozen» را والد کنترل می‌کند؛ اینجا با یک رندرِ دوباره همان را شبیه‌سازی می‌کنیم.
    const { rerender } = render(
      <StorageGate failedKeys={['cw2_receipts']} frozen onRestore={noop} onAcceptDataLoss={() => {}}>
        <p>صندوق</p>
      </StorageGate>,
    );
    expect(screen.queryByText('صندوق')).toBeNull();

    rerender(
      <StorageGate failedKeys={['cw2_receipts']} frozen={false} onRestore={noop} onAcceptDataLoss={() => {}}>
        <p>صندوق</p>
      </StorageGate>,
    );
    expect(screen.getByText('صندوق')).toBeTruthy();
  });
});
