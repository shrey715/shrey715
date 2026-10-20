'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CAP_HEIGHT, GLYPH_EM, layoutGlyphs } from '@/lib/glyphs';
import { DUR, EASE_OUT, VIEWPORT } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playSound } from '@/lib/sound';

type Variant = 'fill' | 'outline' | 'ghost';

interface PlotTextProps {
  text: string;
  /**
   * fill    — traced, then inked solid (with a misregistered accent pass that snaps into place)
   * outline — traced, stays as an outline
   * ghost   — a faint outline traced slowly (background numerals)
   */
  variant?: Variant;
  className?: string;
  /** Seconds before the trace starts. */
  delay?: number;
  /** Play on mount instead of on scroll into view. */
  immediate?: boolean;
  /**
   * Outline width in glyph units (1 unit = 1/100 em), so it scales with the
   * type. Not non-scaling-stroke: that makes Chrome dash in screen pixels,
   * which breaks the pathLength-normalised trace into dotted fragments.
   */
  stroke?: number;
}

const PAD = 4; // viewBox padding so strokes on the outer edges aren't clipped

/**
 * Display type drawn like a pen plotter: each glyph's outline is traced
 * stroke-first, then inked. Sized in `em` (cap height = 1em × 0.859), so it
 * takes its size from the surrounding font-size like real text. The text
 * itself is kept for screen readers and search.
 */
export default function PlotText({ text, variant = 'fill', className = '', delay = 0, immediate = false, stroke = 0.9 }: PlotTextProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, VIEWPORT);
  const prefersReducedMotion = useReducedMotion();
  const play = immediate || inView;
  const still = prefersReducedMotion;

  const { glyphs, width } = layoutGlyphs(text);
  const vbW = width + PAD * 2;
  const vbH = CAP_HEIGHT + PAD * 2;
  const trace = variant === 'ghost' ? DUR.plot * 1.6 : DUR.plot * 0.6;
  const per = Math.min(0.06, 0.5 / Math.max(glyphs.length, 1));

  const strokeOpacity = variant === 'ghost' ? 0.16 : 1;
  const inked = variant === 'fill';

  return (
    <span className={`relative inline-block align-baseline leading-none ${className}`}>
      <span className="sr-only">{text}</span>
      <svg
        ref={ref}
        aria-hidden="true"
        viewBox={`${-PAD} ${-CAP_HEIGHT - PAD} ${vbW} ${vbH}`}
        className="block overflow-visible"
        style={{ height: `${(vbH / GLYPH_EM).toFixed(4)}em`, width: 'auto' }}
      >
        {/* Misregistered accent pass: starts offset, snaps into register as the ink lands */}
        {inked && !still && (
          <motion.g
            initial={{ x: 3.5, y: -2.5, opacity: 0 }}
            animate={play ? { x: 0, y: 0, opacity: [0, 0.9, 0] } : undefined}
            transition={{ duration: DUR.base, ease: EASE_OUT, delay: delay + trace * 0.75 }}
          >
            {glyphs.map((g, i) => (
              <path key={i} d={g.d} transform={`translate(${g.x} 0)`} className="fill-accent" />
            ))}
          </motion.g>
        )}
        {glyphs.map((g, i) => (
          <motion.path
            key={`${text}-${i}`}
            d={g.d}
            transform={`translate(${g.x} 0)`}
            pathLength={1}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinejoin="round"
            strokeDasharray="1 1"
            initial={still ? false : { strokeDashoffset: 1, fillOpacity: 0, strokeOpacity }}
            animate={
              still || play
                ? { strokeDashoffset: 0, fillOpacity: inked ? 1 : 0, strokeOpacity: inked ? 0 : strokeOpacity }
                : undefined
            }
            style={still ? { fillOpacity: inked ? 1 : 0, strokeOpacity: inked ? 0 : strokeOpacity } : undefined}
            transition={{
              strokeDashoffset: { duration: trace, ease: EASE_OUT, delay: delay + i * per },
              fillOpacity: { duration: DUR.base * 0.6, ease: EASE_OUT, delay: delay + trace * 0.8 + i * per * 0.5 },
              strokeOpacity: { duration: DUR.base, delay: delay + trace + 0.2 },
            }}
            onAnimationStart={i === 0 && play ? () => playSound('scratch') : undefined}
          />
        ))}
      </svg>
    </span>
  );
}
