import { CarwashConfig, Product, Service, Tier, User, Worker } from '../types';
import { DEFAULT_ADMIN_PIN } from '../auth';

/**
 * داده‌های پیش‌فرضِ اولین اجرا.
 * تیپ‌ها ستون‌اند و خدمات ردیف؛ قیمتِ هر خدمت برای هر تیپ جداست.
 */

export const DEFAULT_TIERS: Tier[] = [
  { id: 'tier-sedan', name: 'سواری' },
  { id: 'tier-suv', name: 'شاسی‌بلند / کراس‌اوور' },
  { id: 'tier-heavy', name: 'وانت و خودرو سنگین' },
];

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-roshuyi',
    name: 'روشویی (نظافت بدنه)',
    prices: { 'tier-sedan': 400000, 'tier-suv': 600000, 'tier-heavy': 800000 },
    commissionPct: 40,
  },
  {
    id: 'srv-jaru',
    name: 'جارو و نظافت داخل',
    prices: { 'tier-sedan': 300000, 'tier-suv': 400000, 'tier-heavy': 500000 },
    commissionPct: 50,
  },
  {
    id: 'srv-toshuyi',
    name: 'توشویی (شستشوی کامل داخل)',
    prices: { 'tier-sedan': 800000, 'tier-suv': 1200000, 'tier-heavy': 1500000 },
    commissionPct: 40,
  },
  {
    id: 'srv-motorshuyi',
    name: 'موتورشویی',
    prices: { 'tier-sedan': 500000, 'tier-suv': 700000, 'tier-heavy': 900000 },
    commissionPct: 40,
  },
  {
    id: 'srv-sefrshuyi',
    name: 'صفرشویی کامل خودرو',
    prices: { 'tier-sedan': 2000000, 'tier-suv': 3000000, 'tier-heavy': 4000000 },
    commissionPct: 30,
  },
];

/**
 * کالاهای پیش‌فرضِ انبار (لوازم جانبی).
 * قیمت‌ها به ریال‌اند (در UI به تومان دیده می‌شوند). موجودیِ اولیه نمونه است.
 */
export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'prd-shampoo', name: 'شامپو بدنه خودرو', price: 850000, stock: 12, active: true },
  { id: 'prd-freshener', name: 'خوشبوکننده', price: 250000, stock: 30, active: true },
  { id: 'prd-wiper', name: 'تیغه برف‌پاک‌کن', price: 1200000, stock: 8, active: true },
  { id: 'prd-towel', name: 'دستمال میکروفایبر', price: 350000, stock: 25, active: true },
];

export const DEFAULT_WORKERS: Worker[] = [
  { id: 'wrk-1', name: 'اکبری', active: true },
  { id: 'wrk-2', name: 'محمدی', active: true },
];

/**
 * کاربرانِ پیش‌فرض: یک ادمین که با آن اولین ورود انجام می‌شود (رمز = yatash).
 * ادمین بعد از ورود می‌تواند صندوقدار و ادمین‌های دیگر بسازد و رمزها را عوض کند.
 */
export const DEFAULT_USERS: User[] = [
  { id: 'usr-admin', name: 'مدیر', role: 'admin', password: DEFAULT_ADMIN_PIN, active: true },
];

export const DEFAULT_CONFIG: CarwashConfig = {
  shopName: 'کارواش',
  footerText:
    'از انتخاب شما متشکریم! لطفاً اشیاء قیمتی خود را از خودرو خارج کنید. کارواش مسئولیتی در قبال مفقود شدن اشیاء گران‌قیمت ندارد.',
  receiptCounterStart: 1000,
  /**
   * 🔴 پیش‌فرض «چاپِ حرارتیِ مستقیم» است.
   * پرینترهای فیش‌زنِ ارزان مدلِ خودشان را به سیستم‌عامل اعلام نمی‌کنند، پس هیچ
   * درایورِ مخصوصی برایشان نصب نمی‌شود و مسیرِ معمولِ چاپ به‌جای فیش، کدهای خامِ
   * زبانِ صفحه‌بندی را روی کاغذ می‌ریزد (کاغذِ بی‌پایانِ پر از متنِ نامفهوم).
   * حالتِ حرارتی این زنجیره را کنار می‌گذارد و با زبانِ خودِ پرینتر حرف می‌زند.
   * فقط روی نصب‌های تازه اثر دارد؛ انتخابِ ذخیره‌شده‌ی کاربر دست نمی‌خورد.
   */
  printMode: 'thermal',
  printerName: '',
};
