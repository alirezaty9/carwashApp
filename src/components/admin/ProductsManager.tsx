import { useState } from 'react';
import { Plus, Trash2, Minus, Package, Eye, EyeOff } from 'lucide-react';
import { Store } from '../../data/store';
import { rialToToman, toPersianDigits, tomanToRial } from '../../utils/format';
import { SectionCard, inputClass, PrimaryButton } from '../common';

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
      action={
        <span className="bg-[var(--surface-2)] text-[var(--text)] text-xs px-3.5 py-1.5 rounded-lg font-bold border border-[var(--border)]">
          {toPersianDigits(products.length)} کالا
        </span>
      }
    >
      {products.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg)] rounded-2xl border border-dashed border-[var(--border)]">
          <Package className="w-12 h-12 text-[var(--text-faint)] mx-auto mb-3" />
          <p className="text-xs font-bold text-[var(--text-muted)]">هنوز کالایی ثبت نشده است.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold">
                <th className="px-3 py-3 min-w-[200px]">نام کالا</th>
                <th className="px-3 py-3 min-w-[130px]">قیمت (تومان)</th>
                <th className="px-3 py-3 min-w-[180px] text-center">موجودی</th>
                <th className="px-3 py-3 text-center">نمایش در فروش</th>
                <th className="px-2 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {products.map((p) => (
                <tr key={p.id} className={`hover:bg-[var(--surface-2)] ${!p.active ? 'opacity-60' : ''}`}>
                  <td className="px-3 py-2">
                    <input
                      value={p.name}
                      onChange={(e) => renameProduct(p.id, e.target.value)}
                      className="bg-[var(--bg)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs font-bold text-[var(--text)] w-full outline-none focus:border-[var(--accent-strong)]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={rialToToman(p.price)}
                      onChange={(e) => setProductPrice(p.id, tomanToRial(Number(e.target.value)))}
                      className="bg-[var(--bg)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[var(--text)] w-full outline-none focus:border-[var(--accent-strong)]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => adjustStock(p.id, -1)}
                        title="کاهش یک عدد"
                        className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={p.stock}
                        onChange={(e) => setProductStock(p.id, Number(e.target.value))}
                        className="w-16 text-center bg-[var(--bg)] border border-[var(--border)] rounded px-1 py-1.5 text-xs font-mono font-bold text-[var(--text)] outline-none focus:border-[var(--accent-strong)]"
                      />
                      <button
                        onClick={() => adjustStock(p.id, 1)}
                        title="افزایش یک عدد"
                        className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => adjustStock(p.id, 10)}
                        title="شارژ ۱۰ عددی"
                        className="px-2 py-1.5 rounded-lg border border-[var(--money-border)] text-[var(--money-text)] text-[10px] font-bold hover:bg-[var(--surface-2)] cursor-pointer"
                      >
                        +۱۰
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => toggleProduct(p.id)}
                      title={p.active ? 'غیرفعال‌کردن (پنهان از فروش)' : 'فعال‌کردن'}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                        p.active
                          ? 'text-[var(--money-text)] bg-[var(--money-soft)] border-[var(--money-border)]'
                          : 'text-[var(--text-faint)] bg-[var(--surface-2)] border-[var(--border)]'
                      }`}
                    >
                      {p.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {p.active ? 'فعال' : 'غیرفعال'}
                    </button>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`حذف کالای «${p.name}»؟`)) {
                          removeProduct(p.id);
                          notify('کالا حذف شد', 'success');
                        }
                      }}
                      className="p-1.5 text-[var(--danger-text)] hover:bg-[var(--surface-2)] rounded cursor-pointer"
                      title="حذف کالا"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* افزودن کالا */}
      <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1.5">افزودن کالای جدید</label>
          <input
            value={newProduct}
            onChange={(e) => setNewProduct(e.target.value)}
            placeholder="مثال: مایع موتورشویی"
            className={`${inputClass} py-2`}
          />
        </div>
        <PrimaryButton type="button" onClick={handleAdd} className="shrink-0">
          <Plus className="w-4 h-4" /> کالا
        </PrimaryButton>
      </div>
    </SectionCard>
  );
}
