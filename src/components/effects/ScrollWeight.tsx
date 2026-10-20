'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Gives the paper weight: smoothed scroll velocity leans `.weighted` elements
 * a touch, and they settle when the page stops — sheets catching air.
 *
 * Performance: the loop only runs while scrolling/settling (it sleeps when
 * idle), and it writes --vel onto the weighted elements themselves — not the
 * root, which would force a style recalc of the whole document every frame.
 */
export default function ScrollWeight() {
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion) return;
    let els: HTMLElement[] = [];
    const collect = () => {
      els = [...document.querySelectorAll<HTMLElement>('.weighted')];
    };
    const collectId = requestAnimationFrame(collect);

    let lastY = window.scrollY;
    let lastT = performance.now();
    let vel = 0;
    let written = 0;
    let raf = 0;

    const write = (v: number) => {
      if (Math.abs(v - written) < 0.004 && v !== 0) return;
      written = v;
      const s = v.toFixed(3);
      for (const el of els) el.style.setProperty('--vel', s);
    };

    const loop = (t: number) => {
      const y = window.scrollY;
      const dt = Math.max(t - lastT, 1);
      const raw = Math.max(-1, Math.min(1, (y - lastY) / dt / 3)); // ~3px/ms = full lean
      vel += (raw - vel) * 0.12;
      lastY = y;
      lastT = t;
      if (Math.abs(vel) < 0.003 && raw === 0) {
        vel = 0;
        write(0);
        raf = 0; // settled: sleep until the next scroll
        return;
      }
      write(vel);
      raf = requestAnimationFrame(loop);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(collectId);
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      for (const el of els) el.style.removeProperty('--vel');
    };
  }, [prefersReducedMotion, pathname]);

  return null;
}
