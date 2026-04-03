import React from 'react';
import { motion } from 'framer-motion';

export default function AeonButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  type = 'button',
  disabled = false,
  icon
}) {
  const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-headline font-bold transition-all overflow-hidden group active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white shadow-xl shadow-primary/20",
    secondary: "bg-secondary text-white shadow-xl shadow-secondary/20",
    surface: "bg-surface-container-high text-primary hover:bg-surface-container-highest",
    ghost: "bg-transparent text-primary hover:bg-primary/5",
    outline: "bg-transparent border border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-primary"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {/* Subtle shine effect for primary/secondary */}
      {(variant === 'primary' || variant === 'secondary') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}
      
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
