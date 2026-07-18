import { GoalProgress } from '@/lib/types';
import { Target, Clock, Plus } from 'lucide-react';

interface GoalsListProps {
  progresses: GoalProgress[];
  onAdd: () => void;
  onEdit: (goal: GoalProgress['goal']) => void;
}

export function GoalsList({ progresses, onAdd, onEdit }: GoalsListProps) {
  if (progresses.length === 0) {
    return (
      <div className="p-5 rounded-sm h-full" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            <Target size={16} style={{ color: 'var(--accent-gold)' }} />
            Tabungan & Target
          </h3>
          <button 
            onClick={onAdd}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors"
            style={{ color: 'var(--accent-gold)', background: 'rgba(201, 162, 39, 0.1)' }}
          >
            <Plus size={12} /> Buat Target
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
          <p>Belum ada target tabungan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-sm" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          <Target size={16} style={{ color: 'var(--accent-gold)' }} />
          Tabungan & Target
        </h3>
        <button 
          onClick={onAdd}
          className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors hover:bg-white/5"
          style={{ color: 'var(--text)' }}
        >
          <Plus size={12} /> Baru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {progresses.map(({ goal, progressPercentage, currentBalance, estimatedMonthsLeft }) => (
          <div 
            key={goal.id} 
            className="p-4 rounded-sm border cursor-pointer hover:border-white/20 transition-colors"
            style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
            onClick={() => onEdit(goal)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium">{goal.name}</h4>
              <span className="text-xs px-2 py-0.5 rounded-sm bg-black/30 text-white/50 border border-white/10">
                {goal.linked_account_id ? 'Auto' : 'Manual'}
              </span>
            </div>
            
            <div className="flex justify-between items-end mb-2 font-mono">
              <span className="text-sm" style={{ color: 'var(--accent-gold)' }}>
                Rp {currentBalance.toLocaleString('id-ID')}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                / Rp {goal.target_amount.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${progressPercentage}%`, 
                  background: progressPercentage >= 100 ? 'var(--accent-gold)' : 'var(--text)' 
                }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
              <span>{progressPercentage.toFixed(1)}% Tercapai</span>
              
              {progressPercentage < 100 && estimatedMonthsLeft !== null && (
                <span className="flex items-center gap-1">
                  <Clock size={10} /> 
                  {estimatedMonthsLeft < 1 ? '< 1 bln' : `${Math.round(estimatedMonthsLeft)} bln lagi`}
                </span>
              )}
              {progressPercentage >= 100 && (
                <span style={{ color: 'var(--accent-gold)' }}>Selesai! 🎉</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
