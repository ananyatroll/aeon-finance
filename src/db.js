import Dexie from 'dexie';

// ── OmniBudget Offline-First Database ──
const db = new Dexie('OmniBudgetDB');

db.version(2).stores({
  categories: 'id, name, type, uid, updatedAt, _deleted',
  transactions: 'id, categoryId, type, date, uid, updatedAt, _deleted',
  budgets: 'id, name, uid, updatedAt, _deleted',
  savingsGoals: 'id, name, uid, updatedAt, _deleted',
  sync_meta: 'id' // for storing lastSyncTimestamp
});

// ── Seed default categories if empty ──
const DEFAULT_CATEGORIES = [
  { id: 'cat-food',      name: 'Food & Dining',   icon: 'utensils',       color: '#FF6B8A', budgetLimit: 0 },
  { id: 'cat-transport',  name: 'Transportation',  icon: 'car',            color: '#48BFE3', budgetLimit: 0 },
  { id: 'cat-housing',    name: 'Housing',          icon: 'home',           color: '#7B61FF', budgetLimit: 0 },
  { id: 'cat-shopping',   name: 'Shopping',         icon: 'shopping-bag',   color: '#FFD166', budgetLimit: 0 },
  { id: 'cat-health',     name: 'Health',            icon: 'heart-pulse',    color: '#64FFDA', budgetLimit: 0 },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'gamepad-2',      color: '#F472B6', budgetLimit: 0 },
  { id: 'cat-utilities',  name: 'Utilities',        icon: 'zap',            color: '#FCA311', budgetLimit: 0 },
  { id: 'cat-salary',     name: 'Salary',            icon: 'briefcase',      color: '#64FFDA', budgetLimit: 0 },
  { id: 'cat-freelance',  name: 'Freelance',         icon: 'laptop',         color: '#48BFE3', budgetLimit: 0 },
  { id: 'cat-other',      name: 'Other',             icon: 'circle-dot',     color: '#8892B0', budgetLimit: 0 },
];

export async function seedUserDefaults(uid) {
  if (!uid) return;
  const count = await db.categories.where('uid').equals(uid).count();
  if (count === 0) {
    const userDefaults = DEFAULT_CATEGORIES.map(c => ({ ...c, uid }));
    await db.categories.bulkAdd(userDefaults);
  }
}

export default db;
