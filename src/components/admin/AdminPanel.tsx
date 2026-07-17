import { useState } from 'react';
import { DollarSign, Users, SlidersHorizontal, FileSpreadsheet, History as HistoryIcon, Wallet } from 'lucide-react';
import { Receipt } from '../../types';
import { Store } from '../../data/store';
import Reports from '../pos/Reports';
import History from '../pos/History';
import PricingMatrix from './PricingMatrix';
import WorkersManager from './WorkersManager';
import WorkerPayroll from './WorkerPayroll';
import GeneralSettings from './GeneralSettings';

type AdminTab = 'reports' | 'payroll' | 'history' | 'pricing' | 'workers' | 'general';

const TABS: { id: AdminTab; label: string; icon: typeof DollarSign }[] = [
  { id: 'reports', label: 'گزارش‌ها', icon: FileSpreadsheet },
  { id: 'payroll', label: 'دستمزد کارگرها', icon: Wallet },
  { id: 'history', label: 'تاریخچه و ابطال', icon: HistoryIcon },
  { id: 'pricing', label: 'قیمت‌ها و تیپ‌ها', icon: DollarSign },
  { id: 'workers', label: 'کارگرها', icon: Users },
  { id: 'general', label: 'تنظیمات و بکاپ', icon: SlidersHorizontal },
];

export default function AdminPanel({
  store,
  notify,
  onPrint,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
  onPrint: (receipt: Receipt) => void;
}) {
  const [tab, setTab] = useState<AdminTab>('reports');

  return (
    <div className="flex flex-col gap-6">
      {/* زیرمنوی پنل */}
      <div className="flex flex-wrap gap-2 bg-[var(--surface)] p-2 rounded-2xl border border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              tab === t.id ? 'cw-primary' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reports' && <Reports store={store} />}
      {tab === 'payroll' && <WorkerPayroll store={store} />}
      {tab === 'history' && <History store={store} notify={notify} onPrint={onPrint} />}
      {tab === 'pricing' && <PricingMatrix store={store} notify={notify} />}
      {tab === 'workers' && <WorkersManager store={store} notify={notify} />}
      {tab === 'general' && <GeneralSettings store={store} notify={notify} />}
    </div>
  );
}
