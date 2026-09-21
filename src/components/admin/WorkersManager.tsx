import { useState } from 'react';
import { Plus, Trash2, UserCog } from 'lucide-react';
import { Store } from '../../data/store';
import { EmptyState, IconButton, PrimaryButton, SectionCard, StatusPill, inputClass } from '../common';

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
          <EmptyState icon={UserCog}>
            هنوز کارگری ثبت نشده است. نامِ اولین کارگر را در کادرِ پایین بنویسید.
          </EmptyState>
        )}
        {workers.map((w) => (
          <div key={w.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--border)]">
            <UserCog className={`w-5 h-5 shrink-0 ${w.active ? 'text-[var(--ok-text)]' : 'text-[var(--text-faint)]'}`} />
            <input
              value={w.name}
              onChange={(e) => renameWorker(w.id, e.target.value)}
              aria-label="نام کارگر"
              className={`${inputClass} flex-1`}
            />
            <button
              onClick={() => toggleWorker(w.id)}
              title={w.active ? 'غیرفعال کردن' : 'فعال کردن'}
              className="cursor-pointer shrink-0"
            >
              <StatusPill tone={w.active ? 'ok' : 'neutral'}>{w.active ? 'فعال' : 'غیرفعال'}</StatusPill>
            </button>
            <IconButton
              tone="danger"
              onClick={() => {
                if (confirm(`حذف کارگر «${w.name}»؟`)) {
                  removeWorker(w.id);
                  notify('کارگر حذف شد', 'success');
                }
              }}
              title="حذف"
              aria-label="حذف کارگر"
              className="shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </IconButton>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] pt-5 flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">افزودن کارگر جدید</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="نام کارگر" className={inputClass} />
        </div>
        <PrimaryButton type="button" onClick={handleAdd} className="shrink-0">
          <Plus className="w-4 h-4" /> افزودن
        </PrimaryButton>
      </div>
    </SectionCard>
  );
}
