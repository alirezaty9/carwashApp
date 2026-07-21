import { useState } from 'react';
import { DollarSign, Users, SlidersHorizontal, FileSpreadsheet, History as HistoryIcon, Wallet, Package, LucideIcon } from 'lucide-react';
import { Receipt, Sale } from '../../types';
import { Store } from '../../data/store';
import { PillTabs } from '../common';
import Reports from '../pos/Reports';
import History from '../pos/History';
import PricingMatrix from './PricingMatrix';
import WorkersManager from './WorkersManager';
import WorkerPayroll from './WorkerPayroll';
import GeneralSettings from './GeneralSettings';
import AccessoriesPanel from './AccessoriesPanel';

type AdminTab = 'reports' | 'payroll' | 'history' | 'accessories' | 'pricing' | 'workers' | 'general';

const TABS: { id: AdminTab; label: string; icon: LucideIcon }[] = [
  { id: 'reports', label: 'گزارش‌ها', icon: FileSpreadsheet },
  { id: 'payroll', label: 'دستمزد کارگرها', icon: Wallet },
  { id: 'history', label: 'تاریخچه و ابطال', icon: HistoryIcon },
  { id: 'accessories', label: 'لوازم جانبی', icon: Package },
  { id: 'pricing', label: 'قیمت‌ها و تیپ‌ها', icon: DollarSign },
  { id: 'workers', label: 'کارگرها', icon: Users },
  { id: 'general', label: 'تنظیمات و بکاپ', icon: SlidersHorizontal },
];

export default function AdminPanel({
  store,
  notify,
  onPrint,
  onPrintSale,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
  onPrint: (receipt: Receipt) => void;
  onPrintSale: (sale: Sale) => void;
}) {
  const [tab, setTab] = useState<AdminTab>('reports');

  return (
    <div className="flex flex-col gap-6">
      {/* زیرمنوی پنل */}
      <PillTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'reports' && <Reports store={store} />}
      {tab === 'payroll' && <WorkerPayroll store={store} />}
      {tab === 'history' && <History store={store} notify={notify} onPrint={onPrint} />}
      {tab === 'accessories' && <AccessoriesPanel store={store} notify={notify} onPrintSale={onPrintSale} />}
      {tab === 'pricing' && <PricingMatrix store={store} notify={notify} />}
      {tab === 'workers' && <WorkersManager store={store} notify={notify} />}
      {tab === 'general' && <GeneralSettings store={store} notify={notify} />}
    </div>
  );
}
