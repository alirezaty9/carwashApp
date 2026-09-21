import { useState } from 'react';
import { Plus, Trash2, ShieldCheck, User as UserIcon, Eye, EyeOff, Power } from 'lucide-react';
import { UserRole } from '../../types';
import { Store } from '../../data/store';
import { MIN_PASSWORD_LENGTH, validatePasswordValue } from '../../auth';
import { toPersianDigits } from '../../utils/format';
import {
  CountBadge,
  Field,
  IconButton,
  PrimaryButton,
  SectionCard,
  StatusPill,
  cellInputClass,
  inputClass,
} from '../common';

/**
 * مدیریتِ کاربران: ساختنِ کاربرِ جدید (ادمین/صندوقدار)، تغییرِ نام/رمز/نقش و فعال‌سازی.
 *
 * دو نگهبانِ مهم:
 *  ۱) همیشه باید حداقل یک ادمینِ فعال بماند (در store کنترل می‌شود).
 *  ۲) 🔴 نام و رمز «هنگامِ تایپ» ذخیره نمی‌شوند، بلکه وقتی کاربر از کادر بیرون
 *     می‌رود (یا Enter می‌زند) اعتبارسنجی و بعد ثبت می‌شوند. وگرنه خالی‌کردنِ کادرِ
 *     رمز همان لحظه حسابی بدونِ رمز می‌ساخت که هرکسی واردش می‌شد.
 */

/**
 * چیدمانِ مشترکِ سرستون‌ها و ردیف‌ها.
 * یک تعریف برای هر دو، تا ستون‌ها همیشه زیرِ هم بمانند (اگر جدا تعریف شوند، با
 * اولین تغییرِ عرض از هم می‌افتند). زیرِ عرضِ `lg` ردیف‌ها روی هم می‌چینند.
 */
const ROW_GRID = 'grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_9.5rem_minmax(0,1fr)_6rem_2.5rem] gap-2.5';

export default function UsersManager({
  store,
  notify,
  currentUserId,
}: {
  store: Store;
  notify: (m: string, t?: 'success' | 'error' | 'info') => void;
  currentUserId?: string;
}) {
  const { users, addUser, isUserNameTaken, renameUser, setUserPassword, setUserRole, toggleUser, removeUser } = store;

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('cashier');
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});

  // نسخه‌ی «در حالِ تایپِ» نام و رمزِ هر کاربر. تا تأیید نشود، چیزی ذخیره نمی‌شود.
  const [nameDraft, setNameDraft] = useState<Record<string, string>>({});
  const [passDraft, setPassDraft] = useState<Record<string, string>>({});

  const handleAdd = () => {
    if (!newName.trim()) return notify('نام کاربر را وارد کنید', 'error');
    if (isUserNameTaken(newName)) return notify('کاربری با همین نام از قبل هست؛ نامِ دیگری بگذارید', 'error');
    const problem = validatePasswordValue(newPass);
    if (problem) return notify(problem, 'error');
    if (!addUser(newName, newRole, newPass)) return notify('کاربرِ جدید ساخته نشد؛ نام و رمز را بررسی کنید', 'error');
    setNewName('');
    setNewPass('');
    setNewRole('cashier');
    notify('کاربرِ جدید اضافه شد', 'success');
  };

  const guarded = (ok: boolean) => {
    if (!ok) notify('حداقل یک ادمینِ فعال باید باقی بماند', 'error');
  };

  /** ثبتِ نامِ ویرایش‌شده. اگر خالی یا تکراری بود، به مقدارِ قبلی برمی‌گردد. */
  const commitName = (id: string, current: string) => {
    const draft = nameDraft[id];
    setNameDraft(({ [id]: _dropped, ...rest }) => rest);
    if (draft === undefined || draft.trim() === current.trim()) return;
    if (!draft.trim()) return notify('نامِ کاربر نمی‌تواند خالی باشد', 'error');
    if (isUserNameTaken(draft, id)) return notify('کاربرِ دیگری با همین نام هست؛ نامِ دیگری بگذارید', 'error');
    if (renameUser(id, draft)) notify('نامِ کاربر تغییر کرد', 'success');
  };

  /** ثبتِ رمزِ ویرایش‌شده. اگر قواعدِ رمز را نداشت، به رمزِ قبلی برمی‌گردد. */
  const commitPassword = (id: string, current: string) => {
    const draft = passDraft[id];
    setPassDraft(({ [id]: _dropped, ...rest }) => rest);
    if (draft === undefined || draft.trim() === current.trim()) return;
    const problem = validatePasswordValue(draft);
    if (problem) return notify(`${problem} رمزِ قبلی دست‌نخورده ماند.`, 'error');
    if (setUserPassword(id, draft)) notify('رمزِ کاربر تغییر کرد', 'success');
  };

  const adminCount = users.filter((u) => u.role === 'admin' && u.active).length;

  return (
    <SectionCard
      title="کاربران و دسترسی"
      subtitle="هر کاربر «ادمین» یا «صندوقدار» است. صندوقدار فقط به صندوق دسترسی دارد و وارد پنل مدیریت نمی‌شود. ابطالِ قبض با نامِ کاربرِ ادمین ثبت می‌شود."
      action={<CountBadge>{toPersianDigits(users.length)} کاربر</CountBadge>}
    >
      {/* افزودنِ کاربرِ جدید — همه در یک ردیف */}
      <div className="bg-[var(--bg)] rounded-2xl border border-[var(--border)] p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_11rem_auto] gap-3 items-end">
        <Field label="نام کاربر" required>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="مثال: ماهان"
            className={inputClass}
          />
        </Field>
        <Field label="رمز عبور" required hint={`(حداقل ${toPersianDigits(MIN_PASSWORD_LENGTH)} کاراکتر)`}>
          <input
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="رمزِ ورود"
            className={inputClass}
          />
        </Field>
        <Field label="نقش">
          <RoleSegment value={newRole} onChange={setNewRole} />
        </Field>
        <PrimaryButton type="button" onClick={handleAdd} className="h-[42px] shrink-0">
          <Plus className="w-4 h-4" /> افزودن
        </PrimaryButton>
      </div>

      {/* سرستون‌ها — فقط روی نمایشگرِ پهن، چون در حالتِ باریک ردیف‌ها روی هم می‌چینند */}
      <div className={`${ROW_GRID} hidden lg:grid px-3 -mb-1.5 text-[11px] font-medium text-[var(--text-muted)]`}>
        <span>نام کاربر</span>
        <span>نقش</span>
        <span>رمز عبور</span>
        <span className="text-center">وضعیت</span>
        <span />
      </div>

      {/* فهرستِ کاربران — هر کاربر یک ردیفِ واحد */}
      <div className="flex flex-col gap-2">
        {users.map((u) => {
          const isMe = u.id === currentUserId;
          const isAdmin = u.role === 'admin';
          const lastAdmin = isAdmin && u.active && adminCount <= 1;
          return (
            <div
              key={u.id}
              className={`${ROW_GRID} items-center rounded-xl border px-3 py-2.5 transition-colors ${
                u.active ? 'bg-[var(--surface)] border-[var(--border)]' : 'bg-[var(--bg)] border-[var(--border)] opacity-70'
              }`}
            >
              {/* نام — درجا قابلِ ویرایش */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 border ${
                    isAdmin
                      ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent-border)]'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'
                  }`}
                  title={isAdmin ? 'مدیر — دسترسی کامل' : 'صندوقدار — فقط صندوق'}
                >
                  {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                </span>
                <input
                  value={nameDraft[u.id] ?? u.name}
                  onChange={(e) => setNameDraft((d) => ({ ...d, [u.id]: e.target.value }))}
                  onBlur={() => commitName(u.id, u.name)}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  aria-label="نام کاربر"
                  className="min-w-0 flex-1 bg-transparent text-[var(--text)] text-[13px] font-semibold rounded-lg px-2 py-1.5 hover:bg-[var(--surface-2)] focus:bg-[var(--field-bg)] outline-none transition-colors"
                />
                {isMe && <StatusPill tone="accent">شما</StatusPill>}
              </div>

              {/* نقش */}
              <RoleSegment
                value={u.role}
                onChange={(r) => guarded(setUserRole(u.id, r))}
                disabled={lastAdmin}
                disabledHint="آخرین مدیرِ فعال"
                compact
              />

              {/* رمز عبور */}
              <div className="relative min-w-0">
                <input
                  type={showPass[u.id] ? 'text' : 'password'}
                  value={passDraft[u.id] ?? u.password}
                  onChange={(e) => setPassDraft((d) => ({ ...d, [u.id]: e.target.value }))}
                  onBlur={() => commitPassword(u.id, u.password)}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  aria-label={`رمزِ ${u.name}`}
                  className={`${cellInputClass} pl-8`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => ({ ...s, [u.id]: !s[u.id] }))}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text)] rounded-md cursor-pointer"
                  title={showPass[u.id] ? 'پنهان' : 'نمایش'}
                >
                  {showPass[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* وضعیت */}
              <button
                onClick={() => guarded(toggleUser(u.id))}
                title={u.active ? 'غیرفعال کردن' : 'فعال کردن'}
                className="cursor-pointer flex lg:justify-center"
              >
                <StatusPill tone={u.active ? 'ok' : 'neutral'} icon={Power}>
                  {u.active ? 'فعال' : 'غیرفعال'}
                </StatusPill>
              </button>

              {/* حذف */}
              <IconButton
                tone="danger"
                title="حذف کاربر"
                aria-label={`حذف ${u.name}`}
                onClick={() => {
                  if (confirm(`حذف کاربر «${u.name}»؟`)) guarded(removeUser(u.id));
                }}
                className="justify-self-start lg:justify-self-center"
              >
                <Trash2 className="w-4 h-4" />
              </IconButton>
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
 * `compact` برای ردیف‌های فهرست است تا هم‌ارتفاعِ ورودی‌های فشرده بماند.
 */
function RoleSegment({
  value,
  onChange,
  disabled = false,
  disabledHint,
  compact = false,
}: {
  value: UserRole;
  onChange: (r: UserRole) => void;
  disabled?: boolean;
  disabledHint?: string;
  compact?: boolean;
}) {
  const options: { id: UserRole; label: string }[] = [
    { id: 'cashier', label: 'صندوقدار' },
    { id: 'admin', label: 'مدیر' },
  ];
  return (
    <div
      className={`flex gap-1 bg-[var(--field-bg)] p-1 rounded-xl border border-[var(--border)] ${
        compact ? 'h-[34px]' : 'h-[42px]'
      }`}
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
            aria-pressed={isActive}
            className={`flex-1 rounded-lg transition-colors ${compact ? 'text-[12px]' : 'text-[13px]'} ${
              isActive
                ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] font-semibold'
                : lock
                  ? 'text-[var(--text-faint)] cursor-not-allowed'
                  : 'text-[var(--text-muted)] font-medium hover:bg-[var(--surface-2)] cursor-pointer'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
