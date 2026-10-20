'use client';
import { motion } from 'framer-motion';
import { DUR, EASE_OUT, VIEWPORT } from '@/lib/motion';

interface DimensionProps {
  label: React.ReactNode;
  orientation?: 'h' | 'v';
  className?: string;
  /** Line colour class (bg-*) — drafting blue by default. */
  tone?: string;
  /** Label colour class. */
  labelClass?: string;
  delay?: number;
}

/**
 * Engineering dimension line: |<—— label ——>|. Extends outward from its
 * centre when scrolled into view. Fills its container along its axis.
 */
export default function Dimension({
  label,
  orientation = 'h',
  className = '',
  tone = 'bg-draft',
  labelClass = 'text-draft',
  delay = 0,
}: DimensionProps) {
  const h = orientation === 'h';
  const draw = { duration: DUR.base, ease: EASE_OUT, delay };

  return (
    <div
      className={`relative flex ${h ? 'flex-row items-center w-full' : 'flex-col items-center h-full'} ${className}`}
      aria-label={typeof label === 'string' ? label : undefined}
    >
      {/* End ticks */}
      <motion.span
        aria-hidden="true"
        className={`absolute ${tone} ${h ? 'left-0 top-1/2 -translate-y-1/2 w-px h-3' : 'top-0 left-1/2 -translate-x-1/2 h-px w-3'}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.fast, delay: delay + DUR.base * 0.7 }}
      />
      <motion.span
        aria-hidden="true"
        className={`absolute ${tone} ${h ? 'right-0 top-1/2 -translate-y-1/2 w-px h-3' : 'bottom-0 left-1/2 -translate-x-1/2 h-px w-3'}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.fast, delay: delay + DUR.base * 0.7 }}
      />
      {/* Two half-lines growing out from the label */}
      <motion.span
        aria-hidden="true"
        className={`${tone} ${h ? 'h-px flex-1' : 'w-px flex-1'}`}
        style={h ? { originX: 1 } : { originY: 1 }}
        initial={h ? { scaleX: 0 } : { scaleY: 0 }}
        whileInView={h ? { scaleX: 1 } : { scaleY: 1 }}
        viewport={VIEWPORT}
        transition={draw}
      />
      <motion.span
        className={`shrink-0 font-mono-label text-[9px] tabular-nums ${labelClass} ${h ? 'px-2' : 'py-1.5 [writing-mode:vertical-rl] rotate-180'}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.fast, delay: delay + DUR.base * 0.4 }}
      >
        {label}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className={`${tone} ${h ? 'h-px flex-1' : 'w-px flex-1'}`}
        style={h ? { originX: 0 } : { originY: 0 }}
        initial={h ? { scaleX: 0 } : { scaleY: 0 }}
        whileInView={h ? { scaleX: 1 } : { scaleY: 1 }}
        viewport={VIEWPORT}
        transition={draw}
      />
    </div>
  );
}
