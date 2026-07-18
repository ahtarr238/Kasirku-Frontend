import { useMemo } from 'react';
import { Transaction, Budget, BudgetStatus } from '@/lib/types';
import { calculateBudgetStatus } from '@/lib/calculations';
import { Settings } from 'lucide-react';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  budgets: Budget[];
  onSetBudget: (category: string) => void;
  selectedMonth?: string;
}

export function CategoryBreakdown({ transactions, budgets, onSetBudget, selectedMonth }: CategoryBreakdownProps) {
  const { totalExpense, items, budgetStatuses, monthLabel } = useMemo(() => {
    // Hanya ambil bulan yang dipilih, atau bulan berjalan
    const now = new Date();
    const currentMonth = selectedMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Format label (e.g. "Juni 2026")
    const d = new Date(currentMonth + '-01');
    const monthLabel = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    let totalExpense = 0;
    const categoryMap = new Map<string, number>();

    transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date.startsWith(currentMonth)) {
        totalExpense += tx.amount;
        const cat = tx.category || 'Lain-lain';
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + tx.amount);
      }
    });

    const items = Array.from(categoryMap.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount); // urutkan dari terbesar

    const budgetStatuses = calculateBudgetStatus(transactions, budgets, selectedMonth);

    return { totalExpense, items, budgetStatuses, monthLabel };
  }, [transactions, budgets, selectedMonth]);

  if (items.length === 0 && budgets.length === 0) {
    return (
      <div className="p-5 rounded-sm h-full flex flex-col justify-center items-center text-center" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--text-dim)' }}>Kategori Pengeluaran</p>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          Belum ada pengeluaran bulan ini.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-sm" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          Pengeluaran {monthLabel}
        </h3>
        <p className="text-sm font-mono text-right" style={{ color: 'var(--accent-rust)' }}>
          Rp {totalExpense.toLocaleString('id-ID')}
        </p>
      </div>

      <div className="space-y-4">
        {items.map(item => {
          const budget = budgetStatuses.find(b => b.category === item.name);
          const isOver = budget?.status === 'lewat';
          const isWarning = budget?.status === 'mendekati';
          const isSafe = budget?.status === 'aman';
          
          let barColor = 'var(--accent-rust)';
          if (budget) {
            barColor = isOver ? 'var(--accent-rust)' : isWarning ? 'var(--accent-gold)' : 'var(--text)';
          }

          return (
          <div key={item.name} className="relative group cursor-pointer" onClick={() => onSetBudget(item.name)}>
            <div className="flex justify-between text-xs mb-1">
              <span className="truncate pr-2 font-medium group-hover:underline flex items-center gap-1">
                {item.name}
              </span>
              <span className="font-mono text-right shrink-0 flex items-center gap-2" style={{ color: 'var(--text-dim)' }}>
                {budget ? (
                  <span style={{ color: isOver ? 'var(--accent-rust)' : 'var(--text-dim)' }}>
                    Rp {item.amount.toLocaleString('id-ID')} / Rp {budget.monthly_limit.toLocaleString('id-ID')}
                  </span>
                ) : (
                  <span>{item.percentage.toFixed(1)}%</span>
                )}
              </span>
            </div>
            
            {/* Background bar */}
            <div className="h-1.5 w-full rounded-full overflow-hidden relative" style={{ background: 'var(--bg)' }}>
              {/* Fill bar */}
              <div 
                className="h-full rounded-full absolute left-0 top-0 transition-all" 
                style={{ 
                  width: `${budget ? Math.min(budget.percentage, 100) : item.percentage}%`,
                  background: barColor,
                  opacity: 0.8
                }} 
              />
              {/* Over budget marker */}
              {isOver && (
                <div className="absolute right-0 top-0 h-full w-2 bg-red-500 animate-pulse" />
              )}
            </div>
            
            {!budget && (
              <div className="absolute right-0 top-[-20px] opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] bg-black/50 px-1 rounded text-white/50 border border-white/10">Klik untuk set budget</span>
              </div>
            )}
          </div>
        )})}
      </div>
    </div>
  );
}
