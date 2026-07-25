/**
 * تست‌های لایه‌ی داده (store) — مغزِ مالیِ برنامه.
 *
 * چون store یک «هوکِ React» است، با ابزارِ renderHook آن را در یک محیطِ آزمایشی
 * اجرا می‌کنیم و با act(...) اکشن‌ها را صدا می‌زنیم (act یعنی «این تغییرِ state را
 * انجام بده و منتظر بمان تا اعمال شود»).
 *
 * تمرکز: صدور قبض (به‌ویژه جداسازیِ انعام)، تخفیف، پورسانت، فروش/انبار و ابطال.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCarwashStore } from './store';

// قبل از هر تست، حافظه‌ی محلی را پاک می‌کنیم تا هر تست از داده‌ی پیش‌فرضِ تمیز شروع کند.
beforeEach(() => localStorage.clear());

describe('createReceipt (صدور قبضِ شست‌وشو)', () => {
  it('انعام را جدا از مبلغِ کل نگه می‌دارد و پورسانت را درست حساب می‌کند', () => {
    const { result } = renderHook(() => useCarwashStore());
    let rec: any = null;
    act(() => {
      rec = result.current.createReceipt({
        customerPhone: '09120000000',
        customerName: 'تست',
        carModel: 'x',
        tierId: 'tier-sedan',
        serviceIds: ['srv-roshuyi'], // بهای سواری = ۴۰۰۰۰۰ ریال، پورسانت ۴۰٪
        workerId: 'wrk-1',
        discount: 0,
        tip: 50000, // انعام (ریال)
      });
    });
    expect(rec).not.toBeNull();
    expect(rec.price).toBe(400000); // انعام داخلِ مبلغِ کل نیست
    expect(rec.tip).toBe(50000);
    expect(rec.workerCommission).toBe(160000); // ۴۰٪ × ۴۰۰۰۰۰
    expect(result.current.receipts).toHaveLength(1);
    expect(result.current.receipts[0].receiptNumber).toBe(1000); // شروعِ شمارنده
  });

  it('تخفیفِ بزرگ‌تر از جمع، به جمعِ خدمات محدود می‌شود (مبلغ منفی نمی‌شود)', () => {
    const { result } = renderHook(() => useCarwashStore());
    let rec: any = null;
    act(() => {
      rec = result.current.createReceipt({
        customerPhone: '0912',
        customerName: 'ت',
        carModel: 'x',
        tierId: 'tier-sedan',
        serviceIds: ['srv-roshuyi'],
        discount: 999999999,
        tip: 0,
      });
    });
    expect(rec.price).toBe(0);
    expect(rec.discount).toBe(400000);
  });

  it('بدونِ خدمت، قبض ساخته نمی‌شود (null)', () => {
    const { result } = renderHook(() => useCarwashStore());
    let rec: any = 'x';
    act(() => {
      rec = result.current.createReceipt({
        customerPhone: '0912',
        customerName: 'ت',
        carModel: 'x',
        tierId: 'tier-sedan',
        serviceIds: [],
      });
    });
    expect(rec).toBeNull();
  });

  it('بدونِ کارگر، پورسانت undefined است ولی انعام ثبت می‌شود', () => {
    const { result } = renderHook(() => useCarwashStore());
    let rec: any = null;
    act(() => {
      rec = result.current.createReceipt({
        customerPhone: '0912',
        customerName: 'ت',
        carModel: 'x',
        tierId: 'tier-sedan',
        serviceIds: ['srv-roshuyi'],
        tip: 30000,
      });
    });
    expect(rec.workerCommission).toBeUndefined();
    expect(rec.tip).toBe(30000);
  });
});

describe('ابطال و ویرایشِ قبضِ شست‌وشو', () => {
  function makeReceipt(store: ReturnType<typeof useCarwashStore>) {
    return store.createReceipt({
      customerPhone: '0912',
      customerName: 'ت',
      carModel: 'x',
      tierId: 'tier-sedan',
      serviceIds: ['srv-roshuyi'],
      workerId: 'wrk-1',
      tip: 50000,
    });
  }

  it('ابطالِ قبض وضعیتش را «voided» می‌کند و علت را ذخیره می‌کند', () => {
    const { result } = renderHook(() => useCarwashStore());
    let rec: any = null;
    act(() => {
      rec = makeReceipt(result.current);
    });
    act(() => result.current.voidReceipt(rec.id, 'انصراف مشتری'));
    const r = result.current.receipts.find((x) => x.id === rec.id)!;
    expect(r.status).toBe('voided');
    expect(r.voidReason).toBe('انصراف مشتری');
  });

  it('ویرایشِ قبض مبلغ و انعام را به‌روز می‌کند', () => {
    const { result } = renderHook(() => useCarwashStore());
    let rec: any = null;
    act(() => {
      rec = makeReceipt(result.current);
    });
    act(() => result.current.updateReceipt({ ...rec, price: 500000, tip: 20000 }));
    const r = result.current.receipts.find((x) => x.id === rec.id)!;
    expect(r.price).toBe(500000);
    expect(r.tip).toBe(20000);
  });

  it('🟢 ابطال، نامِ کاربرِ ابطال‌کننده را برای رهگیری ثبت می‌کند', () => {
    const { result } = renderHook(() => useCarwashStore());
    let rec: any = null;
    act(() => {
      rec = makeReceipt(result.current);
    });
    act(() => result.current.voidReceipt(rec.id, 'اشتباه', 'ماهان'));
    const r = result.current.receipts.find((x) => x.id === rec.id)!;
    expect(r.status).toBe('voided');
    expect(r.voidedBy).toBe('ماهان');
  });
});

describe('کاربران و نقش‌ها', () => {
  it('کاربرِ پیش‌فرض یک ادمین است', () => {
    const { result } = renderHook(() => useCarwashStore());
    expect(result.current.users.some((u) => u.role === 'admin' && u.active)).toBe(true);
  });

  it('افزودنِ صندوقدار درست ثبت می‌شود', () => {
    const { result } = renderHook(() => useCarwashStore());
    act(() => result.current.addUser('ماهان', 'cashier', '1234'));
    const u = result.current.users.find((x) => x.name === 'ماهان')!;
    expect(u.role).toBe('cashier');
    expect(u.password).toBe('1234');
    expect(u.active).toBe(true);
  });

  it('🛡️ حذفِ آخرین ادمینِ فعال جلوگیری می‌شود (قفل‌نشدن)', () => {
    const { result } = renderHook(() => useCarwashStore());
    const admin = result.current.users.find((u) => u.role === 'admin')!;
    let ok: any = null;
    act(() => {
      ok = result.current.removeUser(admin.id);
    });
    expect(ok).toBe(false);
    expect(result.current.users.some((u) => u.role === 'admin' && u.active)).toBe(true);
  });

  it('🛡️ تبدیلِ آخرین ادمین به صندوقدار جلوگیری می‌شود', () => {
    const { result } = renderHook(() => useCarwashStore());
    const admin = result.current.users.find((u) => u.role === 'admin')!;
    let ok: any = null;
    act(() => {
      ok = result.current.setUserRole(admin.id, 'cashier');
    });
    expect(ok).toBe(false);
    expect(result.current.users.find((u) => u.id === admin.id)!.role).toBe('admin');
  });
});

describe('createSale و انبار', () => {
  it('موجودی را کم می‌کند و مبلغ را درست حساب می‌کند', () => {
    const { result } = renderHook(() => useCarwashStore());
    let sale: any = null;
    act(() => {
      sale = result.current.createSale({ items: [{ productId: 'prd-shampoo', qty: 2 }] });
    });
    expect(sale).not.toBeNull();
    expect(sale.total).toBe(1700000); // ۸۵۰۰۰۰ × ۲
    expect(result.current.products.find((p) => p.id === 'prd-shampoo')!.stock).toBe(10); // ۱۲ − ۲
  });

  it('اگر موجودی کافی نباشد، فروش رد می‌شود و موجودی دست‌نخورده می‌ماند', () => {
    const { result } = renderHook(() => useCarwashStore());
    let sale: any = 'x';
    act(() => {
      sale = result.current.createSale({ items: [{ productId: 'prd-shampoo', qty: 9999 }] });
    });
    expect(sale).toBeNull();
    expect(result.current.products.find((p) => p.id === 'prd-shampoo')!.stock).toBe(12);
  });

  it('ابطالِ فروش موجودی را برمی‌گرداند و ابطالِ دوباره اثر ندارد', () => {
    const { result } = renderHook(() => useCarwashStore());
    let sale: any = null;
    act(() => {
      sale = result.current.createSale({ items: [{ productId: 'prd-shampoo', qty: 3 }] });
    });
    expect(result.current.products.find((p) => p.id === 'prd-shampoo')!.stock).toBe(9);
    act(() => result.current.voidSale(sale.id, 'مرجوعی'));
    expect(result.current.products.find((p) => p.id === 'prd-shampoo')!.stock).toBe(12);
    // ابطالِ دوباره نباید موجودی را دوباره زیاد کند
    act(() => result.current.voidSale(sale.id, 'دوباره'));
    expect(result.current.products.find((p) => p.id === 'prd-shampoo')!.stock).toBe(12);
  });
});

describe('importData (اعتبارسنجیِ بکاپ)', () => {
  it('بکاپِ نامعتبر (بدونِ آرایه‌ی receipts) را رد می‌کند', () => {
    const { result } = renderHook(() => useCarwashStore());
    let ok: any = null;
    act(() => {
      ok = result.current.importData({ tiers: [], services: [] } as any);
    });
    expect(ok).toBe(false);
  });

  it('بکاپِ سالم را می‌پذیرد', () => {
    const { result } = renderHook(() => useCarwashStore());
    let ok: any = null;
    act(() => {
      ok = result.current.importData({
        tiers: [{ id: 't', name: 'x' }],
        services: [{ id: 's', name: 'x', prices: {} }],
        receipts: [],
        sales: [],
        workers: [],
        customers: [],
        products: [],
      } as any);
    });
    expect(ok).toBe(true);
  });
});
