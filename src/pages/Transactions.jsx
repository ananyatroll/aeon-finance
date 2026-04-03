import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db';
import { useCategories, useTransactions, formatCurrency, formatDate, getCategoryMap } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import BaseModal from '../components/ui/BaseModal';
import AeonButton from '../components/ui/AeonButton';

export default function Transactions() {
  const { user } = useAuth();
  const location = useLocation();
  const categories = useCategories(user?.uid);
  const transactions = useTransactions(user?.uid);
  const catMap = getCategoryMap(categories);

  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Form state
  const [form, setForm] = useState({ type: 'expense', categoryId: '', amount: '', note: '', date: '' });

  // Filter transactions
  const filtered = transactions.filter(t => {
    if (t._deleted) return false;
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (t.note || '').toLowerCase().includes(q) ||
             (catMap[t.categoryId]?.name || '').toLowerCase().includes(q);
    }
    return true;
  });

  function openNew(typeOverride = 'expense') {
    setEditingTx(null);
    setForm({
      type: typeOverride,
      categoryId: categories[0]?.id || '',
      amount: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  }

  useEffect(() => {
    if (location.state?.openNew && categories.length > 0) {
      openNew(location.state.type || 'expense');
      // Clear state so it doesn't reopen recursively on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, categories]);

  function openEdit(tx) {
    setEditingTx(tx);
    setForm({
      type: tx.type,
      categoryId: tx.categoryId,
      amount: String(tx.amount),
      note: tx.note || '',
      date: new Date(tx.date).toISOString().split('T')[0],
    });
    setShowModal(true);
  }

  async function handleSave() {
    const data = {
      type: form.type,
      categoryId: form.categoryId,
      amount: parseFloat(form.amount) || 0,
      note: form.note,
      date: new Date(form.date).toISOString(),
      uid: user.uid,
      updatedAt: Date.now(),
      _deleted: false
    };
    if (editingTx) {
      await db.transactions.update(editingTx.id, data);
    } else {
      await db.transactions.add({ id: crypto.randomUUID(), ...data });
    }
    setShowModal(false);
  }

  async function handleDelete(id) {
    await db.transactions.update(id, { _deleted: true, updatedAt: Date.now() });
  }

  // Numerical Keypad Component for Modal
  const Keypad = ({ value, onChange }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];
    
    const handleKey = (key) => {
      if (key === '⌫') {
        onChange(value.slice(0, -1));
      } else if (key === '.') {
        if (!value.includes('.')) onChange(value + '.');
      } else {
        onChange(value + key);
      }
    };

    return (
      <div className="grid grid-cols-3 gap-3 mt-6">
        {keys.map(key => (
          <button
            key={key}
            type="button"
            onClick={() => handleKey(key)}
            className="h-16 rounded-2xl bg-surface-container-low hover:bg-surface-container-high active:scale-95 transition-all text-xl font-headline font-bold text-primary"
          >
            {key}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="pb-24 animate-in fade-in duration-700">
      {/* Header & Search */}
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight mb-6">Structural History</h1>
        
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl transition-colors group-focus-within:text-primary">search</span>
          <input 
            type="text"
            placeholder="Search structural entries..."
            className="w-full h-14 pl-12 pr-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/10 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 bg-surface-container-low p-1.5 rounded-2xl w-fit">
        {['all', 'expense', 'income'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`
              px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
              ${filterType === type 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-primary'}
            `}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-20 text-center bg-surface-container-low rounded-[2.5rem] border border-dashed border-outline-variant/30">
            <span className="material-symbols-outlined text-outline/40 text-6xl mb-4">analytics</span>
            <p className="text-on-surface-variant font-medium">No architectural records found.</p>
          </div>
        ) : (
          filtered.map(tx => {
            const cat = catMap[tx.categoryId] || { name: 'Other', color: '#75777e', icon: 'category' };
            return (
              <div 
                key={tx.id} 
                onClick={() => openEdit(tx)}
                className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-outline-variant/5 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105 group-hover:rotate-3 duration-300 relative overflow-hidden isolate"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ color: cat.color }}>
                    {cat.icon || 'category'}
                  </span>
                </div>
                
                <div className="flex-grow">
                  <h4 className="font-headline font-extrabold text-primary tracking-tight leading-none mb-1">
                    {tx.note || cat.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant opacity-60">
                      {cat.name}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant/30"></span>
                    <span className="text-[10px] font-bold text-on-surface-variant opacity-60">
                      {formatDate(tx.date)}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <span className={`text-lg font-headline font-black ${tx.type === 'income' ? 'text-secondary' : 'text-primary'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-error hover:scale-110"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Add Button */}
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => openNew('expense')}
        className="fixed bottom-28 right-8 w-16 h-16 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center z-40"
      >
        <span className="material-symbols-outlined text-4xl">add</span>
      </motion.button>

      {/* Numerical Entry Modal */}
      <BaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTx ? 'Update Entry' : 'Architectural Entry'}
      >
        <div className="space-y-8 pb-10">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1.5 bg-surface-container-low rounded-2xl w-full">
            {['expense', 'income'].map(type => (
              <button
                key={type}
                onClick={() => setForm(f => ({ ...f, type }))}
                className={`
                  flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                  ${form.type === type 
                    ? (type === 'expense' ? 'bg-primary text-white' : 'bg-secondary text-white')
                    : 'text-on-surface-variant hover:text-primary'}
                `}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Amount Display */}
          <div className="text-center py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Transaction Value</p>
            <div className="text-5xl font-headline font-black text-primary tracking-tighter">
              {formatCurrency(parseFloat(form.amount) || 0)}
            </div>
          </div>

          {/* Keypad - Slightly more compact for scroll height */}
          <div className="max-w-xs mx-auto w-full">
            <Keypad value={form.amount} onChange={(val) => setForm(f => ({ ...f, amount: val }))} />
          </div>

          {/* Secondary Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Structural Node</label>
              <select 
                className="w-full h-14 bg-surface-container-low border-none rounded-xl text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-primary/10 px-4 appearance-none transition-all"
                value={form.categoryId}
                onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Timeline Node</label>
              <input 
                type="date"
                className="w-full h-14 bg-surface-container-low border-none rounded-xl text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-primary/10 px-4 transition-all"
                value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Architectural Note</label>
            <input 
              type="text"
              placeholder="Memo (optional)"
              className="w-full h-14 bg-surface-container-low border-none rounded-xl text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-primary/10 px-4 transition-all"
              value={form.note}
              onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>

          <AeonButton 
            onClick={handleSave}
            variant={form.type === 'expense' ? 'primary' : 'secondary'}
            className="w-full py-5"
          >
            {editingTx ? 'Confirm Structure' : 'Architect Node'}
          </AeonButton>
        </div>
      </BaseModal>
    </div>
  );
}
