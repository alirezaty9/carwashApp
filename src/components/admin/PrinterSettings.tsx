import { useCallback, useEffect, useState } from 'react';
import { Printer, Zap, Ban, RefreshCw } from 'lucide-react';
import { Store } from '../../data/store';
import { SectionCard } from '../common';

interface PrinterInfo {
  name: string;
  displayName: string;
  isDefault: boolean;
}

interface PrinterBridge {
  list(): Promise<PrinterInfo[]>;
  printSilent(deviceName: string): Promise<{ success: boolean; reason?: string }>;
}

const getBridge = (): PrinterBridge | undefined =>
  (window as unknown as { printer?: PrinterBridge }).printer;

const MODES: { id: 'dialog' | 'silent' | 'off'; title: string; desc: string; icon: typeof Printer }[] = [
  { id: 'dialog', title: 'با پنجره‌ی چاپ', desc: 'هنگام هر قبض، پنجره‌ی چاپِ سیستم باز می‌شود (پیش‌فرض).', icon: Printer },
  { id: 'silent', title: 'چاپِ مستقیم', desc: 'قبض بی‌درنگ و بدونِ پنجره به پرینترِ انتخاب‌شده می‌رود.', icon: Zap },
  { id: 'off', title: 'بدونِ پرینتر', desc: 'چاپ نمی‌شود؛ فقط در سیستم ثبت می‌شود (برای جمعِ آخرِ شب).', icon: Ban },
];

/** تنظیماتِ پرینتر و حالتِ چاپ. */
export default function PrinterSettings({
  store,
  notify,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const { config, updateConfig } = store;
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPrinters = useCallback(async () => {
    const bridge = getBridge();
    if (!bridge) return;
    setLoading(true);
    try {
      setPrinters(await bridge.list());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrinters();
  }, [loadPrinters]);

  const isElectron = !!getBridge();

  return (
    <SectionCard
      title="پرینتر و چاپ"
      subtitle="اگر پرینترِ قبض ندارید «بدونِ پرینتر» را بزنید تا قبض فقط در سیستم ثبت شود. اگر دارید، «چاپِ مستقیم» را انتخاب و پرینترتان را از لیست برگزینید."
    >
      {/* سه حالتِ چاپ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MODES.map((m) => {
          const active = config.printMode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => updateConfig({ printMode: m.id })}
              className={`text-right p-4 rounded-xl border-2 transition-all cursor-pointer ${
                active
                  ? 'border-[var(--field-active-border)] bg-[var(--field-bg)]'
                  : 'border-[var(--border)] bg-[var(--field-bg)] hover:border-[var(--field-hover-border)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-5 h-5 ${active ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'}`} />
                <span className="text-xs font-bold text-[var(--field-text)]">{m.title}</span>
              </div>
              <p className="text-[10px] leading-relaxed text-[var(--field-muted)]">{m.desc}</p>
            </button>
          );
        })}
      </div>

      {/* انتخابِ پرینتر — فقط در حالتِ مستقیم */}
      {config.printMode === 'silent' && (
        <div className="border-t border-[var(--border)] pt-5 flex flex-col gap-3">
          {!isElectron ? (
            <div className="bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-text)] text-[11px] font-bold rounded-xl p-3">
              شناساییِ پرینتر فقط در نسخه‌ی نصب‌شده (اپِ دسکتاپ) کار می‌کند.
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">
                    <Printer className="w-4 h-4 inline ml-1" />
                    پرینترِ مقصد
                  </label>
                  <select
                    value={config.printerName}
                    onChange={(e) => updateConfig({ printerName: e.target.value })}
                    className="w-full bg-[var(--field-bg)] text-[var(--field-text)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[var(--accent-strong)]"
                  >
                    <option value="">— پیش‌فرضِ سیستم —</option>
                    {printers.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.displayName || p.name} {p.isDefault ? '(پیش‌فرض)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={loadPrinters}
                  disabled={loading}
                  title="به‌روزرسانیِ لیست"
                  className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] cursor-pointer"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {printers.length === 0 && !loading && (
                <p className="text-[11px] text-[var(--text-faint)] font-semibold">
                  پرینتری پیدا نشد. مطمئن شوید پرینتر روشن و در ویندوز نصب شده است، بعد «به‌روزرسانی» را بزنید.
                </p>
              )}
              <button
                type="button"
                onClick={async () => {
                  const bridge = getBridge();
                  if (!bridge) return;
                  const r = await bridge.printSilent(config.printerName);
                  notify(r.success ? 'صفحه‌ی آزمایشی به پرینتر ارسال شد' : `چاپ ناموفق بود: ${r.reason || 'نامشخص'}`, r.success ? 'success' : 'error');
                }}
                className="self-start cw-primary text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                چاپِ آزمایشی
              </button>
            </>
          )}
        </div>
      )}
    </SectionCard>
  );
}
