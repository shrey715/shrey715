'use client';
import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CAP_HEIGHT, layoutGlyphs } from '@/lib/glyphs';
import { DUR, EASE_OUT } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playSound } from '@/lib/sound';

interface WordmarkProps {
  first: string;
  /** Rendered in the accent colour. */
  last: string;
  /** Set solid (one word) instead of with a word space between the parts. */
  joined?: boolean;
}

const PAD = 3;

/**
 * The sign-off, plotted: the wordmark's real glyph outlines are traced like a
 * signature at the foot of the last sheet (ghosted first part, accent-outlined
 * second), spanning the full content width. Afterwards each letter inks in
 * solid as the cursor comes near it.
 */
export default function Wordmark({ first, last, joined = false }: WordmarkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const fills = useRef<(SVGPathElement | null)[]>([]);
  const inView = useInView(svgRef, { once: true, margin: '-10% 0px' });
  // Proximity tracking only runs while the wordmark is on screen.
  const onScreen = useInView(svgRef);
  const prefersReducedMotion = useReducedMotion();

  const text = joined ? `${first}${last}` : `${first} ${last}`;
  const { glyphs, width } = layoutGlyphs(text, 0.5);
  const splitAt = first.length; // glyph index where the accent part starts (spaces aren't glyphs)

  // Cursor proximity: each glyph's solid fill fades in as the pointer nears.
  useEffect(() => {
    if (prefersReducedMotion || !onScreen) return;
    let raf = 0;
    let mx = -1e4;
    let my = -1e4;
    const update = () => {
      raf = 0;
      for (const el of fills.current) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        el.style.fillOpacity = String(Math.max(0, 1 - d / (r.height * 1.1)));
      }
    };
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, [prefersReducedMotion, onScreen]);

  const play = inView || prefersReducedMotion;
  const per = 0.09;

  return (
    <div className="w-full select-none" role="img" aria-label={text}>
      <svg
        ref={svgRef}
        aria-hidden="true"
        viewBox={`${-PAD} ${-CAP_HEIGHT - PAD} ${width + PAD * 2} ${CAP_HEIGHT + PAD * 2}`}
        className="block w-full h-auto overflow-visible"
      >
        {glyphs.map((g, i) => {
          const accent = i >= splitAt;
          const tf = `translate(${g.x} 0)`;
          return (
            <g key={i}>
              {/* The traced signature line */}
              <motion.path
                d={g.d}
                transform={tf}
                pathLength={1}
                strokeDasharray="1 1"
                strokeWidth={accent ? 0.45 : 0.3}
                className={accent ? 'stroke-accent' : 'stroke-paper/30'}
                fill={accent ? 'none' : 'var(--color-paper)'}
                initial={prefersReducedMotion ? false : { strokeDashoffset: 1, fillOpacity: 0 }}
                animate={play ? { strokeDashoffset: 0, fillOpacity: accent ? 0 : 0.08 } : undefined}
                style={prefersReducedMotion ? { fillOpacity: accent ? 0 : 0.08 } : undefined}
                transition={{
                  strokeDashoffset: { duration: DUR.plot, ease: EASE_OUT, delay: i * per },
                  fillOpacity: { duration: DUR.base, delay: i * per + DUR.plot * 0.7 },
                }}
                onAnimationStart={i === 0 && play ? () => playSound('scratch') : undefined}
              />
              {/* Solid ink that follows the cursor */}
              <path
                ref={(el) => {
                  fills.current[i] = el;
                }}
                d={g.d}
                transform={tf}
                className={accent ? 'fill-accent' : 'fill-paper'}
                style={{ fillOpacity: 0, transition: 'fill-opacity 0.15s linear' }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
