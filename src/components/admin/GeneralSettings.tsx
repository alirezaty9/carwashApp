import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { Download, Upload, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { Store } from '../../data/store';
import { getJalaliDateParts } from '../../utils/jalali';
import { toPersianDigits } from '../../utils/format';
import { getStorageInfo, StorageInfo } from '../../data/persistence';
import { Callout, DangerButton, Field, NumberInput, PrimaryButton, SectionCard, inputClass } from '../common';
import PrinterSettings from './PrinterSettings';
import { PrintReport } from '../../utils/printing';

export default function GeneralSettings({
  store,
  notify,
  onTestPrint,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
  onTestPrint: () => Promise<PrintReport>;
}) {
  const { config, updateConfig, exportData, importData, resetAll } = store;
  const fileRef = useRef<HTMLInputElement>(null);

  const [shopName, setShopName] = useState(config.shopName);
  const [footer, setFooter] = useState(config.footerText);
  const [counterStart, setCounterStart] = useState<number>(config.receiptCounterStart);

  // مسیرِ فایلِ داده و فهرستِ بکاپ‌های خودکار (فقط در نسخه‌ی نصب‌شده وجود دارد)
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  useEffect(() => {
    let alive = true;
    getStorageInfo().then((info) => {
      if (alive) setStorageInfo(info);
    });
    return () => {
      alive = false;
    };
  }, []);

  const saveGeneral = (e: FormEvent) => {
    e.preventDefault();
    updateConfig({ shopName: shopName.trim() || 'کارواش', footerText: footer, receiptCounterStart: Number(counterStart) || 1000 });
    notify('تنظیمات ذخیره شد', 'success');
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
            <NumberInput thousands={false} value={counterStart} onValueChange={setCounterStart} placeholder="۱۰۰۰" className={`${inputClass} tabular-nums`} />
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

      {/* پرینتر و چاپ */}
      <PrinterSettings store={store} onTestPrint={onTestPrint} />

      {/* پشتیبان‌گیری */}
      <SectionCard title="پشتیبان‌گیری و بازیابی" subtitle="تمام اطلاعات آفلاین ذخیره می‌شوند؛ برای اطمینان مرتب بکاپ بگیرید.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleBackup}
            className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--field-hover-border)] hover:bg-[var(--surface-2)] flex items-center gap-3 cursor-pointer transition-colors text-right"
          >
            <Download className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
            <div>
              <div className="text-[13px] font-semibold text-[var(--text)]">دانلود فایل پشتیبان</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">ذخیره‌ی همه‌چیز در یک فایل json</div>
            </div>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--field-hover-border)] hover:bg-[var(--surface-2)] flex items-center gap-3 cursor-pointer transition-colors text-right"
          >
            <Upload className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
            <div>
              <div className="text-[13px] font-semibold text-[var(--text)]">بازیابی از فایل</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">بارگذاری یک بکاپ قبلی</div>
            </div>
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleRestore} className="hidden" />
        </div>

        {/* بکاپِ خودکار — بدونِ نشان دادنِ مسیر، این قابلیت عملاً نامرئی است و
            روزِ مبادا کسی نمی‌داند نسخه‌ی پشتیبان کجاست. */}
        {storageInfo && (
          <Callout
            tone="ok"
            icon={ShieldCheck}
            title={`پشتیبانِ خودکارِ روزانه فعال است — ${toPersianDigits(storageInfo.backups.length)} نسخه موجود است`}
          >
            <p>
              برنامه در اولین اجرای هر روز خودش یک نسخه‌ی پشتیبان می‌سازد و ۷ نسخه‌ی آخر را نگه می‌دارد. این
              جایگزینِ بکاپِ دستی نیست (چون روی همین کامپیوتر است)، ولی اگر فایلِ اصلی خراب شود نجاتتان می‌دهد.
            </p>
            <div className="flex flex-col gap-1 mt-2 text-[11px] text-[var(--text-faint)] break-all">
              <span>پوشه‌ی پشتیبان‌ها: {storageInfo.backupDir}</span>
              <span>فایلِ اصلیِ اطلاعات: {storageInfo.dataPath}</span>
            </div>
          </Callout>
        )}

        <div className="mt-1 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="text-[13px] font-semibold text-[var(--danger-text)]">بازنشانی کامل سیستم</h5>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              تمام داده‌ها حذف و به حالت اولیه برمی‌گردد. این کار برگشت‌پذیر نیست — اول بکاپ بگیرید.
            </p>
          </div>
          <DangerButton onClick={handleReset} className="shrink-0 !px-4 !py-2 !text-[13px]">
            <RefreshCw className="w-4 h-4" /> ریست کامل
          </DangerButton>
        </div>
      </SectionCard>
    </div>
  );
}
