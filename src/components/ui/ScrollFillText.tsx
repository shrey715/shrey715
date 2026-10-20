'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ScrollFillTextProps {
  text: string;
  /** Words (exact match, punctuation included) to paint in the accent colour. */
  accentWords?: string[];
  className?: string;
}

/** Deterministic 0..1 noise so the scatter is identical on every visit. */
function noise(n: number) {
  const x = Math.sin(n * 91.7 + 13.3) * 43758.5453;
  return x - Math.floor(x);
}

function Word({
  word,
  index,
  range,
  progress,
  accent,
}: {
  word: string;
  index: number;
  range: [number, number];
  progress: MotionValue<number>;
  accent: boolean;
}) {
  // Each word starts thrown somewhere off its line — like loose type on the
  // compositor's bench — and is set into place as you scroll.
  const dx = (noise(index) - 0.5) * 2.4;
  const dy = (noise(index + 7) - 0.3) * 1.6;
  const rot = (noise(index + 19) - 0.5) * 24;
  const opacity = useTransform(progress, range, [0.12, 1]);
  const x = useTransform(progress, range, [`${dx}em`, '0em']);
  const y = useTransform(progress, range, [`${dy}em`, '0em']);
  const rotate = useTransform(progress, range, [rot, 0]);
  return (
    <motion.span style={{ opacity, x, y, rotate }} className={`inline-block mr-[0.24em] ${accent ? 'text-accent' : ''}`}>
      {word}
    </motion.span>
  );
}

/**
 * A statement typeset word by word: each word starts scattered and settles
 * into the line as you scroll — scrubbed by scroll position, so reading pace
 * follows the reader.
 */
export default function ScrollFillText({ text, accentWords = [], className = '' }: ScrollFillTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.45'] });
  const words = text.split(' ');

  if (prefersReducedMotion) {
    return (
      <p ref={ref} className={className}>
        {words.map((w, i) => (
          <span key={i} className={`mr-[0.24em] ${accentWords.includes(w) ? 'text-accent' : ''}`}>
            {w}{' '}
          </span>
        ))}
      </p>
    );
  }

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word
          key={i}
          word={w}
          index={i}
          range={[(i / words.length) * 0.7, (i / words.length) * 0.7 + 0.3]}
          progress={scrollYProgress}
          accent={accentWords.includes(w)}
        />
      ))}
    </p>
  );
}
