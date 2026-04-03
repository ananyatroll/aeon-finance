import { useLiveQuery } from 'dexie-react-hooks';
import db from './db';

// ── Format currency ──
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ── Format date ──
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Hooks ──
export function useCategories(uid) {
  return useLiveQuery(() => 
    uid ? db.categories.where('uid').equals(uid).toArray() : Promise.resolve([])
  , [uid]) || [];
}

export function useTransactions(uid) {
  return useLiveQuery(() => 
    uid ? db.transactions.where('uid').equals(uid).orderBy('date').reverse().toArray() : Promise.resolve([])
  , [uid]) || [];
}

export function useSavingsGoals(uid) {
  return useLiveQuery(() => 
    uid ? db.savingsGoals.where('uid').equals(uid).toArray() : Promise.resolve([])
  , [uid]) || [];
}

// ── Category lookup ──
export function getCategoryMap(categories) {
  const map = {};
  for (const c of categories) {
    map[c.id] = c;
  }
  return map;
}

// ── Monthly aggregations ──
export function getMonthlyStats(transactions) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthTx = transactions.filter(t => new Date(t.date) >= startOfMonth);

  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;

  return { income, expenses, balance, transactionCount: monthTx.length };
}

// ── Spending by category (current month) ──
export function getSpendingByCategory(transactions, categories) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const catMap = getCategoryMap(categories);

  const spending = {};
  transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth)
    .forEach(t => {
      const catId = t.categoryId;
      if (!spending[catId]) {
        const cat = catMap[catId] || { name: 'Other', color: '#8892B0' };
        spending[catId] = { name: cat.name, color: cat.color, total: 0, limit: cat.budgetLimit || 0 };
      }
      spending[catId].total += t.amount;
    });

  return Object.values(spending).sort((a, b) => b.total - a.total);
}

// ── Daily spending for chart (last 7 days) ──
export function getDailySpending(transactions) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayStr = d.toDateString();

    const total = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === dayStr)
      .reduce((s, t) => s + t.amount, 0);

    days.push({ name: label, amount: total });
  }
  return days;
}

// ── Monthly trend (last 6 months) ──
export function getMonthlyTrend(transactions) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth();
    const year = d.getFullYear();
    const label = d.toLocaleDateString('en-US', { month: 'short' });

    const monthTx = transactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === month && td.getFullYear() === year;
    });

    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    months.push({ name: label, income, expenses });
  }
  return months;
}
