import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Store } from '../../data/store';
import { rialToToman, tomanToRial } from '../../utils/format';
import {
  IconButton,
  NumberInput,
  PrimaryButton,
  SectionCard,
  cellInputClass,
  inputClass,
  rowHoverClass,
  tableClass,
  tableWrapClass,
  tbodyClass,
  theadRowClass,
} from '../common';

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
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">افزودن خدمت جدید (ردیف)</label>
            <input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
              placeholder="مثال: واکس بدنه"
              className={inputClass}
            />
          </div>
          <PrimaryButton type="button" onClick={handleAddService} className="shrink-0">
            <Plus className="w-4 h-4" /> خدمت
          </PrimaryButton>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">افزودن تیپ جدید (ستون)</label>
            <input
              value={newTier}
              onChange={(e) => setNewTier(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTier()}
              placeholder="مثال: موتورسیکلت"
              className={inputClass}
            />
          </div>
          <PrimaryButton type="button" onClick={handleAddTier} className="shrink-0">
            <Plus className="w-4 h-4" /> تیپ
          </PrimaryButton>
        </div>
      </div>

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr className={theadRowClass}>
              <th className="px-3 py-3 text-right min-w-[200px]">خدمت \ تیپ</th>
              {tiers.map((t) => (
                <th key={t.id} className="px-3 py-2 min-w-[150px]">
                  <div className="flex items-center gap-1">
                    <input
                      value={t.name}
                      onChange={(e) => renameTier(t.id, e.target.value)}
                      aria-label="نام تیپ"
                      className={cellInputClass}
                    />
                    <IconButton
                      tone="danger"
                      onClick={() => {
                        if (tiers.length <= 1) return notify('حداقل یک تیپ لازم است', 'error');
                        if (confirm(`حذف تیپ «${t.name}»؟`)) {
                          removeTier(t.id);
                          notify('تیپ حذف شد', 'success');
                        }
                      }}
                      title="حذف تیپ"
                      aria-label="حذف تیپ"
                      className="shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 min-w-[120px] text-center whitespace-nowrap">٪ پورسانت کارگر</th>
              <th className="px-2 py-3 w-10" />
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {services.map((s) => (
              <tr key={s.id} className={rowHoverClass}>
                <td className="px-3 py-2">
                  <input
                    value={s.name}
                    onChange={(e) => renameService(s.id, e.target.value)}
                    aria-label="نام خدمت"
                    className={cellInputClass}
                  />
                </td>
                {tiers.map((t) => (
                  <td key={t.id} className="px-3 py-2">
                    <NumberInput
                      value={rialToToman(s.prices[t.id] ?? 0)}
                      onValueChange={(toman) => setServicePrice(s.id, t.id, tomanToRial(toman))}
                      placeholder="۰"
                      aria-label={`قیمتِ ${s.name} برای ${t.name}`}
                      className={`${cellInputClass} tabular-nums`}
                    />
                  </td>
                ))}
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <NumberInput
                      thousands={false}
                      value={s.commissionPct ?? 0}
                      onValueChange={(n) => setServiceCommission(s.id, n)}
                      placeholder="۰"
                      aria-label={`درصدِ پورسانتِ ${s.name}`}
                      className={`${cellInputClass} w-16 text-center tabular-nums`}
                    />
                    <span className="text-[var(--text-faint)] text-xs">٪</span>
                  </div>
                </td>
                <td className="px-2 py-2 text-center">
                  <IconButton
                    tone="danger"
                    onClick={() => {
                      // بدونِ هیچ خدمتی، صندوق نمی‌تواند قبض صادر کند —
                      // همان نگهبانی که برای تیپ‌ها هم هست.
                      if (services.length <= 1) return notify('حداقل یک خدمت لازم است', 'error');
                      if (confirm(`حذف خدمت «${s.name}»؟`)) {
                        removeService(s.id);
                        notify('خدمت حذف شد', 'success');
                      }
                    }}
                    title="حذف خدمت"
                    aria-label="حذف خدمت"
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
