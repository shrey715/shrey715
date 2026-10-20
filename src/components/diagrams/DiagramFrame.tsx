'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Drives a looping diagram: seconds since start, mod `length`. Runs only
 * while on screen and not paused; reduced motion freezes on `stillAt`.
 */
export function useLoopClock(length: number, ref: React.RefObject<Element | null>, stillAt: number) {
  const inView = useInView(ref, { margin: '-10% 0px' });
  const prefersReducedMotion = useReducedMotion();
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);
  const origin = useRef<number | null>(null);
  const pausedAt = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion || !inView || paused) {
      origin.current = null;
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      if (origin.current === null) origin.current = now - pausedAt.current * 1000;
      const s = ((now - origin.current) / 1000) % length;
      pausedAt.current = s;
      setT(s);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, paused, length, prefersReducedMotion]);

  const restart = () => {
    pausedAt.current = 0;
    origin.current = null;
    setT(0);
    setPaused(false);
  };

  return { t: prefersReducedMotion ? stillAt : t, paused, setPaused, restart, still: prefersReducedMotion };
}

export type LoopClock = ReturnType<typeof useLoopClock>;

/** Linear 0..1 progress of t through [a, b]. */
export const prog = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** Smooth ease for motion along a path. */
export const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

interface DiagramFrameProps {
  fig: string;
  title: string;
  caption: React.ReactNode;
  clock: LoopClock;
  length: number;
  log: string;
  children: React.ReactNode;
  /** viewBox width/height for the drawing. */
  vw: number;
  vh: number;
}

/**
 * Drawing-sheet frame for a system diagram: title row, the animated drawing
 * on a construction grid, a live event log, and pause / replay controls.
 */
export default function DiagramFrame({ fig, title, caption, clock, length, log, children, vw, vh }: DiagramFrameProps) {
  return (
    <figure className="hard-border bg-paper">
      <div className="flex items-stretch border-b-2 border-ink font-mono-label text-[10px]">
        <span className="px-3 py-2 bg-ink text-paper">{fig}</span>
        <span className="px-3 py-2 flex-1 truncate">{title}</span>
        {!clock.still && (
          <>
            <button
              type="button"
              onClick={() => clock.setPaused(!clock.paused)}
              aria-label={clock.paused ? 'Play diagram' : 'Pause diagram'}
              className="px-3 border-l-2 border-ink hover:bg-ink hover:text-paper transition-colors flex items-center gap-1.5"
            >
              {clock.paused ? <Play size={11} /> : <Pause size={11} />}
              {clock.paused ? 'PLAY' : 'PAUSE'}
            </button>
            <button
              type="button"
              onClick={clock.restart}
              aria-label="Replay diagram"
              className="px-3 border-l-2 border-ink hover:bg-ink hover:text-paper transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={11} /> REPLAY
            </button>
          </>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${vw} ${vh}`}
          className="block w-full min-w-[620px] h-auto grid-lines"
          role="img"
          aria-label={title}
          fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
        >
          {children}
        </svg>
      </div>

      <div className="flex items-stretch border-t-2 border-ink font-mono-label text-[10px]">
        <span className="px-3 py-2 border-r-2 border-ink tabular-nums text-ink/50 w-20 shrink-0">
          T+{clock.t.toFixed(1)}s
        </span>
        <span className="px-3 py-2 flex-1 truncate text-ink" aria-live="off">
          {log}
        </span>
        <span className="px-3 py-2 border-l-2 border-ink text-ink/40 tabular-nums">LOOP {length}s</span>
      </div>
      <figcaption className="px-4 py-3 border-t-2 border-ink font-annot text-base text-ink/70 leading-snug">{caption}</figcaption>
    </figure>
  );
}
