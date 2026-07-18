// ═══════════════════════════════════════════════════════════
//  Kasirku — Pure Calculation Functions
//  Semua fungsi di sini adalah pure functions (tidak ada
//  side effects, tidak ada fetch/DB call) — mudah di-unit-test.
// ═══════════════════════════════════════════════════════════

import {
  Transaction,
  BurnRateResult,
  HealthScore,
  HeatmapDay,
  RecurringTransaction,
} from './types';

// ── Helpers ─────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Mengembalikan string 'YYYY-MM' dari tanggal ISO */
function toYearMonth(date: string): string {
  return date.slice(0, 7);
}

/** Mengembalikan daftar 3 bulan kalender terakhir sebagai 'YYYY-MM' */
function lastNMonths(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

// ── 1. Saldo per akun ───────────────────────────────────────

/**
 * Menghitung saldo akun dari seluruh transaksi.
 * saldo = Σ income − Σ expense + Σ transfer_masuk − Σ transfer_keluar
 */
export function calculateAccountBalance(
  transactions: Transaction[],
  accountId: string
): number {
  return transactions.reduce((balance, tx) => {
    if (tx.account_id === accountId) {
      if (tx.type === 'income') return balance + tx.amount;
      if (tx.type === 'expense') return balance - tx.amount;
      if (tx.type === 'transfer') return balance - tx.amount; // keluar dari akun ini
      if (tx.type === 'saving') return balance - tx.amount; // keluar ke tabungan
    }
    if (tx.to_account_id === accountId && tx.type === 'transfer') {
      return balance + tx.amount; // masuk ke akun ini
    }
    return balance;
  }, 0);
}

// ── 2. Burn rate & runway ───────────────────────────────────

/**
 * Rata-rata pengeluaran per bulan (3 bulan terakhir) dan
 * estimasi berapa bulan saldo bertahan.
 */
export function calculateBurnRateAndRunway(
  transactions: Transaction[],
  totalBalance: number
): BurnRateResult {
  const months = lastNMonths(3);

  const monthlyExpenses = months.map((month) =>
    transactions
      .filter((tx) => tx.type === 'expense' && toYearMonth(tx.date) === month)
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  const burnRate = monthlyExpenses.reduce((a, b) => a + b, 0) / 3;

  return {
    burnRate,
    runway: burnRate === 0 ? null : totalBalance / burnRate,
  };
}

// ── 3. Skor kesehatan finansial ─────────────────────────────

/**
 * Skor 0–100 berdasarkan savings rate rata-rata 3 bulan terakhir.
 * Formula: skor = clamp(50 + savingsRate × 100, 0, 100)
 */
export function calculateHealthScore(transactions: Transaction[]): HealthScore {
  const months = lastNMonths(3);

  const savingsRates = months.map((month) => {
    const income = transactions
      .filter((tx) => tx.type === 'income' && toYearMonth(tx.date) === month)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions
      .filter((tx) => tx.type === 'expense' && toYearMonth(tx.date) === month)
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (income === 0) return 0;
    return (income - expense) / income;
  });

  const avgSavingsRate =
    savingsRates.reduce((a, b) => a + b, 0) / savingsRates.length;
  const score = clamp(50 + avgSavingsRate * 100, 0, 100);

  let label: HealthScore['label'];
  if (score >= 75) label = 'Sehat';
  else if (score >= 50) label = 'Cukup Stabil';
  else if (score >= 25) label = 'Perlu Perhatian';
  else label = 'Rawan';

  return { score, label, savingsRate: avgSavingsRate };
}

// ── 4. Deteksi transaksi rutin/langganan ────────────────────

/**
 * Menandai transaksi yang berulang di ≥2 bulan kalender berbeda
 * secara berurutan, berdasarkan (category, type, amount dibulatkan ke 10rb).
 */
export function detectRecurringTransactions(
  transactions: Transaction[]
): RecurringTransaction[] {
  const round10k = (n: number) => Math.round(n / 10000) * 10000;

  // Group by key
  const groups = new Map<string, { months: Set<string>; tx: Transaction }>();

  for (const tx of transactions) {
    if (tx.type === 'transfer') continue;
    const key = `${tx.category ?? 'uncategorized'}__${tx.type}__${round10k(tx.amount)}`;
    if (!groups.has(key)) {
      groups.set(key, { months: new Set(), tx });
    }
    groups.get(key)!.months.add(toYearMonth(tx.date));
  }

  const results: RecurringTransaction[] = [];

  for (const [, { months, tx }] of groups) {
    if (months.size < 2) continue;

    // Cek apakah bulan-bulan itu berurutan
    const sorted = Array.from(months).sort();
    let consecutive = 1;
    let maxConsecutive = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1] + '-01');
      const curr = new Date(sorted[i] + '-01');
      const diffMonths =
        (curr.getFullYear() - prev.getFullYear()) * 12 +
        (curr.getMonth() - prev.getMonth());
      if (diffMonths === 1) {
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      } else {
        consecutive = 1;
      }
    }

    if (maxConsecutive >= 2) {
      results.push({
        category: tx.category,
        type: tx.type,
        amount: Math.round(tx.amount / 10000) * 10000,
        monthCount: maxConsecutive,
        lastDate: sorted[sorted.length - 1],
      });
    }
  }

  return results.sort((a, b) => b.amount - a.amount);
}

// ── 5. Heatmap mingguan ─────────────────────────────────────

/**
 * 56 hari terakhir — total expense per hari.
 * intensity = amount / max(amount harian dalam rentang), 0 jika tidak ada transaksi.
 */
export function buildWeeklyHeatmap(transactions: Transaction[]): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const today = new Date();

  // Buat map date → total amount
  const amountByDate = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    const prev = amountByDate.get(tx.date) ?? 0;
    amountByDate.set(tx.date, prev + tx.amount);
  }

  for (let i = 55; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, amount: amountByDate.get(dateStr) ?? 0, intensity: 0 });
  }

  const maxAmount = Math.max(...days.map((d) => d.amount), 1);
  return days.map((d) => ({
    ...d,
    intensity: d.amount / maxAmount,
  }));
}

// ── 6. Status Budget per Kategori ───────────────────────────
export function calculateBudgetStatus(
  transactions: Transaction[],
  budgets: import('./types').Budget[],
  selectedMonth?: string // YYYY-MM
): import('./types').BudgetStatus[] {
  const now = new Date();
  const currentMonth = selectedMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const spentMap = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.date.startsWith(currentMonth)) {
      const cat = tx.category || 'Lain-lain';
      spentMap.set(cat, (spentMap.get(cat) || 0) + tx.amount);
    }
  }

  return budgets.map((b) => {
    const spent = spentMap.get(b.category) || 0;
    const percentage = (spent / b.monthly_limit) * 100;
    
    let status: 'aman' | 'mendekati' | 'lewat' = 'aman';
    if (percentage >= 100) status = 'lewat';
    else if (percentage >= 80) status = 'mendekati';

    return {
      category: b.category,
      monthly_limit: b.monthly_limit,
      spent,
      percentage,
      status
    };
  });
}

// ── 7. Progress Goal ────────────────────────────────────────
export function calculateGoalProgress(
  goals: import('./types').Goal[],
  accounts: import('./types').Account[],
  transactions: Transaction[]
): import('./types').GoalProgress[] {
  return goals.map(goal => {
    let currentBalance = goal.current_amount;

    const progressPercentage = Math.min((currentBalance / goal.target_amount) * 100, 100);

    // Kecepatan menabung: rata-rata transaksi tipe 'saving' ke goal ini 3 bulan terakhir
    const months = lastNMonths(3);
    const speeds = months.map(month => {
      return transactions
        .filter(tx => tx.type === 'saving' && tx.goal_id === goal.id && tx.date.startsWith(month))
        .reduce((sum, tx) => sum + tx.amount, 0);
    });
    const savingSpeed = speeds.reduce((a, b) => a + b, 0) / 3;

    let estimatedMonthsLeft = null;
    if (savingSpeed > 0 && currentBalance < goal.target_amount) {
      estimatedMonthsLeft = (goal.target_amount - currentBalance) / savingSpeed;
    }

    return {
      goal,
      currentBalance,
      progressPercentage,
      savingSpeed,
      estimatedMonthsLeft
    };
  });
}

// ── 8. Reminder Tagihan Rutin ───────────────────────────────
export function getUpcomingRecurringBills(
  recurringTransactions: RecurringTransaction[]
): { bill: RecurringTransaction; dueDate: string; daysLeft: number }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming: { bill: RecurringTransaction; dueDate: string; daysLeft: number }[] = [];

  for (const bill of recurringTransactions) {
    if (bill.type === 'expense') {
      const last = new Date(bill.lastDate);
      
      let nextMonth = last.getMonth() + 1;
      let nextYear = last.getFullYear();
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }
      
      const nextDueDate = new Date(nextYear, nextMonth, last.getDate());
      nextDueDate.setHours(0, 0, 0, 0);

      const diffTime = nextDueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= -3 && diffDays <= 7) {
        upcoming.push({
          bill,
          dueDate: nextDueDate.toISOString().slice(0, 10),
          daysLeft: diffDays
        });
      }
    }
  }

  return upcoming.sort((a, b) => a.daysLeft - b.daysLeft);
}

// ── 9. Ringkasan Naratif ────────────────────────────────────
export function generateNarrativeInsights(transactions: Transaction[], selectedMonth?: string): string[] {
  const now = new Date();
  const currentMonth = selectedMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const pastMonths = [];
  // Jika ada selectedMonth, hitung 3 bulan sebelumnya berdasarkan bulan tersebut
  const [year, month] = currentMonth.split('-').map(Number);
  for (let i = 1; i <= 3; i++) {
    const d = new Date(year, month - 1 - i, 1);
    pastMonths.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const getExpense = (month: string) => 
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(month)).reduce((sum, t) => sum + t.amount, 0);
    
  const getIncome = (month: string) => 
    transactions.filter(t => t.type === 'income' && t.date.startsWith(month)).reduce((sum, t) => sum + t.amount, 0);

  const currentExpense = getExpense(currentMonth);
  const currentIncome = getIncome(currentMonth);
  
  const pastExpenses = pastMonths.map(m => getExpense(m));
  const avgPastExpense = pastExpenses.reduce((a, b) => a + b, 0) / 3;

  const insights: string[] = [];

  if (avgPastExpense > 0) {
    const diffExpense = ((currentExpense - avgPastExpense) / avgPastExpense) * 100;
    if (diffExpense > 15) {
      insights.push(`Pengeluaran bulan ini naik ${diffExpense.toFixed(0)}% dibandingkan rata-rata 3 bulan terakhir.`);
    } else if (diffExpense < -15) {
      insights.push(`Hebat! Pengeluaranmu bulan ini turun ${Math.abs(diffExpense).toFixed(0)}% dari biasanya.`);
    } else {
      insights.push(`Pengeluaranmu bulan ini stabil dan sesuai dengan kebiasaan 3 bulan terakhir.`);
    }
  }

  if (currentIncome > 0) {
    const savingRate = ((currentIncome - currentExpense) / currentIncome) * 100;
    if (savingRate >= 20) {
      insights.push(`Kamu berhasil menyisihkan ${savingRate.toFixed(0)}% dari pemasukan bulan ini.`);
    } else if (savingRate < 0) {
      insights.push(`Bulan ini kamu mengalami defisit (pengeluaran melebihi pemasukan).`);
    }
  }

  const currentMonthTx = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
  if (currentMonthTx.length > 0) {
    const catMap = new Map<string, number>();
    for (const tx of currentMonthTx) {
      const cat = tx.category || 'Lain-lain';
      catMap.set(cat, (catMap.get(cat) || 0) + tx.amount);
    }
    const sortedCats = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);
    const topCat = sortedCats[0];
    
    if (topCat && topCat[1] > 0) {
      const percent = (topCat[1] / currentExpense) * 100;
      insights.push(`Sebanyak ${percent.toFixed(0)}% pengeluaran bulan ini dihabiskan untuk ${topCat[0]}.`);
    }
  }

  return insights;
}
