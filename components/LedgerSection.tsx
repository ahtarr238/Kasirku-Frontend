import { useState, useMemo } from 'react';
import { Transaction, Account } from '@/lib/types';
import { LedgerFilterBar } from './LedgerFilterBar';
import { LedgerList } from './LedgerList';

interface LedgerSectionProps {
  transactions: Transaction[];
  accounts: Account[];
  onDelete: (id: string) => void;
}

export function LedgerSection({ transactions, accounts, onDelete }: LedgerSectionProps) {
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => months.add(t.date.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Filter Month
      if (filterMonth !== 'all' && !t.date.startsWith(filterMonth)) return false;
      
      // Filter Type
      if (filterType !== 'all' && t.type !== filterType) return false;
      
      // Filter Account
      if (filterAccount !== 'all') {
        if (t.account_id !== filterAccount && t.to_account_id !== filterAccount) {
          return false;
        }
      }

      // Filter Search
      if (search) {
        const query = search.toLowerCase();
        const categoryMatch = t.category?.toLowerCase().includes(query);
        const noteMatch = t.note?.toLowerCase().includes(query);
        if (!categoryMatch && !noteMatch) return false;
      }

      return true;
    });
  }, [transactions, filterMonth, filterType, filterAccount, search]);

  return (
    <div>
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          Daftar Transaksi
        </h2>
        <div className="text-xs font-mono text-gray-500">
          {filteredTransactions.length} transaksi
        </div>
      </div>
      
      <LedgerFilterBar 
        search={search} setSearch={setSearch}
        filterMonth={filterMonth} setFilterMonth={setFilterMonth}
        filterType={filterType} setFilterType={setFilterType}
        filterAccount={filterAccount} setFilterAccount={setFilterAccount}
        accounts={accounts}
        availableMonths={availableMonths}
      />

      <LedgerList 
        transactions={filteredTransactions} 
        accounts={accounts} 
        onDelete={onDelete} 
      />
    </div>
  );
}
