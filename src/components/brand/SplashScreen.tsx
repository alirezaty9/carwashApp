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
      // 🔴 pointer-events-none بسیار مهم: این لایه‌ی تمام‌صفحه‌ی اسپلش نباید هیچ‌وقت
      // کلیک‌ها را بگیرد. اگر در ویندوز/الکترون انیمیشنِ محو به هر دلیل اجرا نشود،
      // بدونِ این خط، اسپلشِ نامرئی روی همه‌ی ورودی‌ها می‌ماند و کلیک/تایپ را می‌بلعد
      // (همان مشکلِ «اینپوت‌ها قابلِ کلیک نبودند»). با این خط، حتی اگر دیده هم شود
      // مزاحمِ کار نیست و کلیک‌ها مستقیم به ورودی‌های زیرش می‌رسند.
      className="cw-splash no-print pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 backdrop-blur-2xl"
      style={{
        // درخششِ فیروزه‌ایِ ملایم روی یک لایه‌ی تقریباً مات؛ همراه با backdrop-blur
        // باعث می‌شود پس‌زمینه‌ی برنامه بسیار کم‌پیدا و محو باشد.
        background: `radial-gradient(120% 90% at 50% 36%, ${BRAND.gradientFrom}30, transparent 62%), color-mix(in srgb, var(--bg) 94%, transparent)`,
      }}
    >
      <div className="cw-splash-logo flex flex-col items-center gap-4">
        <YatashMark size={96} className="drop-shadow-2xl" />
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-display text-5xl text-[var(--text)] leading-none">{BRAND.nameFa}</span>
          <span className="text-[11px] font-semibold tracking-[0.4em] text-[var(--text-muted)]">
            {BRAND.nameEn}
          </span>
        </div>
        <span className="text-xs font-semibold text-[var(--text-muted)] mt-1">{BRAND.taglineFa}</span>
      </div>
    </div>
  );
}
