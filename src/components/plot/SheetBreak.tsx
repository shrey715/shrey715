'use client';
import { motion } from 'framer-motion';
import { DUR, EASE_OUT, VIEWPORT } from '@/lib/motion';

type Surface = 'paper' | 'ink';

const BG: Record<Surface, string> = {
  paper: 'var(--color-paper)',
  ink: 'var(--color-ink)',
};

/**
 * The seam between two sheets: a perforated tear line across the join, with
 * the next sheet's number and title stamped in a chip on it. The split
 * background carries each side's colour so it sits cleanly on the boundary.
 */
export default function SheetBreak({ from, to, sheet, title }: { from: Surface; to: Surface; sheet: string; title: string }) {
  const chipDark = to === 'ink';
  return (
    <div
      aria-hidden="true"
      className="relative z-10 h-12 sm:h-14 flex items-center print:hidden"
      style={{ background: `linear-gradient(to bottom, ${BG[from]} 50%, ${BG[to]} 50%)` }}
    >
      {/* Perforation: punched holes along the seam, drawn left to right */}
      <motion.div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[6px]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-accent) 2px, transparent 2.5px)',
          backgroundSize: '14px 6px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'left center',
          originX: 0,
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.plot, ease: EASE_OUT }}
      />
      <motion.span
        className={`relative mx-auto px-3 py-1.5 font-mono-label text-[10px] border-2 ${
          chipDark ? 'bg-ink text-paper border-paper/40' : 'bg-paper text-ink border-ink'
        }`}
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.base, ease: EASE_OUT, delay: DUR.base * 0.6 }}
      >
        <span className="text-accent">SHEET {sheet}</span>
        <span className="opacity-40 mx-2">/</span>
        {title}
      </motion.span>
    </div>
  );
}
