import { CarwashConfig, Sale } from '../../types';
import { formatCurrencyToman, toPersianDigits } from '../../utils/format';
import { BRAND } from '../../brand';

/**
 * ناحیه‌ی چاپِ فاکتورِ فروشِ لوازم جانبی (فیشِ حرارتیِ رولی).
 * جدا از PrintReceipt (قبضِ شست‌وشو) است — شماره و عنوانِ مستقل دارد.
 * فقط هنگام window.print() نمایش داده می‌شود.
 */
export default function PrintSale({ sale, config }: { sale: Sale | null; config: CarwashConfig }) {
  if (!sale) return null;

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );

  const subtotal = sale.total + (sale.discount ?? 0);

  return (
    <div className="print-area font-sans text-black" dir="rtl">
      <div className="text-center pb-2 mb-3 border-b-2 border-dashed border-black">
        <h1 className="text-base font-black leading-tight">{config.shopName}</h1>
        <p className="text-[10px] font-bold mt-1">فاکتور فروش لوازم</p>
      </div>

      <div className="flex flex-col gap-1.5 text-[11px] font-bold">
        <Row label="شماره فاکتور:" value={toPersianDigits(sale.saleNumber)} />
        <Row label="تاریخ:" value={sale.jalaliDate} />
        {sale.customerPhone && <Row label="شماره تماس:" value={toPersianDigits(sale.customerPhone)} />}
      </div>

      {/* ریز اقلام */}
      <div className="border-t border-dashed border-black pt-1.5 mt-2 text-[10px]">
        <span className="block font-black mb-1">ریز اقلام:</span>
        <div className="flex flex-col gap-1">
          {sale.items.map((it) => (
            <div key={it.productId} className="flex justify-between font-bold gap-2">
              <span className="min-w-0">
                • {it.name}
                <span className="font-mono"> ×{toPersianDigits(it.qty)}</span>
              </span>
              <span className="font-mono shrink-0">{formatCurrencyToman(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
      </div>

      {sale.notes && (
        <div className="border-t border-dashed border-black pt-1 mt-1.5 text-[10px]">
          <span className="block font-bold underline">توضیحات:</span>
          <p className="mt-0.5 leading-relaxed">{sale.notes}</p>
        </div>
      )}

      {/* جمع و تخفیف (فقط وقتی تخفیف اعمال شده) */}
      {sale.discount ? (
        <div className="border-t border-dashed border-black pt-1.5 mt-2 text-[10px] font-bold flex flex-col gap-1">
          <div className="flex justify-between">
            <span>جمع اقلام:</span>
            <span className="font-mono">{formatCurrencyToman(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>تخفیف:</span>
            <span className="font-mono">−{formatCurrencyToman(sale.discount)}</span>
          </div>
        </div>
      ) : null}

      {/* مبلغ کل */}
      <div className="my-3 p-2 border-2 border-black border-double text-center rounded">
        <span className="block text-[9px] font-bold">مبلغ قابل پرداخت:</span>
        <span className="text-base font-black mt-1 block">{formatCurrencyToman(sale.total)}</span>
      </div>

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
