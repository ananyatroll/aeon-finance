import React from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import {
  useCategories, useTransactions, formatCurrency,
  getMonthlyStats, getSpendingByCategory, getDailySpending
} from '../hooks';

const AeonTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-md border border-outline-variant/20 rounded-xl p-3 shadow-xl">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <p className="text-sm font-bold text-primary">
            {formatCurrency(p.value)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const categories = useCategories();
  const transactions = useTransactions();
  const stats = getMonthlyStats(transactions);
  const categorySpending = getSpendingByCategory(transactions, categories);
  const dailyData = getDailySpending(transactions);

  // Filter out investment categories for a specific view if needed, but here we show all
  const sortedCategories = [...categorySpending].sort((a, b) => b.total - a.total);

  return (
    <div className="pb-10 animate-in fade-in duration-700">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
        
        {/* Row 1: Net Liquidity (Hero) */}
        <div className="md:col-span-8 bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20 group">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Net Liquidity</p>
                <h2 className="text-5xl font-headline font-extrabold tracking-tighter">
                  {formatCurrency(stats.balance)}
                </h2>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined text-xl">qr_code_2</span>
                </button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-secondary text-white rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">add</span>
                Deposit
              </button>
              <button className="px-6 py-3 bg-white/10 text-white rounded-full font-bold text-sm hover:bg-white/20 transition-all active:scale-95 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">near_me</span>
                Transfer
              </button>
            </div>
          </div>
          
          {/* Architectural element */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-secondary-fixed/10 blur-[80px] group-hover:bg-secondary-fixed/20 transition-all duration-1000"></div>
        </div>

        {/* Row 1: Savings/Investments Small Card */}
        <div className="md:col-span-4 bg-secondary-container rounded-[2.5rem] p-8 flex flex-col justify-between shadow-lg shadow-secondary/5 border border-secondary/10">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-6">
              <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-secondary-container opacity-60 mb-1">Monthly Allocations</p>
            <h3 className="text-2xl font-headline font-extrabold text-on-secondary-container tracking-tight">Investment Goal</h3>
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-headline font-black text-on-secondary-container">82%</span>
              <span className="text-[10px] font-bold text-on-secondary-container/60 uppercase tracking-widest mb-1">Target Reached</span>
            </div>
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
        </div>

        {/* Row 2: Analytics Chart */}
        <div className="md:col-span-12 lg:col-span-7 bg-white rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-headline font-extrabold text-primary tracking-tight">Monthly Spending</h3>
              <p className="text-on-surface-variant text-xs font-medium">Your consumption architecture.</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-full">
              <button className="px-4 py-1.5 bg-white shadow-sm rounded-full text-xs font-bold text-primary transition-all">Week</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold text-on-surface-variant hover:text-primary transition-all">Month</button>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
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
                <Bar 
                  dataKey="amount" 
                  fill="#031631" 
                  radius={[8, 8, 8, 8]} 
                  barSize={32}
                  activeBar={<Bar fill="#006c4f" radius={[8, 8, 8, 8]} />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Portfolio Breakdown */}
        <div className="md:col-span-12 lg:col-span-5 bg-white rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/10">
          <h3 className="text-xl font-headline font-extrabold text-primary tracking-tight mb-8">Structural Breakdown</h3>
          <div className="space-y-6">
            {sortedCategories.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300" 
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <span className="material-symbols-outlined" style={{ color: cat.color }}>
                    {cat.icon || 'category'}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-primary tracking-tight">{cat.name}</span>
                    <span className="text-sm font-extrabold text-primary">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: cat.limit > 0 ? `${Math.min((cat.total / cat.limit) * 100, 100)}%` : '40%',
                        backgroundColor: cat.color 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-2xl border border-outline-variant/30 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-low transition-colors">
            View Structural Full Report
          </button>
        </div>

      </div>
    </div>
  );
}
