import { Reminder } from '@/lib/types';
import { CalendarClock, Plus, CheckCircle, Edit, Trash2 } from 'lucide-react';

interface RemindersListProps {
  reminders: Reminder[];
  onAdd: () => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (reminder: Reminder) => void;
}

export function RemindersList({ reminders, onAdd, onEdit, onDelete, onMarkPaid }: RemindersListProps) {
  // sort by due_date ascending
  const sorted = [...reminders].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  return (
    <div className="rounded-sm p-4 h-full border fade-in" style={{ background: 'var(--panel)', borderColor: 'var(--line-strong)' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-sm tracking-wide" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          Tagihan & Pengingat
        </h3>
        <button 
          onClick={onAdd}
          className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity" 
          style={{ color: 'var(--accent-gold)' }}
        >
          <Plus size={14} />
          <span>Tambah</span>
        </button>
      </div>

      <div className="space-y-4">
        {sorted.length === 0 ? (
          <div className="text-center py-6 text-xs" style={{ color: 'var(--text-dim)' }}>
            Belum ada pengingat.
          </div>
        ) : (
          sorted.map(reminder => {
            const dueDate = new Date(reminder.due_date);
            const today = new Date();
            today.setHours(0,0,0,0);
            const diffTime = dueDate.getTime() - today.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let statusStyle = { bg: 'var(--bg)', border: 'var(--line-strong)', color: 'var(--text)' };
            if (daysLeft < 0) {
              statusStyle = { bg: 'var(--accent-rust)', border: 'none', color: '#fff' };
            } else if (daysLeft === 0) {
              statusStyle = { bg: 'var(--accent-gold)', border: 'none', color: '#000' };
            }

            return (
              <div key={reminder.id} className="relative group border rounded-sm p-3 transition-colors hover:border-gray-500" style={{ borderColor: 'var(--line)' }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {reminder.title}
                    </span>
                    <span className="text-xs flex items-center gap-1 mt-1" style={{ color: 'var(--text-dim)' }}>
                      <CalendarClock size={12} />
                      {reminder.is_recurring ? `Berulang (${reminder.recurring_type})` : 'Sekali Bayar'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(reminder)} aria-label="Edit" className="text-gray-400 hover:text-white">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => onDelete(reminder.id)} aria-label="Hapus" className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-sm" style={{ color: 'var(--accent-rust)' }}>
                      Rp {reminder.amount.toLocaleString('id-ID')}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wider inline-block w-max"
                      style={{ 
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: statusStyle.border !== 'none' ? `1px solid ${statusStyle.border}` : 'none'
                      }}
                    >
                      {daysLeft < 0 ? `Lewat ${Math.abs(daysLeft)} hari` : daysLeft === 0 ? 'Hari ini' : `${daysLeft} hari lagi`}
                    </span>
                  </div>
                  <button 
                    onClick={() => onMarkPaid(reminder)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs transition-colors border hover:bg-white/5"
                    style={{ borderColor: 'var(--line-strong)', color: 'var(--text)' }}
                  >
                    <CheckCircle size={14} style={{ color: 'var(--accent-teal)' }} />
                    <span>Lunas</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
