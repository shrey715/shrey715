'use client';
import { motion } from 'framer-motion';
import { EASE_OUT } from '@/lib/motion';

// Tiny schematic of each sheet, drawn in single strokes (viewBox 160 × 100).
const DRAWINGS: Record<string, string[]> = {
  about: [
    'M20 10H70V90H20Z', // portrait frame
    'M45 32m-11 0a11 11 0 1 0 22 0a11 11 0 1 0 -22 0', // head
    'M27 78C29 58 61 58 63 78', // shoulders
    'M86 22H142', 'M86 34H134', 'M86 46H140', 'M86 64H118', 'M86 76H128',
  ],
  experience: [
    'M38 8V92', // spine
    'M33 18H43V26H33Z', 'M33 42H43V50H33Z', 'M33 66H43V74H33Z',
    'M52 22H128', 'M52 46H112', 'M52 70H136',
    'M8 22H26', 'M8 46H26', 'M8 70H26',
  ],
  skills: [
    'M30 30L80 20L130 40L110 80L50 78Z', 'M30 30L110 80', 'M80 20L50 78', 'M80 20L110 80',
    'M27 27H33V33H27Z', 'M77 17H83V23H77Z', 'M127 37H133V43H127Z', 'M107 77H113V83H107Z', 'M47 75H53V81H47Z',
  ],
  projects: [
    'M10 12H74V48H10Z', 'M86 12H150V48H86Z', 'M10 58H74V94H10Z', 'M86 58H150V94H86Z',
    'M16 40V34M22 40V30M28 40V36M34 40V26M40 40V32', 'M92 40V28M98 40V34M104 40V24M110 40V30',
  ],
  blog: [
    'M40 6H120V94H40Z', 'M50 20H110', 'M50 30H104', 'M50 40H108', 'M50 50H96', 'M50 64H110', 'M50 74H100', 'M50 84H86',
  ],
};

/** Strokes of a sheet's schematic, traced in sequence whenever `id` changes. */
export default function SheetThumb({ id, className = '' }: { id: string; className?: string }) {
  const paths = DRAWINGS[id] ?? [];
  return (
    <svg viewBox="0 0 160 100" className={className} aria-hidden="true" fill="none">
      <g key={id} className="stroke-draft" strokeWidth={1.25} strokeLinecap="square">
        {paths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ pathLength: { duration: 0.55, ease: EASE_OUT, delay: i * 0.05 }, opacity: { duration: 0.1, delay: i * 0.05 } }}
          />
        ))}
      </g>
    </svg>
  );
}
