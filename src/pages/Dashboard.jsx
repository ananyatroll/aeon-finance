import React, { useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useCategories, useTransactions, formatCurrency,
  getMonthlyStats, getSpendingByCategory, getDailySpending
} from '../hooks';
import GlassCard from '../components/ui/GlassCard';
import AeonButton from '../components/ui/AeonButton';
import SectionHeader from '../components/ui/SectionHeader';

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
  const { user } = useAuth();
  const categories = useCategories(user?.uid);
  const transactions = useTransactions(user?.uid);
  const navigate = useNavigate();
  const stats = getMonthlyStats(transactions);
  const categorySpending = getSpendingByCategory(transactions, categories);
  const dailyData = getDailySpending(transactions);
  const [chartView, setChartView] = useState('Week');

  const sortedCategories = [...categorySpending].sort((a, b) => b.total - a.total);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-20"
    >
      <SectionHeader 
        title="Gallery" 
        subtitle="Architectural overview of your liquidity."
        action={
          <div className="flex gap-2">
            <button className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-primary opacity-60">calendar_today</span>
            </button>
          </div>
        }
      />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-min">
        
        {/* Row 1: Net Liquidity (Hero) */}
        <motion.div 
          variants={itemVariants}
          className="md:col-span-8 bg-primary rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/30 group min-h-[320px] flex flex-col justify-between"
        >
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-3">Portfolio Net Liquidity</p>
            <h2 className="text-6xl font-headline font-black tracking-tighter mb-12">
              {formatCurrency(stats.balance)}
            </h2>
            
            <div className="flex flex-wrap gap-4 mt-auto">
              <AeonButton 
                variant="secondary"
                icon="add_circle"
                onClick={() => navigate('/transactions', { state: { openNew: true, type: 'income' } })}
              >
                Deposit Capital
              </AeonButton>
              <AeonButton 
                variant="surface"
                className="!bg-white/10 !text-white hover:!bg-white/20"
                icon="account_balance_wallet"
                onClick={() => navigate('/transactions')}
              >
                Full Ledger
              </AeonButton>
            </div>
          </div>
          
          {/* Architectural Background Elements */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-accent/10 blur-[100px] group-hover:bg-accent/20 transition-all duration-1000"></div>
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full border border-white/5 group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="absolute top-40 right-20 w-40 h-40 rounded-full border border-white/5 scale-150 opacity-20"></div>
          </div>
        </motion.div>

        {/* Row 1: Savings/Investments Small Card */}
        <motion.div variants={itemVariants} className="md:col-span-4 h-full">
          <GlassCard 
            className="flex flex-col justify-between h-full !bg-secondary-container !border-secondary/10"
            onClick={() => navigate('/savings')}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-secondary/5 mb-8">
                <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-secondary-container opacity-40 mb-2">Growth Nodes</p>
              <h3 className="text-2xl font-headline font-extrabold text-on-secondary-container tracking-tight leading-tight">Prosperity Threshold</h3>
            </div>
            <div className="mt-12">
              <div className="flex justify-between items-end mb-3">
                <span className="text-4xl font-headline font-black text-on-secondary-container tracking-tighter">82%</span>
                <span className="text-[10px] font-bold text-on-secondary-container/40 uppercase tracking-widest mb-1">Target Reached</span>
              </div>
              <div className="w-full h-3 bg-white/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '82%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-secondary rounded-full" 
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Row 2: Analytics Chart */}
        <motion.div variants={itemVariants} className="md:col-span-12 lg:col-span-7">
          <GlassCard className="h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h3 className="text-xl font-headline font-extrabold text-primary tracking-tight">Structural Velocity</h3>
                <p className="text-on-surface-variant text-xs font-medium opacity-60">Consolidated daily consumption trace.</p>
              </div>
              <div className="flex items-center gap-1 bg-surface-1 p-1 rounded-2xl">
                {['Week', 'Month'].map(view => (
                  <button 
                    key={view}
                    onClick={() => setChartView(view)} 
                    className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${chartView === view ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E2E5" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#44474D', fontSize: 10, fontWeight: 700 }}
                    dy={15} 
                  />
                  <YAxis hide />
                  <Tooltip content={<AeonTooltip />} cursor={{ fill: '#F5F3F6', radius: 12 }} />
                  <Bar 
                    dataKey="amount" 
                    fill="#031631" 
                    radius={[12, 12, 12, 12]} 
                    barSize={chartView === 'Week' ? 40 : 12}
                    activeBar={<Bar fill="#006c4f" radius={[12, 12, 12, 12]} />}
                  >
                    {dailyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} style={{ transition: 'all 0.3s ease' }} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Row 2: Portfolio Breakdown */}
        <motion.div variants={itemVariants} className="md:col-span-12 lg:col-span-5">
          <GlassCard className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-headline font-extrabold text-primary tracking-tight mb-10">Consumption Architecture</h3>
              <div className="space-y-8">
                {sortedCategories.slice(0, 4).map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-5 group cursor-pointer" onClick={() => navigate('/budgets')}>
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 group-hover:rotate-3 duration-300 shadow-sm" 
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <span className="material-symbols-outlined text-2xl" style={{ color: cat.color }}>
                        {cat.icon || 'category'}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-primary tracking-tight">{cat.name}</span>
                        <span className="text-sm font-black text-primary tracking-tighter">{formatCurrency(cat.total)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-1 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full rounded-full" 
                          initial={{ width: 0 }}
                          animate={{ width: cat.limit > 0 ? `${Math.min((cat.total / cat.limit) * 100, 100)}%` : '40%' }}
                          transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <AeonButton 
              variant="outline" 
              className="mt-12 w-full py-4 tracking-widest text-[10px]"
              onClick={() => navigate('/budgets')}
              icon="analytics"
            >
              Analyze Full Architecture
            </AeonButton>
          </GlassCard>
        </motion.div>

      </div>
    </motion.div>
  );
}

