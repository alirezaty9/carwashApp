import { CarwashConfig, Receipt } from '../../types';
import { formatCurrencyToman, toPersianDigits } from '../../utils/format';
import { BRAND } from '../../brand';

/**
 * ناحیه‌ی چاپِ فیشِ حرارتیِ رولی. عرض و ارتفاعِ برگه در لحظه‌ی چاپ و بر اساسِ
 * ارتفاعِ واقعیِ همین فیش تعیین می‌شود — منطقش در src/utils/printing.ts است.
 * فقط هنگام window.print() نمایش داده می‌شود (کلاس print-area در index.css).
 * این عنصر «خواهرِ» بخشِ اصلیِ برنامه است، نه فرزندِ آن، تا در چاپ محو نشود.
 */
export default function PrintReceipt({ receipt, config }: { receipt: Receipt | null; config: CarwashConfig }) {
  if (!receipt) return null;

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );

  return (
    <div className="print-area font-sans text-black" dir="rtl">
      <div className="text-center pb-2 mb-3 border-b-2 border-dashed border-black">
        <h1 className="text-base font-black leading-tight">{config.shopName}</h1>
        <p className="text-[10px] font-bold mt-1">قبض پذیرش کارواش</p>
      </div>

      <div className="flex flex-col gap-1.5 text-[11px] font-bold">
        <Row label="شماره فیش:" value={toPersianDigits(receipt.receiptNumber)} />
        <Row label="تاریخ:" value={receipt.jalaliDate} />
        <Row label="مشتری:" value={receipt.customerName || '—'} />
        <Row label="شماره تماس:" value={toPersianDigits(receipt.customerPhone)} />
        <Row label="خودرو:" value={receipt.carModel} />
        <Row label="تیپ:" value={receipt.tierName} />
        {receipt.workerName && <Row label="کارگر:" value={receipt.workerName} />}
      </div>

      {/* ریز خدمات */}
      <div className="border-t border-dashed border-black pt-1.5 mt-2 text-[10px]">
        <span className="block font-black mb-1">ریز خدمات:</span>
        <div className="flex flex-col gap-1">
          {receipt.services.map((s) => (
            <div key={s.id} className="flex justify-between font-bold">
              <span>• {s.name}</span>
              <span className="font-mono">{formatCurrencyToman(s.price)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* خطِ جداکننده‌ی توضیحات سیاهِ خالص است، نه رنگِ تم: پرینترِ حرارتی فقط
          سیاه می‌سوزاند و رنگِ تم روی کاغذ کم‌رنگ یا اصلاً چاپ‌نشده درمی‌آید. */}
      {receipt.notes && (
        <div className="border-t border-dashed border-black pt-1 mt-1.5 text-[10px]">
          <span className="block font-bold underline">توضیحات:</span>
          <p className="mt-0.5 leading-relaxed">{receipt.notes}</p>
        </div>
      )}

      {/* جمع و تخفیف (فقط وقتی تخفیف اعمال شده) */}
      {receipt.discount ? (
        <div className="border-t border-dashed border-black pt-1.5 mt-2 text-[10px] font-bold flex flex-col gap-1">
          <div className="flex justify-between">
            <span>جمع خدمات:</span>
            <span className="font-mono">{formatCurrencyToman(receipt.price + receipt.discount)}</span>
          </div>
          <div className="flex justify-between">
            <span>تخفیف:</span>
            <span className="font-mono">−{formatCurrencyToman(receipt.discount)}</span>
          </div>
        </div>
      ) : null}

      {/* مبلغ کل — انعام عمداً در این مبلغ نیست */}
      <div className="my-3 p-2 border-2 border-black border-double text-center rounded">
        <span className="block text-[9px] font-bold">مبلغ قابل پرداخت:</span>
        <span className="text-base font-black mt-1 block">{formatCurrencyToman(receipt.price)}</span>
      </div>

      {/* انعامِ کارگر — جدا از مبلغِ کل، به‌صورتِ خطِ مستقل */}
      {receipt.tip ? (
        <div className="mb-2 flex justify-between text-[11px] font-bold border border-black rounded px-2 py-1">
          <span>انعام کارگر{receipt.workerName ? ` (${receipt.workerName})` : ''}:</span>
          <span className="font-mono">{formatCurrencyToman(receipt.tip)}</span>
        </div>
      ) : null}

      <div className="text-center text-[9px] font-medium leading-relaxed pt-2 border-t-2 border-dashed border-black">
        <p>{config.footerText}</p>
      </div>

      {/* خطِ برندِ سازنده */}
      <div className="text-center text-[8px] font-bold mt-2 tracking-wide">
        {BRAND.poweredByFa} · {BRAND.nameEn}
      </div>
    </div>
  );
}
