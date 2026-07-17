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
  /** نگاشتِ tierId → قیمت (تومان) برای آن تیپ */
  prices: Record<string, number>;
}

/** کارگرِ کارواش — انتخابش روی قبض اختیاری است */
export interface Worker {
  id: string;
  name: string;
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
  price: number; // مبلغ قابل پرداخت = جمع خدمات منهای تخفیف
  discount?: number; // مبلغِ تخفیفِ اعمال‌شده (تومان)؛ نبودنش یعنی صفر

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
}

/** تنظیماتِ کلیِ برنامه */
export interface CarwashConfig {
  shopName: string;
  footerText: string;
  receiptCounterStart: number;
  /** رمزِ ورود به پنل مدیریت؛ رشته‌ی خالی یعنی بدون رمز */
  adminPin: string;
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
  config: CarwashConfig;
}
