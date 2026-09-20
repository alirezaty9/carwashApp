import { ChangeEvent, ReactNode, useRef, useState } from 'react';
import { AlertTriangle, Upload, PlayCircle, HardDrive } from 'lucide-react';
import { BackupData } from '../types';
import { GhostButton, PrimaryButton } from './common';

/**
 * دروازه‌ی سلامتِ داده.
 *
 * چرا هست: اگر خواندنِ فایلِ اطلاعات شکست بخورد، برنامه قبلاً بی‌صدا «خالی» بالا
 * می‌آمد و چون ذخیره‌سازی خودکار است، همان ثانیه‌ی اول فهرستِ خالی را روی داده‌ی
 * خراب می‌نوشت و سوابقِ کارواش برای همیشه می‌رفت.
 *
 * حالا در چنین حالتی نوشتن «یخ» می‌زند و این پرده می‌آید. تا وقتی کاربر تصمیم
 * نگیرد، حتی یک بایت روی فایلِ اصلی نوشته نمی‌شود. دو راهِ خروج وجود دارد:
 *   ۱) بازیابی از یک فایلِ پشتیبان (راهِ درست)،
 *   ۲) پذیرفتنِ شروعِ دوباره با دادهٔ خالی (تصمیمِ صریح و آگاهانه‌ی کاربر).
 */
export default function StorageGate({
  failedKeys,
  frozen,
  onRestore,
  onAcceptDataLoss,
  children,
}: {
  failedKeys: string[];
  frozen: boolean;
  /** همان `importData`ی فروشگاه: اگر بکاپ معتبر بود true برمی‌گرداند. */
  onRestore: (data: Partial<BackupData>) => boolean;
  onAcceptDataLoss: () => void;
  children: ReactNode;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  if (!frozen) return <>{children}</>;

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!onRestore(parsed)) setError('این فایل ساختارِ درستی ندارد یا بکاپِ این برنامه نیست.');
      } catch {
        setError('فایل خوانده نشد؛ مطمئن شوید فایلِ پشتیبانِ درستی انتخاب کرده‌اید.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center p-4">
      <div className="cw-card w-full max-w-lg p-7 flex flex-col gap-5 text-right">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 rounded-2xl bg-[var(--danger-soft)] border border-[var(--danger-border)]">
            <AlertTriangle className="w-8 h-8 text-[var(--danger-text)]" />
          </div>
          <h1 className="font-display text-2xl text-[var(--text)]">اطلاعاتِ برنامه خوانده نشد</h1>
          <p className="text-xs font-semibold text-[var(--text-muted)] leading-relaxed max-w-sm">
            برنامه نتوانست {failedKeys.length > 1 ? 'بخش‌هایی' : 'بخشی'} از اطلاعاتِ ذخیره‌شده را بخواند.
          </p>
        </div>

        <div className="bg-[var(--money-soft)] border border-[var(--money-border)] text-[var(--money-text)] text-[11px] font-bold rounded-xl p-3 flex items-start gap-2 leading-relaxed">
          <HardDrive className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <b>هیچ داده‌ای پاک نشده است.</b> برنامه عمداً ذخیره‌سازی را متوقف کرده تا روی اطلاعاتِ قبلیِ شما
            چیزی نوشته نشود. تا وقتی یکی از دو راهِ پایین را انتخاب نکنید، فایلِ اصلی دست‌نخورده می‌ماند.
          </span>
        </div>

        {/* راهِ ۱ — بازیابی از پشتیبان */}
        <div className="border border-[var(--border)] rounded-xl p-4 flex flex-col gap-2.5">
          <div className="text-sm font-bold text-[var(--text)]">۱) بازیابی از فایلِ پشتیبان (پیشنهاد می‌شود)</div>
          <p className="text-[11px] font-semibold text-[var(--text-muted)] leading-relaxed">
            برنامه هر روز یک نسخه‌ی پشتیبانِ خودکار می‌سازد. مسیرش در «پنلِ مدیریت ← تنظیمات و بکاپ» نوشته
            شده. اگر فایلِ پشتیبانی دارید، همین‌جا انتخابش کنید.
          </p>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
          <PrimaryButton type="button" onClick={() => fileRef.current?.click()} className="w-full">
            <Upload className="w-4 h-4" /> انتخابِ فایلِ پشتیبان
          </PrimaryButton>
        </div>

        {/* راهِ ۲ — شروع از نو */}
        <div className="border border-[var(--danger-border)] bg-[var(--danger-soft)] rounded-xl p-4 flex flex-col gap-2.5">
          <div className="text-sm font-bold text-[var(--danger-text)]">۲) شروعِ دوباره با اطلاعاتِ خالی</div>
          <p className="text-[11px] font-semibold text-[var(--danger-text)] leading-relaxed">
            فقط وقتی این را بزنید که پشتیبانی ندارید و می‌پذیرید سوابقِ قبلی در دسترس نباشد. از این لحظه
            برنامه دوباره شروع به ذخیره می‌کند و اطلاعاتِ قبلی بازنویسی خواهد شد.
          </p>
          {confirming ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onAcceptDataLoss}
                className="flex-1 bg-[var(--danger-strong)] text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer"
              >
                بله، می‌پذیرم و از نو شروع کن
              </button>
              <GhostButton type="button" onClick={() => setConfirming(false)} className="shrink-0">
                انصراف
              </GhostButton>
            </div>
          ) : (
            <GhostButton type="button" onClick={() => setConfirming(true)} className="w-full">
              <PlayCircle className="w-4 h-4" /> شروعِ دوباره با اطلاعاتِ خالی
            </GhostButton>
          )}
        </div>

        {error && (
          <div className="bg-[var(--danger-soft)] border border-[var(--danger-border)] text-[var(--danger-text)] text-xs font-bold rounded-xl p-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
