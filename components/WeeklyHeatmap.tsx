import { useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { buildWeeklyHeatmap } from '@/lib/calculations';

interface WeeklyHeatmapProps {
  transactions: Transaction[];
}

export function WeeklyHeatmap({ transactions }: WeeklyHeatmapProps) {
  const days = useMemo(() => buildWeeklyHeatmap(transactions), [transactions]);

  // days berisi 56 item. (Indeks 0 = 55 hari lalu, Indeks 55 = hari ini).
  // Kita akan render dalam grid: 8 kolom (minggu) x 7 baris (hari).
  // Susun berdasarkan kolom-major agar mengalir dari kiri (lama) ke kanan (baru), atas ke bawah.
  
  const grid: any[][] = Array(7).fill(null).map(() => Array(8).fill(null));

  // Mengisi grid (kolom-major order)
  let dayIndex = 0;
  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 7; row++) {
      grid[row][col] = days[dayIndex];
      dayIndex++;
    }
  }

  // Fungsi untuk mendapatkan warna berdasarkan intensitas (0 - 1)
  const getBackgroundColor = (intensity: number) => {
    if (intensity === 0) return 'var(--bg)'; // Tidak ada pengeluaran
    
    // Kita gunakan rentang opacity untuk warna rust (--accent-rust is #9b3a2e)
    // Minimal opacity 0.2, Maksimal 1.0
    const opacity = 0.2 + (intensity * 0.8);
    return `rgba(155, 58, 46, ${opacity})`;
  };

  return (
    <div className="p-5 rounded-sm" style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}>
      <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        Intensitas Pengeluaran (8 Minggu)
      </h3>
      
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto hide-scrollbar">
          {grid[0].map((_, colIndex) => (
            <div key={`col-${colIndex}`} className="flex flex-col gap-1.5">
              {grid.map((row, rowIndex) => {
                const dayData = grid[rowIndex][colIndex];
                if (!dayData) return null;

                return (
                  <div
                    key={dayData.date}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[2px] transition-colors hover:ring-1 hover:ring-white/50 cursor-pointer group relative"
                    style={{ background: getBackgroundColor(dayData.intensity) }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-max px-2 py-1 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 font-mono text-center shadow-lg"
                         style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--line-strong)' }}>
                      <div>{new Date(dayData.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                      {dayData.amount > 0 ? (
                        <div style={{ color: 'var(--accent-rust)' }}>
                          Rp {dayData.amount.toLocaleString('id-ID')}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-dim)' }}>Tidak ada</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="text-[10px] uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-dim)' }}>
          <span>Sedikit</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-[1px]" style={{ background: 'var(--bg)' }} />
            <div className="w-3 h-3 rounded-[1px]" style={{ background: 'rgba(155, 58, 46, 0.4)' }} />
            <div className="w-3 h-3 rounded-[1px]" style={{ background: 'rgba(155, 58, 46, 0.7)' }} />
            <div className="w-3 h-3 rounded-[1px]" style={{ background: 'rgba(155, 58, 46, 1)' }} />
          </div>
          <span>Banyak</span>
        </div>
      </div>
    </div>
  );
}
