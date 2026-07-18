import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function CustomDatePicker({ value, onChange, className = "", style }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse current value or use today
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update calendar view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  }, [value]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Format to YYYY-MM-DD in local timezone
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(newDate.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    setIsOpen(false);
  };

  // Format display value
  const displayValue = value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pilih Tanggal';

  return (
    <div ref={containerRef} className={`relative ${className}`} style={style}>
      <div 
        className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors cursor-pointer select-none"
        style={{
          background: 'var(--bg)',
          color: value ? 'var(--text)' : 'var(--text-dim)',
          border: isOpen ? '1px solid var(--accent-gold)' : '1px solid var(--line-strong)',
          fontFamily: 'var(--font-mono)',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayValue}</span>
        <CalendarIcon size={14} style={{ color: 'var(--text-dim)' }} />
      </div>

      {isOpen && (
        <div 
          className="absolute z-50 mt-1 p-3 rounded-sm shadow-xl fade-in"
          style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)', width: '260px' }}
        >
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4">
            <button 
              type="button" 
              onClick={prevMonth}
              className="p-1 hover:bg-white/5 rounded transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-gold)' }}>
              {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </div>
            <button 
              type="button" 
              onClick={nextMonth}
              className="p-1 hover:bg-white/5 rounded transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
              <div key={d} className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for previous month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className="w-7 h-7 mx-auto rounded-full text-xs flex items-center justify-center transition-colors"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: isSelected ? 'var(--accent-gold)' : isToday ? 'var(--panel-hover)' : 'transparent',
                    color: isSelected ? '#101a2b' : 'var(--text)',
                    border: isToday && !isSelected ? '1px solid var(--accent-gold)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--panel-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = isToday ? 'var(--panel-hover)' : 'transparent';
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
