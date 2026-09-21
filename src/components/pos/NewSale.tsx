import { FormEvent, useMemo, useRef, useState } from 'react';
import { Minus, Plus, Package, ShoppingCart, Check } from 'lucide-react';
import { Sale } from '../../types';
import { Store } from '../../data/store';
import { formatCurrencyToman, toEnglishDigits, toPersianDigits, tomanToRial } from '../../utils/format';
import { EmptyState, Field, IconButton, inputClass, NumberInput, PrimaryButton, SectionCard } from '../common';

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
  const [discount, setDiscount] = useState(0);

  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);

  const setQtyFor = (id: string, next: number, max: number) => {
    const clamped = Math.min(Math.max(0, next), max);
    setQty((prev) => ({ ...prev, [id]: clamped }));
  };

  // کلیک روی کارت: انتخاب/لغوِ کالا. با انتخاب، تعدادِ پیش‌فرض ۱ می‌شود.
  const toggleProduct = (id: string, stock: number) => {
    if (stock <= 0) return;
    setQty((prev) => ({ ...prev, [id]: (prev[id] ?? 0) > 0 ? 0 : 1 }));
  };

  // اقلامِ انتخاب‌شده (تعدادِ بیشتر از صفر)
  const chosen = activeProducts
    .map((p) => ({ product: p, qty: qty[p.id] ?? 0 }))
    .filter((x) => x.qty > 0);

  const subtotal = chosen.reduce((sum, x) => sum + x.product.price * x.qty, 0);

  // تخفیف را کاربر به «تومان» وارد می‌کند؛ داخل سیستم ریال است (×۱۰)
  const discountValue = Math.min(tomanToRial(discount), subtotal);
  const total = subtotal - discountValue;

  const resetForm = () => {
    setQty({});
    setPhone('');
    setNotes('');
    setDiscount(0);
  };

  // قفلِ ضدِ دوبار-کلیک (مثلِ صدورِ قبض): جلوی ثبتِ دوبارهٔ اتفاقیِ فروش را می‌گیرد.
  const submittingRef = useRef(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (chosen.length === 0) return notify('حداقل یک کالا را انتخاب کنید', 'error');

    const sale = createSale({
      items: chosen.map((x) => ({ productId: x.product.id, qty: x.qty })),
      customerPhone: phone || undefined,
      notes,
      discount: discountValue,
    });

    if (!sale) return notify('خطا در ثبت فروش؛ موجودی یا ورودی‌ها را بررسی کنید', 'error');

    submittingRef.current = true;
    window.setTimeout(() => {
      submittingRef.current = false;
    }, 700);

    // این پیام فقط ثبتِ فروش را تأیید می‌کند؛ نتیجه‌ی چاپ جداگانه اعلام می‌شود.
    const noPrint = store.config.printMode === 'off';
    notify(
      `فروش شماره ${toPersianDigits(sale.saleNumber)} ${noPrint ? 'ثبت شد (چاپ غیرفعال)' : 'ثبت شد'}`,
      'success',
    );
    resetForm();
    onPrintSale(sale);
  };

  return (
    <SectionCard
      title="فروش لوازم جانبی"
      subtitle="کالا و تعداد را انتخاب کنید. موجودی با هر فروش کم می‌شود و قبضِ آن جدا از قبضِ شست‌وشوست."
    >
      {activeProducts.length === 0 ? (
        <EmptyState icon={Package}>
          هنوز کالایی در انبار نیست. از پنل مدیریت ← «انبار لوازم» کالا اضافه کنید.
        </EmptyState>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* ===== لیستِ کالاها ===== */}
          <Field label="۱) انتخاب کالا" required hint="(روی کالا بزنید تا انتخاب شود؛ تعداد پیش‌فرض ۱)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeProducts.map((p) => {
                const q = qty[p.id] ?? 0;
                const selected = q > 0;
                const out = p.stock <= 0;
                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={out ? -1 : 0}
                    onClick={() => toggleProduct(p.id, p.stock)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !out) {
                        e.preventDefault();
                        toggleProduct(p.id, p.stock);
                      }
                    }}
                    className={`flex items-center justify-between gap-2 p-3.5 rounded-xl border transition-colors outline-none ${
                      out
                        ? 'opacity-55 cursor-not-allowed border-[var(--border)] bg-[var(--field-bg)]'
                        : selected
                          ? 'cursor-pointer border-[var(--accent)] bg-[var(--accent-soft)]'
                          : 'cursor-pointer border-[var(--border)] bg-[var(--field-bg)] hover:border-[var(--field-hover-border)]'
                    }`}
                  >
                    {/* تیکِ انتخاب + مشخصات */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                          selected
                            ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--on-accent)]'
                            : 'border-[var(--border-strong)] text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                      <div className="min-w-0">
                        <div className={`text-[13px] truncate ${selected ? 'font-semibold text-[var(--text)]' : 'font-medium text-[var(--text-muted)]'}`}>
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-[var(--text)] tabular-nums px-2 py-0.5 rounded-lg bg-[var(--chip-bg)] border border-[var(--chip-border)]">
                            {formatCurrencyToman(p.price)}
                          </span>
                          <span className={`text-[11px] ${out ? 'font-semibold text-[var(--danger-text)]' : 'text-[var(--text-muted)]'}`}>
                            {out ? 'ناموجود' : `موجودی: ${toPersianDigits(p.stock)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* شمارنده‌ی تعداد — فقط وقتی انتخاب شده؛ کلیکش کارت را لغو نکند */}
                    {selected && (
                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          type="button"
                          onClick={() => setQtyFor(p.id, q - 1, p.stock)}
                          title="کمتر"
                          aria-label="کمتر"
                          className="border border-[var(--border)] bg-[var(--surface)]"
                        >
                          <Minus className="w-4 h-4" />
                        </IconButton>
                        <input
                          inputMode="numeric"
                          aria-label={`تعدادِ ${p.name}`}
                          value={toPersianDigits(q)}
                          onChange={(e) => setQtyFor(p.id, Number(toEnglishDigits(e.target.value).replace(/[^0-9]/g, '')) || 0, p.stock)}
                          className="w-11 text-center bg-[var(--surface)] border border-[var(--border)] rounded-lg px-1 py-2 text-[13px] font-semibold text-[var(--text)] outline-none focus:border-[var(--accent)]"
                        />
                        <IconButton
                          type="button"
                          disabled={q >= p.stock}
                          onClick={() => setQtyFor(p.id, q + 1, p.stock)}
                          title="بیشتر"
                          aria-label="بیشتر"
                          className="border border-[var(--border)] bg-[var(--surface)]"
                        >
                          <Plus className="w-4 h-4" />
                        </IconButton>
                      </div>
                    )}
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
                className={`${inputClass} tabular-nums`}
              />
            </Field>
            <Field label="۳) تخفیف (تومان)" hint="(اختیاری، از مبلغ کل کم می‌شود)">
              <NumberInput
                placeholder="۰"
                value={discount}
                onValueChange={setDiscount}
                className={`${inputClass} tabular-nums`}
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

          {/* جمع و ثبت — همان نوارِ پایانیِ صفحه‌ی قبضِ شست‌وشو، تا دو صفحه‌ی
              صندوق دقیقاً یک‌شکل تمام شوند */}
          <div className="border-t border-[var(--border)] pt-5 flex flex-col gap-2.5">
            {discountValue > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] px-1">
                <span className="tabular-nums">جمع اقلام: {formatCurrencyToman(subtotal)}</span>
                <span className="tabular-nums text-[var(--danger-text)]">
                  تخفیف: {formatCurrencyToman(discountValue)}
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="cw-total flex-1 px-5 py-3.5 flex items-center justify-between gap-4">
                <span className="text-[13px] font-medium text-[var(--text-muted)]">مبلغ کل قابل پرداخت</span>
                <span className="cw-amount text-[28px] leading-none">{formatCurrencyToman(total)}</span>
              </div>
              <PrimaryButton type="submit" className="shrink-0 px-8 !py-4 text-base">
                <ShoppingCart className="w-5 h-5" />
                ثبت و چاپ فاکتور
              </PrimaryButton>
            </div>
          </div>
        </form>
      )}
    </SectionCard>
  );
}
