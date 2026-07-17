import { useState } from 'react';
import { Plus, Trash2, UserCog } from 'lucide-react';
import { Store } from '../../data/store';
import { SectionCard, inputClass, PrimaryButton } from '../common';

/** مدیریتِ کارگرها؛ کارگرهای «فعال» در فرمِ قبض قابل انتخاب‌اند. */
export default function WorkersManager({
  store,
  notify,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const { workers, addWorker, renameWorker, toggleWorker, removeWorker } = store;
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return notify('نام کارگر را وارد کنید', 'error');
    addWorker(newName);
    setNewName('');
    notify('کارگر اضافه شد', 'success');
  };

  return (
    <SectionCard title="مدیریت کارگرها" subtitle="انتخاب کارگر روی قبض اختیاری است. کارگرِ غیرفعال در فرم نمایش داده نمی‌شود.">
      <div className="flex flex-col gap-2">
        {workers.length === 0 && (
          <p className="text-center text-xs text-[var(--text-faint)] py-6">هنوز کارگری ثبت نشده است.</p>
        )}
        {workers.map((w) => (
          <div key={w.id} className="flex items-center gap-2 bg-[var(--bg)] p-2.5 rounded-xl border border-[var(--border)]">
            <UserCog className={`w-5 h-5 shrink-0 ${w.active ? 'text-[var(--money-text)]' : 'text-[var(--text-faint)]'}`} />
            <input
              value={w.name}
              onChange={(e) => renameWorker(w.id, e.target.value)}
              className={`${inputClass} py-2 flex-1`}
            />
            <button
              onClick={() => toggleWorker(w.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0 ${
                w.active
                  ? 'bg-[var(--money-soft)] text-[var(--money-text)] border border-[var(--money-border)]'
                  : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'
              }`}
            >
              {w.active ? 'فعال' : 'غیرفعال'}
            </button>
            <button
              onClick={() => {
                if (confirm(`حذف کارگر «${w.name}»؟`)) {
                  removeWorker(w.id);
                  notify('کارگر حذف شد', 'success');
                }
              }}
              className="p-2 text-[var(--danger-text)] hover:bg-[var(--surface-2)] rounded-lg cursor-pointer shrink-0"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1.5">افزودن کارگر جدید</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="نام کارگر" className={`${inputClass} py-2`} />
        </div>
        <PrimaryButton type="button" onClick={handleAdd} className="shrink-0">
          <Plus className="w-4 h-4" /> افزودن
        </PrimaryButton>
      </div>
    </SectionCard>
  );
}
