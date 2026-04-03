import { useState } from 'react';
import db from '../db';
import { useSavingsGoals, formatCurrency } from '../hooks';
import BaseModal from '../components/ui/BaseModal';

export default function Savings() {
  const goals = useSavingsGoals();
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [showContribute, setShowContribute] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  function openNew() {
    setEditGoal(null);
    setForm({ name: '', targetAmount: '', currentAmount: '0', targetDate: '' });
    setShowModal(true);
  }

  function openEdit(goal) {
    setEditGoal(goal);
    setForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const data = {
      name: form.name,
      targetAmount: parseFloat(form.targetAmount) || 0,
      currentAmount: parseFloat(form.currentAmount) || 0,
      targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : null,
    };
    if (editGoal) {
      await db.savingsGoals.update(editGoal.id, data);
    } else {
      await db.savingsGoals.add({ id: crypto.randomUUID(), ...data });
    }
    setShowModal(false);
  }

  async function handleContribute(goalId) {
    const amount = parseFloat(contributeAmount) || 0;
    if (amount <= 0) return;
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      await db.savingsGoals.update(goalId, {
        currentAmount: goal.currentAmount + amount,
      });
    }
    setShowContribute(null);
    setContributeAmount('');
  }

  async function handleDelete(id) {
    if (confirm('Deconstruct this structural goal?')) {
      await db.savingsGoals.delete(id);
    }
  }

  return (
    <div className="pb-24 animate-in fade-in duration-700 px-2 lg:px-0">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Prosperity Targets</h1>
          <p className="text-on-surface-variant text-sm font-medium">Architectural goals for your recurring capital.</p>
        </div>
        <button 
          onClick={openNew}
          className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Target
        </button>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-primary rounded-[2rem] p-6 text-white shadow-xl shadow-primary/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Total Accumulated</p>
          <h2 className="text-3xl font-headline font-black tracking-tighter">{formatCurrency(totalSaved)}</h2>
        </div>
        <div className="bg-white rounded-[2rem] p-6 border border-outline-variant/10 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Aggregated Target</p>
          <h2 className="text-3xl font-headline font-black text-primary tracking-tighter">{formatCurrency(totalTarget)}</h2>
        </div>
        <div className="bg-secondary-container rounded-[2rem] p-6 text-on-secondary-container border border-secondary/10 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Remaining Variance</p>
          <h2 className="text-3xl font-headline font-black tracking-tighter">{formatCurrency(Math.max(0, totalTarget - totalSaved))}</h2>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {goals.map((goal, i) => {
          const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
          const isComplete = goal.currentAmount >= goal.targetAmount;

          return (
            <div 
              key={goal.id} 
              className={`bg-white rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/5 hover:border-outline-variant/20 transition-all group relative overflow-hidden`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isComplete ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-surface-container-low text-primary'}`}>
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isComplete ? 'verified' : 'target'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline font-extrabold text-xl text-primary tracking-tight leading-none mb-1">{goal.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Capital Node</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(goal)} className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center hover:bg-error-container/20 hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-10 mb-8">
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#f5f3f6" strokeWidth="12" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        fill="none" 
                        stroke={isComplete ? '#006c4f' : '#031631'} 
                        strokeWidth="12" 
                        strokeLinecap="round" 
                        strokeDasharray="263.89" 
                        strokeDashoffset={263.89 * (1 - pct / 100)}
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                      />
                    </svg>
                    <span className="absolute font-headline font-black text-lg text-primary">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-1">Accumulated Amount</p>
                    <h4 className="text-3xl font-headline font-black text-primary tracking-tighter mb-1">{formatCurrency(goal.currentAmount)}</h4>
                    <p className="text-xs font-medium text-on-surface-variant">of {formatCurrency(goal.targetAmount)} target</p>
                  </div>
                </div>

                {!isComplete && (
                  <div className="pt-6 border-t border-outline-variant/10">
                    {showContribute === goal.id ? (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          autoFocus
                          className="flex-grow h-12 bg-surface-container-low border-none rounded-xl text-sm font-bold text-primary px-4 outline-none focus:ring-2 focus:ring-primary/10"
                          value={contributeAmount}
                          onChange={(e) => setContributeAmount(e.target.value)}
                        />
                        <button onClick={() => handleContribute(goal.id)} className="px-6 py-2 bg-primary text-white font-bold rounded-xl active:scale-95 transition-all text-xs">Add</button>
                        <button onClick={() => setShowContribute(null)} className="p-2 text-on-surface-variant"><span className="material-symbols-outlined">close</span></button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowContribute(goal.id)}
                        className="w-full py-3 bg-surface-container-low hover:bg-primary hover:text-white transition-all rounded-2xl text-xs font-bold uppercase tracking-widest text-primary flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Contribute Capital
                      </button>
                    )}
                  </div>
                )}
              </div>
              {/* Background architectural trace */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-surface-container-low opacity-40 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <BaseModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={editGoal ? 'Update Requirement' : 'Structural Target'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-6 pb-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant ml-1">Requirement Title</label>
            <input
              type="text"
              placeholder="e.g. Structural Reserve"
              className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-primary font-bold"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant ml-1">Target Capital</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-primary font-bold"
                value={form.targetAmount}
                onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant ml-1">Initial Reserve</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-primary font-bold"
                value={form.currentAmount}
                onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant ml-1">Deadline Node</label>
            <input
              type="date"
              className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-primary font-bold"
              value={form.targetDate}
              onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button type="button" className="flex-1 py-4 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-all order-2 sm:order-1" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="flex-[2] py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all order-1 sm:order-2">
              Initialize Target
            </button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}
