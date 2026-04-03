import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SignUp() {
  const { user, signUpWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password, displayName);
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

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed relative overflow-x-hidden">
      {/* Top Navigation Anchor */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-8 h-20 bg-surface/80 backdrop-blur-md">
        <div className="text-xl font-headline font-extrabold tracking-tight text-primary">
          Aeon Finance
        </div>
        <a className="text-sm font-medium text-primary hover:opacity-80 transition-opacity" href="#">
          Support
        </a>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Editorial Content */}
          <div className="hidden lg:flex lg:col-span-6 flex-col gap-8 pr-12 animate-in slide-in-from-left duration-700">
            <h1 className="font-headline text-6xl font-extrabold text-primary leading-[1.1] tracking-tighter">
              Architect Your <span className="text-secondary">Financial Future.</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-md leading-relaxed">
              Join a sanctuary of wealth management where precision meets serenity. Begin your journey toward architectural prosperity today.
            </p>
            <div className="mt-8 relative overflow-hidden rounded-[2rem] aspect-[4/3] w-full shadow-2xl shadow-primary/5">
              <img 
                alt="Modern architectural detail" 
                className="object-cover w-full h-full" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpNotzu0xnMmzjhDEmQb1J-LjzUiYUnk9Gouy1d0zyHjsgVEEERt1PqJDqQjYUrBro9jtROtc1uD4e2KiDz6Bsrcpi6m4BQDQ-T5Z5D3o5DAhaEVFZY9UbGPOtGshbrphy6L_Cv9w8aeS5yX9DsLb1HniShoIKdBBnESV4ijW1vhdZCVojJyBUgOcGUQ8zk50dh8Sdsr6Vmed04Ct3Sh2U95fPVgUtw4Bvd5PTxMZVywr2kN9qT0-KjnrXiCGp_J6cieejBnWGxNg" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <div className="text-sm font-label uppercase tracking-widest opacity-80 mb-1">Portfolio Design</div>
                <div className="text-xl font-headline font-bold">Structural Integrity</div>
              </div>
            </div>
          </div>

          {/* Right Side: Sign Up Form */}
          <div className="lg:col-span-6 flex flex-col justify-center animate-in fade-in duration-700">
            <div className="w-full max-w-md mx-auto">
              <div className="mb-10">
                <h2 className="font-headline text-3xl font-bold text-primary mb-2">Create Account</h2>
                <p className="text-on-surface-variant">Elevate your wealth management experience.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-primary ml-1" htmlFor="full-name">Full Name</label>
                  <div className="relative group">
                    <input 
                      className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-on-surface-variant/40 outline-none" 
                      id="full-name" 
                      placeholder="John Doe" 
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-primary ml-1" htmlFor="email">Email Address</label>
                  <div className="relative group">
                    <input 
                      className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-on-surface-variant/40 outline-none" 
                      id="email" 
                      placeholder="name@example.com" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Cluster */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-primary ml-1" htmlFor="password">Password</label>
                    <div className="relative group">
                      <input 
                        className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-on-surface-variant/40 outline-none" 
                        id="password" 
                        placeholder="••••••••" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-primary ml-1" htmlFor="confirm-password">Confirm</label>
                    <div className="relative group">
                      <input 
                        className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-on-surface-variant/40 outline-none" 
                        id="confirm-password" 
                        placeholder="••••••••" 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  className="w-full h-14 mt-4 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold rounded-xl active:scale-[0.98] transition-transform shadow-lg shadow-primary/20 flex justify-center items-center gap-2" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Create Account'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-10 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-outline-variant opacity-30"></span>
                </div>
                <span className="relative bg-surface px-4 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">or sign up with</span>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center gap-3 h-14 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-colors active:scale-[0.98]"
                  disabled={loading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button className="flex items-center justify-center gap-3 h-14 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-colors active:scale-[0.98]">
                  <span className="material-symbols-outlined text-primary">fingerprint</span>
                  <span className="text-sm font-medium">Biometric</span>
                </button>
              </div>

              <div className="mt-10 text-center">
                <p className="text-sm text-on-surface-variant/70">
                  Already have an account? 
                  <Link className="text-primary font-bold hover:underline ml-1" to="/login">Log In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Identity */}
      <footer className="py-8 px-6 text-center lg:text-left lg:px-20 border-t border-outline-variant/10">
        <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/40 uppercase">
          © 2024 Aeon Finance Global. All Rights Reserved. Member FINRA/SIPC.
        </p>
      </footer>
    </div>
  );
}
