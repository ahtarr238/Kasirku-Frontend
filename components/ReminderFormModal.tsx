import { useState, useEffect } from 'react';
import { Reminder } from '@/lib/types';
import { CustomSelect } from './ui/CustomSelect';
import { CustomDatePicker } from './ui/CustomDatePicker';

interface ReminderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Reminder>) => void;
  initialData?: Reminder;
}

export function ReminderFormModal({ isOpen, onClose, onSubmit, initialData }: ReminderFormModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('monthly');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setAmount(initialData.amount.toString());
        setDueDate(initialData.due_date);
        setCategory(initialData.category || '');
        setIsRecurring(initialData.is_recurring);
        setRecurringType(initialData.recurring_type || 'monthly');
      } else {
        setTitle('');
        setAmount('');
        setDueDate('');
        setCategory('');
        setIsRecurring(false);
        setRecurringType('monthly');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !dueDate) return;
    
    onSubmit({
      title,
      amount: parseFloat(amount),
      due_date: dueDate,
      category: category || null,
      is_recurring: isRecurring,
      recurring_type: isRecurring ? (recurringType as any) : null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-sm p-6 fade-in max-h-[90vh] overflow-y-auto" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
        <h2 className="text-lg font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          {initialData ? 'Edit Pengingat' : 'Buat Pengingat Baru'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Judul Pengingat
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Bayar Kos"
              className="w-full p-2 text-sm bg-transparent border rounded-sm focus:outline-none"
              style={{ borderColor: 'var(--line-strong)', color: 'var(--text)' }}
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Nominal (Rp)
            </label>
            <input
              type="text"
              value={amount ? Number(amount).toLocaleString('id-ID') : ''}
              onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
              className="w-full p-2 text-sm font-mono bg-transparent border rounded-sm focus:outline-none"
              style={{ borderColor: 'var(--line-strong)', color: 'var(--accent-gold)' }}
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Kategori (Opsional)
            </label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Contoh: Tempat Tinggal"
              className="w-full p-2 text-sm bg-transparent border rounded-sm focus:outline-none"
              style={{ borderColor: 'var(--line-strong)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Tanggal Jatuh Tempo
            </label>
            <CustomDatePicker
              value={dueDate}
              onChange={val => setDueDate(val)}
            />
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isRecurring" className="text-sm" style={{ color: 'var(--text)' }}>
              Ulangi Secara Berkala
            </label>
          </div>

          {isRecurring && (
            <div className="mt-2">
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                Periode Perulangan
              </label>
              <CustomSelect
                value={recurringType}
                onChange={val => setRecurringType(val)}
                options={[
                  { value: 'daily', label: 'Harian' },
                  { value: 'weekly', label: 'Mingguan' },
                  { value: 'monthly', label: 'Bulanan' },
                  { value: 'yearly', label: 'Tahunan' }
                ]}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-sm transition-colors"
              style={{ color: 'var(--text-dim)' }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-sm transition-opacity hover:opacity-90 text-black"
              style={{ background: 'var(--accent-gold)' }}
            >
              Simpan Pengingat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
