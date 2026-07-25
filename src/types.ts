/**
 * مدل‌های داده‌ی سیستم کارواش.
 *
 * ایده‌ی کلیدی: «خدمات» یک لیستِ واحد هستند و برای همه‌ی تیپ‌ها یکسان‌اند؛
 * فقط قیمتِ هر خدمت بسته به تیپِ خودرو فرق می‌کند (ماتریسِ خدمت × تیپ).
 */

/** تیپِ خودرو — پایه‌ی قیمت‌گذاری (سواری، شاسی‌بلند، سنگین، ...) */
export interface Tier {
  id: string;
  name: string;
}

/** یک خدمت (روشویی، توشویی، ...) با قیمتِ مجزا برای هر تیپ */
export interface Service {
  id: string;
  name: string;
  /** نگاشتِ tierId → قیمت (ریال) برای آن تیپ؛ در UI به تومان نمایش/ویرایش می‌شود */
  prices: Record<string, number>;
  /** درصدِ پورسانتِ کارگر از این خدمت (۰ تا ۱۰۰)؛ نبودنش یعنی صفر */
  commissionPct?: number;
}

/** کارگرِ کارواش — انتخابش روی قبض اختیاری است */
export interface Worker {
  id: string;
  name: string;
  active: boolean;
}

/** نقشِ کاربر: ادمین (دسترسیِ کامل) یا صندوقدار (فقط صندوق) */
export type UserRole = 'admin' | 'cashier';

/**
 * کاربرِ سیستم که با آن وارد می‌شود. هنگام ورود، کاربر نامش را از فهرست انتخاب
 * می‌کند و رمزش را می‌زند (یوزرنیم تایپ نمی‌شود). نقش، دسترسی را تعیین می‌کند.
 */
export interface User {
  id: string;
  name: string;
  role: UserRole;
  /** رمزِ ورود (متن ساده — اپ آفلاین است، مثلِ بقیه‌ی تنظیمات) */
  password: string;
  active: boolean;
}

/** مشتری؛ کلیدِ اصلی شماره‌ی اوست */
export interface Customer {
  phone: string;
  name: string;
  createdAt: string; // ISO
}

/** ردیفِ خدمتِ ثبت‌شده روی یک قبض (اسنپ‌شاتِ قیمت در لحظه‌ی صدور) */
export interface ReceiptService {
  id: string;
  name: string;
  price: number;
}

/** یک قبضِ صادرشده */
export interface Receipt {
  id: string;
  receiptNumber: number;

  // مشتری
  customerPhone: string;
  customerName: string;

  // خودرو
  carModel: string; // نوع/مدل ماشین (متن آزاد، مثل «پژو ۲۰۶ سفید»)
  tierId: string;
  tierName: string;

  // خدمات و مبلغ
  services: ReceiptService[];
  price: number; // مبلغ قابل پرداخت = جمع خدمات منهای تخفیف (انعام در این مبلغ نیست)
  discount?: number; // مبلغِ تخفیفِ اعمال‌شده (ریال)؛ نبودنش یعنی صفر
  workerCommission?: number; // پورسانتِ کارگرِ این قبض (اسنپ‌شات در لحظه‌ی صدور)
  /**
   * انعامِ کارگر (ریال). عمداً جدا از `price` نگه داشته می‌شود: در مبلغِ کلِ فاکتور
   * و در درآمدِ کارواش حساب نمی‌شود، بلکه مستقیماً به سهمِ کارگر اضافه می‌شود و در
   * «دستمزد کارگرها» جداگانه از پورسانت نمایش داده می‌شود.
   */
  tip?: number;

  // کارگر (اختیاری)
  workerId?: string;
  workerName?: string;

  notes?: string;

  // تاریخ
  date: string; // ISO
  jalaliDate: string;
  jalaliYear: number;
  jalaliMonth: number;
  jalaliDay: number;

  // وضعیت
  status: 'active' | 'voided';
  voidReason?: string;
  /** نامِ کاربری که این قبض را باطل کرده (برای رهگیری) */
  voidedBy?: string;
}

/**
 * کالای انبار (لوازم جانبی) — مثل شامپو، خوشبوکننده، برف‌پاک‌کن.
 * جدا از «خدمات» است چون موجودی (تعداد) دارد و با هر فروش کم می‌شود.
 */
export interface Product {
  id: string;
  name: string;
  /** قیمتِ فروش (ریال)؛ در UI به تومان نمایش/ویرایش می‌شود */
  price: number;
  /** موجودیِ فعلی (تعداد) */
  stock: number;
  /** کالای غیرفعال در صفحه‌ی فروش نمایش داده نمی‌شود */
  active: boolean;
}

/** یک ردیفِ کالای فروخته‌شده روی قبضِ فروش (اسنپ‌شاتِ قیمت و تعداد در لحظه‌ی فروش) */
export interface SaleItem {
  productId: string;
  name: string;
  price: number; // قیمتِ واحد در لحظه‌ی فروش (ریال)
  qty: number;
}

/**
 * قبضِ فروشِ لوازم جانبی — کاملاً جدا از Receipt (قبضِ شست‌وشو).
 * شمارنده، تاریخچه، چاپ و گزارشِ آن مستقل است.
 */
export interface Sale {
  id: string;
  saleNumber: number;

  items: SaleItem[];
  total: number; // مبلغ قابل پرداخت = جمعِ اقلام منهای تخفیف
  discount?: number; // مبلغِ تخفیفِ اعمال‌شده (ریال)؛ نبودنش یعنی صفر

  customerPhone?: string; // اختیاری
  notes?: string;

  // تاریخ
  date: string; // ISO
  jalaliDate: string;
  jalaliYear: number;
  jalaliMonth: number;
  jalaliDay: number;

  // وضعیت
  status: 'active' | 'voided';
  voidReason?: string;
  /** نامِ کاربری که این فروش را باطل کرده (برای رهگیری) */
  voidedBy?: string;
}

/** تنظیماتِ کلیِ برنامه */
export interface CarwashConfig {
  shopName: string;
  footerText: string;
  receiptCounterStart: number;
  /** رمزِ ورود به پنل مدیریت؛ رشته‌ی خالی یعنی بدون رمز */
  adminPin: string;
  /**
   * «مرا به‌خاطر بسپار» برای پنل: چند دقیقه بعد از ورودِ موفق، دوباره رمز پرسیده نشود.
   * ۰ = هر بار بپرس (امن‌ترین).  مثلاً ۱۵ = تا ۱۵ دقیقه دوباره نپرس.
   */
  adminUnlockMinutes: number;
  /**
   * حالتِ چاپ:
   * - 'dialog': نمایشِ پنجره‌ی چاپِ سیستم (پیش‌فرض؛ همه‌جا کار می‌کند)
   * - 'silent': چاپِ مستقیم به پرینترِ انتخاب‌شده بدونِ پنجره (مناسبِ پرینترِ حرارتی)
   * - 'off': بدونِ پرینتر — قبض فقط در سیستم ثبت می‌شود (برای جمعِ آخرِ شب)
   */
  printMode: 'dialog' | 'silent' | 'off';
  /** نامِ پرینترِ مقصد در حالتِ silent (از لیستِ پرینترهای سیستم) */
  printerName: string;
}

/** ساختارِ فایلِ پشتیبان */
export interface BackupData {
  version: string;
  exportedAt: string;
  tiers: Tier[];
  services: Service[];
  workers: Worker[];
  customers: Customer[];
  receipts: Receipt[];
  products: Product[];
  sales: Sale[];
  config: CarwashConfig;
  users?: User[];
}
