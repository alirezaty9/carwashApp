import { useState } from 'react';
import { Plus, Trash2, Minus, Package, Eye, EyeOff } from 'lucide-react';
import { Store } from '../../data/store';
import { rialToToman, toPersianDigits, tomanToRial } from '../../utils/format';
import {
  CountBadge,
  EmptyState,
  IconButton,
  PrimaryButton,
  SectionCard,
  StatusPill,
  cellInputClass,
  inputClass,
  NumberInput,
  rowHoverClass,
  tableClass,
  tableWrapClass,
  tbodyClass,
  theadRowClass,
} from '../common';

/**
 * مدیریتِ انبارِ لوازم جانبی: افزودن کالا، تعیینِ قیمت (تومان)، و شارژ/کاهشِ موجودی.
 * موجودی اینجا «دستی» تنظیم می‌شود؛ کم‌شدنِ خودکار هنگام فروش در صفحه‌ی فروش انجام می‌شود.
 */
export default function ProductsManager({
  store,
  notify,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const { products, addProduct, renameProduct, setProductPrice, setProductStock, adjustStock, toggleProduct, removeProduct } = store;

  const [newProduct, setNewProduct] = useState('');

  const handleAdd = () => {
    if (!newProduct.trim()) return notify('نام کالا را وارد کنید', 'error');
    addProduct(newProduct);
    setNewProduct('');
    notify('کالای جدید اضافه شد', 'success');
  };

  return (
    <SectionCard
      title="لوازم و انبار"
      subtitle="قیمتِ فروش (تومان) و موجودیِ هر کالا را تعیین کنید. برای شارژِ انبار از دکمه‌ی «+۱۰» یا ویرایشِ مستقیمِ عدد استفاده کنید."
      action={<CountBadge>{toPersianDigits(products.length)} کالا</CountBadge>}
    >
      {products.length === 0 ? (
        <EmptyState icon={Package}>
          هنوز کالایی ثبت نشده است. از کادرِ پایینِ همین صفحه اولین کالا را اضافه کنید.
        </EmptyState>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr className={theadRowClass}>
                <th className="px-3 py-3 min-w-[200px]">نام کالا</th>
                <th className="px-3 py-3 min-w-[130px]">قیمت (تومان)</th>
                <th className="px-3 py-3 min-w-[190px] text-center">موجودی</th>
                <th className="px-3 py-3 text-center">نمایش در فروش</th>
                <th className="px-2 py-3 w-10" />
              </tr>
            </thead>
            <tbody className={tbodyClass}>
              {products.map((p) => (
                <tr key={p.id} className={`${rowHoverClass} ${!p.active ? 'opacity-60' : ''}`}>
                  <td className="px-3 py-2">
                    <input
                      value={p.name}
                      onChange={(e) => renameProduct(p.id, e.target.value)}
                      aria-label="نام کالا"
                      className={cellInputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <NumberInput
                      value={rialToToman(p.price)}
                      onValueChange={(toman) => setProductPrice(p.id, tomanToRial(toman))}
                      placeholder="۰"
                      aria-label="قیمتِ کالا به تومان"
                      className={`${cellInputClass} tabular-nums`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <IconButton
                        onClick={() => adjustStock(p.id, -1)}
                        title="کاهش یک عدد"
                        aria-label="کاهش یک عدد"
                        className="border border-[var(--border)]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </IconButton>
                      <NumberInput
                        thousands={false}
                        value={p.stock}
                        onValueChange={(n) => setProductStock(p.id, n)}
                        placeholder="۰"
                        aria-label="موجودیِ کالا"
                        className={`${cellInputClass} w-16 text-center tabular-nums`}
                      />
                      <IconButton
                        onClick={() => adjustStock(p.id, 1)}
                        title="افزایش یک عدد"
                        aria-label="افزایش یک عدد"
                        className="border border-[var(--border)]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </IconButton>
                      <button
                        onClick={() => adjustStock(p.id, 10)}
                        title="شارژ ۱۰ عددی"
                        className="px-2.5 py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] text-[11px] font-semibold hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer transition-colors"
                      >
                        +۱۰
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => toggleProduct(p.id)}
                      title={p.active ? 'غیرفعال‌کردن (پنهان از فروش)' : 'فعال‌کردن'}
                      className="cursor-pointer"
                    >
                      <StatusPill tone={p.active ? 'ok' : 'neutral'} icon={p.active ? Eye : EyeOff}>
                        {p.active ? 'فعال' : 'غیرفعال'}
                      </StatusPill>
                    </button>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <IconButton
                      tone="danger"
                      onClick={() => {
                        if (confirm(`حذف کالای «${p.name}»؟`)) {
                          removeProduct(p.id);
                          notify('کالا حذف شد', 'success');
                        }
                      }}
                      title="حذف کالا"
                      aria-label="حذف کالا"
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* افزودن کالا */}
      <div className="border-t border-[var(--border)] pt-5 flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">افزودن کالای جدید</label>
          <input
            value={newProduct}
            onChange={(e) => setNewProduct(e.target.value)}
            placeholder="مثال: مایع موتورشویی"
            className={inputClass}
          />
        </div>
        <PrimaryButton type="button" onClick={handleAdd} className="shrink-0">
          <Plus className="w-4 h-4" /> کالا
        </PrimaryButton>
      </div>
    </SectionCard>
  );
}
