import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { user, signInWithGoogle, signInWithEmail, resetPassword, enableOfflineMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineMode = async () => {
    setError('');
    setLoading(true);
    try {
      await enableOfflineMode();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-6 selection:bg-secondary-fixed selection:text-on-secondary-fixed relative">
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary-fixed/10 blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary-fixed/20 blur-[150px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-[440px]">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="mb-0 flex items-center justify-center w-20 h-20 rounded-xl bg-primary shadow-2xl shadow-primary/20 mb-6">
            <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Aeon Finance</h1>
          <p className="text-on-surface-variant font-medium text-sm">Architecting your financial serenity.</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(3,22,49,0.06)] border border-outline-variant/10">
          <div className="mb-10 text-left">
            <h2 className="text-2xl font-bold text-primary tracking-tight">Secure Access</h2>
            <p className="text-on-surface-variant text-sm mt-1">Enter your credentials to continue to your dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">alternate_email</span>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all duration-300 outline-none" 
                  id="email" 
                  placeholder="name@company.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant" htmlFor="password">Password</label>
                <button 
                  type="button"
                  onClick={() => {
                    if (email) resetPassword(email).then(() => setError('Reset email sent!')).catch(e => setError(e.message));
                    else setError('Enter email for reset');
                  }}
                  className="text-xs font-semibold text-secondary hover:underline transition-all"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">lock</span>
                <input 
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all duration-300 outline-none" 
                  id="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-outline-variant/20 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 w-full">
              <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
              <span className="text-xs font-bold text-outline uppercase tracking-widest">Or bypass via</span>
              <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-low border border-transparent rounded-xl hover:border-outline-variant/20 transition-all group"
                disabled={loading}
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-xs font-bold text-primary">Google</span>
              </button>
              <button 
                onClick={handleOfflineMode} 
                className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary-container/50 border border-secondary/20 rounded-xl hover:bg-secondary-container transition-all group"
                disabled={loading}
              >
                <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">cloud_off</span>
                <span className="text-xs font-bold text-secondary">Offline Mode</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center pb-12">
          <p className="text-on-surface-variant text-sm font-medium">
            Don't have an account? 
            <Link className="text-primary font-bold hover:underline ml-1" to="/signup">Sign Up</Link>
          </p>
        </div>

        <footer className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">verified_user</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">256-bit AES Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">shield</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">SIPC Insured</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
