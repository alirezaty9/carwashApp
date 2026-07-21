import { FormEvent, useMemo, useState } from 'react';
import { Minus, Plus, Package, ShoppingCart } from 'lucide-react';
import { Sale } from '../../types';
import { Store } from '../../data/store';
import { formatCurrencyToman, toEnglishDigits, toPersianDigits, tomanToRial } from '../../utils/format';
import { Field, inputClass, PrimaryButton, SectionCard } from '../common';

interface Props {
  store: Store;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onPrintSale: (sale: Sale) => void;
}

/**
 * صفحه‌ی فروشِ لوازم جانبی (جدا از قبضِ شست‌وشو).
 * برای هر کالا یک تعداد انتخاب می‌شود؛ موجودیِ هر کالا سقفِ تعداد است.
 */
export default function NewSale({ store, notify, onPrintSale }: Props) {
  const { products, createSale } = store;

  // نگاشتِ productId → تعدادِ انتخاب‌شده
  const [qty, setQty] = useState<Record<string, number>>({});
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState('');

  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);

  const setQtyFor = (id: string, next: number, max: number) => {
    const clamped = Math.min(Math.max(0, next), max);
    setQty((prev) => ({ ...prev, [id]: clamped }));
  };

  // اقلامِ انتخاب‌شده (تعدادِ بیشتر از صفر)
  const chosen = activeProducts
    .map((p) => ({ product: p, qty: qty[p.id] ?? 0 }))
    .filter((x) => x.qty > 0);

  const subtotal = chosen.reduce((sum, x) => sum + x.product.price * x.qty, 0);

  // تخفیف را کاربر به «تومان» وارد می‌کند؛ داخل سیستم ریال است (×۱۰)
  const discountToman = Math.max(0, Number(toEnglishDigits(discount).replace(/[^0-9]/g, '')) || 0);
  const discountValue = Math.min(tomanToRial(discountToman), subtotal);
  const total = subtotal - discountValue;

  const handleDiscountChange = (raw: string) => {
    const digits = toEnglishDigits(raw).replace(/[^0-9]/g, '');
    setDiscount(digits ? new Intl.NumberFormat('fa-IR').format(Number(digits)) : '');
  };

  const resetForm = () => {
    setQty({});
    setPhone('');
    setNotes('');
    setDiscount('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (chosen.length === 0) return notify('حداقل یک کالا را انتخاب کنید', 'error');

    const sale = createSale({
      items: chosen.map((x) => ({ productId: x.product.id, qty: x.qty })),
      customerPhone: phone || undefined,
      notes,
      discount: discountValue,
    });

    if (!sale) return notify('خطا در ثبت فروش؛ موجودی یا ورودی‌ها را بررسی کنید', 'error');

    notify(`فروش شماره ${toPersianDigits(sale.saleNumber)} ثبت و برای چاپ ارسال شد`, 'success');
    resetForm();
    onPrintSale(sale);
  };

  return (
    <SectionCard
      title="فروش لوازم جانبی"
      subtitle="کالا و تعداد را انتخاب کنید. موجودی با هر فروش کم می‌شود و قبضِ آن جدا از قبضِ شست‌وشوست."
    >
      {activeProducts.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg)] rounded-2xl border border-dashed border-[var(--border)]">
          <Package className="w-12 h-12 text-[var(--text-faint)] mx-auto mb-3" />
          <p className="text-xs font-bold text-[var(--text-muted)]">
            هنوز کالایی در انبار نیست. از پنل مدیریت → «لوازم و انبار» کالا اضافه کنید.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {/* ===== لیستِ کالاها ===== */}
          <Field label="۱) انتخاب کالا و تعداد" required>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeProducts.map((p) => {
                const q = qty[p.id] ?? 0;
                const out = p.stock <= 0;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between gap-2 p-3 rounded-xl border transition-all ${
                      q > 0
                        ? 'border-[var(--money-border)] bg-[var(--field-bg)]'
                        : 'border-[var(--border)] bg-[var(--field-bg)]'
                    } ${out ? 'opacity-60' : ''}`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--field-text)] truncate">{p.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-extrabold text-[var(--price)] font-mono px-2 py-0.5 rounded-md bg-[var(--price-soft)]">
                          {formatCurrencyToman(p.price)}
                        </span>
                        <span className={`text-[10px] font-bold ${out ? 'text-[var(--danger-text)]' : 'text-[var(--text-muted)]'}`}>
                          {out ? 'ناموجود' : `موجودی: ${toPersianDigits(p.stock)}`}
                        </span>
                      </div>
                    </div>

                    {/* شمارنده‌ی تعداد */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={out}
                        onClick={() => setQtyFor(p.id, q - 1, p.stock)}
                        className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        inputMode="numeric"
                        value={toPersianDigits(q)}
                        onChange={(e) => setQtyFor(p.id, Number(toEnglishDigits(e.target.value).replace(/[^0-9]/g, '')) || 0, p.stock)}
                        className="w-12 text-center bg-[var(--bg)] border border-[var(--border)] rounded-lg px-1 py-1.5 text-xs font-mono font-bold text-[var(--text)] outline-none focus:border-[var(--accent-strong)]"
                      />
                      <button
                        type="button"
                        disabled={out || q >= p.stock}
                        onClick={() => setQtyFor(p.id, q + 1, p.stock)}
                        className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Field>

          <div className="border-t border-[var(--border)]" />

          {/* ===== مشتری و تخفیف ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="۲) شماره‌ی مشتری" hint="(اختیاری)">
              <input
                inputMode="numeric"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${inputClass} text-right font-mono`}
              />
            </Field>
            <Field label="۳) تخفیف (تومان)" hint="(اختیاری، از مبلغ کل کم می‌شود)">
              <input
                inputMode="numeric"
                placeholder="۰"
                value={discount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className={`${inputClass} text-right font-mono tabular-nums`}
              />
            </Field>
          </div>

          <Field label="توضیحات" hint="(اختیاری)">
            <input
              placeholder="یادداشت..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </Field>

          {/* جمع و ثبت */}
          <div className="border-t border-[var(--border)] pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex flex-col gap-1.5">
              {discountValue > 0 && (
                <span className="text-[11px] font-semibold text-[var(--text-muted)] px-1">
                  جمع اقلام: {formatCurrencyToman(subtotal)}
                  <span className="text-[var(--danger-text)]"> — تخفیف: {formatCurrencyToman(discountValue)}</span>
                </span>
              )}
              <div className="cw-total rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-[var(--text-muted)]">مبلغ کل قابل پرداخت</span>
                <span className="text-2xl font-extrabold text-[var(--price)] font-mono leading-none">
                  {formatCurrencyToman(total)}
                </span>
              </div>
            </div>
            <PrimaryButton type="submit" className="w-full sm:w-auto px-8 py-3.5 text-base rounded-2xl">
              <ShoppingCart className="w-5 h-5" />
              ثبت و چاپ فاکتور
            </PrimaryButton>
          </div>
        </form>
      )}
    </SectionCard>
  );
}
