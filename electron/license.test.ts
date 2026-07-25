// @vitest-environment node
/**
 * تست‌های سیستمِ لایسنس (تریالِ ۷روزه و لایسنسِ سالانه).
 *
 * چرا این فایل .ts (نه .cjs)؟ چون Vitest اجازه نمی‌دهد با require بارگذاری شود؛ باید
 * از import استفاده کنیم. اما ماژولِ اصلی (license.cjs) هنوز CommonJS است، پس آن را با
 * createRequire به‌صورتِ مستقیم و بدونِ تبدیل، require می‌کنیم تا رفتارِ واقعی‌اش حفظ شود.
 *
 * «هرمتیک»: با YATASH_ANCHOR_DIR فایل‌های لنگرِ تریال را در پوشه‌ی موقتِ جدا می‌نویسیم
 * و با «تایمرِ ساختگی» گذرِ زمان را شبیه‌سازی می‌کنیم تا بدونِ صبرِ ۷روزه، انقضا را تست کنیم.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// نامِ nodeRequire (نه require) تا با تعریفِ سراسریِ require تداخل نکند.
const nodeRequire = createRequire(import.meta.url);
const { computeStatus, verifySignature, importLicense, canonicalPayload, getMachineId } = nodeRequire('./license.cjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// انبارِ ساختگیِ داده (به‌جای electron-store) — یک Map ساده.
function makeStore(init: Record<string, unknown> = {}) {
  const m = new Map(Object.entries(init));
  return {
    get: (k: string) => m.get(k),
    set: (k: string, v: unknown) => m.set(k, v),
    delete: (k: string) => m.delete(k),
    has: (k: string) => m.has(k),
  };
}

let anchorDir: string;
beforeEach(() => {
  anchorDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yt-anchor-'));
  process.env.YATASH_ANCHOR_DIR = anchorDir;
});
afterEach(() => {
  vi.useRealTimers();
  delete process.env.YATASH_ANCHOR_DIR;
  try {
    fs.rmSync(anchorDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
});

describe('تریالِ ۷روزه', () => {
  it('نصبِ تازه → تریال با ۷ روز', () => {
    const s = computeStatus(makeStore());
    expect(s.state).toBe('trial');
    expect(s.daysLeft).toBe(7);
  });

  it('حذف و نصبِ دوباره تریال را ریست نمی‌کند (لنگر firstRun را نگه می‌دارد)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    computeStatus(makeStore()); // روزِ ۰ — لنگر نوشته می‌شود
    vi.setSystemTime(new Date('2026-01-04T00:00:00Z')); // روزِ ۳
    const s = computeStatus(makeStore()); // انبارِ خالی = نصبِ دوباره، ولی لنگر باقی است
    expect(s.state).toBe('trial');
    expect(s.daysLeft).toBe(4); // نه ۷ — یعنی ریست نشد
  });

  it('بعد از ۷ روز منقضی می‌شود', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const store = makeStore();
    computeStatus(store);
    vi.setSystemTime(new Date('2026-01-09T00:00:00Z')); // روزِ ۸
    const s = computeStatus(store);
    expect(s.state).toBe('expired');
  });

  it('عقب‌کشیدنِ ساعت، تریالِ منقضی را زنده نمی‌کند (ساعتِ سقفی)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const store = makeStore();
    computeStatus(store);
    vi.setSystemTime(new Date('2026-01-10T00:00:00Z')); // روزِ ۹ — lastSeen جلو می‌رود
    computeStatus(store);
    vi.setSystemTime(new Date('2026-01-02T00:00:00Z')); // ساعت را به روزِ ۱ عقب می‌کشیم
    const s = computeStatus(store);
    expect(s.state).toBe('expired'); // effectiveNow از سقف استفاده می‌کند
  });
});

// این تست‌ها به کلیدِ خصوصی نیاز دارند (که در گیت نیست). اگر نبود، skip می‌شوند.
const PEM = path.join(__dirname, '..', 'yatash-private.pem');
const hasPem = fs.existsSync(PEM);
const maybe = hasPem ? it : it.skip;

function issueFor(machineId: string, days: number, type = 'annual') {
  const now = new Date();
  const exp = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const payload = { customer: 'test', machineId, type, issuedAt: iso(now), expiresAt: iso(exp) };
  const priv = crypto.createPrivateKey(fs.readFileSync(PEM));
  const signature = crypto.sign(null, Buffer.from(canonicalPayload(payload), 'utf8'), priv);
  return JSON.stringify({ payload, signature: signature.toString('base64') });
}

describe('لایسنسِ سالانه', () => {
  maybe('لایسنسِ معتبرِ ۳۶۵روزه → فعال با ~۳۶۵ روز', () => {
    const content = issueFor(getMachineId(), 365);
    const store = makeStore();
    const res = importLicense(store, content);
    expect(res.ok).toBe(true);
    const s = computeStatus(store);
    expect(s.state).toBe('licensed');
    expect(s.daysLeft).toBeGreaterThan(360);
  });

  maybe('لایسنسِ منقضی‌شده → expired', () => {
    const content = issueFor(getMachineId(), -1); // دیروز منقضی شده
    const store = makeStore();
    importLicense(store, content);
    const s = computeStatus(store);
    expect(s.state).toBe('expired');
  });

  maybe('لایسنسِ صادرشده برای دستگاهِ دیگر رد می‌شود', () => {
    const content = issueFor('00000000000000000000000000000000', 365);
    const res = importLicense(makeStore(), content);
    expect(res.ok).toBe(false);
  });
});

describe('امضای دیجیتال (verifySignature)', () => {
  const SAMPLE = path.join(__dirname, '..', 'license.dat');
  const hasSample = fs.existsSync(SAMPLE);
  const maybeSample = hasSample ? it : it.skip;

  maybeSample('امضای درست را می‌پذیرد و دستکاری‌شده را رد می‌کند', () => {
    const sample = JSON.parse(fs.readFileSync(SAMPLE, 'utf8'));
    expect(verifySignature(sample.payload, sample.signature)).toBe(true);
    const tampered = { ...sample.payload, customer: 'hacker' };
    expect(verifySignature(tampered, sample.signature)).toBe(false);
  });
});
