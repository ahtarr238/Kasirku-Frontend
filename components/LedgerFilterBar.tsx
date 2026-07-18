import { Search, Filter, X } from 'lucide-react';
import { Account } from '@/lib/types';
import { CustomSelect } from './ui/CustomSelect';

interface LedgerFilterBarProps {
  search: string;
  setSearch: (s: string) => void;
  filterMonth: string;
  setFilterMonth: (m: string) => void;
  filterType: string;
  setFilterType: (t: string) => void;
  filterAccount: string;
  setFilterAccount: (a: string) => void;
  accounts: Account[];
  availableMonths: string[]; // YYYY-MM
}

export function LedgerFilterBar({
  search, setSearch,
  filterMonth, setFilterMonth,
  filterType, setFilterType,
  filterAccount, setFilterAccount,
  accounts, availableMonths
}: LedgerFilterBarProps) {
  
  const formatMonth = (ym: string) => {
    const d = new Date(ym + '-01');
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const inputClass = "px-3 py-1.5 text-xs rounded-sm outline-none transition-colors border";
  const inputStyle = { background: 'var(--panel)', color: 'var(--text)', borderColor: 'var(--line-strong)' };

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6 p-4 rounded-sm border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--line-strong)' }}>
      {/* Search */}
      <div className="flex-1 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input 
          type="text"
          placeholder="Cari transaksi atau catatan..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full pl-9 ${inputClass}`}
          style={inputStyle}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters Container */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} style={{ color: 'var(--text-dim)' }} className="mr-1 hidden md:block" />
        
        {/* Month Filter */}
        <CustomSelect
          value={filterMonth}
          onChange={(val) => setFilterMonth(val)}
          className="w-[140px]"
          options={[
            { value: "all", label: "Semua Bulan" },
            ...availableMonths.map(m => ({ value: m, label: formatMonth(m) }))
          ]}
        />

        {/* Type Filter */}
        <CustomSelect
          value={filterType}
          onChange={(val) => setFilterType(val)}
          className="w-[140px]"
          options={[
            { value: "all", label: "Semua Tipe" },
            { value: "income", label: "Pemasukan" },
            { value: "expense", label: "Pengeluaran" },
            { value: "transfer", label: "Transfer" }
          ]}
        />

        {/* Account Filter */}
        <CustomSelect
          value={filterAccount}
          onChange={(val) => setFilterAccount(val)}
          className="w-[140px]"
          options={[
            { value: "all", label: "Semua Akun" },
            ...accounts.map(a => ({ value: a.id, label: a.name }))
          ]}
        />
      </div>
    </div>
  );
}
