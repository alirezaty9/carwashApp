import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackupData,
  CarwashConfig,
  Customer,
  Receipt,
  ReceiptService,
  Service,
  Tier,
  Worker,
} from '../types';
import {
  DEFAULT_CONFIG,
  DEFAULT_SERVICES,
  DEFAULT_TIERS,
  DEFAULT_WORKERS,
} from './defaults';
import { getFormattedJalali, getJalaliDateParts, toEnglishDigits } from '../utils/jalali';

/**
 * لایه‌ی داده‌ی برنامه. تمام state، ذخیره‌سازی و اکشن‌ها اینجا متمرکز است تا
 * کامپوننت‌های UI فقط «مصرف‌کننده» باشند (جداسازیِ لایه‌ی UI از داده).
 *
 * ذخیره‌سازی فعلاً روی localStorage است؛ برای انتقال به Electron کافی است
 * فقط توابع load/save زیر به فایل/SQLite تغییر کنند و بقیه‌ی برنامه دست‌نخورده بماند.
 */

// کلیدهای نسخه‌ی جدید (پیشوند cw2 تا با داده‌ی نسخه‌ی قدیمی تداخل نکند)
const KEYS = {
  tiers: 'cw2_tiers',
  services: 'cw2_services',
  workers: 'cw2_workers',
  customers: 'cw2_customers',
  receipts: 'cw2_receipts',
  config: 'cw2_config',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* در حالتی که حافظه پر باشد بی‌صدا رد می‌شویم */
  }
}

// شناسه‌ی یکتا بدون وابستگی به Math.random (سازگار با محیط‌های محدود)
let idCounter = 0;
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export type Store = ReturnType<typeof useCarwashStore>;

export interface CreateReceiptInput {
  customerPhone: string;
  customerName: string;
  carModel: string;
  tierId: string;
  serviceIds: string[];
  workerId?: string;
  notes?: string;
  discount?: number; // مبلغِ تخفیف (تومان)
}

export function useCarwashStore() {
  const [tiers, setTiers] = useState<Tier[]>(() => load(KEYS.tiers, DEFAULT_TIERS));
  const [services, setServices] = useState<Service[]>(() => load(KEYS.services, DEFAULT_SERVICES));
  const [workers, setWorkers] = useState<Worker[]>(() => load(KEYS.workers, DEFAULT_WORKERS));
  const [customers, setCustomers] = useState<Customer[]>(() => load(KEYS.customers, []));
  const [receipts, setReceipts] = useState<Receipt[]>(() => load(KEYS.receipts, []));
  const [config, setConfig] = useState<CarwashConfig>(() => load(KEYS.config, DEFAULT_CONFIG));

  // --- ذخیره‌سازی خودکار ---
  useEffect(() => save(KEYS.tiers, tiers), [tiers]);
  useEffect(() => save(KEYS.services, services), [services]);
  useEffect(() => save(KEYS.workers, workers), [workers]);
  useEffect(() => save(KEYS.customers, customers), [customers]);
  useEffect(() => save(KEYS.receipts, receipts), [receipts]);
  useEffect(() => save(KEYS.config, config), [config]);

  // ================= تیپ‌ها =================
  const addTier = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTiers((prev) => [...prev, { id: uid('tier'), name: trimmed }]);
  }, []);

  const renameTier = useCallback((id: string, name: string) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
  }, []);

  const removeTier = useCallback((id: string) => {
    setTiers((prev) => (prev.length <= 1 ? prev : prev.filter((t) => t.id !== id)));
    // قیمت این تیپ را از همه‌ی خدمات هم پاک می‌کنیم
    setServices((prev) =>
      prev.map((s) => {
        const { [id]: _removed, ...rest } = s.prices;
        return { ...s, prices: rest };
      }),
    );
  }, []);

  // ================= خدمات =================
  const addService = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setServices((prev) => [...prev, { id: uid('srv'), name: trimmed, prices: {} }]);
  }, []);

  const renameService = useCallback((id: string, name: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  const removeService = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const setServicePrice = useCallback((serviceId: string, tierId: string, price: number) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, prices: { ...s.prices, [tierId]: price } } : s,
      ),
    );
  }, []);

  // درصدِ پورسانتِ کارگر برای یک خدمت (بین ۰ و ۱۰۰ محدود می‌شود)
  const setServiceCommission = useCallback((serviceId: string, pct: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(pct)));
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, commissionPct: clamped } : s)),
    );
  }, []);

  // ================= کارگرها =================
  const addWorker = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setWorkers((prev) => [...prev, { id: uid('wrk'), name: trimmed, active: true }]);
  }, []);

  const renameWorker = useCallback((id: string, name: string) => {
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, name } : w)));
  }, []);

  const toggleWorker = useCallback((id: string) => {
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));
  }, []);

  const removeWorker = useCallback((id: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // ================= مشتری‌ها =================
  const getCustomerByPhone = useCallback(
    (phone: string): Customer | undefined => {
      const p = toEnglishDigits(phone).trim();
      if (!p) return undefined;
      return customers.find((c) => c.phone === p);
    },
    [customers],
  );

  const getCustomerHistory = useCallback(
    (phone: string): Receipt[] => {
      const p = toEnglishDigits(phone).trim();
      if (!p) return [];
      return receipts.filter((r) => r.customerPhone === p);
    },
    [receipts],
  );

  // ================= قبض‌ها =================
  const nextReceiptNumber = useMemo(() => {
    if (receipts.length === 0) return config.receiptCounterStart;
    return Math.max(...receipts.map((r) => r.receiptNumber || 0)) + 1;
  }, [receipts, config.receiptCounterStart]);

  const createReceipt = useCallback(
    (input: CreateReceiptInput): Receipt | null => {
      const tier = tiers.find((t) => t.id === input.tierId);
      if (!tier) return null;

      const phone = toEnglishDigits(input.customerPhone).trim();
      const name = input.customerName.trim();

      const chosenServices = services.filter((s) => input.serviceIds.includes(s.id));
      const chosen: ReceiptService[] = chosenServices.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.prices[tier.id] ?? 0,
      }));

      if (chosen.length === 0) return null;
      const subtotal = chosen.reduce((sum, s) => sum + s.price, 0);
      // تخفیف بین صفر و جمعِ خدمات محدود می‌شود تا مبلغ منفی نشود
      const discount = Math.min(Math.max(0, Math.round(input.discount ?? 0)), subtotal);
      const total = subtotal - discount;

      const worker = input.workerId ? workers.find((w) => w.id === input.workerId) : undefined;

      // پورسانتِ کارگر = جمعِ (قیمتِ هر خدمت × درصدِ پورسانتِ همان خدمت).
      // بر پایه‌ی قیمتِ ناخالصِ خدمات (قبل از تخفیف) حساب می‌شود، چون تخفیف سهمِ
      // کارواش است نه کارگر. فقط وقتی کارگری انتخاب شده باشد ثبت می‌شود.
      const workerCommission = worker
        ? chosenServices.reduce(
            (sum, s) => sum + Math.round(((s.prices[tier.id] ?? 0) * (s.commissionPct ?? 0)) / 100),
            0,
          )
        : 0;

      const now = new Date();
      const { year, month, day } = getJalaliDateParts(now);

      const receipt: Receipt = {
        id: uid('rcp'),
        receiptNumber: nextReceiptNumber,
        customerPhone: phone,
        customerName: name,
        carModel: input.carModel.trim() || 'نامشخص',
        tierId: tier.id,
        tierName: tier.name,
        services: chosen,
        price: total,
        discount: discount || undefined,
        workerCommission: workerCommission || undefined,
        workerId: worker?.id,
        workerName: worker?.name,
        notes: input.notes?.trim() || undefined,
        date: now.toISOString(),
        jalaliDate: getFormattedJalali(now, true),
        jalaliYear: year,
        jalaliMonth: month,
        jalaliDay: day,
        status: 'active',
      };

      setReceipts((prev) => [receipt, ...prev]);

      // ثبت/به‌روزرسانی مشتری
      if (phone) {
        setCustomers((prev) => {
          const existing = prev.find((c) => c.phone === phone);
          if (existing) {
            return name && name !== existing.name
              ? prev.map((c) => (c.phone === phone ? { ...c, name } : c))
              : prev;
          }
          return [...prev, { phone, name, createdAt: now.toISOString() }];
        });
      }

      return receipt;
    },
    [tiers, services, workers, nextReceiptNumber],
  );

  const voidReceipt = useCallback((id: string, reason: string) => {
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'voided' as const, voidReason: reason.trim() || 'بدون علت' } : r,
      ),
    );
  }, []);

  const updateReceipt = useCallback((updated: Receipt) => {
    setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }, []);

  // ================= تنظیمات =================
  const updateConfig = useCallback((partial: Partial<CarwashConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  // ================= پشتیبان‌گیری / بازیابی / ریست =================
  const exportData = useCallback((): BackupData => {
    return {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      tiers,
      services,
      workers,
      customers,
      receipts,
      config,
    };
  }, [tiers, services, workers, customers, receipts, config]);

  const importData = useCallback((data: Partial<BackupData>): boolean => {
    if (!data || !Array.isArray(data.tiers) || !Array.isArray(data.services) || !Array.isArray(data.receipts)) {
      return false;
    }
    setTiers(data.tiers);
    setServices(data.services);
    setWorkers(Array.isArray(data.workers) ? data.workers : []);
    setCustomers(Array.isArray(data.customers) ? data.customers : []);
    setReceipts(data.receipts);
    if (data.config) setConfig({ ...DEFAULT_CONFIG, ...data.config });
    return true;
  }, []);

  const resetAll = useCallback(() => {
    setTiers(DEFAULT_TIERS);
    setServices(DEFAULT_SERVICES);
    setWorkers(DEFAULT_WORKERS);
    setCustomers([]);
    setReceipts([]);
    setConfig(DEFAULT_CONFIG);
  }, []);

  return {
    // state
    tiers,
    services,
    workers,
    customers,
    receipts,
    config,
    nextReceiptNumber,
    // tiers
    addTier,
    renameTier,
    removeTier,
    // services
    addService,
    renameService,
    removeService,
    setServicePrice,
    setServiceCommission,
    // workers
    addWorker,
    renameWorker,
    toggleWorker,
    removeWorker,
    // customers
    getCustomerByPhone,
    getCustomerHistory,
    // receipts
    createReceipt,
    voidReceipt,
    updateReceipt,
    // config
    updateConfig,
    // data
    exportData,
    importData,
    resetAll,
  };
}
