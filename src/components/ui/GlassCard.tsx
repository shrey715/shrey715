'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}

export default function GlassCard({ children, className, dark = false }: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ 
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      className={`
        relative overflow-hidden rounded-2xl 
        ${dark 
          ? 'bg-[#252525] border border-white/10' 
          : 'bg-white/50 backdrop-blur-xl border border-white/60'
        }
        shadow-[0_4px_24px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]
        transition-shadow duration-300
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.04)]
        will-change-transform
        ${className || ''}
      `}
    >
      {/* Top highlight */}
      <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent ${dark ? 'via-white/20' : 'via-white'} to-transparent opacity-80`} />
      
      {children}
    </motion.div>
  );
}
