import { BRAND } from '../../brand';

/**
 * نشانِ برندِ یاتاش — یک قطره‌ی آب داخلِ نشانِ گرادیانی (حسِ آب/تمیزی).
 * SVG است تا در هر اندازه تیز بماند. رنگ‌ها از `brand.ts` می‌آیند.
 */
export function YatashMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="yatash-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BRAND.gradientFrom} />
          <stop offset="1" stopColor={BRAND.gradientTo} />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#yatash-grad)" />
      {/* قطره‌ی آب */}
      <path
        d="M24 9c0 0 10 12.5 10 20.5a10 10 0 0 1-20 0C14 21.5 24 9 24 9Z"
        fill="#FFFFFF"
        fillOpacity="0.96"
      />
      {/* برقِ قطره */}
      <circle cx="20" cy="30" r="3.2" fill={BRAND.gradientTo} fillOpacity="0.45" />
    </svg>
  );
}

/**
 * وردمارکِ کامل: نشان + نامِ «یاتاش» + زیرنویسِ لاتین.
 * `subtitle=false` فقط نامِ فارسی را نشان می‌دهد.
 */
export function YatashLogo({
  size = 40,
  subtitle = true,
  className = '',
}: {
  size?: number;
  subtitle?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <YatashMark size={size} />
      <div className="flex flex-col leading-none">
        <span className="font-display text-2xl text-[var(--text)]">{BRAND.nameFa}</span>
        {subtitle && (
          <span className="text-[9px] font-extrabold tracking-[0.35em] text-[var(--text-faint)] mt-0.5">
            {BRAND.nameEn}
          </span>
        )}
      </div>
    </div>
  );
}
