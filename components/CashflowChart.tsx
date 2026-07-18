import { useMemo } from 'react';
import { Transaction } from '@/lib/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CashflowChartProps {
  transactions: Transaction[];
}

export function CashflowChart({ transactions }: CashflowChartProps) {
  const data = useMemo(() => {
    // 6 bulan terakhir
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const map = new Map<string, { month: string; income: number; expense: number }>();
    months.forEach((m) => map.set(m, { month: m, income: 0, expense: 0 }));

    transactions.forEach((tx) => {
      const ym = tx.date.substring(0, 7);
      if (map.has(ym)) {
        const item = map.get(ym)!;
        if (tx.type === 'income') item.income += tx.amount;
        if (tx.type === 'expense') item.expense += tx.amount;
      }
    });

    return Array.from(map.values()).map((d) => {
      const dateObj = new Date(d.month + '-01');
      return {
        ...d,
        displayMonth: dateObj.toLocaleDateString('id-ID', { month: 'short' }),
      };
    });
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-sm shadow-xl" 
          style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}
        >
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any) => (
              <div key={entry.name} className="flex justify-between gap-6 text-sm font-mono">
                <span style={{ color: entry.color }}>
                  {entry.name === 'income' ? 'Masuk' : 'Keluar'}
                </span>
                <span style={{ color: 'var(--text)' }}>
                  {entry.value.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 p-4 rounded-sm" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
      <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        Aliran Kas (6 Bulan)
      </h3>
      <div className="w-full h-48 text-xs font-mono">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-rust)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-rust)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="displayMonth" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-dim)', fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-dim)', fontSize: 10 }} 
              tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}K` : val}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="var(--accent-gold)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorIncome)" 
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              stroke="var(--accent-rust)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorExpense)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
