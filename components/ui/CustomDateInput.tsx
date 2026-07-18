import { Calendar } from 'lucide-react';
import React from 'react';

interface CustomDateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function CustomDateInput({ className = "", style, ...props }: CustomDateInputProps) {
  return (
    <div className={`relative ${className}`} style={style}>
      <input
        {...props}
        className="custom-date-input w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors appearance-none"
        style={{
          background: 'var(--bg)',
          color: 'var(--text)',
          border: '1px solid var(--line-strong)',
          fontFamily: 'var(--font-mono)',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--line-strong)')}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }}>
        <Calendar size={14} />
      </div>
      <style>{`
        /* Sembunyikan icon kalender bawaan tapi tetap bisa diklik dengan menutupi seluruh input */
        .custom-date-input::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
      `}</style>
    </div>
  );
}
