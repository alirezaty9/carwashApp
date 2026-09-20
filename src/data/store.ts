import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackupData,
  CarwashConfig,
  Customer,
  Product,
  Receipt,
  ReceiptService,
  Sale,
  SaleItem,
  Service,
  Tier,
  User,
  UserRole,
  Worker,
} from '../types';
import {
  DEFAULT_CONFIG,
  DEFAULT_PRODUCTS,
  DEFAULT_SERVICES,
  DEFAULT_TIERS,
  DEFAULT_USERS,
  DEFAULT_WORKERS,
} from './defaults';
import { getFormattedJalali, getJalaliDateParts } from '../utils/jalali';
import { toEnglishDigits } from '../utils/format';
import { readRaw, saveRaw, StorageError, subscribeStorageErrors } from './persistence';
import { calcWorkerCommission } from '../utils/receipts';

/**
 * لایه‌ی داده‌ی برنامه. تمام state، ذخیره‌سازی و اکشن‌ها اینجا متمرکز است تا
 * کامپوننت‌های UI فقط «مصرف‌کننده» باشند (جداسازیِ لایه‌ی UI از داده).
 *
 * ذخیره‌سازی از طریقِ آداپتورِ `persistence` انجام می‌شود: داخلِ Electron روی یک
 * فایلِ واقعی و در مرورگر روی localStorage. خودِ این فایل از محلِ ذخیره بی‌خبر است.
 */

// کلیدهای نسخه‌ی جدید (پیشوند cw2 تا با داده‌ی نسخه‌ی قدیمی تداخل نکند)
const KEYS = {
  tiers: 'cw2_tiers',
  services: 'cw2_services',
  workers: 'cw2_workers',
  customers: 'cw2_customers',
  receipts: 'cw2_receipts',
  products: 'cw2_products',
  sales: 'cw2_sales',
  config: 'cw2_config',
  users: 'cw2_users',
} as const;

function save<T>(key: string, value: T): void {
  saveRaw(key, JSON.stringify(value));
}

/**
 * خواندنِ همه‌ی کلیدها در یک نوبت، همراه با فهرستِ کلیدهایی که خواندنشان شکست خورد.
 *
 * 🔴 چرا یک‌جا و چرا با فهرستِ خطا؟ چون «کلید وجود ندارد» و «کلید خراب است» دو
 * وضعیتِ کاملاً متفاوت‌اند. قبلاً هر دو به مقدارِ پیش‌فرض تبدیل می‌شدند و چون
 * ذخیره‌سازیِ خودکار بلافاصله بعد از بالا آمدن اجرا می‌شود، مقدارِ خالی روی
 * داده‌ی خراب نوشته می‌شد و سوابق برای همیشه می‌رفت. حالا اگر حتی یک کلید خراب
 * باشد، نوشتن «یخ» می‌زند تا کاربر تصمیم بگیرد (بازیابی از بکاپ یا شروعِ نو).
 */
function loadAll() {
  const failedKeys: string[] = [];

  const read = <T,>(key: string, fallback: T): T => {
    const result = readRaw(key);
    if (result.status === 'empty') return fallback;
    if (result.status === 'error') {
      failedKeys.push(key);
      return fallback;
    }
    try {
      return JSON.parse(result.value) as T;
    } catch {
      failedKeys.push(key);
      return fallback;
    }
  };

  return {
    tiers: read(KEYS.tiers, DEFAULT_TIERS),
    services: read(KEYS.services, DEFAULT_SERVICES),
    workers: read(KEYS.workers, DEFAULT_WORKERS),
    customers: read<Customer[]>(KEYS.customers, []),
    receipts: read<Receipt[]>(KEYS.receipts, []),
    products: read(KEYS.products, DEFAULT_PRODUCTS),
    sales: read<Sale[]>(KEYS.sales, []),
    config: read(KEYS.config, DEFAULT_CONFIG),
    users: read(KEYS.users, DEFAULT_USERS),
    failedKeys,
  };
}

/**
 * ثبت/به‌روزرسانیِ مشتری بر اساسِ شماره‌ی تلفن.
 *
 * این قاعده هم در «صدورِ قبضِ نو» و هم در «ویرایشِ قبضِ قدیمی» لازم است. اگر در
 * دو جا جدا نوشته شود، دیر یا زود یکی‌شان به‌روز می‌شود و دیگری نه — همان چیزی
 * که باعث شد قبضِ ویرایش‌شده از پرونده‌ی مشتری غیب شود.
 */
function upsertCustomer(list: Customer[], phone: string, name: string, at: string): Customer[] {
  if (!phone) return list;
  const existing = list.find((c) => c.phone === phone);
  if (existing) {
    return name && name !== existing.name ? list.map((c) => (c.phone === phone ? { ...c, name } : c)) : list;
  }
  return [...list, { phone, name, createdAt: at }];
}

/** بزرگ‌ترین عددِ یک فهرست، بدونِ باز کردنِ آرایه روی پارامترهای تابع.
 *  (`Math.max(...list)` روی ده‌ها هزار قبض به سقفِ تعدادِ پارامترها می‌خورد.) */
const maxOf = (values: number[]): number => values.reduce((max, v) => (v > max ? v : max), 0);

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
  discount?: number; // مبلغِ تخفیف (ریال)
  tip?: number; // انعامِ کارگر (ریال) — جدا از مبلغِ کل
}

/** یک ردیفِ ورودیِ فروشِ کالا (فقط شناسه و تعداد؛ قیمت از خودِ کالا خوانده می‌شود) */
export interface CreateSaleItemInput {
  productId: string;
  qty: number;
}

export interface CreateSaleInput {
  items: CreateSaleItemInput[];
  customerPhone?: string;
  notes?: string;
  discount?: number; // مبلغِ تخفیف (ریال)
}

export function useCarwashStore() {
  // یک‌بار در عمرِ کامپوننت: همه‌ی کلیدها خوانده و وضعیتِ سلامتشان ثبت می‌شود.
  const [initial] = useState(loadAll);

  const [tiers, setTiers] = useState<Tier[]>(initial.tiers);
  const [services, setServices] = useState<Service[]>(initial.services);
  const [workers, setWorkers] = useState<Worker[]>(initial.workers);
  const [customers, setCustomers] = useState<Customer[]>(initial.customers);
  const [receipts, setReceipts] = useState<Receipt[]>(initial.receipts);
  const [products, setProducts] = useState<Product[]>(initial.products);
  const [sales, setSales] = useState<Sale[]>(initial.sales);
  const [config, setConfig] = useState<CarwashConfig>(initial.config);
  const [users, setUsers] = useState<User[]>(initial.users);

  // 🔴 «یخِ ذخیره‌سازی»: تا وقتی خواندنِ اولیه مشکوک است، هیچ‌چیز روی دیسک نوشته
  // نمی‌شود. این تنها چیزی است که جلوی بازنویسیِ داده‌ی سالم با فهرستِ خالی را
  // می‌گیرد. با بازیابی از بکاپ یا تأییدِ صریحِ کاربر برداشته می‌شود.
  const [writesFrozen, setWritesFrozen] = useState(initial.failedKeys.length > 0);
  const [loadFailedKeys] = useState<string[]>(initial.failedKeys);
  const [saveError, setSaveError] = useState<StorageError | null>(null);

  // شکستِ نوشتن (دیسکِ پر، فایلِ قفل‌شده) از پروسه‌ی Main گزارش می‌شود
  useEffect(() => subscribeStorageErrors(setSaveError), []);

  // --- ذخیره‌سازی خودکار ---
  useEffect(() => {
    if (writesFrozen) return;
    save(KEYS.tiers, tiers);
  }, [tiers, writesFrozen]);
  useEffect(() => {
    if (writesFrozen) return;
    save(KEYS.services, services);
  }, [services, writesFrozen]);
  useEffect(() => {
    if (writesFrozen) return;
    save(KEYS.workers, workers);
  }, [workers, writesFrozen]);
  useEffect(() => {
    if (writesFrozen) return;
    save(KEYS.customers, customers);
  }, [customers, writesFrozen]);
  useEffect(() => {
    if (writesFrozen) return;
    save(KEYS.receipts, receipts);
  }, [receipts, writesFrozen]);
  useEffect(() => {
    if (writesFrozen) return;
    save(KEYS.products, products);
  }, [products, writesFrozen]);
  useEffect(() => {
    if (writesFrozen) return;
    save(KEYS.sales, sales);
  }, [sales, writesFrozen]);
  useEffect(() => {
    if (writesFrozen) return;
    save(KEYS.config, config);
  }, [config, writesFrozen]);
  useEffect(() => {
    if (writesFrozen) return;
    save(KEYS.users, users);
  }, [users, writesFrozen]);

  // ================= تیپ‌ها =================
  const addTier = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTiers((prev) => [...prev, { id: uid('tier'), name: trimmed }]);
  }, []);

  const renameTier = useCallback((id: string, name: string) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
  }, []);

  const removeTier = useCallback(
    (id: string) => {
      // نگهبان: آخرین تیپ حذف نمی‌شود. این تصمیم باید «قبل» از هر دو تغییر گرفته شود،
      // وگرنه تیپ می‌ماند ولی قیمت‌هایش پاک می‌شود و همه‌ی خدمات صفر قیمت می‌گیرند.
      if (tiers.length <= 1) return;
      setTiers((prev) => prev.filter((t) => t.id !== id));
      // قیمت این تیپ را از همه‌ی خدمات هم پاک می‌کنیم
      setServices((prev) =>
        prev.map((s) => {
          const { [id]: _removed, ...rest } = s.prices;
          return { ...s, prices: rest };
        }),
      );
    },
    [tiers],
  );

  // ================= خدمات =================
  const addService = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setServices((prev) => [...prev, { id: uid('srv'), name: trimmed, prices: {} }]);
  }, []);

  const renameService = useCallback((id: string, name: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  // نگهبان: آخرین خدمت حذف نمی‌شود. بدونِ خدمت هیچ قبضی صادر نمی‌شود و صندوق
  // عملاً می‌خوابد — همان نگهبانی که برای تیپ‌ها هم گذاشته شده است.
  const removeService = useCallback(
    (id: string): boolean => {
      if (services.length <= 1) return false;
      setServices((prev) => prev.filter((s) => s.id !== id));
      return true;
    },
    [services],
  );

  const setServicePrice = useCallback((serviceId: string, tierId: string, price: number) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, prices: { ...s.prices, [tierId]: price } } : s,
      ),
    );
  }, []);

  // درصدِ پورسانتِ کارگر برای یک خدمت (بین ۰ و ۱۰۰ محدود می‌شود)
  const setServiceCommission = useCallback((serviceId: string, pct: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(Number.isFinite(pct) ? pct : 0)));
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

  // ================= کاربران (ورود و نقش) =================
  // نگهبان: همیشه باید حداقل یک ادمینِ فعال باقی بماند تا کسی خودش را از سیستم قفل نکند.
  const activeAdminCount = (list: User[]) => list.filter((u) => u.role === 'admin' && u.active).length;

  /** آیا نامِ داده‌شده قبلاً برای کاربرِ دیگری استفاده شده؟ (نامِ تکراری در صفحه‌ی
   *  ورود دو کاشیِ کاملاً یکسان می‌سازد و معلوم نیست کدام کدام است.) */
  const isUserNameTaken = useCallback(
    (name: string, exceptId?: string): boolean => {
      const trimmed = name.trim();
      return users.some((u) => u.id !== exceptId && u.name.trim() === trimmed);
    },
    [users],
  );

  const addUser = useCallback(
    (name: string, role: UserRole, password: string): boolean => {
      const trimmed = name.trim();
      // نگهبانِ مرزِ ورودی: نه نامِ خالی، نه نامِ تکراری، نه رمزِ خالی.
      // رمزِ خالی یعنی هرکس با زدنِ «ورود» بدونِ تایپِ چیزی وارد می‌شود.
      if (!trimmed || !password.trim()) return false;
      if (users.some((u) => u.name.trim() === trimmed)) return false;
      setUsers((prev) => [...prev, { id: uid('usr'), name: trimmed, role, password: password.trim(), active: true }]);
      return true;
    },
    [users],
  );

  const renameUser = useCallback(
    (id: string, name: string): boolean => {
      const trimmed = name.trim();
      if (!trimmed || isUserNameTaken(trimmed, id)) return false;
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, name: trimmed } : u)));
      return true;
    },
    [isUserNameTaken],
  );

  // نگهبان: رمزِ خالی پذیرفته نمی‌شود. اعتبارسنجیِ کاملِ قواعدِ رمز در لایه‌ی UI
  // (با پیامِ فارسیِ دقیق) انجام می‌شود؛ این‌جا آخرین خطِ دفاع است.
  const setUserPassword = useCallback((id: string, password: string): boolean => {
    const trimmed = password.trim();
    if (!trimmed) return false;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, password: trimmed } : u)));
    return true;
  }, []);

  // این سه اکشن قبل از تغییر، «همگام» تصمیم می‌گیرند (بر اساسِ users فعلی) تا مقدارِ
  // برگشتی قابلِ اتکا باشد؛ اگر نتیجه صفر ادمینِ فعال شود، تغییر انجام نمی‌شود.
  const setUserRole = useCallback(
    (id: string, role: UserRole): boolean => {
      const next = users.map((u) => (u.id === id ? { ...u, role } : u));
      if (activeAdminCount(next) === 0) return false;
      setUsers(next);
      return true;
    },
    [users],
  );

  const toggleUser = useCallback(
    (id: string): boolean => {
      const next = users.map((u) => (u.id === id ? { ...u, active: !u.active } : u));
      if (activeAdminCount(next) === 0) return false;
      setUsers(next);
      return true;
    },
    [users],
  );

  const removeUser = useCallback(
    (id: string): boolean => {
      const next = users.filter((u) => u.id !== id);
      if (activeAdminCount(next) === 0) return false;
      setUsers(next);
      return true;
    },
    [users],
  );

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
  // شماره‌ی قبضِ بعدی: هیچ‌وقت از «شروعِ شماره‌ی قبض» عقب‌تر نمی‌رود (تا اگر ادمین
  // شمارنده را جلو ببرد اثر کند) و هیچ‌وقت شماره‌ی تکراری نمی‌سازد (بزرگ‌ترین موجود +۱).
  const nextReceiptNumber = useMemo(() => {
    const maxExisting = maxOf(receipts.map((r) => r.receiptNumber || 0));
    return Math.max(config.receiptCounterStart, maxExisting + 1);
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

      // انعام: مبلغِ مثبتِ گِردشده. عمداً وارد `total`/`subtotal` نمی‌شود تا نه در
      // مبلغِ کلِ فاکتور بیاید و نه در درآمدِ کارواش؛ فقط به سهمِ کارگر می‌رود.
      const tip = Math.max(0, Math.round(input.tip ?? 0));

      const worker = input.workerId ? workers.find((w) => w.id === input.workerId) : undefined;

      const workerCommission = calcWorkerCommission(chosen, services, !!worker);

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
        tip: tip || undefined,
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
      setCustomers((prev) => upsertCustomer(prev, phone, name, now.toISOString()));

      return receipt;
    },
    [tiers, services, workers, nextReceiptNumber],
  );

  // byName: نامِ کاربری که ابطال را انجام می‌دهد (برای رهگیری). اختیاری تا در تست‌ها/جاهای قدیمی نشکند.
  const voidReceipt = useCallback((id: string, reason: string, byName?: string) => {
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'voided' as const, voidReason: reason.trim() || 'بدون علت', voidedBy: byName || undefined }
          : r,
      ),
    );
  }, []);

  // ویرایشِ قبض. پورسانت همیشه از نو حساب می‌شود، چون در فرمِ ویرایش می‌شود کارگر را
  // عوض کرد یا برداشت؛ اگر پورسانتِ قدیمی دست‌نخورده بماند، مبلغی به نامِ کارگری که
  // دیگر روی قبض نیست باقی می‌ماند (یا کارگرِ تازه‌اضافه‌شده پورسانتش صفر می‌شود).
  const updateReceipt = useCallback(
    (updated: Receipt) => {
      const commission = calcWorkerCommission(updated.services, services, !!updated.workerId);
      // شماره‌ی تلفن با همان قاعده‌ی لحظه‌ی صدور نرمال می‌شود (ارقامِ فارسی → لاتین).
      // بدونِ این، شماره‌ی ویرایش‌شده با هیچ جست‌وجویی جور درنمی‌آمد.
      const phone = toEnglishDigits(updated.customerPhone).trim();
      const name = updated.customerName.trim();
      const fixed: Receipt = {
        ...updated,
        customerPhone: phone,
        customerName: name,
        workerCommission: commission || undefined,
      };
      setReceipts((prev) => prev.map((r) => (r.id === fixed.id ? fixed : r)));
      // پرونده‌ی مشتری هم مثلِ لحظه‌ی صدور به‌روز می‌شود؛ وگرنه قبضِ ویرایش‌شده
      // در پنلِ «مشتریِ قدیمیِ» صفحه‌ی صندوق دیگر دیده نمی‌شد.
      setCustomers((prev) => upsertCustomer(prev, phone, name, new Date().toISOString()));
    },
    [services],
  );

  // ================= کالاها (انبار) =================
  const addProduct = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setProducts((prev) => [...prev, { id: uid('prd'), name: trimmed, price: 0, stock: 0, active: true }]);
  }, []);

  const renameProduct = useCallback((id: string, name: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const setProductPrice = useCallback((id: string, price: number) => {
    const safe = Math.max(0, Math.round(Number.isFinite(price) ? price : 0));
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, price: safe } : p)));
  }, []);

  // تنظیمِ مستقیمِ موجودی (ویرایشِ دستی)
  const setProductStock = useCallback((id: string, stock: number) => {
    const safe = Math.max(0, Math.round(Number.isFinite(stock) ? stock : 0));
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: safe } : p)));
  }, []);

  // افزایش/کاهشِ موجودی به‌اندازه‌ی delta (مثلاً +۱۰ هنگام خریدِ انبار)
  const adjustStock = useCallback((id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + Math.round(delta)) } : p)),
    );
  }, []);

  const toggleProduct = useCallback((id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ================= فروشِ کالا =================
  const nextSaleNumber = useMemo(() => maxOf(sales.map((s) => s.saleNumber || 0)) + 1, [sales]);

  const createSale = useCallback(
    (input: CreateSaleInput): Sale | null => {
      // فقط ردیف‌های معتبر (کالای موجود و تعدادِ مثبت)
      const rows: SaleItem[] = [];
      for (const row of input.items) {
        const qty = Math.round(row.qty);
        if (qty <= 0) continue;
        const product = products.find((p) => p.id === row.productId);
        if (!product) return null;
        // موجودی نباید کفاف ندهد
        if (qty > product.stock) return null;
        rows.push({ productId: product.id, name: product.name, price: product.price, qty });
      }
      if (rows.length === 0) return null;

      const subtotal = rows.reduce((sum, r) => sum + r.price * r.qty, 0);
      const discount = Math.min(Math.max(0, Math.round(input.discount ?? 0)), subtotal);
      const total = subtotal - discount;

      const phone = input.customerPhone ? toEnglishDigits(input.customerPhone).trim() : undefined;

      const now = new Date();
      const { year, month, day } = getJalaliDateParts(now);

      const sale: Sale = {
        id: uid('sal'),
        saleNumber: nextSaleNumber,
        items: rows,
        total,
        discount: discount || undefined,
        customerPhone: phone || undefined,
        notes: input.notes?.trim() || undefined,
        date: now.toISOString(),
        jalaliDate: getFormattedJalali(now, true),
        jalaliYear: year,
        jalaliMonth: month,
        jalaliDay: day,
        status: 'active',
      };

      // کم‌کردنِ موجودیِ هر کالا به‌اندازه‌ی فروخته‌شده
      setProducts((prev) =>
        prev.map((p) => {
          const sold = rows.find((r) => r.productId === p.id);
          return sold ? { ...p, stock: Math.max(0, p.stock - sold.qty) } : p;
        }),
      );

      setSales((prev) => [sale, ...prev]);
      return sale;
    },
    [products, nextSaleNumber],
  );

  // ابطالِ فروش → موجودیِ کالاها به انبار برمی‌گردد.
  // ⚠️ تصمیم و برگرداندنِ موجودی عمداً «بیرونِ» به‌روزرسانیِ فروش‌ها انجام می‌شود.
  // قبلاً برگرداندنِ موجودی داخلِ آن نوشته شده بود؛ چون React در حالتِ توسعه این
  // توابع را دو بار اجرا می‌کند، موجودی دو برابر به انبار برمی‌گشت.
  const voidSale = useCallback(
    (id: string, reason: string, byName?: string) => {
      const target = sales.find((s) => s.id === id);
      // فقط فروشِ فعال ابطال می‌شود تا ابطالِ تکراری موجودی را دوباره برنگرداند
      if (!target || target.status !== 'active') return;

      setProducts((prev) =>
        prev.map((p) => {
          const returned = target.items.find((r) => r.productId === p.id);
          return returned ? { ...p, stock: p.stock + returned.qty } : p;
        }),
      );
      setSales((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: 'voided' as const, voidReason: reason.trim() || 'بدون علت', voidedBy: byName || undefined }
            : s,
        ),
      );
    },
    [sales],
  );

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
      products,
      sales,
      config,
      users,
    };
  }, [tiers, services, workers, customers, receipts, products, sales, config, users]);

  const importData = useCallback((data: Partial<BackupData>): boolean => {
    if (!data || !Array.isArray(data.tiers) || !Array.isArray(data.services) || !Array.isArray(data.receipts)) {
      return false;
    }
    // اعتبارسنجیِ شکلِ رکوردها: یک بکاپِ خراب/قدیمی نباید کلِ داده را آلوده کند.
    // اگر حتی یک قبض/فروش ساختارِ درست نداشته باشد، کلِ واردسازی رد می‌شود تا
    // محاسباتِ مالی (که به price/status عددی و معتبر تکیه دارند) نشکنند.
    const validReceipt = (r: unknown): boolean =>
      !!r && typeof r === 'object' &&
      typeof (r as Receipt).id === 'string' &&
      typeof (r as Receipt).receiptNumber === 'number' &&
      Number.isFinite((r as Receipt).price) &&
      Array.isArray((r as Receipt).services);
    const validSale = (s: unknown): boolean =>
      !!s && typeof s === 'object' &&
      typeof (s as Sale).id === 'string' &&
      Number.isFinite((s as Sale).total) &&
      Array.isArray((s as Sale).items);

    if (!data.receipts.every(validReceipt)) return false;
    const sales = Array.isArray(data.sales) ? data.sales : [];
    if (!sales.every(validSale)) return false;

    setTiers(data.tiers);
    setServices(data.services);
    setWorkers(Array.isArray(data.workers) ? data.workers : []);
    setCustomers(Array.isArray(data.customers) ? data.customers : []);
    setReceipts(data.receipts);
    setProducts(Array.isArray(data.products) ? data.products : []);
    setSales(sales);
    if (data.config) setConfig({ ...DEFAULT_CONFIG, ...data.config });
    // کاربران: اگر بکاپِ قدیمی کاربر نداشت، کاربرانِ پیش‌فرض را نگه می‌داریم تا قفل نشویم.
    if (Array.isArray(data.users) && data.users.length > 0) setUsers(data.users);
    // بازیابیِ موفق یعنی داده‌ی معتبری در دست داریم، پس نوشتن دوباره آزاد می‌شود.
    setWritesFrozen(false);
    return true;
  }, []);

  /**
   * «می‌دانم داده‌ی قبلی خوانده نشد، با همین وضعِ خالی ادامه بده.»
   * تصمیمِ صریحِ کاربر است و تنها راهِ برداشتنِ یخِ ذخیره‌سازی بدونِ بازیابی.
   */
  const acceptDataLoss = useCallback(() => setWritesFrozen(false), []);

  /** بستنِ نوارِ هشدارِ شکستِ نوشتن (تا خطای بعدی دوباره ظاهر شود). */
  const dismissSaveError = useCallback(() => setSaveError(null), []);

  const resetAll = useCallback(() => {
    setTiers(DEFAULT_TIERS);
    setServices(DEFAULT_SERVICES);
    setWorkers(DEFAULT_WORKERS);
    setCustomers([]);
    setReceipts([]);
    setProducts(DEFAULT_PRODUCTS);
    setSales([]);
    setConfig(DEFAULT_CONFIG);
    setUsers(DEFAULT_USERS);
    setWritesFrozen(false);
  }, []);

  return {
    // سلامتِ ذخیره‌سازی
    /** کلیدهایی که خواندنشان شکست خورد؛ تا خالی نشود نوشتن یخ است. */
    loadFailedKeys,
    writesFrozen,
    saveError,
    acceptDataLoss,
    dismissSaveError,
    // state
    tiers,
    services,
    workers,
    customers,
    receipts,
    products,
    sales,
    config,
    users,
    nextReceiptNumber,
    nextSaleNumber,
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
    // users
    addUser,
    isUserNameTaken,
    renameUser,
    setUserPassword,
    setUserRole,
    toggleUser,
    removeUser,
    // customers
    getCustomerByPhone,
    getCustomerHistory,
    // receipts
    createReceipt,
    voidReceipt,
    updateReceipt,
    // products
    addProduct,
    renameProduct,
    setProductPrice,
    setProductStock,
    adjustStock,
    toggleProduct,
    removeProduct,
    // sales
    createSale,
    voidSale,
    // config
    updateConfig,
    // data
    exportData,
    importData,
    resetAll,
  };
}
