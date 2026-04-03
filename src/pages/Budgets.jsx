import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import db from '../db';
import { useAuth, useCategories, useTransactions, useSavingsGoals, formatCurrency, getSpendingByCategory } from '../hooks';
import BaseModal from '../components/ui/BaseModal';

export default function Budgets() {
  const { user } = useAuth();
  const categories = useCategories(user?.uid);
  const transactions = useTransactions(user?.uid);
  const goals = useSavingsGoals(user?.uid);
  const spending = getSpendingByCategory(transactions, categories);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#031631', icon: 'category', budgetLimit: '' });

  const categoriesWithSpend = categories.map(c => {
    const sp = spending.find(s => s.name === c.name);
    return { ...c, spent: sp?.total || 0 };
  });

  const budgetedCategories = categoriesWithSpend.filter(c => c.budgetLimit > 0);
  const totalBudget = budgetedCategories.reduce((s, c) => s + c.budgetLimit, 0);
  const totalSpent = budgetedCategories.reduce((s, c) => s + c.spent, 0);
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const chartData = budgetedCategories.map(c => ({
    name: c.name,
    budget: c.budgetLimit,
    spent: c.spent,
    color: c.color,
  }));

  function openEdit(cat) {
    setEditCat(cat);
    setForm({ name: cat.name, color: cat.color, icon: cat.icon || 'category', budgetLimit: String(cat.budgetLimit || '') });
    setShowModal(true);
  }

  function openNew() {
    setEditCat(null);
    setForm({ name: '', color: '#031631', icon: 'category', budgetLimit: '' });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const data = {
      name: form.name,
      color: form.color,
      icon: form.icon,
      budgetLimit: parseFloat(form.budgetLimit) || 0,
    };
    if (editCat) {
      await db.categories.update(editCat.id, data);
    } else {
      await db.categories.add({ id: 'cat-' + crypto.randomUUID().slice(0, 8), ...data });
    }
    setShowModal(false);
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this structural node?')) {
      await db.categories.delete(id);
    }
  }

  const AeonTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white/90 backdrop-blur-md border border-outline-variant/20 rounded-xl p-3 shadow-xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
            <p className="text-sm font-bold text-primary">
              {p.name}: {formatCurrency(p.value)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pb-24 animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Monthly Allocations</h1>
          <p className="text-on-surface-variant text-sm font-medium">Defining the architectural limits of your capital.</p>
        </div>
        <button 
          onClick={openNew}
          className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Node
        </button>
      </div>

      {/* Global Summary Card */}
      <div className="bg-white rounded-[2.5rem] p-8 mb-8 shadow-sm border border-outline-variant/10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Total Structural Utilization</p>
            <h2 className="text-4xl font-headline font-black text-primary tracking-tighter">
              {formatCurrency(totalSpent)} <span className="text-lg font-bold text-on-surface-variant/40 tracking-normal mx-2">/</span> {formatCurrency(totalBudget)}
            </h2>
          </div>
          <div className="text-right">
            <span className={`text-4xl font-headline font-black tracking-tighter ${totalSpent > totalBudget ? 'text-error' : 'text-secondary'}`}>
              {overallPct.toFixed(0)}%
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Consumed</p>
          </div>
        </div>
        <div className="w-full h-4 bg-surface-container-low rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${totalSpent > totalBudget ? 'bg-error' : 'bg-secondary'}`}
            style={{ width: `${overallPct}%` }}
          ></div>
        </div>
      </div>

      {/* Analytics Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-8 mb-8 shadow-sm border border-outline-variant/10">
          <h3 className="text-xl font-headline font-extrabold text-primary tracking-tight mb-8">Allocation Variance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E2E5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#44474D', fontSize: 10, fontWeight: 600 }}
                  dy={10} 
                />
                <YAxis hide />
                <Tooltip content={<AeonTooltip />} cursor={{ fill: '#F5F3F6', radius: 8 }} />
                <Bar dataKey="budget" name="Allocation" fill="#efedf0" radius={[4, 4, 4, 4]} barSize={24} />
                <Bar dataKey="spent" name="Spent" radius={[4, 4, 4, 4]} barSize={24}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.spent > entry.budget ? '#ba1a1a' : entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, i) => {
          const sp = spending.find(s => s.name === cat.name);
          const spent = sp?.total || 0;
          const limit = cat.budgetLimit || 0;
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const over = spent > limit && limit > 0;

          return (
            <div 
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-outline-variant/5 hover:border-outline-variant/20 transition-all group" 
              key={cat.id}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <span className="material-symbols-outlined text-2xl" style={{ color: cat.color }}>
                      {cat.icon || 'category'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline font-extrabold text-primary tracking-tight leading-tight">{cat.name}</h4>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Structural Node</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center hover:bg-error-container transition-colors text-on-surface-variant hover:text-error">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>

              {limit > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-1">Utilization</p>
                      <p className="text-lg font-headline font-black text-primary leading-none">
                        {formatCurrency(spent)} <span className="text-xs font-bold text-on-surface-variant/30 tracking-normal mx-1">/</span> {formatCurrency(limit)}
                      </p>
                    </div>
                    <div className={`text-xl font-headline font-black tracking-tighter ${over ? 'text-error' : 'text-primary opacity-40'}`}>
                      {pct.toFixed(0)}%
                    </div>
                  </div>
                  <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${over ? 'bg-error' : ''}`}
                      style={{ 
                        width: `${pct}%`, 
                        backgroundColor: over ? undefined : cat.color 
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm" style={{ color: over ? '#ba1a1a' : '#006c4f' }}>
                      {over ? 'warning' : 'check_circle'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${over ? 'text-error' : 'text-secondary'}`}>
                      {over ? `${formatCurrency(spent - limit)} over budget` : `${formatCurrency(limit - spent)} remaining`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 border-2 border-dashed border-outline-variant/10 rounded-2xl flex flex-col items-center justify-center opacity-40">
                  <span className="material-symbols-outlined text-2xl mb-1">architecture</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest">No Limit Defined</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <BaseModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={editCat ? 'Update Node' : 'Structural Initialization'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-6 pb-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant ml-1">Node Title</label>
            <input
              type="text"
              placeholder="e.g., Structural Foundation"
              className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-primary font-bold"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant ml-1">Capital Limit</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-primary font-bold"
                value={form.budgetLimit}
                onChange={e => setForm(f => ({ ...f, budgetLimit: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant ml-1">Thematic Color</label>
              <div className="flex gap-2 items-center bg-surface-container-low rounded-xl px-4 h-14 overflow-hidden">
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-8 h-8 rounded-full border-none cursor-pointer bg-transparent shrink-0"
                />
                <span className="text-[10px] font-mono font-bold text-on-surface-variant truncate">{form.color}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button type="button" className="flex-1 py-4 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-all order-2 sm:order-1" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="flex-[2] py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all order-1 sm:order-2">
              Construct Node
            </button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}
