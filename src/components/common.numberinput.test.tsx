/**
 * تستِ کامپوننتِ NumberInput — قلبِ همه‌ی ورودی‌های عددی.
 * اینجا کامپوننتِ واقعی را رندر می‌کنیم و مثلِ کاربر داخلش تایپ می‌کنیم (fireEvent)
 * و رفتارش را می‌سنجیم. این «تستِ کامپوننتی» است: یک پله بالاتر از تستِ واحد.
 */
import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberInput } from './common';
import { toEnglishDigits } from '../utils/format';

// چون NumberInput کنترل‌شده است، یک بسته‌بندیِ کوچک با state می‌سازیم تا مقدارِ
// نمایشی‌اش (بعد از فرمت‌بندی) دیده شود.
function Wrapper({ thousands = true }: { thousands?: boolean }) {
  const [v, setV] = useState(0);
  return <NumberInput value={v} onValueChange={setV} thousands={thousands} placeholder="۰" />;
}

describe('NumberInput', () => {
  it('ارقامِ فارسی را می‌پذیرد و با جداکننده‌ی هزارگانِ فارسی نشان می‌دهد', () => {
    render(<Wrapper />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '۱۲۵۰۰' } });
    expect(toEnglishDigits(input.value).replace(/[^0-9]/g, '')).toBe('12500');
    expect(input.value).not.toBe('12500'); // یعنی واقعاً فارسی + فرمت شده
  });

  it('با thousands=false بدونِ جداکننده و فقط فارسی نشان می‌دهد', () => {
    render(<Wrapper thousands={false} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '۴۰' } });
    expect(input.value).toBe('۴۰');
  });

  it('ورودیِ غیرعددی را صفر و نمایش را خالی می‌کند', () => {
    render(<Wrapper />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abc!!' } });
    expect(input.value).toBe('');
  });
});
