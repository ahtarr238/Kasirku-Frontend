// ═══════════════════════════════════════════════════════════
//  Kasirku — Shared TypeScript Types
// ═══════════════════════════════════════════════════════════

export type AccountType = 'bank' | 'ewallet' | 'cash' | 'other';
export type TransactionType = 'income' | 'expense' | 'transfer' | 'saving';

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  created_at: string;
  /** Dihitung dari transaksi, tidak disimpan di DB */
  balance?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  to_account_id: string | null;
  goal_id?: string | null;
  date: string;               // format: 'YYYY-MM-DD'
  type: TransactionType;
  category: string | null;
  amount: number;             // selalu positif; tanda ditentukan oleh `type`
  note: string | null;
  created_at: string;
}

export interface Settings {
  user_id: string;
  income_categories: string[];
  expense_categories: string[];
}

// ── Response types dari API ──────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// ── Calculated / derived types ───────────────────────────────

export interface HealthScore {
  score: number;                                    // 0–100
  label: 'Sehat' | 'Cukup Stabil' | 'Perlu Perhatian' | 'Rawan';
  savingsRate: number;
}

export interface BurnRateResult {
  burnRate: number;           // rata-rata expense per bulan (Rp)
  runway: number | null;      // dalam bulan; null = tak terhingga (burnRate = 0)
}

export interface HeatmapDay {
  date: string;               // 'YYYY-MM-DD'
  amount: number;             // total expense hari itu
  intensity: number;          // 0–1, relatif terhadap max harian
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
}

export interface BudgetStatus {
  category: string;
  monthly_limit: number;
  spent: number;
  percentage: number;
  status: 'aman' | 'mendekati' | 'lewat';
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  linked_account_id: string | null;
  current_amount: number;
  target_date: string | null;
  created_at: string;
}

export interface GoalProgress {
  goal: Goal;
  progressPercentage: number;
  currentBalance: number;
  savingSpeed: number; // per month
  estimatedMonthsLeft: number | null;
}

export interface RecurringTransaction {
  category: string | null;
  type: TransactionType;
  amount: number;             // amount dibulatkan ke 10rb
  monthCount: number;         // berapa bulan berturut-turut terdeteksi
  lastDate: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  due_date: string;
  category: string | null;
  is_recurring: boolean;
  recurring_type: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  created_at: string;
}
