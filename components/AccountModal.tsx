import { useState, FormEvent } from 'react';
import { AccountType } from '@/lib/types';
import { X } from 'lucide-react';
import { CustomSelect } from './ui/CustomSelect';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function AccountModal({ isOpen, onClose, onSubmit }: AccountModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Nama akun wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name, type });
      setName('');
      setType('bank');
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
        className="w-full max-w-sm rounded-sm p-6 shadow-2xl relative"
        style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-gold)' }}>
          Tambah Akun
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Nama Akun</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="BCA, GoPay, Tunai..."
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Jenis Akun</label>
            <CustomSelect
              value={type}
              onChange={(val) => setType(val as AccountType)}
              options={[
                { value: "bank", label: "Bank" },
                { value: "ewallet", label: "E-Wallet" },
                { value: "cash", label: "Tunai" },
                { value: "other", label: "Lainnya" }
              ]}
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
            {loading ? 'Menyimpan...' : 'Simpan Akun'}
          </button>
        </form>
      </div>
    </div>
  );
}
