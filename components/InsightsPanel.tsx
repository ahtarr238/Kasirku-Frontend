import { useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { 
  calculateBurnRateAndRunway, 
  calculateHealthScore, 
  detectRecurringTransactions 
} from '@/lib/calculations';
import { AlertCircle, Flame, HeartPulse, Repeat } from 'lucide-react';

interface InsightsPanelProps {
  transactions: Transaction[];
  totalBalance: number;
}

export function InsightsPanel({ transactions, totalBalance }: InsightsPanelProps) {
  const { burnRate, runway } = useMemo(() => calculateBurnRateAndRunway(transactions, totalBalance), [transactions, totalBalance]);
  const health = useMemo(() => calculateHealthScore(transactions), [transactions]);
  const recurring = useMemo(() => detectRecurringTransactions(transactions), [transactions]);

  return (
    <div className="space-y-6">
      
      {/* Burn Rate & Runway */}
      <div className="p-5 rounded-sm" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} style={{ color: 'var(--accent-rust)' }} />
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            Burn Rate & Runway
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Burn Rate (Avg)</p>
            <p className="text-lg font-mono" style={{ color: 'var(--accent-rust)' }}>
              Rp {Math.round(burnRate).toLocaleString('id-ID')}
              <span className="text-xs ml-1" style={{ color: 'var(--text-dim)' }}>/bln</span>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Runway</p>
            <p className="text-lg font-mono" style={{ color: 'var(--text)' }}>
              {runway === null || !isFinite(runway) ? '∞' : runway < 1 ? '< 1' : Math.round(runway)}
              <span className="text-xs ml-1" style={{ color: 'var(--text-dim)' }}>bulan</span>
            </p>
          </div>
        </div>
        <p className="text-xs mt-4 leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          *Berdasarkan rata-rata pengeluaran 3 bulan terakhir. Runway adalah estimasi ketahanan saldo saat ini jika tidak ada pemasukan baru.
        </p>
      </div>

      {/* Health Score */}
      <div className="p-5 rounded-sm" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
        <div className="flex items-center gap-2 mb-4">
          <HeartPulse size={16} style={{ color: 'var(--accent-gold)' }} />
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            Kesehatan Finansial
          </h3>
        </div>
        
        <div className="flex items-center gap-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center border-4"
            style={{ 
              borderColor: health.score >= 75 ? 'var(--accent-gold)' : health.score >= 50 ? '#d4a373' : 'var(--accent-rust)',
              background: 'var(--bg)'
            }}
          >
            <span className="text-xl font-bold font-mono">{Math.round(health.score)}</span>
          </div>
          <div>
            <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>{health.label}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
              Savings rate rata-rata: <span className="font-mono text-white">{(health.savingsRate * 100).toFixed(1)}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recurring Transactions */}
      <div className="p-5 rounded-sm" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Repeat size={16} style={{ color: 'var(--text)' }} />
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            Deteksi Langganan
          </h3>
        </div>
        
        {recurring.length > 0 ? (
          <div className="space-y-3">
            {recurring.map((rec, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-sm" style={{ background: 'var(--bg)', border: '1px solid var(--line)' }}>
                <div>
                  <p className="text-sm font-medium">{rec.category || 'Uncategorized'}</p>
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-dim)' }}>
                    <AlertCircle size={12} /> {rec.monthCount} bulan berturut-turut
                  </p>
                </div>
                <div className="text-right font-mono text-sm" style={{ color: rec.type === 'expense' ? 'var(--accent-rust)' : 'var(--accent-gold)' }}>
                  Rp {rec.amount.toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-dim)' }}>
            Belum ada pola langganan yang terdeteksi.
          </p>
        )}
      </div>

    </div>
  );
}
