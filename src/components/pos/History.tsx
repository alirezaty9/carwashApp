import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Printer, Edit3, XCircle, CheckCircle, Search, FileText, Droplets, ShoppingCart, LucideIcon } from 'lucide-react';
import { Receipt, Sale, User } from '../../types';
import { Store } from '../../data/store';
import { formatCurrencyToman, rialToToman, toEnglishDigits, toPersianDigits, tomanToRial } from '../../utils/format';
import {
  CountBadge,
  DangerButton,
  EmptyState,
  Field,
  GhostButton,
  IconButton,
  Modal,
  ModalHeader,
  NumberInput,
  Pagination,
  PillTabs,
  PrimaryButton,
  SectionCard,
  StatusPill,
  inputClass,
  rowHoverClass,
  tableClass,
  tableWrapClass,
  tbodyClass,
  theadRowClass,
} from '../common';
import SalesHistory from '../admin/SalesHistory';

const PAGE_SIZE = 15;

interface Props {
  store: Store;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onPrint: (receipt: Receipt) => void;
  onPrintSale: (sale: Sale) => void;
  currentUser: User;
}

type Kind = 'receipts' | 'sales';
const KIND_TABS: { id: Kind; label: string; icon: LucideIcon }[] = [
  { id: 'receipts', label: 'قبض‌های شست‌وشو', icon: Droplets },
  { id: 'sales', label: 'فروش لوازم', icon: ShoppingCart },
];

export default function History({ store, notify, onPrint, onPrintSale, currentUser }: Props) {
  const { receipts, tiers, workers, voidReceipt, updateReceipt } = store;

  const [kind, setKind] = useState<Kind>('receipts');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'voided'>('all');
  const [tierFilter, setTierFilter] = useState('all');

  const [voiding, setVoiding] = useState<Receipt | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [editing, setEditing] = useState<Receipt | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const engTerm = toEnglishDigits(term);
    return receipts.filter((r) => {
      const matchesSearch =
        !term ||
        String(r.receiptNumber).includes(engTerm) ||
        toEnglishDigits(r.customerPhone).includes(engTerm) ||
        r.customerName.toLowerCase().includes(term) ||
        r.carModel.toLowerCase().includes(term) ||
        r.tierName.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesTier = tierFilter === 'all' || r.tierId === tierFilter;
      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [receipts, query, statusFilter, tierFilter]);

  // صفحه‌بندی: با هر تغییرِ فیلتر به صفحه‌ی ۱ برگرد تا خارج از محدوده نمانیم.
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [query, statusFilter, tierFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submitVoid = (e: FormEvent) => {
    e.preventDefault();
    if (!voiding) return;
    voidReceipt(voiding.id, voidReason, currentUser.name);
    setVoiding(null);
    setVoidReason('');
    notify('قبض باطل شد', 'success');
  };

  const submitEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    updateReceipt(editing);
    setEditing(null);
    notify('مشخصات قبض ویرایش شد', 'success');
  };

  // زیرتبِ «فروش لوازم» → کامپوننتِ مستقلِ تاریخچه‌ی فروش (با ابطالِ خودش)
  if (kind === 'sales') {
    return (
      <div className="flex flex-col gap-6">
        <PillTabs tabs={KIND_TABS} active={kind} onChange={setKind} />
        <SalesHistory store={store} notify={notify} onPrintSale={onPrintSale} currentUser={currentUser} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PillTabs tabs={KIND_TABS} active={kind} onChange={setKind} />
    <SectionCard
      title="تاریخچه‌ی قبوض شست‌وشو"
      subtitle="جستجو، چاپ مجدد، ویرایش و ابطال قبض‌های صادرشده."
      action={<CountBadge>مجموع: {toPersianDigits(receipts.length)} قبض</CountBadge>}
    >
      {/* نوار فیلترها — یک ردیف، بالای جدول */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-faint)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            placeholder="جستجو: شماره قبض، نام، تلفن، خودرو..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="جستجوی قبض"
            className={`${inputClass} pr-9`}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} aria-label="فیلترِ وضعیت" className={inputClass}>
          <option value="all">همه‌ی وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="voided">باطل‌شده</option>
        </select>
        <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} aria-label="فیلترِ تیپ" className={inputClass}>
          <option value="all">همه‌ی تیپ‌ها</option>
          {tiers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* جدول */}
      {filtered.length === 0 ? (
        <EmptyState icon={FileText}>
          هیچ قبضی با این جست‌وجو پیدا نشد. عبارتِ جست‌وجو یا فیلترها را عوض کنید.
        </EmptyState>
      ) : (
        <div className={tableWrapClass}>
          <table className={`${tableClass} whitespace-nowrap`}>
            <thead>
              <tr className={theadRowClass}>
                <th className="px-3 py-3">ش.قبض</th>
                <th className="px-3 py-3">مشتری</th>
                <th className="px-3 py-3">خودرو / تیپ</th>
                <th className="px-3 py-3">خدمات</th>
                <th className="px-3 py-3">کارگر</th>
                <th className="px-3 py-3">مبلغ</th>
                <th className="px-3 py-3">تاریخ</th>
                <th className="px-3 py-3">وضعیت</th>
                <th className="px-3 py-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className={`${tbodyClass} text-[var(--text-muted)]`}>
              {pageItems.map((r) => {
                const voided = r.status === 'voided';
                return (
                  <tr key={r.id} className={`${rowHoverClass} ${voided ? 'bg-[var(--danger-soft)]' : ''}`}>
                    <td className="px-3 py-3 tabular-nums font-semibold text-[var(--text)]">
                      {toPersianDigits(r.receiptNumber)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-[var(--text)]">{r.customerName || '—'}</div>
                      <div className="text-[11px] tabular-nums text-[var(--text-faint)]">{toPersianDigits(r.customerPhone)}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-[var(--text)]">{r.carModel || '—'}</div>
                      <div className="text-[11px] text-[var(--text-faint)]">{r.tierName}</div>
                    </td>
                    <td className="px-3 py-3 max-w-[180px] whitespace-normal">
                      <div className="flex flex-wrap gap-1">
                        {r.services.map((s) => (
                          <span
                            key={s.id}
                            className="bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--text-muted)] text-[11px] px-1.5 py-0.5 rounded-lg"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">{r.workerName || '—'}</td>
                    <td className="px-3 py-3 tabular-nums">
                      <span className={voided ? 'line-through text-[var(--text-faint)]' : 'font-semibold text-[var(--text)]'}>
                        {formatCurrencyToman(r.price)}
                      </span>
                      {r.tip ? (
                        <div className="text-[11px] text-[var(--ok-text)]">+ انعام {formatCurrencyToman(r.tip)}</div>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-[11px]">{r.jalaliDate}</td>
                    <td className="px-3 py-3">
                      {voided ? (
                        <div className="flex flex-col gap-1">
                          <StatusPill tone="danger" icon={XCircle}>
                            باطل
                          </StatusPill>
                          {r.voidedBy && <span className="text-[11px] text-[var(--text-faint)]">توسط {r.voidedBy}</span>}
                        </div>
                      ) : (
                        <StatusPill tone="ok" icon={CheckCircle}>
                          فعال
                        </StatusPill>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        <IconButton tone="accent" title="چاپ مجدد" aria-label="چاپ مجدد" onClick={() => onPrint(r)}>
                          <Printer className="w-4 h-4" />
                        </IconButton>
                        <IconButton title="ویرایش" aria-label="ویرایش" onClick={() => setEditing(r)}>
                          <Edit3 className="w-4 h-4" />
                        </IconButton>
                        {!voided && (
                          <IconButton tone="danger" title="ابطال" aria-label="ابطال" onClick={() => setVoiding(r)}>
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
        <ModalHeader title={`ابطال قبض ${voiding ? toPersianDigits(voiding.receiptNumber) : ''}`} onClose={() => setVoiding(null)} />
        <form onSubmit={submitVoid} className="flex flex-col gap-4">
          <Field label="علت ابطال" required>
            <input required value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="مثال: انصراف مشتری" className={inputClass} />
          </Field>
          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
            <GhostButton type="button" onClick={() => setVoiding(null)}>انصراف</GhostButton>
            <DangerButton type="submit">تایید ابطال</DangerButton>
          </div>
        </form>
      </Modal>

      {/* مودالِ ویرایش */}
      <Modal open={!!editing} onClose={() => setEditing(null)} maxWidth="max-w-lg">
        {editing && (
          <>
            <ModalHeader title={`ویرایش قبض ${toPersianDigits(editing.receiptNumber)}`} onClose={() => setEditing(null)} />
            <form onSubmit={submitEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="نام مشتری">
                <input value={editing.customerName} onChange={(e) => setEditing({ ...editing, customerName: e.target.value })} className={inputClass} />
              </Field>
              <Field label="شماره‌ی مشتری">
                <input value={editing.customerPhone} onChange={(e) => setEditing({ ...editing, customerPhone: e.target.value })} className={`${inputClass} tabular-nums`} />
              </Field>
              <Field label="نوع/مدل ماشین">
                <input value={editing.carModel} onChange={(e) => setEditing({ ...editing, carModel: e.target.value })} className={inputClass} />
              </Field>
              <Field label="کارگر">
                <select
                  value={editing.workerId || ''}
                  onChange={(e) => {
                    const w = workers.find((x) => x.id === e.target.value);
                    setEditing({ ...editing, workerId: w?.id, workerName: w?.name });
                  }}
                  className={inputClass}
                >
                  <option value="">— مشخص نشده —</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="مبلغ (تومان)">
                <NumberInput
                  value={rialToToman(editing.price)}
                  onValueChange={(toman) => setEditing({ ...editing, price: tomanToRial(toman) })}
                  className={`${inputClass} tabular-nums`}
                />
              </Field>
              <Field label="انعام کارگر (تومان)">
                <NumberInput
                  value={rialToToman(editing.tip ?? 0)}
                  onValueChange={(toman) => setEditing({ ...editing, tip: tomanToRial(toman) || undefined })}
                  className={`${inputClass} tabular-nums`}
                />
              </Field>
              <Field label="توضیحات">
                <input value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className={inputClass} />
              </Field>
              <div className="sm:col-span-2 flex justify-end gap-2 border-t border-[var(--border)] pt-3">
                <GhostButton type="button" onClick={() => setEditing(null)}>انصراف</GhostButton>
                <PrimaryButton type="submit">ثبت تغییرات</PrimaryButton>
              </div>
            </form>
          </>
        )}
      </Modal>
    </SectionCard>
    </div>
  );
}
