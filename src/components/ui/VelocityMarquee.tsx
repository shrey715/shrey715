'use client';
import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

const COPIES = 4;

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

interface RowProps {
  items: string[];
  /** % of one copy per second; sign sets the resting direction. */
  baseVelocity: number;
  className?: string;
  starClassName?: string;
}

function Row({ items, baseVelocity, className, starClassName }: RowProps) {
  const prefersReducedMotion = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const skewX = useTransform(velocity, [-2500, 2500], [12, -12], { clamp: true });
  const x = useTransform(baseX, (v) => `${wrap(-100 / COPIES, 0, v)}%`);
  const direction = useRef(1);
  const trackRef = useRef<HTMLDivElement>(null);
  // Hover eases the strip to a crawl; dragging takes over completely.
  const speed = useRef(1);
  const hovering = useRef(false);
  const drag = useRef<{ x: number; base: number } | null>(null);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion || drag.current) return;
    speed.current += ((hovering.current ? 0.12 : 1) - speed.current) * 0.08;
    const b = boost.get();
    if (b < 0) direction.current = -1;
    else if (b > 0) direction.current = 1;
    let move = direction.current * baseVelocity * (delta / 1000);
    move += direction.current * move * b;
    baseX.set(baseX.get() + move * speed.current);
  });

  const onPointerDown = (e: React.PointerEvent) => {
    if (prefersReducedMotion) return;
    drag.current = { x: e.clientX, base: baseX.get() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const width = trackRef.current?.offsetWidth;
    if (!d || !width) return;
    baseX.set(d.base + ((e.clientX - d.x) / width) * 100);
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div
      className={cn('overflow-hidden whitespace-nowrap flex cursor-grab active:cursor-grabbing select-none touch-pan-y', className)}
      onPointerEnter={(e) => e.pointerType === 'mouse' && (hovering.current = true)}
      onPointerLeave={() => {
        hovering.current = false;
        endDrag();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      data-cursor="DRAG"
    >
      <motion.div ref={trackRef} style={{ x, skewX: prefersReducedMotion ? 0 : skewX }} className="flex shrink-0">
        {Array.from({ length: COPIES }, (_, c) => (
          <span key={c} className="flex shrink-0 items-center" aria-hidden={c > 0}>
            {items.map((item) => (
              <span key={item} className="flex items-center">
                <span className="px-5 sm:px-7">{item}</span>
                <span className={cn('text-[0.55em]', starClassName)}>✶</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Two strips of display type crossed like tape over the seam between a paper
 * and an ink section. They drift on their own and surge, reverse and shear
 * with scroll velocity.
 */
export default function VelocityMarquee({
  top,
  bottom,
}: {
  top: string[];
  bottom: string[];
}) {
  return (
    <div
      className="relative z-20 py-10 sm:py-14 overflow-hidden bg-[linear-gradient(to_bottom,var(--color-paper)_50%,var(--color-ink)_50%)] print:hidden"
      aria-hidden="true"
    >
      <div className="font-display leading-none" style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)' }}>
        <Row
          items={top}
          baseVelocity={-2.2}
          className="bg-accent text-ink border-y-2 border-ink py-3 -rotate-[2.5deg] scale-x-[1.08] relative z-10"
          starClassName="text-paper"
        />
        <Row
          items={bottom}
          baseVelocity={1.6}
          className="bg-ink text-paper border-y-2 border-paper/30 py-3 rotate-[1.8deg] scale-x-[1.08] -mt-3"
          starClassName="text-accent"
        />
      </div>
    </div>
  );
}
