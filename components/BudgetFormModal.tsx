import { useState, useEffect } from 'react';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { category: string; monthly_limit: number }) => void;
  initialData?: { category: string; monthly_limit: number };
}

export function BudgetFormModal({ isOpen, onClose, onSubmit, initialData }: BudgetFormModalProps) {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCategory(initialData.category);
        setLimit(initialData.monthly_limit.toString());
      } else {
        setCategory('');
        setLimit('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit) return;
    
    onSubmit({
      category,
      monthly_limit: parseFloat(limit)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-sm p-6 fade-in" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
        <h2 className="text-lg font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          {initialData ? 'Edit Target Bulanan' : 'Set Target Bulanan'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Kategori
            </label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2 text-sm bg-transparent border rounded-sm focus:outline-none"
              style={{ borderColor: 'var(--line-strong)', color: 'var(--text)' }}
              required
              readOnly={!!initialData} // Tidak bisa ganti kategori kalau edit (karena itu unique key)
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Batas Maksimal (Rp)
            </label>
            <input
              type="text"
              value={limit ? Number(limit).toLocaleString('id-ID') : ''}
              onChange={e => setLimit(e.target.value.replace(/\D/g, ''))}
              className="w-full p-2 text-sm font-mono bg-transparent border rounded-sm focus:outline-none"
              style={{ borderColor: 'var(--line-strong)', color: 'var(--accent-gold)' }}
              required
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
              Simpan Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
