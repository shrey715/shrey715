'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE_OUT } from '@/lib/constants';

const COUNT_DURATION = 1500; // ms for 0 -> 100
const HOLD_AFTER = 350; // ms to hold at 100 before the curtain lifts

/**
 * Branded intro: an "SD" monogram with a reveal, a 0->100 counter and a
 * filling progress bar, then a curtain that lifts to hand off into the hero.
 *
 * Plays once per browser session (sessionStorage) and is skipped entirely
 * for visitors who prefer reduced motion. The overlay is present in the
 * initial render so there's no flash of the page before it appears; the
 * effect immediately dismisses it when it shouldn't play.
 */
export default function Preloader() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);

  // Decide whether to play, and lock scroll while the curtain is up.
  useEffect(() => {
    const alreadySeen =
      typeof window !== 'undefined' && sessionStorage.getItem('preloaded') === '1';

    if (prefersReducedMotion || alreadySeen) {
      setVisible(false);
      return;
    }

    document.body.style.overflow = 'hidden';

    const start = performance.now();
    let raf = 0;
    let exitTimer: ReturnType<typeof setTimeout>;

    const tick = (now: number) => {
      const p = Math.min((now - start) / COUNT_DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setCount(Math.round(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        exitTimer = setTimeout(() => setVisible(false), HOLD_AFTER);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      document.body.style.overflow = '';
    };
  }, [prefersReducedMotion]);

  // Restore scroll once the curtain has lifted.
  const handleExitComplete = () => {
    document.body.style.overflow = '';
    sessionStorage.setItem('preloaded', '1');
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-paper grid-lines text-ink"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Monogram */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="relative"
          >
            <span className="font-display block text-ink select-none" style={{ fontSize: 'clamp(6rem, 28vw, 18rem)' }}>
              S<span className="text-accent">D</span>
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-mono-label text-[11px] text-ink/50"
          >
            SHREYAS&nbsp;DEB&nbsp;/&nbsp;PORTFOLIO
          </motion.p>

          {/* Counter pinned to the bottom */}
          <div className="absolute bottom-8 left-0 right-0 px-6 sm:px-10 flex items-end justify-between">
            <span className="font-display text-7xl sm:text-8xl tabular-nums text-ink leading-none">
              {count}
            </span>
            <span className="font-mono-label text-[11px] text-ink/40 mb-2">LOADING</span>
          </div>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 h-2 w-full bg-ink/10 border-t-2 border-ink">
            <div
              className="h-full bg-accent transition-[width] duration-100 ease-out"
              style={{ width: `${count}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
