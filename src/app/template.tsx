'use client';
import { useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { consumeTransitionNav } from '@/lib/viewTransition';

const CELL = 96; // px — a multiple of the 64px background grid reads as the same paper
const STAGGER = 0.022;
const DURATION = 0.42;
const EASE = [0.76, 0, 0.24, 1] as const;

interface Grid {
  cols: number;
  rows: number;
}

/**
 * Route transition, replayed on every client-side navigation (Next mounts a
 * fresh template per route): the screen starts tiled in ink cells, which fold
 * away in a diagonal wave from the top-left to reveal the new page — the
 * site's own grid paper, turning over.
 *
 * Stands down on the very first load (the Preloader owns that beat), under
 * reduced motion, and for View Transition navigations (those morph shared
 * elements instead, and a cover would hide the morph).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const [grid, setGrid] = useState<Grid | null>(null);

  // Layout effect: the cover must be up before the new page's first paint.
  useLayoutEffect(() => {
    // Read directly: the useReducedMotion hook reports false on first render.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || consumeTransitionNav()) return;
    if (sessionStorage.getItem('preloaded') !== '1') return;
    const cols = Math.ceil(window.innerWidth / CELL);
    const rows = Math.ceil(window.innerHeight / CELL);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- must commit before paint
    setGrid({ cols, rows });
    const done = setTimeout(() => setGrid(null), ((cols + rows) * STAGGER + DURATION) * 1000 + 120);
    return () => clearTimeout(done);
  }, []);

  return (
    <>
      {grid && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[100000] pointer-events-none print:hidden grid"
          style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gridTemplateRows: `repeat(${grid.rows}, 1fr)` }}
        >
          {Array.from({ length: grid.cols * grid.rows }, (_, i) => {
            const c = i % grid.cols;
            const r = Math.floor(i / grid.cols);
            return (
              <motion.div
                key={i}
                className="bg-ink origin-bottom-right"
                initial={{ scale: 1.02 }}
                animate={{ scale: 0 }}
                transition={{ duration: DURATION, ease: EASE, delay: (c + r) * STAGGER }}
              />
            );
          })}
        </div>
      )}
      {children}
    </>
  );
}
