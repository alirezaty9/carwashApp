import { useState } from 'react';
import { DollarSign, Users, SlidersHorizontal, FileSpreadsheet, History as HistoryIcon, Wallet, Package, KeyRound, UserCog, LucideIcon } from 'lucide-react';
import { Receipt, Sale, User } from '../../types';
import { Store } from '../../data/store';
import { PrintReport } from '../../utils/printing';
import { PillTabs } from '../common';
import Reports from '../pos/Reports';
import History from '../pos/History';
import PricingMatrix from './PricingMatrix';
import WorkersManager from './WorkersManager';
import WorkerPayroll from './WorkerPayroll';
import GeneralSettings from './GeneralSettings';
import ProductsManager from './ProductsManager';
import UsersManager from './UsersManager';
import LicenseSettings from '../../license/LicenseSettings';

type AdminTab = 'reports' | 'payroll' | 'history' | 'accessories' | 'pricing' | 'workers' | 'users' | 'general' | 'license';

const TABS: { id: AdminTab; label: string; icon: LucideIcon }[] = [
  { id: 'reports', label: 'گزارش‌ها', icon: FileSpreadsheet },
  { id: 'payroll', label: 'دستمزد کارگرها', icon: Wallet },
  { id: 'history', label: 'تاریخچه و ابطال', icon: HistoryIcon },
  { id: 'accessories', label: 'انبار لوازم', icon: Package },
  { id: 'pricing', label: 'قیمت‌ها و تیپ‌ها', icon: DollarSign },
  { id: 'workers', label: 'کارگرها', icon: Users },
  { id: 'users', label: 'کاربران', icon: UserCog },
  { id: 'license', label: 'لایسنس', icon: KeyRound },
  { id: 'general', label: 'تنظیمات و بکاپ', icon: SlidersHorizontal },
];

export default function AdminPanel({
  store,
  notify,
  onPrint,
  onPrintSale,
  onTestPrint,
  currentUser,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
  onPrint: (receipt: Receipt) => void;
  onPrintSale: (sale: Sale) => void;
  /** چاپِ یک فیشِ نمونه برای امتحانِ پرینتر. */
  onTestPrint: () => Promise<PrintReport>;
  currentUser: User;
}) {
  const [tab, setTab] = useState<AdminTab>('reports');

  return (
    <div className="flex flex-col gap-6">
      {/* زیرمنوی پنل */}
      <PillTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'reports' && <Reports store={store} />}
      {tab === 'payroll' && <WorkerPayroll store={store} />}
      {tab === 'history' && <History store={store} notify={notify} onPrint={onPrint} onPrintSale={onPrintSale} currentUser={currentUser} />}
      {tab === 'accessories' && <ProductsManager store={store} notify={notify} />}
      {tab === 'pricing' && <PricingMatrix store={store} notify={notify} />}
      {tab === 'workers' && <WorkersManager store={store} notify={notify} />}
      {tab === 'users' && <UsersManager store={store} notify={notify} currentUserId={currentUser.id} />}
      {tab === 'license' && <LicenseSettings />}
      {tab === 'general' && <GeneralSettings store={store} notify={notify} onTestPrint={onTestPrint} />}
    </div>
  );
}
