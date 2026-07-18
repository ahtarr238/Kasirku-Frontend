'use client';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Account, Transaction, Budget, Goal } from '@/lib/types';
import { calculateAccountBalance, calculateGoalProgress } from '@/lib/calculations';

import { Header } from '@/components/Header';
import { AccountsStrip } from '@/components/AccountsStrip';
import { LedgerSection } from '@/components/LedgerSection';
import { TransactionModal } from '@/components/TransactionModal';
import { AccountModal } from '@/components/AccountModal';
import { CashflowChart } from '@/components/CashflowChart';
import { InsightsPanel } from '@/components/InsightsPanel';
import { WeeklyHeatmap } from '@/components/WeeklyHeatmap';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { GoalsList } from '@/components/GoalsList';
import { BudgetFormModal } from '@/components/BudgetFormModal';
import { GoalFormModal } from '@/components/GoalFormModal';
import { NarrativeSummaryCard } from '@/components/NarrativeSummaryCard';
import { UpcomingBillsBanner } from '@/components/UpcomingBillsBanner';
import { detectRecurringTransactions } from '@/lib/calculations';
import Papa from 'papaparse';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  async function fetchData() {
    try {
      const [accRes, txRes, budgetRes, goalRes] = await Promise.all([
        apiGet<{ data: Account[] }>('/api/accounts'),
        apiGet<{ data: Transaction[] }>('/api/transactions'),
        apiGet<{ data: Budget[] }>('/api/budgets'),
        apiGet<{ data: Goal[] }>('/api/goals')
      ]);

      const fetchedTx = txRes.data;
      const fetchedAcc = accRes.data.map(acc => ({
        ...acc,
        balance: calculateAccountBalance(fetchedTx, acc.id)
      }));

      setTransactions(fetchedTx);
      setAccounts(fetchedAcc);
      setBudgets(budgetRes.data);
      setGoals(goalRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    setUser(currentUser);
    fetchData();
  }, []);

  async function handleAddTransaction(data: any) {
    await apiPost('/api/transactions', data);
    fetchData(); // refresh data
  }

  async function handleAddAccount(data: any) {
    await apiPost('/api/accounts', data);
    fetchData();
  }

  async function handleDeleteTransaction(id: string) {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      await apiDelete(`/api/transactions/${id}`);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus transaksi');
    }
  }

  async function handleSetBudget(data: { category: string; monthly_limit: number }) {
    await apiPost('/api/budgets', data);
    fetchData();
  }

  async function handleSetGoal(data: Partial<Goal>) {
    if (editingGoal) {
      await apiPatch(`/api/goals/${editingGoal.id}`, data);
    } else {
      await apiPost('/api/goals', data);
    }
    fetchData();
  }

  function handleExport() {
    if (transactions.length === 0) {
      alert('Tidak ada transaksi untuk diekspor');
      return;
    }
    
    const exportData = transactions.map(t => ({
      Tanggal: t.date,
      Tipe: t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer',
      Kategori: t.category || '',
      Nominal: t.amount,
      Akun_Sumber: accounts.find(a => a.id === t.account_id)?.name || '',
      Akun_Tujuan: t.to_account_id ? accounts.find(a => a.id === t.to_account_id)?.name || '' : '',
      Catatan: t.note || ''
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kasirku_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <main
        className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto w-full overflow-x-hidden fade-in"
        style={{ background: 'var(--bg)' }}
      >
      <Header 
        user={user} 
        onAddTransaction={() => setIsTxModalOpen(true)} 
        onAddAccount={() => setIsAccModalOpen(true)}
        onExport={handleExport}
      />

      {loading ? (
        <div className="text-center py-20" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Memuat data...
        </div>
      ) : (
        <>
          <AccountsStrip accounts={accounts} />
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8 min-w-0">
              <NarrativeSummaryCard transactions={transactions} />
              <UpcomingBillsBanner recurringTransactions={detectRecurringTransactions(transactions)} />
              
              <CashflowChart transactions={transactions} />
              
              <WeeklyHeatmap transactions={transactions} />

              <LedgerSection 
                transactions={transactions} 
                accounts={accounts} 
                onDelete={handleDeleteTransaction}
              />
            </div>
            
            {/* Sidebar Column */}
            <div className="space-y-8 min-w-0">
              <InsightsPanel 
                transactions={transactions}
                totalBalance={accounts.reduce((sum, a) => sum + (a.balance || 0), 0)}
              />

              <CategoryBreakdown 
                transactions={transactions} 
                budgets={budgets} 
                onSetBudget={(cat) => {
                  setBudgetCategory(cat);
                  setIsBudgetModalOpen(true);
                }} 
              />
              
              <GoalsList 
                progresses={calculateGoalProgress(goals, accounts, transactions)}
                onAdd={() => {
                  setEditingGoal(undefined);
                  setIsGoalModalOpen(true);
                }}
                onEdit={(g) => {
                  setEditingGoal(g);
                  setIsGoalModalOpen(true);
                }}
              />
            </div>
          </div>
        </>
      )}
    </main>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleAddTransaction}
        accounts={accounts}
        goals={goals}
      />

      <AccountModal
        isOpen={isAccModalOpen}
        onClose={() => setIsAccModalOpen(false)}
        onSubmit={handleAddAccount}
      />

      <BudgetFormModal 
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSubmit={handleSetBudget}
        initialData={budgets.find(b => b.category === budgetCategory)}
      />

      <GoalFormModal 
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleSetGoal}
        accounts={accounts}
        initialData={editingGoal}
      />

      {/* FAB Mobile (Hanya muncul di HP) */}
      <button
        onClick={() => setIsTxModalOpen(true)}
        className="fixed sm:hidden bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40 transition-transform active:scale-95 fade-in"
        style={{ background: 'var(--accent-gold)', color: '#101a2b', boxShadow: '0 4px 20px rgba(201, 162, 39, 0.3)' }}
        aria-label="Catat Transaksi"
      >
        <Plus size={24} />
      </button>
    </>
  );
}
