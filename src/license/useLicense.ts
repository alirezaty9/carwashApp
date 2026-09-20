import { useCallback, useEffect, useState } from 'react';

/** وضعیتِ لایسنس که از پروسه‌ی Main برمی‌گردد. */
export interface LicenseStatus {
  state: 'loading' | 'trial' | 'licensed' | 'expired' | 'invalid';
  type?: string;
  customer?: string;
  machineId?: string;
  expiresAt?: string;
  daysLeft?: number;
  /** علتِ نامعتبر بودن — دقیقاً همان سه حالتی که مدیرِ لایسنس برمی‌گرداند. */
  reason?: 'signature' | 'machine' | 'corrupt';
}

interface LicenseBridge {
  getStatus(): Promise<LicenseStatus>;
  getMachineId(): Promise<string>;
  import(content: string): Promise<{ ok: boolean; error?: string }>;
}

function getBridge(): LicenseBridge | undefined {
  return typeof window !== 'undefined' ? (window as unknown as { license?: LicenseBridge }).license : undefined;
}

/**
 * هوکِ لایسنس. در Electron وضعیتِ واقعی را می‌گیرد؛ در مرورگر (توسعه) که پلی نیست،
 * به‌صورتِ «licensed/dev» باز می‌گذارد تا کار متوقف نشود.
 */
export function useLicense() {
  const [status, setStatus] = useState<LicenseStatus>({ state: 'loading' });

  const refresh = useCallback(async () => {
    const bridge = getBridge();
    if (!bridge) {
      setStatus({ state: 'licensed', type: 'dev' });
      return;
    }
    try {
      setStatus(await bridge.getStatus());
    } catch {
      setStatus({ state: 'invalid', reason: 'corrupt' });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const importLicense = useCallback(
    async (content: string): Promise<{ ok: boolean; error?: string }> => {
      const bridge = getBridge();
      if (!bridge) return { ok: false, error: 'فعال‌سازی فقط در نسخه‌ی نصب‌شده ممکن است.' };
      const result = await bridge.import(content);
      if (result.ok) await refresh();
      return result;
    },
    [refresh],
  );

  return { status, refresh, importLicense };
}
