import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Printer, UserCheck, History as HistoryIcon } from 'lucide-react';
import { Receipt } from '../../types';
import { Store } from '../../data/store';
import { formatCurrencyToman, toEnglishDigits, toPersianDigits, tomanToRial } from '../../utils/format';
import { Field, inputClass, PrimaryButton, SectionCard } from '../common';

interface Props {
  store: Store;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onPrint: (receipt: Receipt) => void;
}

/** صفحه‌ی اصلیِ صندوق: صدور سریع قبض */
export default function NewReceipt({ store, notify, onPrint }: Props) {
  const { tiers, services, workers, createReceipt, getCustomerByPhone, getCustomerHistory } = store;

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [carModel, setCarModel] = useState('');
  const [tierId, setTierId] = useState('');
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [workerId, setWorkerId] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState('');

  // انتخابِ پیش‌فرضِ اولین تیپ
  useEffect(() => {
    if (tiers.length > 0 && !tiers.some((t) => t.id === tierId)) {
      setTierId(tiers[0].id);
    }
  }, [tiers, tierId]);

  // شناساییِ مشتریِ قدیمی بر اساس شماره
  const existingCustomer = useMemo(() => getCustomerByPhone(phone), [phone, getCustomerByPhone]);
  const history = useMemo(() => getCustomerHistory(phone), [phone, getCustomerHistory]);

  // پُرکردنِ خودکارِ نام وقتی مشتری شناخته شد
  useEffect(() => {
    if (existingCustomer) setName(existingCustomer.name);
    // فقط با تغییر شماره‌ی شناسایی‌شده اجرا شود
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingCustomer?.phone]);

  const activeWorkers = workers.filter((w) => w.active);

  // مبلغِ هر خدمت برای تیپِ انتخابی
  const priceFor = (serviceId: string) => {
    const s = services.find((x) => x.id === serviceId);
    return s?.prices[tierId] ?? 0;
  };

  const subtotal = serviceIds.reduce((sum, id) => sum + priceFor(id), 0);
  // کاربر تخفیف را به «تومان» وارد می‌کند؛ قیمت‌ها داخل سیستم به ریال ذخیره‌اند،
  // پس ×۱۰ می‌کنیم و بین صفر و جمعِ خدمات محدود می‌کنیم تا مبلغ منفی نشود.
  const discountToman = Math.max(0, Number(toEnglishDigits(discount).replace(/[^0-9]/g, '')) || 0);
  const discountValue = Math.min(tomanToRial(discountToman), subtotal);
  const total = subtotal - discountValue;

  // ورودیِ تخفیف را حینِ تایپ به «رقمِ فارسی + جداکننده‌ی سه‌رقمی» تبدیل می‌کنیم
  // تا هم‌شکلِ قیمت‌هایِ نمایش‌داده‌شده باشد (مثلِ ۱۲٬۵۰۰).
  const handleDiscountChange = (raw: string) => {
    const digits = toEnglishDigits(raw).replace(/[^0-9]/g, '');
    setDiscount(digits ? new Intl.NumberFormat('fa-IR').format(Number(digits)) : '');
  };

  const toggleService = (id: string) => {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const resetForm = () => {
    setPhone('');
    setName('');
    setCarModel('');
    setServiceIds([]);
    setWorkerId('');
    setNotes('');
    setDiscount('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return notify('شماره‌ی مشتری را وارد کنید', 'error');
    if (!name.trim()) return notify('نام مشتری را وارد کنید', 'error');
    if (!tierId) return notify('تیپ خودرو را انتخاب کنید', 'error');
    if (serviceIds.length === 0) return notify('حداقل یک خدمت را انتخاب کنید', 'error');

    const receipt = createReceipt({
      customerPhone: phone,
      customerName: name,
      carModel,
      tierId,
      serviceIds,
      workerId: workerId || undefined,
      notes,
      discount: discountValue,
    });

    if (!receipt) return notify('خطا در صدور قبض؛ ورودی‌ها را بررسی کنید', 'error');

    const noPrint = store.config.printMode === 'off';
    notify(
      `قبض شماره ${toPersianDigits(receipt.receiptNumber)} ${noPrint ? 'ثبت شد (چاپ غیرفعال)' : 'صادر و برای چاپ ارسال شد'}`,
      'success',
    );
    resetForm();
    onPrint(receipt);
  };

  return (
    <SectionCard
      title="صدور قبض جدید"
      subtitle="شماره‌ی مشتری را بزنید، خدمات را انتخاب کنید و فیش را چاپ کنید."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        {/* ===== سکشن ۱: مشتری و خودرو (گام‌های ۱، ۲، ۳) ===== */}
        {/* گام ۱، ۲ و ۳: مشتری و خودرو — در یک خط */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="۱) شماره‌ی مشتری" required>
            <input
              inputMode="numeric"
              autoFocus
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${inputClass} text-right font-mono`}
            />
          </Field>
          <Field label="۲) نام مشتری" required>
            <input
              placeholder="نام و نام خانوادگی"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="۳) نوع و مدل ماشین" hint="(اختیاری)">
            <input
              placeholder="برند، رنگ یا مدل خودرو"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        {/* پنلِ سوابقِ مشتریِ قدیمی */}
        {existingCustomer && (
          <div className="bg-[var(--accent-soft)] border border-[var(--accent-border)] rounded-xl p-4 flex flex-col gap-2 animate-fade-in">
            <div className="flex items-center gap-2 text-[var(--accent-text)] text-xs font-bold">
              <UserCheck className="w-4 h-4" />
              مشتریِ قدیمی: {existingCustomer.name} — {toPersianDigits(history.length)} قبض پیشین
            </div>
            {history.length > 0 && (
              <ul className="divide-y divide-[var(--accent-border)] text-[11px] font-semibold text-[var(--text-muted)]">
                {history.slice(0, 4).map((r) => (
                  <li key={r.id} className="py-1.5 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <HistoryIcon className="w-3 h-3 text-[var(--text-faint)]" />
                      {r.jalaliDate} — {r.tierName}
                    </span>
                    <span className={`font-mono ${r.status === 'voided' ? 'line-through text-[var(--text-faint)]' : 'text-[var(--price)]'}`}>
                      {formatCurrencyToman(r.price)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* خطِ جداکننده‌ی سکشن */}
        <div className="border-t border-[var(--border)]" />

        {/* ===== سکشن ۲: تیپ ماشین (گام ۴) ===== */}
        <Field label="۴) تیپ ماشین" required>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tiers.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTierId(t.id)}
                className={`px-3 py-3 rounded-xl border-2 text-xs font-bold cursor-pointer transition-all ${
                  tierId === t.id
                    ? 'border-[var(--field-active-border)] bg-[var(--field-bg)] text-[var(--field-text)] shadow-sm'
                    : 'border-[var(--border)] bg-[var(--field-bg)] text-[var(--field-muted)] hover:bg-[var(--field-hover-bg)] hover:border-[var(--field-hover-border)]'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </Field>

        {/* خطِ جداکننده‌ی سکشن */}
        <div className="border-t border-[var(--border)]" />

        {/* ===== سکشن ۳: خدمات (گام ۵) ===== */}
        <Field label="۵) خدمات" required hint="(قیمت‌ها بر اساس تیپِ انتخابی)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {services.map((s) => {
              const selected = serviceIds.includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selected
                      ? 'border-[var(--money-border)] bg-[var(--field-bg)] text-[var(--field-text)] shadow-sm'
                      : 'border-[var(--border)] bg-[var(--field-bg)] text-[var(--field-muted)] hover:bg-[var(--field-hover-bg)] hover:border-[var(--field-hover-border)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleService(s.id)}
                      className="w-4 h-4 accent-[var(--money-strong)]"
                    />
                    <span className="text-xs font-bold">{s.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-[var(--price)] font-mono px-2 py-0.5 rounded-md bg-[var(--price-soft)] shrink-0">
                    {formatCurrencyToman(priceFor(s.id))}
                  </span>
                </label>
              );
            })}
          </div>
        </Field>

        {/* خطِ جداکننده‌ی سکشن */}
        <div className="border-t border-[var(--border)]" />

        {/* ===== سکشن ۴: کارگر، تخفیف و توضیحات (گام‌های ۶ و ۷) ===== */}
        {/* گام ۶ و ۷: کارگر + تخفیف — در یک خط */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="۶) کارگرِ شوینده" hint="(اختیاری)">
            <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className={inputClass}>
              <option value="">— مشخص نشده —</option>
              {activeWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="۷) تخفیف (تومان)" hint="(اختیاری، از مبلغ کل کم می‌شود)">
            <input
              inputMode="numeric"
              placeholder="۰"
              value={discount}
              onChange={(e) => handleDiscountChange(e.target.value)}
              className={`${inputClass} text-right font-mono tabular-nums`}
            />
          </Field>
        </div>

        {/* توضیحات — در خطِ جداگانه پایین */}
        <Field label="توضیحات" hint="(اختیاری)">
          <input
            placeholder="یادداشت یا خدمات خاص..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
          />
        </Field>

        {/* جمع و ثبت */}
        <div className="border-t border-[var(--border)] pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex flex-col gap-1.5">
            {discountValue > 0 && (
              <span className="text-[11px] font-semibold text-[var(--text-muted)] px-1">
                جمع خدمات: {formatCurrencyToman(subtotal)}
                <span className="text-[var(--danger-text)]"> — تخفیف: {formatCurrencyToman(discountValue)}</span>
              </span>
            )}
            {/* مبلغ کل: یک خط، بدون آیکون، فونتِ معمولی */}
            <div className="cw-total rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-[var(--text-muted)]">مبلغ کل قابل پرداخت</span>
              <span className="text-2xl font-extrabold text-[var(--price)] font-mono leading-none">
                {formatCurrencyToman(total)}
              </span>
            </div>
          </div>
          <PrimaryButton type="submit" className="w-full sm:w-auto px-8 py-3.5 text-base rounded-2xl">
            <Printer className="w-5 h-5" />
            ثبت و چاپ قبض
          </PrimaryButton>
        </div>
      </form>
    </SectionCard>
  );
}
