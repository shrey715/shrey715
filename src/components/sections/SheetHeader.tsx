'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DUR, EASE_OUT, STAGGER, VIEWPORT } from '@/lib/motion';

export interface SheetField {
  k: string;
  v: React.ReactNode;
  /** Small secondary line. */
  sub?: React.ReactNode;
}

/** Live IST clock string, ticking every second (client-only). */
export function useIstClock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata' }));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return t;
}

/**
 * Dense mono spec grid — the header block printed across the top of a
 * drawing sheet. Cells rule in left to right.
 */
// Static class names so Tailwind can see them.
const COLS: Record<number, string> = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 5: 'md:grid-cols-5' };

export default function SheetHeader({ fields, dark = false, className = '' }: { fields: SheetField[]; dark?: boolean; className?: string }) {
  const line = dark ? 'border-paper/20' : 'border-ink/20';
  const key = dark ? 'text-paper/40' : 'text-ink/45';
  const val = dark ? 'text-paper' : 'text-ink';
  const sub = dark ? 'text-paper/50' : 'text-ink/50';

  return (
    <dl className={`grid grid-cols-2 ${COLS[Math.min(fields.length, 5)] ?? 'md:grid-cols-5'} border-t-2 border-b-2 ${line} ${className}`}>
      {fields.map((f, i) => (
        <motion.div
          key={f.k}
          className={`py-4 pr-4 ${i > 0 ? `md:border-l-2 md:pl-4 ${line}` : ''} ${i % 2 === 1 ? `border-l-2 pl-4 ${line} md:border-l-2` : ''} ${
            i >= 2 ? `border-t-2 md:border-t-0 ${line}` : ''
          }`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: DUR.base, ease: EASE_OUT, delay: i * STAGGER * 1.5 }}
        >
          <dt className={`font-mono-label text-[9px] ${key}`}>{f.k}</dt>
          <dd className={`mt-2 font-mono text-[13px] leading-snug ${val}`}>{f.v}</dd>
          {f.sub && <dd className={`mt-1 font-mono-label text-[9px] ${sub}`}>{f.sub}</dd>}
        </motion.div>
      ))}
    </dl>
  );
}
