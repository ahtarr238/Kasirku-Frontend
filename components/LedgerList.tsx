import { Transaction, Account } from '@/lib/types';
import { Trash2 } from 'lucide-react';

interface LedgerListProps {
  transactions: Transaction[];
  accounts: Account[];
  onDelete: (id: string) => void;
}

export function LedgerList({ transactions, accounts, onDelete }: LedgerListProps) {
  // Fungsi helper cari nama akun
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Unknown';

  // Group by month
  const grouped: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    // ambil YYYY-MM
    const monthKey = t.date.substring(0, 7);
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(t);
  });

  // Sort months descending
  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const formatMonth = (ym: string) => {
    const d = new Date(ym + '-01');
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center" style={{ color: 'var(--text-dim)' }}>
        <p>Belum ada transaksi dicatat.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {sortedMonths.map(month => (
        <div key={month}>
          {/* Month Header */}
          <h3 
            className="text-lg font-bold mb-4 pb-2" 
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', borderBottom: '1px solid var(--line-strong)' }}
          >
            {formatMonth(month)}
          </h3>

          {/* Ledger Table */}
          <div className="w-full text-sm">
            {/* Header row - Hidden on mobile */}
            <div 
              className="hidden md:grid grid-cols-[100px_1fr_150px_150px_40px] gap-4 py-2 px-2 text-xs uppercase tracking-widest font-mono"
              style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--line)' }}
            >
              <div>Tanggal</div>
              <div>Keterangan</div>
              <div>Akun</div>
              <div className="text-right">Nominal</div>
              <div></div>
            </div>

            {/* Rows */}
            <div className="flex flex-col">
              {grouped[month].map(t => (
                <div 
                  key={t.id} 
                  className="group flex flex-col md:grid md:grid-cols-[100px_1fr_150px_150px_40px] gap-1 md:gap-4 py-3 px-2 md:items-center ledger-row"
                >
                  <div className="flex justify-between md:contents items-start">
                    <div className="truncate md:col-start-2 md:col-end-3 md:row-start-1">
                      <p className="font-medium md:font-normal">{t.category || (t.type === 'transfer' ? 'Transfer' : 'Uncategorized')}</p>
                      {t.note && (
                        <p className="text-xs truncate" style={{ color: 'var(--text-dim)' }}>
                          {t.note}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 md:contents">
                      <div className="text-right font-mono font-medium md:font-normal md:col-start-4 md:col-end-5 md:row-start-1" style={{ 
                        color: t.type === 'income' ? 'var(--accent-gold)' 
                             : t.type === 'expense' ? 'var(--accent-rust)'
                             : 'var(--text-dim)' 
                      }}>
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                        {t.amount.toLocaleString('id-ID')}
                      </div>

                      <div className="md:col-start-5 md:col-end-6 md:row-start-1 flex justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onDelete(t.id)}
                          className="p-1.5 md:p-1 rounded bg-black/40 md:bg-transparent hover:bg-red-500/10 text-red-400/80 md:text-red-400/50 hover:text-red-400 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} className="md:w-3.5 md:h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between md:contents mt-1 md:mt-0 text-xs md:text-sm">
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }} className="md:col-start-1 md:col-end-2 md:row-start-1">
                      {formatDate(t.date)}
                    </div>
                    
                    <div className="truncate text-xs md:col-start-3 md:col-end-4 md:row-start-1" style={{ color: 'var(--text-muted)' }}>
                      {t.type === 'transfer' 
                        ? `${getAccountName(t.account_id)} → ${t.to_account_id ? getAccountName(t.to_account_id) : '?'}`
                        : getAccountName(t.account_id)
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
