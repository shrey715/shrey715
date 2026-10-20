'use client';
import { motion } from 'framer-motion';
import { DUR, EASE_OUT, VIEWPORT } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * The plotter pass with its pen visible: content wipes in left-to-right while
 * a thin drafting-blue "pen head" rides the leading edge, then lifts away.
 * For larger blocks; list items use the lighter `plotIn()` spread.
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return <div className={className}>{children}</div>;

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ clipPath: 'inset(-12% 99.4% -12% -12%)' }}
        whileInView={{ clipPath: 'inset(-12% -12% -12% -12%)' }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.base, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.div>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-full border-l border-draft"
        initial={{ x: '0%', opacity: 1 }}
        whileInView={{ x: '100%', opacity: [1, 1, 0] }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.base, ease: EASE_OUT, delay, opacity: { times: [0, 0.8, 1], duration: DUR.base, delay } }}
      />
    </div>
  );
}
