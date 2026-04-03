import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', onClick }) {
  const Component = onClick ? motion.div : 'div';
  const props = onClick ? {
    whileHover: { y: -4, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 },
    onClick,
    className: `glass-morphism rounded-[2.5rem] p-8 ${className} cursor-pointer`
  } : {
    className: `glass-morphism rounded-[2.5rem] p-8 ${className}`
  };

  return (
    <Component {...props}>
      {children}
    </Component>
  );
}
