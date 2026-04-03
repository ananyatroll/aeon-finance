import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vaultService } from '../services/VaultService';
import { useAuth } from '../contexts/AuthContext';

export default function VaultGuard({ children }) {
  const { logout } = useAuth();
  const [isLocked, setIsLocked] = useState(vaultService.isConfigured());
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNumPress = (digit) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setIsError(false);
    }
  };

  const handlePinSubmit = async (currentPin) => {
    setLoading(true);
    const success = await vaultService.verifyPIN(currentPin);
    if (success) {
      setIsLocked(false);
      setPin('');
    } else {
      setIsError(true);
      setPin('');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit(pin);
    }
  }, [pin]);

  if (!isLocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[200] bg-surface flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Architectural Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-primary/5 rounded-full scale-150" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border border-primary/5 rounded-full scale-125" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-10 shadow-inner">
          <motion.span 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="material-symbols-outlined text-4xl text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lock
          </motion.span>
        </div>

        <h2 className="text-3xl font-headline font-black text-primary tracking-tighter mb-2">Architectural Guard</h2>
        <p className="text-on-surface-variant text-sm font-medium tracking-widest uppercase opacity-40 mb-12 text-center">Identify to modify liquidity</p>

        {/* PIN Display */}
        <div className="flex gap-4 mb-16">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ 
                scale: pin.length > i ? 1.2 : 1,
                backgroundColor: pin.length > i ? "var(--color-primary)" : "#E4E2E5"
              }}
              className="w-4 h-4 rounded-full"
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-6 w-full mb-12">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((num, i) => (
            <motion.button
              key={i}
              whileHover={num !== '' ? { scale: 1.05, backgroundColor: "#F5F3F6" } : {}}
              whileTap={num !== '' ? { scale: 0.95 } : {}}
              disabled={num === '' || loading}
              onClick={() => {
                if (num === 'del') setPin(p => p.slice(0, -1));
                else if (typeof num === 'number') handleNumPress(num.toString());
              }}
              className={`
                h-20 flex items-center justify-center rounded-[2rem] text-2xl font-headline font-black transition-colors
                ${num === '' ? 'opacity-0 cursor-default' : 'text-primary bg-transparent'}
              `}
            >
              {num === 'del' ? (
                <span className="material-symbols-outlined text-2xl">backspace</span>
              ) : num}
            </motion.button>
          ))}
        </div>

        <button 
          onClick={logout}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors opacity-40 hover:opacity-100"
        >
          Deconstruct Session
        </button>
      </motion.div>

      {/* Error Feedback */}
      <AnimatePresence>
        {isError && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-12 px-6 py-3 bg-red-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-red-500/20"
          >
            Access Restriction: Invalid Credential
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
