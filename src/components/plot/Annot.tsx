'use client';
import { motion } from 'framer-motion';
import { DUR, EASE_OUT, VIEWPORT } from '@/lib/motion';

interface AnnotProps {
  children: React.ReactNode;
  /** Which way the leader line points (from the note towards the thing it describes). */
  point?: 'left' | 'right' | 'up' | 'down' | 'none';
  /** Leader length in px. */
  leader?: number;
  dark?: boolean;
  className?: string;
  delay?: number;
}

/**
 * Margin note in the draftsman's italic serif, with a drafting-blue leader
 * line that draws out towards whatever it's annotating.
 */
export default function Annot({ children, point = 'left', leader = 40, dark = false, className = '', delay = 0 }: AnnotProps) {
  const horizontal = point === 'left' || point === 'right';
  const lineFirst = point === 'left' || point === 'up';
  const text = dark ? 'text-paper/70' : 'text-ink/70';

  const line = point !== 'none' && (
    <span
      aria-hidden="true"
      className={`relative shrink-0 ${horizontal ? 'h-px self-center' : 'w-px self-start ml-2'}`}
      style={horizontal ? { width: leader } : { height: leader }}
    >
      <motion.span
        className="absolute inset-0 bg-draft"
        style={{ originX: point === 'left' ? 1 : 0, originY: point === 'up' ? 1 : 0 }}
        initial={horizontal ? { scaleX: 0 } : { scaleY: 0 }}
        whileInView={horizontal ? { scaleX: 1 } : { scaleY: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.base, ease: EASE_OUT, delay }}
      />
      {/* Arrow-dot at the far end */}
      <motion.span
        className={`absolute w-1.5 h-1.5 rounded-full bg-draft ${
          point === 'left' ? '-left-0.5 -top-[2.5px]' : point === 'right' ? '-right-0.5 -top-[2.5px]' : point === 'up' ? '-top-0.5 -left-[2.5px]' : '-bottom-0.5 -left-[2.5px]'
        }`}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.fast, delay: delay + DUR.base * 0.8 }}
      />
    </span>
  );

  return (
    <span className={`inline-flex ${horizontal ? 'flex-row items-center' : 'flex-col'} gap-2 ${className}`}>
      {lineFirst && line}
      <motion.span
        className={`font-annot text-base sm:text-lg leading-snug ${text}`}
        initial={{ opacity: 0, x: point === 'left' ? -6 : point === 'right' ? 6 : 0 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.base, ease: EASE_OUT, delay: delay + DUR.base * 0.5 }}
      >
        {children}
      </motion.span>
      {!lineFirst && line}
    </span>
  );
}
