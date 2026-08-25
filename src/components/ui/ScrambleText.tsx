'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

interface ScrambleTextProps {
  text: string;
  className?: string;
  /** Total decode duration in ms. */
  duration?: number;
  /** Delay before decoding starts (ms). */
  delay?: number;
}

/**
 * Terminal-style decode: characters resolve left-to-right out of a stream of
 * random glyphs once the element enters the viewport. Renders plain text for
 * reduced-motion visitors and before hydration.
 */
export default function ScrambleText({
  text,
  className = '',
  duration = 900,
  delay = 150,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const prefersReducedMotion = useReducedMotion();
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;

    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now + delay;
      const elapsed = now - start;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      // Number of characters fully resolved, sweeping left to right.
      const settled = Math.floor(progress * text.length);

      let next = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) {
        const ch = text[i];
        // Keep spaces (and non-breaking spaces) stable to avoid layout jumps.
        next += ch === ' ' || ch === '\u00A0' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOutput(next);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setOutput(text);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, prefersReducedMotion, text, duration, delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {output}
    </span>
  );
}
