'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE_OUT, HERO_READY_EVENT, INTRO_EVENT } from '@/lib/constants';

const COUNT_DURATION = 1500; // curtain mode: ms for 0 -> 100
const PRE_DURATION = 1600; // particle mode: ms for 0 -> 90
const FORM_TIME = 1700; // particle mode: time the monogram takes to settle after the scene is ready
const READY_TIMEOUT = 5000; // never wait on WebGL longer than this
const HOLD_AFTER = 350; // ms to hold at 100 before handing off

type Mode = 'curtain' | 'particles';

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Branded intro, once per session.
 *
 * On the home page it's a "particle" intro: the overlay is transparent and
 * the hero's own particle field forms the SD monogram underneath it while the
 * counter runs. The counter tracks something real — it holds at 90 until the
 * WebGL scene reports ready, then completes as the monogram settles. At 100
 * the chrome fades and the particles flow straight into the hero (the hero
 * listens for INTRO_EVENT). No curtain.
 *
 * Entering on any other page keeps the classic opaque SD + curtain lift.
 * Skipped entirely for reduced motion. The overlay is in the server render
 * (opaque) so the page never flashes before the client decides.
 */
export default function Preloader() {
  const prefersReducedMotion = useReducedMotion();
  const lenis = useLenis();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [mode, setMode] = useState<Mode>('curtain');
  const [count, setCount] = useState(0);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem('preloaded') === '1';
    if (prefersReducedMotion || alreadySeen) {
      // Deferred: not a synchronous state update inside the effect body.
      const id = requestAnimationFrame(() => setVisible(false));
      return () => cancelAnimationFrame(id);
    }

    const particles = pathname === '/';
    document.body.style.overflow = 'hidden';
    lenis?.stop();

    const start = performance.now();
    let readyAt: number | null = null;
    const onReady = () => {
      readyAt ??= performance.now();
    };
    window.addEventListener(HERO_READY_EVENT, onReady);
    const fallback = setTimeout(onReady, READY_TIMEOUT);

    let raf = 0;
    let exitTimer: ReturnType<typeof setTimeout>;
    let first = true;

    const tick = (now: number) => {
      if (first) {
        first = false;
        setMode(particles ? 'particles' : 'curtain');
      }
      let p: number;
      if (particles) {
        const pre = 0.9 * easeOut(Math.min((now - start) / PRE_DURATION, 1));
        const post = readyAt === null ? 0 : Math.min((now - readyAt) / FORM_TIME, 1);
        p = Math.min(1, pre + 0.1 * post);
      } else {
        p = easeOut(Math.min((now - start) / COUNT_DURATION, 1));
      }
      setCount(Math.round(p * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        exitTimer = setTimeout(() => {
          setVisible(false);
          // Particles start flowing into the hero as the chrome fades.
          window.dispatchEvent(new Event(INTRO_EVENT));
        }, HOLD_AFTER);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      clearTimeout(fallback);
      window.removeEventListener(HERO_READY_EVENT, onReady);
      document.body.style.overflow = '';
      lenis?.start();
    };
    // Decided once per mount; pathname changes don't restart the intro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, lenis]);

  const handleExitComplete = () => {
    document.body.style.overflow = '';
    lenis?.start();
    sessionStorage.setItem('preloaded', '1');
  };

  const particles = mode === 'particles';

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="preloader"
          className={`fixed inset-0 z-[100000] flex flex-col items-center justify-center text-ink print:hidden ${
            particles ? 'bg-transparent' : 'bg-paper grid-lines'
          }`}
          exit={particles ? { opacity: 0 } : { y: '-100%' }}
          transition={particles ? { duration: 0.6, ease: EASE_OUT } : { duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Classic mode draws the monogram in type; particle mode lets the
              hero's particle field draw it underneath. */}
          {!particles && (
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
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className={`font-mono-label text-[11px] text-ink/50 ${particles ? 'absolute top-[78%] left-1/2 -translate-x-1/2 whitespace-nowrap' : ''}`}
          >
            SHREYAS&nbsp;DEB&nbsp;/&nbsp;PORTFOLIO
          </motion.p>

          {/* Counter pinned to the bottom */}
          <div className="absolute bottom-8 left-0 right-0 px-6 sm:px-10 flex items-end justify-between">
            <span className="font-display text-7xl sm:text-8xl tabular-nums text-ink leading-none">{count}</span>
            <span className="font-mono-label text-[11px] text-ink/40 mb-2">
              {particles && count >= 90 && count < 100 ? 'ASSEMBLING' : 'LOADING'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 h-2 w-full bg-ink/10 border-t-2 border-ink">
            <div className="h-full bg-accent transition-[width] duration-100 ease-out" style={{ width: `${count}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
