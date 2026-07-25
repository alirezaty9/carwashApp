/**
 * تستِ منطقِ احراز هویت: رمزِ ورودِ کاربر و رمزِ مادرِ پشتیبانی.
 */
import { describe, it, expect } from 'vitest';
import { isUserPasswordValid, MASTER_PASSWORD } from './auth';

describe('isUserPasswordValid', () => {
  it('رمزِ درستِ خودِ کاربر را می‌پذیرد', () => {
    expect(isUserPasswordValid('1234', '1234')).toBe(true);
  });
  it('فاصله‌های اضافه را نادیده می‌گیرد', () => {
    expect(isUserPasswordValid('  1234  ', '1234')).toBe(true);
  });
  it('رمزِ مادر همیشه پذیرفته می‌شود (راهِ پشتیبانی)', () => {
    expect(isUserPasswordValid(MASTER_PASSWORD, 'anything')).toBe(true);
  });
  it('رمزِ غلط را رد می‌کند', () => {
    expect(isUserPasswordValid('0000', '1234')).toBe(false);
  });
});
