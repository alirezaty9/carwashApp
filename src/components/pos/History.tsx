import { FormEvent, useMemo, useState } from 'react';
import { Printer, Edit3, XCircle, CheckCircle, Search, FileText } from 'lucide-react';
import { Receipt } from '../../types';
import { Store } from '../../data/store';
import { formatCurrencyToman, toEnglishDigits, toPersianDigits } from '../../utils/jalali';
import { Field, GhostButton, inputClass, Modal, ModalHeader, PrimaryButton, SectionCard } from '../common';

interface Props {
  store: Store;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onPrint: (receipt: Receipt) => void;
}

export default function History({ store, notify, onPrint }: Props) {
  const { receipts, tiers, workers, voidReceipt, updateReceipt } = store;

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

  const submitVoid = (e: FormEvent) => {
    e.preventDefault();
    if (!voiding) return;
    voidReceipt(voiding.id, voidReason);
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

  return (
    <SectionCard
      title="تاریخچه‌ی قبوض"
      subtitle="جستجو، چاپ مجدد، ویرایش و ابطال قبض‌های صادرشده."
      action={
        <span className="bg-[var(--surface-2)] text-[var(--text)] text-xs px-3.5 py-1.5 rounded-lg font-bold border border-[var(--border)]">
          مجموع: {toPersianDigits(receipts.length)} قبض
        </span>
      }
    >
      {/* نوار فیلترها */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)]">
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-faint)] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="جستجو: شماره قبض، نام، تلفن، خودرو..."
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
        <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className={`${inputClass} py-2`}>
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
        <div className="text-center py-12 bg-[var(--bg)] rounded-2xl border border-dashed border-[var(--border)]">
          <FileText className="w-12 h-12 text-[var(--text-faint)] mx-auto mb-3" />
          <p className="text-xs font-bold text-[var(--text-muted)]">هیچ قبضی یافت نشد.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
          <table className="w-full text-right border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--bg)] text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
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
            <tbody className="divide-y divide-[var(--border)] font-semibold text-[var(--text-muted)]">
              {filtered.map((r) => {
                const voided = r.status === 'voided';
                return (
                  <tr key={r.id} className={`hover:bg-[var(--surface-2)] transition-all ${voided ? 'bg-[var(--danger-soft)] text-[var(--text-faint)]' : ''}`}>
                    <td className="px-3 py-3 font-mono text-[var(--text)] font-bold">{toPersianDigits(r.receiptNumber)}</td>
                    <td className="px-3 py-3">
                      <div className="font-bold text-[var(--text)]">{r.customerName || '—'}</div>
                      <div className="font-mono text-[10px] text-[var(--text-muted)]">{toPersianDigits(r.customerPhone)}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-[var(--text)]">{r.carModel}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{r.tierName}</div>
                    </td>
                    <td className="px-3 py-3 max-w-[180px] whitespace-normal">
                      <div className="flex flex-wrap gap-1">
                        {r.services.map((s) => (
                          <span key={s.id} className="bg-[var(--money-soft)] border border-[var(--money-border)] text-[var(--money-text)] text-[9px] px-1.5 py-0.5 rounded">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[var(--text-muted)]">{r.workerName || '—'}</td>
                    <td className={`px-3 py-3 font-bold font-mono ${voided ? 'line-through text-[var(--text-faint)]' : 'text-[var(--price)]'}`}>
                      {formatCurrencyToman(r.price)}
                    </td>
                    <td className="px-3 py-3 text-[var(--text-muted)] text-[11px]">{r.jalaliDate}</td>
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
                        <button title="چاپ مجدد" onClick={() => onPrint(r)} className="p-1.5 text-[var(--accent-text)] hover:bg-[var(--surface-2)] rounded-lg cursor-pointer">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button title="ویرایش" onClick={() => setEditing(r)} className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-lg cursor-pointer">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!voided && (
                          <button title="ابطال" onClick={() => setVoiding(r)} className="p-1.5 text-[var(--danger-text)] hover:bg-[var(--surface-2)] rounded-lg cursor-pointer">
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
        <ModalHeader title={`ابطال قبض ${voiding ? toPersianDigits(voiding.receiptNumber) : ''}`} onClose={() => setVoiding(null)} />
        <form onSubmit={submitVoid} className="flex flex-col gap-4">
          <Field label="علت ابطال" required>
            <input required value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="مثال: انصراف مشتری" className={inputClass} />
          </Field>
          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
            <GhostButton type="button" onClick={() => setVoiding(null)}>انصراف</GhostButton>
            <button type="submit" className="bg-[var(--danger-strong)] hover:bg-[var(--danger-strong)] text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer">
              تایید ابطال
            </button>
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
                <input value={editing.customerPhone} onChange={(e) => setEditing({ ...editing, customerPhone: e.target.value })} className={`${inputClass} font-mono text-right`} />
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
                <input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className={`${inputClass} font-mono`} />
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
  );
}
