# ---------------------------------------------------------------------------
# آزمایشِ «چاپِ خام» روی ویندوز — بدونِ دخالتِ برنامه‌ی یاتاش.
#
# این فایل دقیقاً همان کاری را می‌کند که برنامه هنگامِ «چاپِ حرارتی» انجام می‌دهد:
# چند بایتِ خام را مستقیم به صفِ چاپِ ویندوز می‌دهد. پس اگر این جواب بدهد ولی
# برنامه ندهد، ایراد از برنامه است؛ و اگر این هم جواب ندهد، ایراد از خودِ ویندوز
# یا پرینتر است (پورتِ اشتباه، صفِ گیرکرده، درایورِ معیوب).
#
# طرزِ استفاده در ویندوز:
#   ۱) پنجره‌ی PowerShell را باز کن (Start → تایپ کن PowerShell → Enter)
#   ۲) به پوشه‌ی این فایل برو، مثلاً:  cd D:\
#   ۳) این را بزن:
#        powershell -ExecutionPolicy Bypass -File .\win-raw-test.ps1
#
# اگر نامِ پرینتر را بدانی می‌توانی مستقیم بدهی:
#        powershell -ExecutionPolicy Bypass -File .\win-raw-test.ps1 -PrinterName "POS-80"
# ---------------------------------------------------------------------------

param([string]$PrinterName = "")

$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Runtime.InteropServices;
public class YatashRawTest {
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

  public static void Send(string printer, byte[] bytes) {
    IntPtr handle;
    if (!OpenPrinter(printer, out handle, IntPtr.Zero))
      throw new Exception("OpenPrinter failed: " + Marshal.GetLastWin32Error());
    try {
      DocInfo info = new DocInfo();
      info.pDocName = "Yatash RAW test";
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
          Console.WriteLine("bytes written: " + written);
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

# --- ۱) وضعیتِ پرینترهای نصب‌شده ---
Write-Host ""
Write-Host "=== پرینترهای نصب‌شده ===" -ForegroundColor Cyan
Get-Printer | Format-Table -AutoSize Name, PortName, DriverName, PrinterStatus

# --- ۲) انتخابِ پرینتر ---
if ([string]::IsNullOrWhiteSpace($PrinterName)) {
  $PrinterName = Read-Host "نامِ پرینترِ فیش‌زن را از جدولِ بالا کپی کن و اینجا بگذار"
}
Write-Host ""
Write-Host "پرینترِ انتخابی: $PrinterName" -ForegroundColor Yellow

# --- ۳) کارهای منتظر در صف (اگر چیزی اینجا گیر کرده باشد، کارِ تازه هم پشتش می‌ماند) ---
Write-Host ""
Write-Host "=== کارهای منتظر در صفِ چاپ ===" -ForegroundColor Cyan
try {
  $jobs = Get-PrintJob -PrinterName $PrinterName
  if ($jobs) { $jobs | Format-Table -AutoSize Id, DocumentName, JobStatus, Size } else { Write-Host "صف خالی است (خوب است)" }
} catch {
  Write-Host "خواندنِ صف ممکن نشد: $($_.Exception.Message)"
}

# --- ۴) ارسالِ متنِ آزمایشی به زبانِ ESC/POS ---
# 0x1B 0x40 = «راه‌اندازیِ مجدد» ، بعد یک خط متن و چند خط کاغذ
$bytes = [byte[]](0x1B, 0x40) +
         [System.Text.Encoding]::ASCII.GetBytes("YATASH RAW TEST OK`n`n`n`n`n")

Write-Host ""
Write-Host "=== ارسالِ آزمایشی ===" -ForegroundColor Cyan
try {
  [YatashRawTest]::Send($PrinterName, $bytes)
  Write-Host "ارسال بدونِ خطا انجام شد." -ForegroundColor Green
  Write-Host ""
  Write-Host "حالا به پرینتر نگاه کن:"
  Write-Host "  - اگر «YATASH RAW TEST OK» چاپ شد → مسیرِ چاپِ خامِ ویندوز سالم است."
  Write-Host "  - اگر هیچ کاغذی بیرون نیامد → ایراد از پورت یا خودِ پرینتر است، نه از برنامه."
} catch {
  Write-Host "ارسال شکست خورد: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""
