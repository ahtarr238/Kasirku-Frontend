import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function CustomSelect({ options, value, onChange, placeholder = "Pilih...", className = "", style }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={style}>
      <div 
        className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors cursor-pointer select-none"
        style={{
          background: 'var(--bg)',
          color: selectedOption ? 'var(--text)' : 'var(--text-dim)',
          border: isOpen ? '1px solid var(--accent-gold)' : '1px solid var(--line-strong)',
          fontFamily: 'var(--font-mono)',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-dim)' }} />
      </div>

      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 rounded-sm shadow-xl overflow-y-auto max-h-60 fade-in"
          style={{ background: 'var(--panel)', border: '1px solid var(--line-strong)' }}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-dim)' }}>Tidak ada opsi</div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                className="px-3 py-2 text-sm cursor-pointer transition-colors"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: value === opt.value ? 'var(--accent-gold)' : 'var(--text)',
                  background: value === opt.value ? 'var(--panel-hover)' : 'transparent',
                }}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--panel-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = value === opt.value ? 'var(--panel-hover)' : 'transparent')}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
