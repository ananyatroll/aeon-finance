import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Savings from './pages/Savings';
import Settings from './pages/Settings';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import VaultGuard from './components/VaultGuard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-surface gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse shadow-lg">
        <span className="material-symbols-outlined text-white text-3xl">account_balance</span>
      </div>
      <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest animate-pulse">Architecting Serenity...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <VaultGuard>
      {children}
    </VaultGuard>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
