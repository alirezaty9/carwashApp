import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Store } from '../../data/store';
import { rialToToman, tomanToRial } from '../../utils/format';
import { SectionCard, inputClass, NumberInput, PrimaryButton } from '../common';

/**
 * ماتریسِ قیمت‌گذاری: ردیف‌ها «خدمات» و ستون‌ها «تیپ‌ها».
 * چون خدمات برای همه‌ی تیپ‌ها یکسان‌اند و فقط قیمتشان فرق می‌کند،
 * این جدول دقیقاً همان مدل را نشان می‌دهد؛ هر سلول = قیمتِ یک خدمت برای یک تیپ.
 */
export default function PricingMatrix({
  store,
  notify,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const { tiers, services, addTier, removeTier, renameTier, addService, removeService, renameService, setServicePrice, setServiceCommission } = store;

  const [newService, setNewService] = useState('');
  const [newTier, setNewTier] = useState('');

  const handleAddService = () => {
    if (!newService.trim()) return notify('نام خدمت را وارد کنید', 'error');
    addService(newService);
    setNewService('');
    notify('خدمت جدید اضافه شد', 'success');
  };

  const handleAddTier = () => {
    if (!newTier.trim()) return notify('نام تیپ را وارد کنید', 'error');
    addTier(newTier);
    setNewTier('');
    notify('تیپ جدید اضافه شد', 'success');
  };

  return (
    <SectionCard
      title="قیمت‌گذاری خدمات و تیپ‌ها"
      subtitle="قیمتِ هر سلول را جدا تعیین کنید (تومان). ستونِ «٪ پورسانت» = سهمِ کارگر از هر خدمت که در «دستمزد کارگرها» محاسبه می‌شود."
    >
      {/* افزودن خدمت و تیپ — بالای صفحه تا دمِ‌دست باشد */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1.5">افزودن خدمت جدید (ردیف)</label>
            <input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
              placeholder="مثال: واکس بدنه"
              className={`${inputClass} py-2`}
            />
          </div>
          <PrimaryButton type="button" onClick={handleAddService} className="shrink-0">
            <Plus className="w-4 h-4" /> خدمت
          </PrimaryButton>
        </div>

        <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1.5">افزودن تیپ جدید (ستون)</label>
            <input
              value={newTier}
              onChange={(e) => setNewTier(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTier()}
              placeholder="مثال: موتورسیکلت"
              className={`${inputClass} py-2`}
            />
          </div>
          <PrimaryButton type="button" onClick={handleAddTier} className="shrink-0">
            <Plus className="w-4 h-4" /> تیپ
          </PrimaryButton>
        </div>
      </div>

      <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
              <th className="px-3 py-3 text-right font-bold text-[var(--text-muted)] min-w-[200px]">خدمت \ تیپ</th>
              {tiers.map((t) => (
                <th key={t.id} className="px-3 py-2 font-bold text-[var(--text-muted)] min-w-[150px]">
                  <div className="flex items-center gap-1">
                    <input
                      value={t.name}
                      onChange={(e) => renameTier(t.id, e.target.value)}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-xs font-bold text-[var(--text)] w-full outline-none focus:border-[var(--accent-strong)]"
                    />
                    <button
                      onClick={() => {
                        if (tiers.length <= 1) return notify('حداقل یک تیپ لازم است', 'error');
                        if (confirm(`حذف تیپ «${t.name}»؟`)) {
                          removeTier(t.id);
                          notify('تیپ حذف شد', 'success');
                        }
                      }}
                      className="p-1 text-[var(--danger-text)] hover:bg-[var(--surface-2)] rounded cursor-pointer shrink-0"
                      title="حذف تیپ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 font-bold text-[var(--money-text)] min-w-[120px] text-center whitespace-nowrap">
                ٪ پورسانت کارگر
              </th>
              <th className="px-2 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-[var(--surface-2)]">
                <td className="px-3 py-2">
                  <input
                    value={s.name}
                    onChange={(e) => renameService(s.id, e.target.value)}
                    className="bg-[var(--bg)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs font-bold text-[var(--text)] w-full outline-none focus:border-[var(--accent-strong)]"
                  />
                </td>
                {tiers.map((t) => (
                  <td key={t.id} className="px-3 py-2">
                    <NumberInput
                      value={rialToToman(s.prices[t.id] ?? 0)}
                      onValueChange={(toman) => setServicePrice(s.id, t.id, tomanToRial(toman))}
                      placeholder="۰"
                      className="bg-[var(--bg)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[var(--text)] w-full outline-none focus:border-[var(--accent-strong)]"
                    />
                  </td>
                ))}
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <NumberInput
                      thousands={false}
                      value={s.commissionPct ?? 0}
                      onValueChange={(n) => setServiceCommission(s.id, n)}
                      placeholder="۰"
                      className="bg-[var(--bg)] border border-[var(--money-border)] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[var(--money-text)] w-16 text-center outline-none focus:border-[var(--money-strong)]"
                    />
                    <span className="text-[var(--text-faint)] text-xs font-bold">٪</span>
                  </div>
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => {
                      if (confirm(`حذف خدمت «${s.name}»؟`)) {
                        removeService(s.id);
                        notify('خدمت حذف شد', 'success');
                      }
                    }}
                    className="p-1.5 text-[var(--danger-text)] hover:bg-[var(--surface-2)] rounded cursor-pointer"
                    title="حذف خدمت"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
