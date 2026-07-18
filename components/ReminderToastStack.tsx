'use client';

import { useEffect, useState } from 'react';
import { X, Bell, AlertTriangle, Clock, CalendarClock, BellOff } from 'lucide-react';
import { Reminder } from '@/lib/types';

// ── Threshold ──────────────────────────────────────────────────
// Toast muncul jika daysLeft jatuh dalam rentang ini.
// Range-based supaya tidak terlewat jika user tidak buka tepat di hari threshold.
//   14-day alert  : daysLeft 8–14
//   7-day alert   : daysLeft 4–7
//   3-day alert   : daysLeft 1–3
//   today alert   : daysLeft 0
//   overdue       : daysLeft < 0
function getThreshold(daysLeft: number): '14d' | '7d' | '3d' | 'today' | 'overdue' | null {
  if (daysLeft < 0)             return 'overdue';
  if (daysLeft === 0)           return 'today';
  if (daysLeft >= 1 && daysLeft <= 3)  return '3d';
  if (daysLeft >= 4 && daysLeft <= 7)  return '7d';
  if (daysLeft >= 8 && daysLeft <= 14) return '14d';
  return null; // lebih dari 14 hari → tidak muncul
}

interface ToastItem {
  id: string;           // reminder.id + '_' + threshold
  reminder: Reminder;
  daysLeft: number;
  threshold: '14d' | '7d' | '3d' | 'today' | 'overdue';
}

interface ReminderToastStackProps {
  reminders: Reminder[];
}

// ── Parse tanggal YYYY-MM-DD tanpa konversi timezone ───────────
// new Date('2026-07-21') → UTC midnight → di WIB jadi jam 07:00 hari yang sama
// supaya aman, parse langsung dari string
function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0); // local midnight
}

function getDaysLeft(dueDate: string): number {
  const due   = parseDateLocal(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - today.getTime();
  // Math.round lebih toleran untuk perbedaan jam kecil
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function getStyle(threshold: ToastItem['threshold']) {
  switch (threshold) {
    case 'overdue': return { border: '#9b3a2e', accent: '#c0392b', bg: 'rgba(155,58,46,0.18)',  label: 'Sudah Lewat!',           icon: AlertTriangle };
    case 'today':   return { border: '#c9a227', accent: '#c9a227', bg: 'rgba(201,162,39,0.15)', label: 'Jatuh Tempo Hari Ini!',   icon: AlertTriangle };
    case '3d':      return { border: '#c0392b', accent: '#e74c3c', bg: 'rgba(231,76,60,0.12)',  label: 'Segera Jatuh Tempo',      icon: Clock };
    case '7d':      return { border: '#e67e22', accent: '#e67e22', bg: 'rgba(230,126,34,0.12)', label: 'Jatuh Tempo Minggu Ini',  icon: Clock };
    case '14d':     return { border: '#c9a227', accent: '#c9a227', bg: 'rgba(201,162,39,0.10)', label: 'Jatuh Tempo 2 Minggu Ini',icon: CalendarClock };
  }
}

// ── Snooze: key harian, otomatis reset esok hari ──────────────
function getTodayKey() {
  return `kasirku_snooze_${new Date().toISOString().split('T')[0]}`;
}
function getSnoozed(): string[] {
  try { return JSON.parse(localStorage.getItem(getTodayKey()) || '[]'); } catch { return []; }
}
function addSnooze(id: string) {
  try {
    const list = getSnoozed();
    if (!list.includes(id)) { list.push(id); localStorage.setItem(getTodayKey(), JSON.stringify(list)); }
  } catch { /* ignore */ }
}

export function ReminderToastStack({ reminders }: ReminderToastStackProps) {
  const [toasts,          setToasts]          = useState<ToastItem[]>([]);
  const [visible,         setVisible]         = useState<Set<string>>(new Set());
  const [sessionHidden,   setSessionHidden]   = useState<Set<string>>(new Set());

  useEffect(() => {
    if (reminders.length === 0) return;

    const snoozed = getSnoozed();
    const items: ToastItem[] = [];

    reminders.forEach((reminder) => {
      const daysLeft  = getDaysLeft(reminder.due_date);
      const threshold = getThreshold(daysLeft);
      if (!threshold) return;

      // ID berbasis threshold (bukan exact daysLeft) → snooze tetap berlaku selama threshold yang sama
      const toastId = `${reminder.id}_${threshold}`;
      if (snoozed.includes(toastId)) return;

      items.push({ id: toastId, reminder, daysLeft, threshold });
    });

    if (items.length === 0) return;
    setToasts(items);

    // Stagger masuk
    const ids = new Set<string>();
    items.forEach((item, idx) => {
      setTimeout(() => {
        ids.add(item.id);
        setVisible(new Set(ids));
      }, idx * 380);
    });
  }, [reminders]);

  // Tutup sementara (muncul lagi saat refresh)
  function dismissTemp(toastId: string) {
    setVisible(prev => { const n = new Set(prev); n.delete(toastId); return n; });
    setTimeout(() => setSessionHidden(prev => new Set([...prev, toastId])), 300);
  }

  // Snooze hari ini
  function snoozeOne(toastId: string) {
    addSnooze(toastId);
    dismissTemp(toastId);
  }

  function snoozeAll() {
    toasts.forEach(t => addSnooze(t.id));
    setVisible(new Set());
    setTimeout(() => setToasts([]), 300);
  }

  const activeToasts = toasts.filter(t => !sessionHidden.has(t.id));
  if (activeToasts.length === 0) return null;

  return (
    // Mobile: full width, muncul dari atas dengan margin kiri-kanan
    // Desktop (sm+): 320px fixed di pojok kanan atas
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 flex flex-col gap-2.5" style={{ pointerEvents: 'none' }}>

      {/* Header jika >1 */}
      {activeToasts.length > 1 && (
        <div style={{
          background: 'var(--panel)', border: '1px solid var(--line-strong)', borderRadius: 2,
          padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          pointerEvents: 'auto', opacity: visible.size > 0 ? 1 : 0, transition: 'opacity 300ms ease',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            <Bell size={12} />
            {activeToasts.length} tagihan perlu perhatian
          </span>
          {/* Touch target diperbesar untuk mobile */}
          <button onClick={snoozeAll}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'color 150ms', padding: '4px 0' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-dim)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            <BellOff size={12} /> Tutup semua hari ini
          </button>
        </div>
      )}

      {/* Cards */}
      {activeToasts.map(toast => {
        const s    = getStyle(toast.threshold);
        const Icon = s.icon;
        const isIn = visible.has(toast.id);

        return (
          <div key={toast.id} style={{
            background: 'var(--panel)', border: `1px solid ${s.border}`, borderLeft: `3px solid ${s.accent}`,
            borderRadius: 2, padding: '12px 14px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${s.border}22`,
            pointerEvents: 'auto', position: 'relative', overflow: 'hidden',
            // Di mobile slide dari atas, di desktop slide dari kanan
            // Kita pakai translateY untuk mobile (lebih natural)
            transform: isIn ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.97)',
            opacity: isIn ? 1 : 0,
            transition: 'transform 350ms cubic-bezier(0.34,1.56,0.64,1), opacity 280ms ease',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: s.bg, pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              {/* Badge + close */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: s.accent, fontFamily: 'var(--font-mono)', flexWrap: 'wrap' }}>
                  <Icon size={13} style={{ flexShrink: 0 }} />
                  {s.label}
                  {toast.daysLeft > 0 && (
                    <span style={{ fontWeight: 400, opacity: 0.8 }}>· {toast.daysLeft} hari lagi</span>
                  )}
                </span>
                {/* Touch target 32×32 minimum untuk mobile */}
                <button onClick={() => dismissTemp(toast.id)} title="Tutup (muncul lagi saat refresh)"
                  style={{ color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0, transition: 'color 150ms', padding: '6px', margin: '-6px -6px -6px 0' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  <X size={15} />
                </button>
              </div>

              {/* Judul + nominal */}
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3, lineHeight: 1.3 }}>
                {toast.reminder.title}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Rp {toast.reminder.amount.toLocaleString('id-ID')}
                {toast.reminder.category && <span style={{ color: 'var(--text-muted)' }}> · {toast.reminder.category}</span>}
              </p>

              {/* Tanggal + snooze dalam satu baris bawah */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10, paddingTop: 8, borderTop: `1px solid ${s.border}44` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  <CalendarClock size={11} style={{ flexShrink: 0 }} />
                  <span>{parseDateLocal(toast.reminder.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {/* Snooze — touch target diperbesar */}
                <button onClick={() => snoozeOne(toast.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'color 150ms', padding: '4px 0', flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  <BellOff size={11} /><span>Jangan muncul lagi</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
