import { useState, useEffect } from 'react';
import { Account, Goal } from '@/lib/types';
import { CustomSelect } from './ui/CustomSelect';
import { CustomDatePicker } from './ui/CustomDatePicker';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Goal>) => void;
  accounts: Account[];
  initialData?: Goal;
}

export function GoalFormModal({ isOpen, onClose, onSubmit, accounts, initialData }: GoalFormModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setTargetAmount(initialData.target_amount.toString());
        setCurrentAmount(initialData.current_amount.toString());
        setTargetDate(initialData.target_date || '');
      } else {
        setName('');
        setTargetAmount('');
        setCurrentAmount('0');
        setTargetDate('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    
    onSubmit({
      name,
      target_amount: parseFloat(targetAmount),
      linked_account_id: null,
      current_amount: parseFloat(currentAmount || '0'),
      target_date: targetDate || null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-sm p-6 fade-in" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
        <h2 className="text-lg font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          {initialData ? 'Edit Goal Tabungan' : 'Buat Goal Baru'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Nama Goal
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Dana Darurat"
              className="w-full p-2 text-sm bg-transparent border rounded-sm focus:outline-none"
              style={{ borderColor: 'var(--line-strong)', color: 'var(--text)' }}
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Target Tabungan (Rp)
            </label>
            <input
              type="text"
              value={targetAmount ? Number(targetAmount).toLocaleString('id-ID') : ''}
              onChange={e => setTargetAmount(e.target.value.replace(/\D/g, ''))}
              className="w-full p-2 text-sm font-mono bg-transparent border rounded-sm focus:outline-none"
              style={{ borderColor: 'var(--line-strong)', color: 'var(--accent-gold)' }}
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Progress Saat Ini (Rp)
            </label>
            <input
              type="text"
              value={currentAmount ? Number(currentAmount).toLocaleString('id-ID') : ''}
              onChange={e => setCurrentAmount(e.target.value.replace(/\D/g, ''))}
              className="w-full p-2 text-sm font-mono bg-transparent border rounded-sm focus:outline-none"
              style={{ borderColor: 'var(--line-strong)', color: 'var(--text)' }}
            />
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-dim)' }}>
              (Otomatis bertambah jika Anda mencatat transaksi dengan tipe Tabungan)
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Target Tanggal (Opsional)
            </label>
            <CustomDatePicker
              value={targetDate}
              onChange={val => setTargetDate(val)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              Simpan Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
