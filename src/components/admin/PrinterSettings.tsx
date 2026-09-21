import { useCallback, useEffect, useState } from 'react';
import { Printer, Zap, Ban, RefreshCw, FileCheck2, CheckCircle, AlertCircle, Info, Receipt as ReceiptIcon } from 'lucide-react';
import { Store } from '../../data/store';
import { Callout, GhostButton, IconButton, SectionCard, inputClass } from '../common';
import { getPrinterBridge, PrinterInfo, PrintMode, PrintReport } from '../../utils/printing';

const MODES: { id: PrintMode; title: string; desc: string; icon: typeof Printer }[] = [
  {
    id: 'thermal',
    title: 'چاپِ حرارتی (پیشنهادی)',
    desc: 'مخصوصِ پرینترهای فیش‌زن. بدونِ نیاز به درایور و بدونِ کاغذِ اضافه.',
    icon: ReceiptIcon,
  },
  { id: 'silent', title: 'چاپِ معمولی', desc: 'برای پرینترهای معمولی که درایورِ خودشان نصب است.', icon: Zap },
  { id: 'dialog', title: 'با پنجره‌ی چاپ', desc: 'هنگام هر قبض، پنجره‌ی چاپِ سیستم باز می‌شود.', icon: Printer },
  { id: 'off', title: 'بدونِ پرینتر', desc: 'چاپ نمی‌شود؛ فقط در سیستم ثبت می‌شود (برای جمعِ آخرِ شب).', icon: Ban },
];

/** در این دو حالت باید پرینترِ مقصد از لیست انتخاب شود. */
const MODES_NEEDING_PRINTER: PrintMode[] = ['thermal', 'silent'];

/** تنظیماتِ پرینتر و حالتِ چاپ. */
export default function PrinterSettings({
  store,
  onTestPrint,
}: {
  store: Store;
  onTestPrint: () => Promise<PrintReport>;
}) {
  const { config, updateConfig } = store;
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [loading, setLoading] = useState(false);
  // نتیجه‌ی چاپِ آزمایشی؛ برخلافِ اعلانِ بالای صفحه محو نمی‌شود تا خوانده شود.
  const [testResult, setTestResult] = useState<PrintReport | null>(null);
  const [testing, setTesting] = useState(false);

  const runTestPrint = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      setTestResult(await onTestPrint());
    } catch (error) {
      setTestResult({
        type: 'error',
        text: `چاپِ آزمایشی اجرا نشد. (جزئیات: ${error instanceof Error ? error.message : String(error)})`,
      });
    } finally {
      setTesting(false);
    }
  };

  const loadPrinters = useCallback(async () => {
    const bridge = getPrinterBridge();
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

  const isElectron = !!getPrinterBridge();

  return (
    <SectionCard
      title="پرینتر و چاپ"
      subtitle="اگر پرینترِ فیش‌زن دارید «چاپِ حرارتی» را انتخاب کنید و پرینترتان را از لیست برگزینید — این حالت به هیچ درایوری نیاز ندارد. اگر پرینتر ندارید، «بدونِ پرینتر» را بزنید تا قبض فقط در سیستم ثبت شود."
    >
      {/* چهار حالتِ چاپ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {MODES.map((m) => {
          const active = config.printMode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => updateConfig({ printMode: m.id })}
              aria-pressed={active}
              className={`text-right p-4 rounded-xl border transition-colors cursor-pointer ${
                active
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border)] bg-[var(--field-bg)] hover:border-[var(--field-hover-border)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'}`} />
                <span className={`text-[13px] ${active ? 'font-semibold text-[var(--text)]' : 'font-medium text-[var(--text-muted)]'}`}>
                  {m.title}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{m.desc}</p>
            </button>
          );
        })}
      </div>

      {/* راهنمای حالتِ حرارتی */}
      {config.printMode === 'thermal' && (
        <Callout tone="ok" icon={CheckCircle}>
          در این حالت برنامه فیش را خودش به تصویر تبدیل می‌کند و با زبانِ خودِ پرینترهای فیش‌زن می‌فرستد. پس نه درایورِ
          مخصوص لازم است، نه اندازه‌ی کاغذِ سیستم می‌تواند خرابش کند. فقط پرینترِ مقصد را از لیستِ پایین انتخاب کنید.
        </Callout>
      )}

      {/* هشدارِ حالتِ «با پنجره‌ی چاپ»: اندازه‌ی کاغذِ آن پنجره بر اندازه‌ی فیش
          اولویت دارد و روی رولِ پیوسته کاغذِ اضافه می‌دهد. */}
      {config.printMode === 'dialog' && (
        <Callout tone="warn" icon={AlertCircle}>
          اگر پرینترتان از نوعِ رولیِ حرارتی (فیش‌زن) است، «چاپِ حرارتی» را انتخاب کنید. در این حالت اندازه‌ی کاغذی که
          داخلِ پنجره‌ی چاپ انتخاب شده، بر اندازه‌ی فیش اولویت دارد؛ اگر روی A4 باشد برای هر فیش یک برگه‌ی ۳۰ سانتی
          کاغذ بیرون می‌آید.
        </Callout>
      )}

      {/* انتخابِ پرینتر — در حالت‌هایی که مقصد باید مشخص باشد */}
      {MODES_NEEDING_PRINTER.includes(config.printMode) && (
        <div className="border-t border-[var(--border)] pt-5 flex flex-col gap-3">
          {!isElectron ? (
            <Callout tone="accent" icon={Info}>
              شناساییِ پرینتر فقط در نسخه‌ی نصب‌شده (اپِ دسکتاپ) کار می‌کند.
            </Callout>
          ) : (
            <>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] mb-2">
                    <Printer className="w-4 h-4" />
                    پرینترِ مقصد
                  </label>
                  <select
                    value={config.printerName}
                    onChange={(e) => updateConfig({ printerName: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">— پیش‌فرضِ سیستم —</option>
                    {printers.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.displayName || p.name} {p.isDefault ? '(پیش‌فرض)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <IconButton
                  type="button"
                  onClick={loadPrinters}
                  disabled={loading}
                  title="به‌روزرسانیِ لیست"
                  aria-label="به‌روزرسانیِ لیستِ پرینترها"
                  className="border border-[var(--border)] !p-2.5 shrink-0"
                >
                  <RefreshCw className={`w-[18px] h-[18px] ${loading ? 'animate-spin' : ''}`} />
                </IconButton>
              </div>

              {printers.length === 0 && !loading && (
                <p className="text-[11px] text-[var(--text-faint)]">
                  پرینتری پیدا نشد. مطمئن شوید پرینتر روشن و در سیستم نصب شده است، بعد «به‌روزرسانی» را بزنید.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* امتحانِ پرینتر بدونِ صدورِ قبضِ واقعی */}
      {isElectron && config.printMode !== 'off' && (
        <div className="border-t border-[var(--border)] pt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[13px] font-semibold text-[var(--text)]">امتحانِ پرینتر</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                یک فیشِ نمونه چاپ می‌شود. این فیش در سوابقِ مالی ثبت نمی‌شود.
              </p>
            </div>
            <GhostButton type="button" onClick={runTestPrint} disabled={testing} className="shrink-0">
              <FileCheck2 className="w-4 h-4" />
              {testing ? 'در حالِ چاپ…' : 'چاپِ آزمایشی'}
            </GhostButton>
          </div>

          {testResult && <TestResultBox report={testResult} />}
        </div>
      )}

    </SectionCard>
  );
}

/** نتیجه‌ی چاپِ آزمایشی — همان زبانِ رنگیِ اعلان‌های برنامه. */
function TestResultBox({ report }: { report: PrintReport }) {
  const tone = report.type === 'success' ? 'ok' : report.type === 'error' ? 'danger' : 'accent';
  const Icon = report.type === 'success' ? CheckCircle : report.type === 'error' ? AlertCircle : Info;
  return (
    <Callout tone={tone} icon={Icon}>
      {report.text}
    </Callout>
  );
}
