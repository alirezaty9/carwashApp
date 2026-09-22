'use strict';

/**
 * رساندنِ بایت‌های خام به پرینتر — بدونِ هیچ ترجمه‌ای در میانه‌ی راه.
 *
 * چرا «خام» مهم است: سیستم‌عامل به‌طور پیش‌فرض هر چیزی را که برای چاپ می‌فرستی
 * از یک زنجیره‌ی مترجم رد می‌کند (تبدیل به PostScript و بعد به زبانِ پرینتر).
 * ما خودمان از قبل به زبانِ خودِ پرینتر (ESC/POS) حرف زده‌ایم، پس هر ترجمه‌ی
 * اضافه‌ای فقط خرابش می‌کند. این فایل مسیری باز می‌کند که آن زنجیره را دور بزند.
 *
 * هر سیستم‌عامل راهِ خودش را دارد:
 *   لینوکس/مک → دستورِ `lp` با گزینه‌ی `-o raw`
 *   ویندوز    → صفِ چاپِ ویندوز با نوعِ دادهٔ `RAW` (از راهِ PowerShell)
 */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

/** سقفِ انتظار برای پایانِ کارِ چاپ. بیشتر از این یعنی چیزی گیر کرده. */
const PRINT_TIMEOUT_MS = 20_000;

function writeTempJob(data) {
  const file = path.join(os.tmpdir(), `yatash-receipt-${process.pid}-${Date.now()}.bin`);
  fs.writeFileSync(file, data);
  return file;
}

function removeQuietly(file) {
  try {
    fs.unlinkSync(file);
  } catch {
    /* فایلِ موقت اگر نماند هم مشکلی نیست */
  }
}

/** لاگ‌گیرِ پیش‌فرض: هیچ‌کاری نمی‌کند. صداکننده می‌تواند لاگ‌گیرِ واقعی بدهد. */
const noopLog = () => {};

/** اجرای یک دستور و برگرداندنِ نتیجه به‌صورتِ خوانا (هرگز پرتاب نمی‌کند). */
function run(command, args, options = {}, log = noopLog) {
  const startedAt = Date.now();
  log('info', `اجرای دستور: ${command}`, `آرگومان‌ها: ${args.join(' ')}`);
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(command, args, { windowsHide: true, ...options });
    } catch (error) {
      resolve({ ok: false, reason: `${command}: ${error && error.message ? error.message : String(error)}` });
      return;
    }

    let stderr = '';
    let stdout = '';
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const timer = setTimeout(() => {
      try {
        child.kill();
      } catch {
        /* اگر کشته نشد، تایمر به‌هرحال جواب را برگردانده است */
      }
      finish({ ok: false, reason: `${command}: بیش از حد طول کشید` });
    }, PRINT_TIMEOUT_MS);

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      log('error', `اجرای ${command} ممکن نشد`, error && error.message ? error.message : String(error));
      finish({
        ok: false,
        reason:
          error && error.code === 'ENOENT'
            ? `دستورِ ${command} روی این سیستم نصب نیست`
            : `${command}: ${error && error.message ? error.message : String(error)}`,
      });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      log(
        code === 0 ? 'ok' : 'error',
        `${command} با کدِ ${code} تمام شد`,
        `زمان=${Date.now() - startedAt}ms` +
          (stdout.trim() ? ` · خروجی: ${stdout.trim()}` : '') +
          (stderr.trim() ? ` · خطا: ${stderr.trim()}` : ' · بدونِ پیامِ خطا'),
      );
      finish(
        code === 0
          ? { ok: true }
          : { ok: false, reason: `${command} با کدِ ${code} تمام شد${stderr ? ` — ${stderr.trim()}` : ''}` },
      );
    });
  });
}

/**
 * ویندوز: کارِ چاپ با نوعِ دادهٔ RAW مستقیم به صفِ چاپ داده می‌شود.
 *
 * چرا PowerShell: خودِ ویندوز راهِ آماده‌ای در خطِ فرمان برای «چاپِ خام» ندارد،
 * ولی توابعِ داخلیِ صفِ چاپ (winspool) این کار را می‌کنند و PowerShell می‌تواند
 * مستقیم صدایشان بزند. مزیتش این است که به هیچ کتابخانه‌ی اضافه‌ای نیاز نداریم و
 * حجمِ فایلِ نصبی دست‌نخورده می‌ماند.
 *
 * نام و مسیر از راهِ متغیرهای محیطی داده می‌شوند تا نامِ فارسی یا دارای فاصله‌ی
 * پرینتر، دستور را نشکند.
 */
const WINDOWS_RAW_SCRIPT = `
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Runtime.InteropServices;
public class YatashRawPrinter {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public class DocInfo {
    [MarshalAs(UnmanagedType.LPWStr)] public string pDocName;
    [MarshalAs(UnmanagedType.LPWStr)] public string pOutputFile;
    [MarshalAs(UnmanagedType.LPWStr)] public string pDataType;
  }
  [DllImport("winspool.drv", CharSet = CharSet.Unicode, SetLastError = true)]
  public static extern bool OpenPrinter(string src, out IntPtr handle, IntPtr defaults);
  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool ClosePrinter(IntPtr handle);
  [DllImport("winspool.drv", CharSet = CharSet.Unicode, SetLastError = true)]
  public static extern bool StartDocPrinter(IntPtr handle, int level, [In, MarshalAs(UnmanagedType.LPStruct)] DocInfo info);
  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool EndDocPrinter(IntPtr handle);
  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool StartPagePrinter(IntPtr handle);
  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool EndPagePrinter(IntPtr handle);
  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool WritePrinter(IntPtr handle, IntPtr buffer, int count, out int written);

  public static void Send(string printer, string file) {
    byte[] bytes = File.ReadAllBytes(file);
    IntPtr handle;
    if (!OpenPrinter(printer, out handle, IntPtr.Zero))
      throw new Exception("OpenPrinter failed: " + Marshal.GetLastWin32Error());
    try {
      DocInfo info = new DocInfo();
      info.pDocName = "Yatash Receipt";
      info.pDataType = "RAW";
      if (!StartDocPrinter(handle, 1, info))
        throw new Exception("StartDocPrinter failed: " + Marshal.GetLastWin32Error());
      try {
        if (!StartPagePrinter(handle))
          throw new Exception("StartPagePrinter failed: " + Marshal.GetLastWin32Error());
        IntPtr buffer = Marshal.AllocCoTaskMem(bytes.Length);
        try {
          Marshal.Copy(bytes, 0, buffer, bytes.Length);
          int written;
          if (!WritePrinter(handle, buffer, bytes.Length, out written))
            throw new Exception("WritePrinter failed: " + Marshal.GetLastWin32Error());
        } finally {
          Marshal.FreeCoTaskMem(buffer);
        }
        EndPagePrinter(handle);
      } finally {
        EndDocPrinter(handle);
      }
    } finally {
      ClosePrinter(handle);
    }
  }
}
"@
try {
  if ([string]::IsNullOrEmpty($env:YATASH_PRINTER)) { throw 'printer name is empty' }
  if (-not (Test-Path -LiteralPath $env:YATASH_FILE)) { throw 'job file not found' }
  [YatashRawPrinter]::Send($env:YATASH_PRINTER, $env:YATASH_FILE)
  exit 0
} catch {
  # پیام به خروجیِ خطا می‌رود تا برنامه بتواند عینِ آن را به کاربر نشان دهد
  [Console]::Error.WriteLine($_.Exception.Message)
  exit 1
}
`;

/**
 * اسکریپت روی دیسک نوشته و با `-File` اجرا می‌شود، نه با `-Command`.
 *
 * چرا: دادنِ یک اسکریپتِ چندخطی به‌صورتِ آرگومانِ خطِ فرمان، از چند لایه‌ی
 * نقل‌قول‌گذاری (نود → ویندوز → پاورشل) رد می‌شود و کافی است یکی از آن لایه‌ها
 * یک کاراکتر را جابه‌جا کند تا کلِ اسکریپت بی‌صدا نامعتبر شود. اجرای فایل هیچ‌کدام
 * از آن لایه‌ها را ندارد.
 *
 * علامتِ ابتدای فایل (BOM) هم لازم است، وگرنه پاورشلِ ویندوز فایلِ UTF-8 را با
 * انکودینگِ محلی می‌خواند و کاراکترهای غیرِانگلیسی خراب می‌شوند.
 */
function writeTempScript() {
  const file = path.join(os.tmpdir(), `yatash-rawprint-${process.pid}-${Date.now()}.ps1`);
  fs.writeFileSync(file, `\uFEFF${WINDOWS_RAW_SCRIPT}`, 'utf8');
  return file;
}

async function sendWindows(file, deviceName, log = noopLog) {
  if (!deviceName) {
    log('error', '🔴 پرینتر انتخاب نشده', 'در ویندوز برای ارسالِ خام باید نامِ دقیقِ پرینتر مشخص باشد');
    return {
      ok: false,
      reason: 'برای چاپِ حرارتی باید پرینتر را از لیستِ تنظیمات انتخاب کنید (پیش‌فرضِ سیستم کافی نیست)',
    };
  }

  const script = writeTempScript();
  log(
    'info',
    'مسیرِ ویندوز: ارسالِ خام از راهِ صفِ چاپ',
    `اسکریپت: ${script} · فایلِ کارِ چاپ: ${file} (${fs.statSync(file).size} بایت) · پرینتر: «${deviceName}»`,
  );
  const args = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script];
  const options = { env: { ...process.env, YATASH_PRINTER: deviceName, YATASH_FILE: file } };

  const queued = { ok: true, note: 'کارِ چاپ به صفِ چاپِ ویندوز تحویل شد.' };

  try {
    const result = await run('powershell.exe', args, options, log);
    // نسخه‌های تازه‌ی ویندوز ممکن است فقط پاورشلِ جدید (pwsh) را داشته باشند
    if (!result.ok && /نصب نیست/.test(result.reason || '')) {
      log('warn', 'powershell.exe پیدا نشد؛ تلاش با pwsh.exe');
      const retry = await run('pwsh.exe', args, options, log);
      return retry.ok ? queued : retry;
    }
    return result.ok ? queued : result;
  } finally {
    removeQuietly(script);
  }
}

/**
 * لینوکس و مک: `lp` با گزینه‌ی `-o raw`.
 * گزینه‌ی `raw` به سیستمِ چاپ می‌گوید «این فایل از قبل به زبانِ پرینتر است، دست
 * نزن» — دقیقاً همان چیزی که لازم داریم.
 */
async function sendUnix(file, deviceName, log = noopLog) {
  const args = deviceName ? ['-d', deviceName, '-o', 'raw', file] : ['-o', 'raw', file];
  log('info', 'مسیرِ لینوکس/مک: ارسالِ خام با دستورِ lp', `پرینتر: «${deviceName || '(پیش‌فرضِ سیستم)'}»`);
  const result = await run('lp', args, {}, log);
  if (result.ok) return { ok: true, note: 'کارِ چاپ به صفِ چاپِ سیستم تحویل شد.' };

  // اگر `lp` در دسترس نبود، آخرین راه نوشتنِ مستقیم روی خودِ دستگاه است.
  log('warn', 'lp جواب نداد؛ تلاش برای نوشتنِ مستقیم روی دستگاه', result.reason);
  const direct = writeToDevice(file, log);
  return direct.ok ? direct : { ok: false, reason: `${result.reason} | ${direct.reason}` };
}

/** نوشتنِ مستقیم روی گره‌ی دستگاهِ پرینتر (مثلِ /dev/usb/lp0). */
function writeToDevice(file, log = noopLog) {
  let nodes = [];
  try {
    nodes = fs
      .readdirSync('/dev/usb')
      .filter((name) => name.startsWith('lp'))
      .map((name) => path.join('/dev/usb', name));
  } catch {
    nodes = [];
  }
  log('info', 'گره‌های دستگاهِ پرینتر', nodes.join(' · ') || 'هیچ');
  if (nodes.length === 0) return { ok: false, reason: 'هیچ دستگاهِ پرینتری در /dev/usb پیدا نشد' };

  const data = fs.readFileSync(file);
  for (const node of nodes) {
    try {
      fs.writeFileSync(node, data);
      return { ok: true, note: `مستقیم روی ${node} نوشته شد` };
    } catch (error) {
      if (error && error.code === 'EACCES') {
        return {
          ok: false,
          reason: `اجازه‌ی نوشتن روی ${node} نیست. کاربر را به گروهِ lp اضافه کنید: sudo usermod -aG lp $USER`,
        };
      }
    }
  }
  return { ok: false, reason: 'نوشتنِ مستقیم روی دستگاهِ پرینتر ممکن نشد' };
}

/**
 * بایت‌های آماده را به پرینتر می‌رساند.
 * همیشه با یک نتیجه‌ی خوانا برمی‌گردد و هرگز خطا پرتاب نمی‌کند.
 */
async function sendRaw(data, deviceName, log = noopLog) {
  if (!data || data.length === 0) {
    log('error', '🔴 داده‌ای برای چاپ نبود');
    return { ok: false, reason: 'داده‌ای برای چاپ ساخته نشد' };
  }

  const file = writeTempJob(data);
  try {
    return process.platform === 'win32'
      ? await sendWindows(file, deviceName, log)
      : await sendUnix(file, deviceName, log);
  } finally {
    removeQuietly(file);
  }
}

module.exports = { sendRaw };
