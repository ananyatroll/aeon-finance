import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AeonButton from './ui/AeonButton';

const NAV_ITEMS = [
  { to: '/', icon: 'dashboard', label: 'Gallery' },
  { to: '/budgets', icon: 'account_balance_wallet', label: 'Budgets' },
  { to: '/transactions', icon: 'receipt_long', label: 'History' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Layout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return null;

  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBgCTnSpMLqKQX7hVIqu-kvRpD8T_T7TJD2vGn8MAQiGyHuFAUMhCaEON1C0hdd4YtAbJLEL1aP3c_P6X6bg3WauPSSJ_u0D6O5S0BSCy0HwvCxE_DFVCwG9mTIyyMXDtKXOR6RFFQtHWU28RL7F3_1mVD4Ofr7kXY3KPjCgsaVXrblTjamADEQe5A9ZLRth-EuVjqop2FPQoNBr5WbchwCpdAD63KKmCRIoCQdh4kyG72Ik1ssViuwTVJDRFjioMbWAR0OKzzf2pc";

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-primary/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20 shadow-sm"
            >
              <img 
                alt="User profile" 
                className="w-full h-full object-cover" 
                src={user?.photoURL || defaultAvatar}
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-headline font-extrabold text-primary tracking-tighter text-lg leading-none">Aeon Finance</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mt-1 opacity-60">Architectural Node</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${isOffline ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}>
              <span className="material-symbols-outlined text-sm">
                {isOffline ? 'cloud_off' : 'cloud_done'}
              </span>
              <span>{isOffline ? 'Offline' : 'Synced'}</span>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary transition-colors hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[22px]">notifications_active</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        <Outlet />
      </main>

      {/* Floating BottomNavBar */}
      <div className="fixed bottom-6 left-0 w-full z-50 px-6 flex justify-center">
        <nav className="glass-morphism rounded-full px-4 py-2 sm:px-8 sm:py-3 shadow-2xl flex items-center gap-1 sm:gap-4 max-w-lg w-full justify-between">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `
                relative flex flex-col items-center justify-center px-4 py-2 transition-all active:scale-90 duration-200 rounded-2xl
                ${isActive 
                  ? 'text-primary' 
                  : 'text-on-surface-variant hover:text-primary opacity-60 hover:opacity-100'}
              `}
              id={`nav-${item.label.toLowerCase()}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-primary/5 rounded-2xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`material-symbols-outlined transition-all ${isActive ? 'scale-110' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {item.icon}
                  </span>
                  <span className="font-body font-bold text-[9px] sm:text-[10px] mt-0.5 uppercase tracking-widest leading-none truncate">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/transactions', { state: { openNew: true, type: 'expense' } })}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 ml-2"
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </motion.button>
        </nav>
      </div>
    </div>
  );
}
