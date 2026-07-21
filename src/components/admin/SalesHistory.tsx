import { FormEvent, useMemo, useState } from 'react';
import { Printer, XCircle, CheckCircle, Search, ShoppingCart } from 'lucide-react';
import { Sale } from '../../types';
import { Store } from '../../data/store';
import { formatCurrencyToman, toEnglishDigits, toPersianDigits } from '../../utils/format';
import { Field, GhostButton, inputClass, Modal, ModalHeader, SectionCard } from '../common';

interface Props {
  store: Store;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onPrintSale: (sale: Sale) => void;
}

/** تاریخچه‌ی فروشِ لوازم: جستجو، چاپ مجدد و ابطال (که موجودی را برمی‌گرداند). */
export default function SalesHistory({ store, notify, onPrintSale }: Props) {
  const { sales, voidSale } = store;

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'voided'>('all');
  const [voiding, setVoiding] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const engTerm = toEnglishDigits(term);
    return sales.filter((s) => {
      const matchesSearch =
        !term ||
        String(s.saleNumber).includes(engTerm) ||
        (s.customerPhone ? toEnglishDigits(s.customerPhone).includes(engTerm) : false) ||
        s.items.some((it) => it.name.toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sales, query, statusFilter]);

  const submitVoid = (e: FormEvent) => {
    e.preventDefault();
    if (!voiding) return;
    voidSale(voiding.id, voidReason);
    setVoiding(null);
    setVoidReason('');
    notify('فروش باطل شد و موجودی به انبار بازگشت', 'success');
  };

  return (
    <SectionCard
      title="تاریخچه‌ی فروش لوازم"
      subtitle="جستجو، چاپ مجدد و ابطال. با ابطالِ فروش، تعدادِ کالاها دوباره به انبار اضافه می‌شود."
      action={
        <span className="bg-[var(--surface-2)] text-[var(--text)] text-xs px-3.5 py-1.5 rounded-lg font-bold border border-[var(--border)]">
          مجموع: {toPersianDigits(sales.length)} فروش
        </span>
      }
    >
      {/* فیلترها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)]">
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-faint)] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="جستجو: شماره فاکتور، کالا، تلفن..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputClass} pr-9 py-2`}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className={`${inputClass} py-2`}>
          <option value="all">همه‌ی وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="voided">باطل‌شده</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg)] rounded-2xl border border-dashed border-[var(--border)]">
          <ShoppingCart className="w-12 h-12 text-[var(--text-faint)] mx-auto mb-3" />
          <p className="text-xs font-bold text-[var(--text-muted)]">هیچ فروشی یافت نشد.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
          <table className="w-full text-right border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--bg)] text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
                <th className="px-3 py-3">ش.فاکتور</th>
                <th className="px-3 py-3">اقلام</th>
                <th className="px-3 py-3">تلفن</th>
                <th className="px-3 py-3">مبلغ</th>
                <th className="px-3 py-3">تاریخ</th>
                <th className="px-3 py-3">وضعیت</th>
                <th className="px-3 py-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-semibold text-[var(--text-muted)]">
              {filtered.map((s) => {
                const voided = s.status === 'voided';
                return (
                  <tr key={s.id} className={`hover:bg-[var(--surface-2)] transition-all ${voided ? 'bg-[var(--danger-soft)] text-[var(--text-faint)]' : ''}`}>
                    <td className="px-3 py-3 font-mono text-[var(--text)] font-bold">{toPersianDigits(s.saleNumber)}</td>
                    <td className="px-3 py-3 max-w-[220px] whitespace-normal">
                      <div className="flex flex-wrap gap-1">
                        {s.items.map((it) => (
                          <span key={it.productId} className="bg-[var(--money-soft)] border border-[var(--money-border)] text-[var(--money-text)] text-[9px] px-1.5 py-0.5 rounded">
                            {it.name} ×{toPersianDigits(it.qty)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-[10px] text-[var(--text-muted)]">
                      {s.customerPhone ? toPersianDigits(s.customerPhone) : '—'}
                    </td>
                    <td className={`px-3 py-3 font-bold font-mono ${voided ? 'line-through text-[var(--text-faint)]' : 'text-[var(--price)]'}`}>
                      {formatCurrencyToman(s.total)}
                    </td>
                    <td className="px-3 py-3 text-[var(--text-muted)] text-[11px]">{s.jalaliDate}</td>
                    <td className="px-3 py-3">
                      {voided ? (
                        <span className="inline-flex items-center gap-1 text-[var(--danger-text)] bg-[var(--danger-soft)] border border-[var(--danger-border)] px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <XCircle className="w-3 h-3" /> باطل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[var(--money-text)] bg-[var(--money-soft)] border border-[var(--money-border)] px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" /> فعال
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button title="چاپ مجدد" onClick={() => onPrintSale(s)} className="p-1.5 text-[var(--accent-text)] hover:bg-[var(--surface-2)] rounded-lg cursor-pointer">
                          <Printer className="w-4 h-4" />
                        </button>
                        {!voided && (
                          <button title="ابطال" onClick={() => setVoiding(s)} className="p-1.5 text-[var(--danger-text)] hover:bg-[var(--surface-2)] rounded-lg cursor-pointer">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* مودالِ ابطال */}
      <Modal open={!!voiding} onClose={() => setVoiding(null)}>
        <ModalHeader title={`ابطال فاکتور ${voiding ? toPersianDigits(voiding.saleNumber) : ''}`} onClose={() => setVoiding(null)} />
        <form onSubmit={submitVoid} className="flex flex-col gap-4">
          <div className="bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-text)] text-[11px] font-bold rounded-xl p-3 leading-relaxed">
            با ابطال، موجودیِ کالاهای این فاکتور دوباره به انبار برمی‌گردد.
          </div>
          <Field label="علت ابطال" required>
            <input required value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="مثال: مرجوعی مشتری" className={inputClass} />
          </Field>
          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
            <GhostButton type="button" onClick={() => setVoiding(null)}>انصراف</GhostButton>
            <button type="submit" className="bg-[var(--danger-strong)] hover:bg-[var(--danger-strong)] text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer">
              تایید ابطال
            </button>
          </div>
        </form>
      </Modal>
    </SectionCard>
  );
}
