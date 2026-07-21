import { BRAND } from '../../brand';
import { YatashMark } from './YatashLogo';

/**
 * واترمارکِ ملایمِ برندِ یاتاش در پس‌زمینه — ثابت، بسیار کم‌رنگ و بدونِ تداخل
 * با کلیک‌ها (pointer-events: none). برندِ سازنده را همیشه حاضر نگه می‌دارد
 * بدونِ اینکه مزاحمِ کار باشد.
 */
export default function BrandWatermark() {
  return (
    <div className="no-print fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* نشانِ بزرگِ گوشه‌ی پایین-چپ */}
      <div className="absolute -bottom-16 -left-16 opacity-[0.04]">
        <YatashMark size={340} />
      </div>
      {/* نامِ محوِ گوشه‌ی بالا-راست */}
      <span className="absolute top-24 -right-6 font-display text-[9rem] leading-none text-[var(--text)] opacity-[0.025] rotate-90 origin-top-right">
        {BRAND.nameFa}
      </span>
    </div>
  );
}
