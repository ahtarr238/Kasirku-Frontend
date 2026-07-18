import { RecurringTransaction } from '@/lib/types';
import { getUpcomingRecurringBills } from '@/lib/calculations';
import { CalendarClock, AlertCircle } from 'lucide-react';

interface UpcomingBillsBannerProps {
  recurringTransactions: RecurringTransaction[];
}

export function UpcomingBillsBanner({ recurringTransactions }: UpcomingBillsBannerProps) {
  const upcoming = getUpcomingRecurringBills(recurringTransactions);

  if (upcoming.length === 0) return null;

  return (
    <div className="mb-8 p-4 rounded-sm fade-in border" style={{ background: 'rgba(155, 58, 46, 0.1)', borderColor: 'var(--accent-rust)' }}>
      <div className="flex items-start gap-3">
        <AlertCircle size={18} style={{ color: 'var(--accent-rust)', marginTop: '2px' }} />
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            Reminder Tagihan Mendekati Jatuh Tempo
          </h3>
          <div className="space-y-2">
            {upcoming.map(({ bill, dueDate, daysLeft }, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs md:text-sm">
                <span className="flex items-center gap-2">
                  <CalendarClock size={14} style={{ color: 'var(--text-dim)' }} />
                  <span className="font-medium">{bill.category || 'Tagihan Rutin'}</span>
                </span>
                
                <div className="flex items-center gap-4">
                  <span className="font-mono" style={{ color: 'var(--accent-rust)' }}>
                    Rp {bill.amount.toLocaleString('id-ID')}
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded-sm w-24 text-center text-[10px] uppercase tracking-wider"
                    style={{ 
                      background: daysLeft < 0 ? 'var(--accent-rust)' : daysLeft === 0 ? 'var(--accent-gold)' : 'var(--panel)',
                      color: daysLeft < 0 ? '#fff' : daysLeft === 0 ? '#000' : 'var(--text)',
                      border: daysLeft > 0 ? '1px solid var(--line-strong)' : 'none'
                    }}
                  >
                    {daysLeft < 0 ? `Lewat ${Math.abs(daysLeft)} hari` : daysLeft === 0 ? 'Hari ini' : `${daysLeft} hari lagi`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
