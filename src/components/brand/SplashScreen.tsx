import { useEffect, useState } from 'react';
import { BRAND } from '../../brand';
import { YatashMark } from './YatashLogo';

/**
 * اسپلش‌اسکرینِ برندِ یاتاش که هنگامِ باز شدنِ برنامه یک‌بار نمایش داده می‌شود
 * و بعد از ~۱٫۸ ثانیه محو می‌شود (انیمیشنِ محو در CSS، سپس حذف از DOM).
 */
export default function SplashScreen() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setGone(true), 1900);
    return () => window.clearTimeout(id);
  }, []);

  if (gone) return null;

  return (
    <div
      className="cw-splash no-print fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5"
      style={{
        background: `radial-gradient(circle at 50% 40%, ${BRAND.gradientFrom}22, var(--bg) 70%)`,
      }}
    >
      <div className="cw-splash-logo flex flex-col items-center gap-4">
        <YatashMark size={96} className="drop-shadow-2xl" />
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-display text-5xl text-[var(--text)] leading-none">{BRAND.nameFa}</span>
          <span className="text-[11px] font-extrabold tracking-[0.4em] text-[var(--text-muted)]">
            {BRAND.nameEn}
          </span>
        </div>
        <span className="text-xs font-bold text-[var(--text-muted)] mt-1">{BRAND.taglineFa}</span>
      </div>
    </div>
  );
}
