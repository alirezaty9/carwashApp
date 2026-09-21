import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Printer, XCircle, CheckCircle, Search, ShoppingCart } from 'lucide-react';
import { Sale, User } from '../../types';
import { Store } from '../../data/store';
import { formatCurrencyToman, toEnglishDigits, toPersianDigits } from '../../utils/format';
import {
  Callout,
  CountBadge,
  DangerButton,
  EmptyState,
  Field,
  GhostButton,
  IconButton,
  Modal,
  ModalHeader,
  Pagination,
  SectionCard,
  StatusPill,
  inputClass,
  rowHoverClass,
  tableClass,
  tableWrapClass,
  tbodyClass,
  theadRowClass,
} from '../common';

const PAGE_SIZE = 15;

interface Props {
  store: Store;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onPrintSale: (sale: Sale) => void;
  currentUser: User;
}

/** تاریخچه‌ی فروشِ لوازم: جستجو، چاپ مجدد و ابطال (که موجودی را برمی‌گرداند). */
export default function SalesHistory({ store, notify, onPrintSale, currentUser }: Props) {
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

  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [query, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submitVoid = (e: FormEvent) => {
    e.preventDefault();
    if (!voiding) return;
    voidSale(voiding.id, voidReason, currentUser.name);
    setVoiding(null);
    setVoidReason('');
    notify('فروش باطل شد و موجودی به انبار بازگشت', 'success');
  };

  return (
    <SectionCard
      title="تاریخچه‌ی فروش لوازم"
      subtitle="جستجو، چاپ مجدد و ابطال. با ابطالِ فروش، تعدادِ کالاها دوباره به انبار اضافه می‌شود."
      action={<CountBadge>مجموع: {toPersianDigits(sales.length)} فروش</CountBadge>}
    >
      {/* فیلترها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-faint)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            placeholder="جستجو: شماره فاکتور، کالا، تلفن..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="جستجوی فاکتور"
            className={`${inputClass} pr-9`}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} aria-label="فیلترِ وضعیت" className={inputClass}>
          <option value="all">همه‌ی وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="voided">باطل‌شده</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingCart}>
          هیچ فاکتوری با این جست‌وجو پیدا نشد. عبارتِ جست‌وجو یا فیلترِ وضعیت را عوض کنید.
        </EmptyState>
      ) : (
        <div className={tableWrapClass}>
          <table className={`${tableClass} whitespace-nowrap`}>
            <thead>
              <tr className={theadRowClass}>
                <th className="px-3 py-3">ش.فاکتور</th>
                <th className="px-3 py-3">اقلام</th>
                <th className="px-3 py-3">تلفن</th>
                <th className="px-3 py-3">مبلغ</th>
                <th className="px-3 py-3">تاریخ</th>
                <th className="px-3 py-3">وضعیت</th>
                <th className="px-3 py-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className={`${tbodyClass} text-[var(--text-muted)]`}>
              {pageItems.map((s) => {
                const voided = s.status === 'voided';
                return (
                  <tr key={s.id} className={`${rowHoverClass} ${voided ? 'bg-[var(--danger-soft)]' : ''}`}>
                    <td className="px-3 py-3 tabular-nums font-semibold text-[var(--text)]">
                      {toPersianDigits(s.saleNumber)}
                    </td>
                    <td className="px-3 py-3 max-w-[220px] whitespace-normal">
                      <div className="flex flex-wrap gap-1">
                        {s.items.map((it) => (
                          <span
                            key={it.productId}
                            className="bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--text-muted)] text-[11px] px-1.5 py-0.5 rounded-lg"
                          >
                            {it.name} ×{toPersianDigits(it.qty)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-[11px]">
                      {s.customerPhone ? toPersianDigits(s.customerPhone) : '—'}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      <span className={voided ? 'line-through text-[var(--text-faint)]' : 'font-semibold text-[var(--text)]'}>
                        {formatCurrencyToman(s.total)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[11px]">{s.jalaliDate}</td>
                    <td className="px-3 py-3">
                      {voided ? (
                        <div className="flex flex-col gap-1">
                          <StatusPill tone="danger" icon={XCircle}>
                            باطل
                          </StatusPill>
                          {s.voidedBy && <span className="text-[11px] text-[var(--text-faint)]">توسط {s.voidedBy}</span>}
                        </div>
                      ) : (
                        <StatusPill tone="ok" icon={CheckCircle}>
                          فعال
                        </StatusPill>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        <IconButton tone="accent" title="چاپ مجدد" aria-label="چاپ مجدد" onClick={() => onPrintSale(s)}>
                          <Printer className="w-4 h-4" />
                        </IconButton>
                        {!voided && (
                          <IconButton tone="danger" title="ابطال" aria-label="ابطال" onClick={() => setVoiding(s)}>
                            <XCircle className="w-4 h-4" />
                          </IconButton>
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

      <Pagination page={page} pageCount={pageCount} onPage={setPage} />

      {/* مودالِ ابطال */}
      <Modal open={!!voiding} onClose={() => setVoiding(null)}>
        <ModalHeader title={`ابطال فاکتور ${voiding ? toPersianDigits(voiding.saleNumber) : ''}`} onClose={() => setVoiding(null)} />
        <form onSubmit={submitVoid} className="flex flex-col gap-4">
          <Callout tone="accent">با ابطال، موجودیِ کالاهای این فاکتور دوباره به انبار برمی‌گردد.</Callout>
          <Field label="علت ابطال" required>
            <input required value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="مثال: مرجوعی مشتری" className={inputClass} />
          </Field>
          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
            <GhostButton type="button" onClick={() => setVoiding(null)}>انصراف</GhostButton>
            <DangerButton type="submit">تایید ابطال</DangerButton>
          </div>
        </form>
      </Modal>
    </SectionCard>
  );
}
