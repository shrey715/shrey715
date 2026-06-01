'use client';
import { motion } from 'framer-motion';
import { EASE_OUT } from '@/lib/constants';

interface RevealTextProps {
  text: string;
  className?: string;
  /** Delay before the first word starts (seconds). */
  delay?: number;
  /** Stagger between words (seconds). */
  stagger?: number;
}

/**
 * Heading reveal where each word slides up from behind a clipping mask.
 * The visual classes (font, size, gradient) live on the wrapping <span> so
 * `background-clip: text` gradients still apply across the whole heading.
 */
export default function RevealText({
  text,
  className = '',
  delay = 0,
  stagger = 0.06,
}: RevealTextProps) {
  const words = text.split(' ');

  return (
    <span className={`${className} inline-block`}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          style={{
            paddingBottom: '0.14em',
            paddingRight: '0.08em',
            marginRight: i < words.length - 1 ? '0.2em' : undefined,
          }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: delay + i * stagger }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
