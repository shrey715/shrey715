'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT } from '@/lib/motion';

// Must match HeroScene's camera (fov 45°, z = 6) and heroLayout().
const WORLD_H = 2 * 6 * Math.tan((45 / 2) * (Math.PI / 180));
const FIGURE_RADIUS = 2; // formations are built to fit a radius-2 sphere

function figureOnScreen(w: number, h: number) {
  const worldW = WORLD_H * (w / h);
  if (w / h > 1.15) {
    const scale = Math.min(0.64, worldW / 14);
    return { cx: w * 0.75, cy: h * 0.53, r: ((FIGURE_RADIUS * scale) / WORLD_H) * h };
  }
  const scale = Math.min(worldW / 6.4, 0.6);
  return { cx: w * 0.5, cy: h * 0.29, r: ((FIGURE_RADIUS * scale) / WORLD_H) * h };
}

/**
 * Drafting construction lines around the hero's particle figure — compass
 * circle, centre cross, bounding box with corner ticks — re-drawn each time
 * the figure morphs, as if it were being laid out on the sheet. Lines only.
 */
export default function HeroConstruction({ index, show, still }: { index: number; show: boolean; still: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const f = size ? figureOnScreen(size.w, size.h) : null;
  const draw = (delay: number, duration = 1.1) => ({
    initial: still ? false : ({ pathLength: 0, opacity: 0 } as const),
    animate: show ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
    transition: { pathLength: { duration, ease: EASE_OUT, delay }, opacity: { duration: 0.3, delay } },
  });

  return (
    <svg ref={ref} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
      {f && (
        <g key={index} className="stroke-draft" fill="none" strokeWidth={1} opacity={0.45}>
          {/* Compass circle */}
          <motion.circle cx={f.cx} cy={f.cy} r={f.r * 1.12} strokeDasharray="3 6" {...draw(0.1, 1.6)} />
          {/* Centre cross */}
          <motion.path d={`M${f.cx - f.r * 1.35} ${f.cy}H${f.cx + f.r * 1.35}`} {...draw(0)} />
          <motion.path d={`M${f.cx} ${f.cy - f.r * 1.35}V${f.cy + f.r * 1.35}`} {...draw(0.08)} />
          {/* Bounding box corner ticks */}
          {[
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1],
          ].map(([sx, sy], i) => {
            const x = f.cx + sx * f.r * 1.2;
            const y = f.cy + sy * f.r * 1.2;
            const t = f.r * 0.14;
            return <motion.path key={i} d={`M${x - sx * t} ${y}H${x}V${y - sy * t}`} {...draw(0.5 + i * 0.08, 0.5)} />;
          })}
        </g>
      )}
    </svg>
  );
}
