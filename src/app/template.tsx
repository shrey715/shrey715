'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const; // matches Preloader's exit curve

/**
 * A lighter echo of the Preloader's curtain-lift, replayed on every
 * client-side route change (Next.js mounts a fresh instance of this file
 * per navigation) so in-app navigation shares the same visual grammar as
 * the initial load. Suppressed on the very first page load — the Preloader
 * already owns that beat, tracked via the same sessionStorage flag — and
 * under reduced motion.
 *
 * Deliberately does NOT touch Lenis (no stop/start): a route change can
 * carry a pending cross-page section scroll (see useSectionNav), and
 * pausing Lenis here would cancel that in-flight scroll animation. The
 * curtain is purely a visual overlay — nothing needs to actually stop
 * scrolling underneath it for its ~0.7s.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  // Starts false on both server and client so hydration always agrees —
  // sessionStorage is client-only, so this can only be checked after mount.
  const [playCurtain, setPlayCurtain] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (sessionStorage.getItem('preloaded') !== '1') return;
    setPlayCurtain(true);
  }, [prefersReducedMotion]);

  return (
    <>
      {playCurtain && (
        <motion.div
          aria-hidden="true"
          initial={{ y: 0 }}
          animate={{ y: '-100%' }}
          transition={{ duration: 0.7, ease: CURTAIN_EASE, delay: 0.05 }}
          className="fixed inset-0 z-[100000] bg-ink grid-lines-dark pointer-events-none print:hidden"
        />
      )}
      {children}
    </>
  );
}
