import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { Download, Upload, RefreshCw, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { Store } from '../../data/store';
import { getJalaliDateParts } from '../../utils/jalali';
import { SectionCard, inputClass, PrimaryButton, Field } from '../common';

export default function GeneralSettings({
  store,
  notify,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const { config, updateConfig, exportData, importData, resetAll } = store;
  const fileRef = useRef<HTMLInputElement>(null);

  const [shopName, setShopName] = useState(config.shopName);
  const [footer, setFooter] = useState(config.footerText);
  const [counterStart, setCounterStart] = useState<number>(config.receiptCounterStart);
  const [pin, setPin] = useState(config.adminPin);
  const [showPin, setShowPin] = useState(false);

  const saveGeneral = (e: FormEvent) => {
    e.preventDefault();
    updateConfig({ shopName: shopName.trim() || 'کارواش', footerText: footer, receiptCounterStart: Number(counterStart) || 1000 });
    notify('تنظیمات ذخیره شد', 'success');
  };

  const savePin = (e: FormEvent) => {
    e.preventDefault();
    updateConfig({ adminPin: pin.trim() });
    notify(pin.trim() ? 'رمز پنل تنظیم شد' : 'رمز پنل حذف شد', 'success');
  };

  const handleBackup = () => {
    const data = exportData();
    const href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const { year, month, day } = getJalaliDateParts(new Date());
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.setAttribute('download', `carwash_backup_${year}_${month}_${day}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    notify('فایل پشتیبان دانلود شد', 'success');
  };

  const handleRestore = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (importData(parsed)) notify('اطلاعات با موفقیت بازیابی شد', 'success');
        else notify('ساختار فایل معتبر نیست', 'error');
      } catch {
        notify('خطا در خواندن فایل', 'error');
      }
    };
    reader.readAsText(file, 'UTF-8');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleReset = () => {
    if (confirm('هشدار: تمام قبوض، مشتری‌ها، خدمات و تنظیمات پاک و بازنشانی می‌شود. مطمئن هستید؟')) {
      resetAll();
      setShopName('کارواش');
      notify('سیستم بازنشانی شد', 'info');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* تنظیمات عمومی */}
      <SectionCard title="تنظیمات عمومی و قبض">
        <form onSubmit={saveGeneral} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="نام کارواش">
            <input value={shopName} onChange={(e) => setShopName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="شروع شماره‌ی قبض">
            <input type="number" value={counterStart} onChange={(e) => setCounterStart(Number(e.target.value))} className={`${inputClass} font-mono`} />
          </Field>
          <div className="md:col-span-3">
            <Field label="متن پایین قبض">
              <textarea rows={2} value={footer} onChange={(e) => setFooter(e.target.value)} className={`${inputClass} resize-none`} />
            </Field>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <PrimaryButton type="submit">
              <Save className="w-4 h-4" /> ذخیره‌ی تنظیمات
            </PrimaryButton>
          </div>
        </form>
      </SectionCard>

      {/* رمز پنل */}
      <SectionCard title="رمز پنل مدیریت" subtitle="برای جداسازیِ دسترسیِ کارگر از تنظیمات. رمزِ فعلی همین‌جا نمایش داده می‌شود (با دکمه‌ی چشم)؛ می‌توانید عوضش کنید. خالی بگذارید تا بدون رمز باز شود.">
        <form onSubmit={savePin} className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <Field label="رمز عبور پنل">
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-faint)] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="خالی = بدون رمز"
                  className={`${inputClass} pr-9 pl-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  title={showPin ? 'پنهان‌کردن رمز' : 'نمایش رمز'}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] rounded-lg cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          </div>
          <PrimaryButton type="submit" className="w-full sm:w-auto">ثبت رمز</PrimaryButton>
        </form>
      </SectionCard>

      {/* پشتیبان‌گیری */}
      <SectionCard title="پشتیبان‌گیری و بازیابی" subtitle="تمام اطلاعات آفلاین ذخیره می‌شوند؛ برای اطمینان مرتب بکاپ بگیرید.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleBackup}
            className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] flex items-center gap-3 cursor-pointer transition-all text-right"
          >
            <Download className="w-6 h-6 text-[var(--money-text)] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[var(--text)]">دانلود فایل پشتیبان</div>
              <div className="text-[10px] text-[var(--text-faint)] mt-0.5">ذخیره‌ی همه‌چیز در یک فایل json</div>
            </div>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="p-4 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] hover:bg-[var(--accent-soft)] flex items-center gap-3 cursor-pointer transition-all text-right"
          >
            <Upload className="w-6 h-6 text-[var(--accent-text)] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[var(--text)]">بازیابی از فایل</div>
              <div className="text-[10px] text-[var(--text-faint)] mt-0.5">بارگذاری یک بکاپ قبلی</div>
            </div>
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleRestore} className="hidden" />
        </div>

        <div className="mt-2 bg-[var(--danger-soft)] border border-[var(--danger-border)] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h5 className="text-xs font-bold text-[var(--danger-text)]">بازنشانی کامل سیستم</h5>
            <p className="text-[10px] text-[var(--danger-text)] mt-0.5">تمام داده‌ها حذف و به حالت اولیه برمی‌گردد (غیرقابل بازگشت).</p>
          </div>
          <button
            onClick={handleReset}
            className="bg-[var(--danger-strong)] hover:bg-[var(--danger-strong)] text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> ریست کامل
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
