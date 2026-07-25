import { useState } from 'react';
import { Plus, Trash2, ShieldCheck, User as UserIcon, Eye, EyeOff, Power } from 'lucide-react';
import { UserRole } from '../../types';
import { Store } from '../../data/store';
import { SectionCard, inputClass, PrimaryButton } from '../common';

/**
 * مدیریتِ کاربران: ساختنِ کاربرِ جدید (ادمین/صندوقدار)، تغییرِ نام/رمز/نقش و فعال‌سازی.
 * نگهبان: همیشه باید حداقل یک ادمینِ فعال بماند (در store کنترل می‌شود).
 */
export default function UsersManager({
  store,
  notify,
  currentUserId,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
  currentUserId?: string;
}) {
  const { users, addUser, renameUser, setUserPassword, setUserRole, toggleUser, removeUser } = store;

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('cashier');
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});

  const handleAdd = () => {
    if (!newName.trim()) return notify('نام کاربر را وارد کنید', 'error');
    if (!newPass.trim()) return notify('برای کاربرِ جدید رمز بگذارید', 'error');
    addUser(newName, newRole, newPass);
    setNewName('');
    setNewPass('');
    setNewRole('cashier');
    notify('کاربرِ جدید اضافه شد', 'success');
  };

  const guarded = (ok: boolean) => {
    if (!ok) notify('حداقل یک ادمینِ فعال باید باقی بماند', 'error');
  };

  const adminCount = users.filter((u) => u.role === 'admin' && u.active).length;

  return (
    <SectionCard
      title="کاربران و دسترسی"
      subtitle="هر کاربر «ادمین» یا «صندوقدار» است. صندوقدار فقط به صندوق دسترسی دارد و وارد پنل مدیریت نمی‌شود. ابطالِ قبض با نامِ کاربرِ ادمین ثبت می‌شود."
      action={
        <span className="bg-[var(--surface-2)] text-[var(--text)] text-xs px-3.5 py-1.5 rounded-lg font-bold border border-[var(--border)]">
          {users.length} کاربر
        </span>
      }
    >
      {/* افزودنِ کاربرِ جدید */}
      <div className="bg-[var(--bg)] rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)]">
          <Plus className="w-4 h-4 text-[var(--accent-text)]" />
          <span className="text-sm font-bold text-[var(--text)]">افزودنِ کاربرِ جدید</span>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1.5">نام کاربر</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="مثال: ماهان"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1.5">رمز عبور</label>
            <input
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="رمزِ ورود"
              className={inputClass}
            />
          </div>

          <PrimaryButton type="button" onClick={handleAdd} className="shrink-0 h-[42px]">
            <Plus className="w-4 h-4" /> افزودن
          </PrimaryButton>

          {/* انتخابِ نقش — سگمنتِ دوتایی، خواناتر از select برای دو گزینه */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-[var(--text-muted)] mb-1.5">نقشِ کاربر</label>
            <RoleSegment value={newRole} onChange={setNewRole} />
          </div>
        </div>
      </div>

      {/* فهرستِ کاربران */}
      <div className="flex flex-col gap-2.5">
        {users.map((u) => {
          const isMe = u.id === currentUserId;
          const isAdmin = u.role === 'admin';
          const lastAdmin = isAdmin && u.active && adminCount <= 1;
          return (
            <div
              key={u.id}
              className={`rounded-2xl border transition-colors ${
                u.active
                  ? 'bg-[var(--surface)] border-[var(--border)]'
                  : 'bg-[var(--bg)] border-[var(--border)] opacity-70'
              }`}
            >
              {/* طبقه‌ی ۱ — هویت: آواتار + نام + برچسبِ «شما» + وضعیت */}
              <div className="flex items-center gap-3 p-3.5">
                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 border ${
                    isAdmin
                      ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent-border)]'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'
                  }`}
                >
                  {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    value={u.name}
                    onChange={(e) => renameUser(u.id, e.target.value)}
                    aria-label="نام کاربر"
                    className="w-full bg-transparent text-[var(--text)] text-base font-bold rounded-lg px-1 py-0.5 -mr-1 hover:bg-[var(--surface-2)] focus:bg-[var(--field-bg)] focus:ring-2 focus:ring-[var(--accent-soft)] outline-none transition-all"
                  />
                  <div className="flex items-center gap-1.5 px-1 mt-0.5">
                    <span className="text-[11px] font-bold text-[var(--text-muted)]">
                      {isAdmin ? 'مدیر — دسترسی کامل' : 'صندوقدار — فقط صندوق'}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] border border-[var(--accent-border)] px-1.5 py-0.5 rounded-md">
                        شما
                      </span>
                    )}
                  </div>
                </div>

                {/* وضعیتِ فعال/غیرفعال */}
                <button
                  onClick={() => guarded(toggleUser(u.id))}
                  title={u.active ? 'غیرفعال کردن' : 'فعال کردن'}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 border transition-colors ${
                    u.active
                      ? 'bg-[var(--money-soft)] text-[var(--money-text)] border-[var(--money-border)]'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {u.active ? 'فعال' : 'غیرفعال'}
                </button>
              </div>

              {/* طبقه‌ی ۲ — اعتبارنامه‌ها: رمز + نقش + حذف */}
              <div className="flex flex-wrap items-end gap-3 px-3.5 pb-3.5 pt-3 border-t border-[var(--border)]">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1">رمز عبور</label>
                  <div className="relative">
                    <input
                      type={showPass[u.id] ? 'text' : 'password'}
                      value={u.password}
                      onChange={(e) => setUserPassword(u.id, e.target.value)}
                      className={`${inputClass} pl-9`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => ({ ...s, [u.id]: !s[u.id] }))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text)] rounded cursor-pointer"
                      title={showPass[u.id] ? 'پنهان' : 'نمایش'}
                    >
                      {showPass[u.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="w-40 shrink-0">
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1">نقش</label>
                  <RoleSegment
                    value={u.role}
                    onChange={(r) => guarded(setUserRole(u.id, r))}
                    disabled={lastAdmin}
                    disabledHint="آخرین مدیرِ فعال"
                  />
                </div>

                <button
                  onClick={() => {
                    if (confirm(`حذف کاربر «${u.name}»؟`)) guarded(removeUser(u.id));
                  }}
                  className="h-[42px] px-3 flex items-center gap-1.5 text-[var(--danger-text)] hover:bg-[var(--danger-soft)] border border-transparent hover:border-[var(--danger-border)] rounded-xl cursor-pointer shrink-0 text-xs font-bold transition-colors"
                  title="حذف کاربر"
                >
                  <Trash2 className="w-4 h-4" /> حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/**
 * انتخابگرِ نقش به‌صورتِ دو دکمه‌ی کنارِ هم (segmented) — برای دو گزینه از select
 * خواناتر و کلیک‌راحت‌تر است. اگر disabled باشد (آخرین مدیرِ فعال) تغییر نمی‌کند.
 */
function RoleSegment({
  value,
  onChange,
  disabled = false,
  disabledHint,
}: {
  value: UserRole;
  onChange: (r: UserRole) => void;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const options: { id: UserRole; label: string }[] = [
    { id: 'cashier', label: 'صندوقدار' },
    { id: 'admin', label: 'مدیر' },
  ];
  return (
    <div
      className="flex gap-1 bg-[var(--field-bg)] p-1 rounded-xl border border-[var(--border)] h-[42px]"
      title={disabled ? disabledHint : undefined}
    >
      {options.map((o) => {
        const isActive = value === o.id;
        const lock = disabled && !isActive;
        return (
          <button
            key={o.id}
            type="button"
            disabled={lock}
            onClick={() => !isActive && onChange(o.id)}
            className={`flex-1 rounded-lg text-xs font-bold transition-all ${
              isActive
                ? 'cw-primary'
                : lock
                ? 'text-[var(--text-faint)] cursor-not-allowed'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] cursor-pointer'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
