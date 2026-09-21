import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Printer, Zap, Ban, RefreshCw, FileCheck2, CheckCircle, AlertCircle, Info, FileText, Trash2, ClipboardCopy, Terminal, Receipt as ReceiptIcon } from 'lucide-react';
import { Store } from '../../data/store';
import { SectionCard } from '../common';
import { getPrinterBridge, PrinterInfo, PrintMode, PrintReport } from '../../utils/printing';
import { clearPrintLog, getPrintLog, printLogAsText, subscribePrintLog } from '../../utils/printLog';

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
  onTestPrint: (kind: 'print' | 'pdf') => Promise<PrintReport>;
}) {
  const { config, updateConfig } = store;
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [loading, setLoading] = useState(false);
  // نتیجه‌ی آخرین چاپِ آزمایشی. برخلافِ اعلانِ بالای صفحه که بعد از چند ثانیه محو
  // می‌شود، این پیام سرِ جایش می‌ماند تا کاربر فرصتِ خواندن و اقدام داشته باشد.
  const [testResult, setTestResult] = useState<PrintReport | null>(null);
  const [testing, setTesting] = useState(false);

  // گزارشِ زنده‌ی مسیرِ چاپ. با هر قدمِ تازه (چه از اپ، چه از بخشِ سیستمی) این
  // کادر خودش به‌روز می‌شود.
  const logEntries = useSyncExternalStore(subscribePrintLog, getPrintLog, getPrintLog);
  const [copied, setCopied] = useState(false);

  const runTestPrint = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      setTestResult(await onTestPrint('print'));
    } catch (error) {
      setTestResult({
        type: 'error',
        text: `چاپِ آزمایشی اجرا نشد. (جزئیات: ${error instanceof Error ? error.message : String(error)})`,
      });
    } finally {
      setTesting(false);
    }
  };

  const runPreview = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      setTestResult(await onTestPrint('pdf'));
    } finally {
      setTesting(false);
    }
  };

  const copyLog = async () => {
    try {
      await navigator.clipboard.writeText(printLogAsText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // دسترسی به حافظه‌ی موقتِ سیستم رد شد — گزارش همچنان روی صفحه خوانا است
      setCopied(false);
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

      {/* راهنمای حالتِ حرارتی — چرا این حالت پیشنهاد می‌شود */}
      {config.printMode === 'thermal' && (
        <div className="bg-[var(--money-soft)] border border-[var(--money-border)] text-[var(--money-text)] text-[11px] font-bold rounded-xl p-3 leading-relaxed">
          ✅ در این حالت برنامه فیش را خودش به تصویر تبدیل می‌کند و با زبانِ خودِ پرینترهای فیش‌زن می‌فرستد. پس نه درایورِ
          مخصوص لازم است، نه اندازه‌ی کاغذِ سیستم می‌تواند خرابش کند. فقط پرینترِ مقصد را از لیستِ پایین انتخاب کنید.
        </div>
      )}

      {/* 🔴 هشدارِ حالتِ «با پنجره‌ی چاپ» روی پرینترِ رولی.
          در این حالت اندازه‌ی کاغذی که داخلِ پنجره‌ی چاپ انتخاب شده بر اندازه‌ی فیش
          اولویت دارد؛ اگر آن پنجره روی A4 باشد، هر فیش یک برگه‌ی ۳۰ سانتی می‌شود و
          روی رولِ پیوسته یعنی کاغذِ اضافه. */}
      {config.printMode === 'dialog' && (
        <div className="bg-[var(--danger-soft)] border border-[var(--danger-border)] text-[var(--danger-text)] text-[11px] font-bold rounded-xl p-3 leading-relaxed">
          ⚠️ اگر پرینترتان از نوعِ رولیِ حرارتی (فیش‌زن) است، «چاپِ مستقیم» را انتخاب کنید. در این حالت اندازه‌ی کاغذی که
          داخلِ پنجره‌ی چاپ انتخاب شده، بر اندازه‌ی فیش اولویت دارد؛ اگر روی A4 باشد برای هر فیش یک برگه‌ی ۳۰ سانتی
          کاغذ بیرون می‌آید.
        </div>
      )}

      {/* انتخابِ پرینتر — در حالت‌هایی که مقصد باید مشخص باشد */}
      {MODES_NEEDING_PRINTER.includes(config.printMode) && (
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
            </>
          )}
        </div>
      )}

      {/* چاپِ آزمایشی — تنها راهی که بدونِ صدورِ قبضِ واقعی معلوم می‌کند
          چاپ کار می‌کند یا نه، و اگر نه، دقیقاً ویندوز چه ایرادی گرفته است. */}
      {isElectron && config.printMode !== 'off' && (
        <div className="border-t border-[var(--border)] pt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs font-bold text-[var(--text)]">امتحانِ پرینتر</p>
              <p className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">
                یک فیشِ نمونه چاپ می‌شود. این فیش در سوابقِ مالی ثبت نمی‌شود.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runPreview}
                disabled={testing}
                title="همان فیش را به‌صورتِ فایلِ PDF روی میزِ کار ذخیره می‌کند"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-60 cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4" />
                ذخیره به‌صورتِ PDF
              </button>
              <button
                type="button"
                onClick={runTestPrint}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] disabled:opacity-60 cursor-pointer transition-all"
              >
                <FileCheck2 className="w-4 h-4" />
                {testing ? 'در حالِ چاپ…' : 'چاپِ آزمایشی'}
              </button>
            </div>
          </div>

          {testResult && <TestResultBox report={testResult} />}
        </div>
      )}

      {/* گزارشِ زنده‌ی مسیرِ چاپ — هر قدم با ساعتِ دقیق. همین قدم‌ها هم‌زمان در
          ترمینالی که برنامه از آن اجرا شده هم چاپ می‌شوند. */}
      {isElectron && (
        <div className="border-t border-[var(--border)] pt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs font-bold text-[var(--text)] flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                گزارشِ چاپ
              </p>
              <p className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">
                قدم‌به‌قدمِ آخرین چاپ. اگر چاپ انجام نشد، این گزارش را کپی کنید و برای پشتیبانی بفرستید.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyLog}
                disabled={logEntries.length === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-50 cursor-pointer transition-all"
              >
                <ClipboardCopy className="w-4 h-4" />
                {copied ? 'کپی شد' : 'کپیِ گزارش'}
              </button>
              <button
                type="button"
                onClick={clearPrintLog}
                disabled={logEntries.length === 0}
                title="پاک‌کردنِ گزارش"
                className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-50 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {logEntries.length === 0 ? (
            <p className="text-[11px] text-[var(--text-faint)] font-semibold">
              هنوز چیزی ثبت نشده. یک «چاپِ آزمایشی» بزنید تا قدم‌ها اینجا بیایند.
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] divide-y divide-[var(--border)]">
              {logEntries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 px-3 py-2">
                  <span className="text-[10px] font-mono text-[var(--text-faint)] shrink-0 pt-[2px]">{entry.time}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-[2px] rounded-md shrink-0 ${
                      entry.source === 'app'
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
                        : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                    }`}
                  >
                    {entry.source === 'app' ? 'اپ' : 'سیستم'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[var(--text)] leading-relaxed">{entry.step}</p>
                    {entry.detail && (
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold leading-relaxed break-words">
                        {entry.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

/** نتیجه‌ی چاپِ آزمایشی — سبز/قرمز/آبی، دقیقاً مثلِ اعلان‌های برنامه. */
function TestResultBox({ report }: { report: PrintReport }) {
  const styles: Record<PrintReport['type'], string> = {
    success: 'bg-[var(--money-soft)] border-[var(--money-border)] text-[var(--money-text)]',
    error: 'bg-[var(--danger-soft)] border-[var(--danger-border)] text-[var(--danger-text)]',
    info: 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)]',
  };
  const Icon = report.type === 'success' ? CheckCircle : report.type === 'error' ? AlertCircle : Info;
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${styles[report.type]}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <p className="text-[11px] font-bold leading-relaxed">{report.text}</p>
    </div>
  );
}
