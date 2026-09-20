/**
 * 🔴 تستِ یکپارچگیِ پنلِ «کاربران و دسترسی» — با storeِ واقعی.
 *
 * ایرادی که این تست‌ها نگهبانش هستند: قبلاً هر حرفی که در کادرِ رمز تایپ می‌شد
 * همان لحظه ذخیره می‌شد. پس کافی بود مدیر کادر را خالی کند (مثلاً برای تایپِ
 * رمزِ تازه) و حواسش پرت شود — از آن لحظه هرکسی با انتخابِ آن کاربر و زدنِ
 * «ورود» بدونِ تایپِ چیزی وارد برنامه می‌شد.
 *
 * حالا رمز فقط هنگامِ بیرون رفتن از کادر (blur) و بعد از اعتبارسنجی ثبت می‌شود.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { useCarwashStore } from '../../data/store';
import { DEFAULT_ADMIN_PIN } from '../../auth';
import UsersManager from './UsersManager';

beforeEach(() => localStorage.clear());

/** آخرین رمزِ ذخیره‌شده‌ی کاربرِ ادمین را از خودِ store می‌خواند (نه از روی صفحه). */
let lastUsers: { id: string; name: string; password: string; role: string }[] = [];

function Harness({ notify }: { notify: (m: string, t?: string) => void }) {
  const store = useCarwashStore();
  lastUsers = store.users as never;
  return <UsersManager store={store} notify={notify as never} currentUserId={store.users[0]?.id} />;
}

/** کادرِ رمزِ ردیفِ کاربر در فهرست (نه کادرِ فرمِ افزودن). */
const listPasswordInput = (container: HTMLElement) =>
  container.querySelector('input[type="password"]') as HTMLInputElement;

const adminPassword = () => lastUsers.find((u) => u.role === 'admin')!.password;

describe('UsersManager — کادرِ رمز', () => {
  it('رمزِ فعلیِ کاربر را نشان می‌دهد', () => {
    const { container } = render(<Harness notify={() => {}} />);
    expect(listPasswordInput(container).value).toBe(DEFAULT_ADMIN_PIN);
  });

  it('🔴 خالی کردنِ کادر رمز را پاک نمی‌کند و پیامِ خطا می‌دهد', () => {
    const notify = vi.fn();
    const { container } = render(<Harness notify={notify} />);
    const input = listPasswordInput(container);

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(adminPassword()).toBe(DEFAULT_ADMIN_PIN); // دست‌نخورده ماند
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('رمز نمی‌تواند خالی باشد'), 'error');
  });

  it('🔴 خالی کردنِ کادر، مقدارِ نمایشی را هم به رمزِ قبلی برمی‌گرداند', () => {
    const { container } = render(<Harness notify={() => {}} />);
    const input = listPasswordInput(container);

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(listPasswordInput(container).value).toBe(DEFAULT_ADMIN_PIN);
  });

  it('🛡️ رمزِ خیلی کوتاه پذیرفته نمی‌شود', () => {
    const notify = vi.fn();
    const { container } = render(<Harness notify={notify} />);
    const input = listPasswordInput(container);

    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.blur(input);

    expect(adminPassword()).toBe(DEFAULT_ADMIN_PIN);
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('حداقل'), 'error');
  });

  it('🟢 رمزِ معتبر ثبت می‌شود', () => {
    const notify = vi.fn();
    const { container } = render(<Harness notify={notify} />);
    const input = listPasswordInput(container);

    fireEvent.change(input, { target: { value: 'رمزِ تازه' } });
    fireEvent.blur(input);

    expect(adminPassword()).toBe('رمزِ تازه');
    expect(notify).toHaveBeenCalledWith('رمزِ کاربر تغییر کرد', 'success');
  });

  it('🟢 تا وقتی از کادر بیرون نرفته‌ای، هیچ‌چیز ذخیره نشده', () => {
    const { container } = render(<Harness notify={() => {}} />);
    const input = listPasswordInput(container);

    fireEvent.change(input, { target: { value: '' } });
    // هنوز blur نشده — این همان پنجره‌ی خطرناکِ قبلی بود
    expect(adminPassword()).toBe(DEFAULT_ADMIN_PIN);
  });

  it('کلیدِ Enter هم مثلِ بیرون رفتن از کادر، رمز را ثبت می‌کند', () => {
    const { container } = render(<Harness notify={() => {}} />);
    const input = listPasswordInput(container);

    // کاربرِ واقعی موقعِ زدنِ Enter داخلِ کادر است؛ بدونِ فوکوس، jsdom اصلاً
    // رویدادِ «بیرون رفتن از کادر» را صادر نمی‌کند و تست واقعیت را نمی‌سنجد.
    input.focus();
    fireEvent.change(input, { target: { value: 'رمزِ اینتری' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(adminPassword()).toBe('رمزِ اینتری');
  });
});

describe('UsersManager — نامِ کاربر', () => {
  const nameInput = (container: HTMLElement) =>
    container.querySelector('input[aria-label="نام کاربر"]') as HTMLInputElement;

  it('🛡️ نامِ خالی پذیرفته نمی‌شود و نامِ قبلی برمی‌گردد', () => {
    const notify = vi.fn();
    const { container } = render(<Harness notify={notify} />);
    const input = nameInput(container);
    const before = input.value;

    fireEvent.change(input, { target: { value: '  ' } });
    fireEvent.blur(input);

    expect(nameInput(container).value).toBe(before);
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('خالی'), 'error');
  });

  it('🟢 نامِ معتبر ثبت می‌شود', () => {
    const { container } = render(<Harness notify={() => {}} />);
    const input = nameInput(container);

    fireEvent.change(input, { target: { value: 'مدیرِ کارواش' } });
    fireEvent.blur(input);

    expect(lastUsers.find((u) => u.role === 'admin')!.name).toBe('مدیرِ کارواش');
  });
});

describe('UsersManager — افزودنِ کاربرِ جدید', () => {
  const fillNewUser = (name: string, password: string) => {
    fireEvent.change(screen.getByPlaceholderText('مثال: ماهان'), { target: { value: name } });
    fireEvent.change(screen.getByPlaceholderText(/رمزِ ورود/), { target: { value: password } });
    fireEvent.click(screen.getByRole('button', { name: /افزودن/ }));
  };

  it('🛡️ کاربرِ بدونِ رمز ساخته نمی‌شود', () => {
    const notify = vi.fn();
    render(<Harness notify={notify} />);
    const before = lastUsers.length;

    fillNewUser('صندوق‌دار', '');

    expect(lastUsers).toHaveLength(before);
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('خالی'), 'error');
  });

  it('🛡️ کاربرِ با رمزِ کوتاه ساخته نمی‌شود', () => {
    const notify = vi.fn();
    render(<Harness notify={notify} />);
    const before = lastUsers.length;

    fillNewUser('صندوق‌دار', '12');

    expect(lastUsers).toHaveLength(before);
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('حداقل'), 'error');
  });

  it('🛡️ نامِ تکراری ساخته نمی‌شود', () => {
    const notify = vi.fn();
    render(<Harness notify={notify} />);
    const existingName = lastUsers[0].name;
    const before = lastUsers.length;

    fillNewUser(existingName, '1234');

    expect(lastUsers).toHaveLength(before);
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('همین نام'), 'error');
  });

  it('🟢 کاربرِ سالم ساخته می‌شود', () => {
    const notify = vi.fn();
    render(<Harness notify={notify} />);
    const before = lastUsers.length;

    fillNewUser('صندوق‌دار تست', '1234');

    expect(lastUsers).toHaveLength(before + 1);
    expect(lastUsers.find((u) => u.name === 'صندوق‌دار تست')!.password).toBe('1234');
    expect(notify).toHaveBeenCalledWith('کاربرِ جدید اضافه شد', 'success');
  });
});
