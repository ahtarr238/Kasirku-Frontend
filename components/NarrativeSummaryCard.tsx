import { Transaction } from '@/lib/types';
import { generateNarrativeInsights } from '@/lib/calculations';
import { Sparkles } from 'lucide-react';

interface NarrativeSummaryCardProps {
  transactions: Transaction[];
  selectedMonth?: string;
}

export function NarrativeSummaryCard({ transactions, selectedMonth }: NarrativeSummaryCardProps) {
  const insights = generateNarrativeInsights(transactions, selectedMonth);

  const monthLabel = selectedMonth 
    ? new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    : 'Bulan Ini';

  if (insights.length === 0) return null;

  return (
    <div className="mb-8 p-5 rounded-sm fade-in relative overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Sparkles size={100} />
      </div>
      
      <h3 className="text-sm font-bold flex items-center gap-2 mb-4 relative z-10" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
        Sekilas {monthLabel}
      </h3>
      
      <ul className="space-y-3 relative z-10">
        {insights.map((insight, idx) => {
          // Parse the bold text markdown (**) and render it as span with highlight color
          const parts = insight.split(/(\*\*.*?\*\*)/g);
          return (
            <li key={idx} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-dim)' }}>
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent-gold)' }} />
              <span className="leading-relaxed">
                {parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <span key={i} className="font-medium" style={{ color: 'var(--text)' }}>
                        {part.slice(2, -2)}
                      </span>
                    );
                  }
                  return <span key={i}>{part}</span>;
                })}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
