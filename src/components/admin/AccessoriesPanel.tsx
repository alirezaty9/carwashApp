import { useState } from 'react';
import { Package, ShoppingCart, LucideIcon } from 'lucide-react';
import { Sale } from '../../types';
import { Store } from '../../data/store';
import { PillTabs } from '../common';
import ProductsManager from './ProductsManager';
import SalesHistory from './SalesHistory';

type SubTab = 'inventory' | 'sales';

const TABS: { id: SubTab; label: string; icon: LucideIcon }[] = [
  { id: 'inventory', label: 'انبار و کالاها', icon: Package },
  { id: 'sales', label: 'فروش‌ها', icon: ShoppingCart },
];

/** تبِ «لوازم جانبی» در پنل مدیریت: مدیریتِ انبار + تاریخچه‌ی فروش. */
export default function AccessoriesPanel({
  store,
  notify,
  onPrintSale,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
  onPrintSale: (sale: Sale) => void;
}) {
  const [tab, setTab] = useState<SubTab>('inventory');

  return (
    <div className="flex flex-col gap-6">
      <PillTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'inventory' ? (
        <ProductsManager store={store} notify={notify} />
      ) : (
        <SalesHistory store={store} notify={notify} onPrintSale={onPrintSale} />
      )}
    </div>
  );
}
