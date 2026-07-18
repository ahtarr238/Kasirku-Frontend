import { useState, FormEvent } from 'react';
import { Account, TransactionType, Goal } from '@/lib/types';
import { X } from 'lucide-react';
import { CustomSelect } from './ui/CustomSelect';
import { CustomDatePicker } from './ui/CustomDatePicker';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  accounts: Account[];
  goals: Goal[];
}

export function TransactionModal({ isOpen, onClose, onSubmit, accounts, goals }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [goalId, setGoalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!accountId) {
      setError('Pilih akun sumber');
      return;
    }

    if (type === 'transfer' && !toAccountId) {
      setError('Pilih akun tujuan');
      return;
    }

    if (type === 'saving' && !goalId) {
      setError('Pilih target tabungan');
      return;
    }

    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount <= 0) {
      setError('Nominal tidak valid');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        type,
        date,
        amount: numAmount,
        category: type === 'saving' ? 'Tabungan' : (category || null),
        note: note || null,
        account_id: accountId,
        to_account_id: type === 'transfer' ? toAccountId : undefined,
        goal_id: type === 'saving' ? goalId : undefined
      });
      // Reset form
      setAmount('');
      setCategory('');
      setNote('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors";
  const inputStyle = { background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--line-strong)' };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 fade-in">
      <div 
        className="w-full max-w-md rounded-sm p-6 shadow-2xl relative"
        style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-gold)' }}>
          Catat Transaksi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipe */}
          <div className="flex gap-2">
            {(['expense', 'income', 'transfer', 'saving'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="flex-1 py-1.5 text-xs tracking-wider uppercase rounded-sm border transition-colors"
                style={{
                  borderColor: type === t ? 'var(--accent-gold)' : 'var(--line-strong)',
                  color: type === t ? 'var(--accent-gold)' : 'var(--text-dim)',
                  background: type === t ? 'var(--bg)' : 'transparent',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : t === 'transfer' ? 'Transfer' : 'Tabungan'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tanggal */}
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Tanggal</label>
              <CustomDatePicker
                value={date}
                onChange={val => setDate(val)}
              />
            </div>
            
            {/* Nominal */}
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Nominal</label>
              <input 
                type="text" 
                value={amount}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setAmount(val ? parseInt(val).toLocaleString('id-ID') : '');
                }}
                placeholder="0"
                required
                className={inputClass}
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Akun */}
            <div className={(type === 'transfer' || type === 'saving') ? 'col-span-1' : 'col-span-2'}>
              <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {type === 'transfer' ? 'Dari Akun' : type === 'saving' ? 'Dari Akun' : 'Akun'}
              </label>
              <CustomSelect
                value={accountId}
                onChange={(val) => setAccountId(val)}
                options={[
                  { value: "", label: "-- Pilih Akun --" },
                  ...accounts.map(a => ({ value: a.id, label: a.name }))
                ]}
              />
            </div>

            {/* Ke Akun (Transfer) */}
            {type === 'transfer' && (
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Ke Akun</label>
                <CustomSelect
                  value={toAccountId}
                  onChange={(val) => setToAccountId(val)}
                  options={[
                    { value: "", label: "-- Pilih Akun --" },
                    ...accounts
                      .filter(a => a.id !== accountId)
                      .map(a => ({ value: a.id, label: a.name }))
                  ]}
                />
              </div>
            )}

            {/* Ke Tabungan (Saving) */}
            {type === 'saving' && (
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Ke Tabungan</label>
                <CustomSelect
                  value={goalId}
                  onChange={(val) => setGoalId(val)}
                  options={[
                    { value: "", label: "-- Pilih Tabungan --" },
                    ...goals.map(g => ({ value: g.id, label: g.name }))
                  ]}
                />
              </div>
            )}
          </div>

          {/* Kategori */}
          {(type !== 'transfer' && type !== 'saving') && (
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Kategori</label>
              <input 
                type="text" 
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder={type === 'expense' ? 'Makanan, Transportasi...' : 'Gaji, Bonus...'}
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>
          )}

          {/* Catatan */}
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Catatan (Opsional)</label>
            <input 
              type="text" 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Deskripsi..."
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 text-sm rounded-sm transition-opacity"
            style={{
              background: 'var(--accent-gold)',
              color: '#101a2b',
              fontFamily: 'var(--font-mono)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}
