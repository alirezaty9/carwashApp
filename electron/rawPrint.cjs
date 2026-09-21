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

/** اجرای یک دستور و برگرداندنِ نتیجه به‌صورتِ خوانا (هرگز پرتاب نمی‌کند). */
function run(command, args, options = {}) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(command, args, { windowsHide: true, ...options });
    } catch (error) {
      resolve({ ok: false, reason: `${command}: ${error && error.message ? error.message : String(error)}` });
      return;
    }

    let stderr = '';
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
    child.on('error', (error) => {
      clearTimeout(timer);
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
if ([string]::IsNullOrEmpty($env:YATASH_PRINTER)) { throw 'نامِ پرینتر داده نشده' }
[YatashRawPrinter]::Send($env:YATASH_PRINTER, $env:YATASH_FILE)
`;

async function sendWindows(file, deviceName) {
  if (!deviceName) {
    return {
      ok: false,
      reason: 'برای چاپِ حرارتی باید پرینتر را از لیستِ تنظیمات انتخاب کنید (پیش‌فرضِ سیستم کافی نیست)',
    };
  }
  return run(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', WINDOWS_RAW_SCRIPT],
    { env: { ...process.env, YATASH_PRINTER: deviceName, YATASH_FILE: file } },
  );
}

/**
 * لینوکس و مک: `lp` با گزینه‌ی `-o raw`.
 * گزینه‌ی `raw` به سیستمِ چاپ می‌گوید «این فایل از قبل به زبانِ پرینتر است، دست
 * نزن» — دقیقاً همان چیزی که لازم داریم.
 */
async function sendUnix(file, deviceName) {
  const args = deviceName ? ['-d', deviceName, '-o', 'raw', file] : ['-o', 'raw', file];
  const result = await run('lp', args);
  if (result.ok) return result;

  // اگر `lp` در دسترس نبود، آخرین راه نوشتنِ مستقیم روی خودِ دستگاه است.
  // معمولاً به دسترسیِ ویژه نیاز دارد، پس علتش صریح گزارش می‌شود.
  const direct = writeToDevice(file);
  return direct.ok ? direct : { ok: false, reason: `${result.reason} | ${direct.reason}` };
}

/** نوشتنِ مستقیم روی گره‌ی دستگاهِ پرینتر (مثلِ /dev/usb/lp0). */
function writeToDevice(file) {
  let nodes = [];
  try {
    nodes = fs
      .readdirSync('/dev/usb')
      .filter((name) => name.startsWith('lp'))
      .map((name) => path.join('/dev/usb', name));
  } catch {
    nodes = [];
  }
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
async function sendRaw(data, deviceName) {
  if (!data || data.length === 0) return { ok: false, reason: 'داده‌ای برای چاپ ساخته نشد' };

  const file = writeTempJob(data);
  try {
    return process.platform === 'win32' ? await sendWindows(file, deviceName) : await sendUnix(file, deviceName);
  } finally {
    removeQuietly(file);
  }
}

module.exports = { sendRaw };
