'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { EASE_OUT } from '@/lib/constants';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const line: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};
const letter: Variants = {
  hidden: { y: '105%' },
  show: { y: '0%', transition: { duration: 0.9, ease: EASE_OUT } },
};

/**
 * Quiet sign-off: a ghosted wordmark sized to exactly fill its container's
 * width, in the same low-contrast register as the section watermark numerals.
 * Letters rise out of a mask when it scrolls into view; hovering one inks it in.
 */
interface WordmarkProps {
  first: string;
  /** Rendered in the accent colour. */
  last: string;
  /** Set solid (one word) instead of with a word space between the parts. */
  joined?: boolean;
}

export default function Wordmark({ first, last, joined = false }: WordmarkProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;
    const fit = () => {
      // Width scales linearly with font-size, so one measurement is exact.
      const current = parseFloat(getComputedStyle(text).fontSize);
      const w = text.getBoundingClientRect().width;
      if (w > 0) setFontSize((current * box.clientWidth) / w);
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const render = (word: string, accent: boolean) =>
    word.split('').map((ch, i) => (
      <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom pt-[0.08em] pb-[0.02em]">
        <motion.span
          variants={prefersReducedMotion ? undefined : letter}
          whileHover={prefersReducedMotion ? undefined : { y: '-6%' }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className={`inline-block transition-colors duration-300 ${
            accent
              ? 'text-transparent [-webkit-text-stroke:1.5px_var(--color-accent)] hover:text-accent'
              : 'text-paper/[0.08] hover:text-paper'
          }`}
        >
          {ch}
        </motion.span>
      </span>
    ));

  return (
    <div ref={boxRef} className="w-full overflow-hidden select-none" aria-label={joined ? `${first}${last}` : `${first} ${last}`} role="img">
      <motion.span
        ref={textRef}
        variants={line}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        aria-hidden="true"
        className="font-display inline-flex whitespace-nowrap leading-[0.8]"
        style={{ fontSize: fontSize ?? '17vw' }}
      >
        {render(first, false)}
        {!joined && <span className="inline-block w-[0.22em]" />}
        {render(last, true)}
      </motion.span>
    </div>
  );
}
