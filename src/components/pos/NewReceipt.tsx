import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Printer, UserCheck, History as HistoryIcon } from 'lucide-react';
import { Receipt } from '../../types';
import { Store } from '../../data/store';
import { formatCurrencyToman, toPersianDigits, tomanToRial } from '../../utils/format';
import { Callout, Field, inputClass, NumberInput, PrimaryButton, SectionCard } from '../common';

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
  // تخفیف و انعام را کاربر به «تومان» وارد می‌کند و به‌صورتِ عدد نگه می‌داریم
  // (نه رشته) تا ورودیِ عددیِ کاربرپسند با ارقامِ فارسی و انتخابِ خودکار کار کند.
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);

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
  // قیمت‌ها داخل سیستم به ریال‌اند؛ تخفیف/انعامِ تومانی را ×۱۰ می‌کنیم.
  // تخفیف بین صفر و جمعِ خدمات محدود می‌شود تا مبلغ منفی نشود.
  const discountValue = Math.min(tomanToRial(discount), subtotal);
  // 🔵 انعام عمداً در «total» نمی‌آید — نه در فاکتور، نه در درآمدِ کارواش.
  const tipValue = tomanToRial(tip);
  const total = subtotal - discountValue;

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
    setDiscount(0);
    setTip(0);
  };

  // قفلِ ضدِ دوبار-کلیک: بدونِ آن، دو کلیکِ سریع می‌تواند دو قبض با شماره‌ی یکسان بسازد
  // (چون شماره‌ی بعدی از state خوانده می‌شود که هنوز به‌روز نشده).
  const submittingRef = useRef(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
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
      tip: tipValue,
    });

    if (!receipt) return notify('خطا در صدور قبض؛ ورودی‌ها را بررسی کنید', 'error');

    // قفل را کوتاه فعال کن تا کلیکِ دومِ اتفاقی نادیده گرفته شود
    submittingRef.current = true;
    window.setTimeout(() => {
      submittingRef.current = false;
    }, 700);

    // این پیام فقط ثبتِ قبض را تأیید می‌کند؛ نتیجه‌ی چاپ جداگانه اعلام می‌شود.
    const noPrint = store.config.printMode === 'off';
    notify(
      `قبض شماره ${toPersianDigits(receipt.receiptNumber)} ${noPrint ? 'ثبت شد (چاپ غیرفعال)' : 'ثبت شد'}`,
      'success',
    );
    resetForm();
    onPrint(receipt);
  };

  // بدونِ تیتر: زبانه‌ی بالای صفحه («قبض شست‌وشو») همین حالا اسمِ این صفحه را
  // گفته و تکرارش فقط یک سطرِ اضافه بود.
  return (
    <SectionCard>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
              className={`${inputClass} tabular-nums`}
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
          <Callout
            tone="accent"
            icon={UserCheck}
            title={`مشتریِ قدیمی: ${existingCustomer.name} — ${toPersianDigits(history.length)} قبض پیشین`}
            className="animate-fade-in"
          >
            {history.length > 0 && (
              <ul className="divide-y divide-[var(--border)] max-h-56 overflow-y-auto -mb-1">
                {history.slice(0, 10).map((r) => (
                  <li key={r.id} className="py-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 min-w-0">
                      <HistoryIcon className="w-3 h-3 text-[var(--text-faint)] shrink-0" />
                      <span className="truncate">
                        {r.jalaliDate} — {r.tierName}
                      </span>
                    </span>
                    <span
                      className={`tabular-nums shrink-0 ${
                        r.status === 'voided'
                          ? 'line-through text-[var(--text-faint)]'
                          : 'font-semibold text-[var(--text)]'
                      }`}
                    >
                      {formatCurrencyToman(r.price)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Callout>
        )}

        {/* خطِ جداکننده‌ی سکشن */}
        <div className="border-t border-[var(--border)]" />

        {/* ===== سکشن ۲: تیپ ماشین (گام ۴) ===== */}
        <Field label="۴) تیپ ماشین" required>
          {/* چیپِ انتخابی به‌جای شبکه‌ی دکمه‌های هم‌عرض: تعدادِ تیپ‌ها را کاربر
              تعیین می‌کند، پس ردیفِ چیدمان باید با تعدادشان جلو برود نه با یک
              شبکه‌ی ثابتِ سه‌ستونه که با چهار تیپ یک خانه‌ی خالی می‌ساخت. */}
          <div className="flex flex-wrap gap-2">
            {tiers.map((t) => (
              <button
                type="button"
                key={t.id}
                aria-pressed={tierId === t.id}
                onClick={() => setTierId(t.id)}
                className={`px-4 py-2.5 rounded-xl border text-[13px] cursor-pointer transition-colors ${
                  tierId === t.id
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)] font-semibold'
                    : 'border-[var(--border)] bg-[var(--field-bg)] text-[var(--text-muted)] font-medium hover:border-[var(--field-hover-border)] hover:text-[var(--text)]'
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
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selected
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border)] bg-[var(--field-bg)] hover:border-[var(--field-hover-border)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleService(s.id)}
                      className="w-4 h-4 accent-[var(--accent)] shrink-0"
                    />
                    <span
                      className={`text-[13px] truncate ${
                        selected ? 'font-semibold text-[var(--text)]' : 'font-medium text-[var(--text-muted)]'
                      }`}
                    >
                      {s.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--text)] tabular-nums px-2 py-1 rounded-lg bg-[var(--chip-bg)] border border-[var(--chip-border)] shrink-0">
                    {formatCurrencyToman(priceFor(s.id))}
                  </span>
                </label>
              );
            })}
          </div>
        </Field>

        {/* خطِ جداکننده‌ی سکشن */}
        <div className="border-t border-[var(--border)]" />

        {/* ===== سکشن ۴: کارگر، انعام، تخفیف و توضیحات (گام‌های ۶، ۷ و ۸) ===== */}
        {/* گام ۶، ۷ و ۸: کارگر + انعام + تخفیف — در یک خط */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
          <Field label="۷) انعام کارگر (تومان)" hint="(اختیاری، جدا از مبلغ کل)">
            <NumberInput
              placeholder="۰"
              value={tip}
              onValueChange={setTip}
              className={`${inputClass} tabular-nums`}
            />
          </Field>
          <Field label="۸) تخفیف (تومان)" hint="(اختیاری، از مبلغ کل کم می‌شود)">
            <NumberInput
              placeholder="۰"
              value={discount}
              onValueChange={setDiscount}
              className={`${inputClass} tabular-nums`}
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

        {/* ===== نوارِ پایانی: مبلغ و ثبت =====
            تنها عنصرِ «بلندِ» این صفحه. مبلغ بی‌رنگ ولی بزرگ و هم‌عرض است تا از
            یک متری هم خوانده شود، و خطِ فیروزه‌ایِ لبه‌ی راستِ کادر می‌گوید عددی
            که از مشتری می‌گیری همین است. */}
        <div className="border-t border-[var(--border)] pt-5 flex flex-col gap-2.5">
          {discountValue > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] px-1">
              <span className="tabular-nums">جمع خدمات: {formatCurrencyToman(subtotal)}</span>
              <span className="tabular-nums text-[var(--danger-text)]">
                تخفیف: {formatCurrencyToman(discountValue)}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {/* 🔴 فقط مبلغِ کل داخلِ این کادر باشد — تست‌ها عددِ داخلِ .cw-total را
                به‌عنوانِ «مبلغِ کل» می‌خوانند و هر رقمِ دیگری آن را خراب می‌کند. */}
            <div className="cw-total flex-1 px-5 py-3.5 flex items-center justify-between gap-4">
              <span className="text-[13px] font-medium text-[var(--text-muted)]">مبلغ کل قابل پرداخت</span>
              <span className="cw-amount text-[28px] leading-none">{formatCurrencyToman(total)}</span>
            </div>
            <PrimaryButton type="submit" className="shrink-0 px-8 !py-4 text-base">
              <Printer className="w-5 h-5" />
              ثبت و چاپ قبض
            </PrimaryButton>
          </div>

          {/* انعام جداگانه: جدا از مبلغِ کل نمایش داده می‌شود و مستقیم سهمِ کارگر است */}
          {tipValue > 0 && (
            <span className="text-xs font-medium text-[var(--ok-text)] tabular-nums px-1">
              انعام کارگر (جدا از مبلغ کل): {formatCurrencyToman(tipValue)}
            </span>
          )}
        </div>
      </form>
    </SectionCard>
  );
}
