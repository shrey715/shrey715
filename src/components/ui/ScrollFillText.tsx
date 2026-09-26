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

function Word({
  word,
  range,
  progress,
  accent,
}: {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
  accent: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, ['0.18em', '0em']);
  return (
    <motion.span style={{ opacity, y }} className={`inline-block mr-[0.24em] ${accent ? 'text-accent' : ''}`}>
      {word}
    </motion.span>
  );
}

/**
 * A statement that inks itself in word by word, scrubbed by scroll position
 * rather than played on a timer — reading pace follows the reader.
 */
export default function ScrollFillText({ text, accentWords = [], className = '' }: ScrollFillTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.4'] });
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
          range={[i / words.length, (i + 1) / words.length]}
          progress={scrollYProgress}
          accent={accentWords.includes(w)}
        />
      ))}
    </p>
  );
}
