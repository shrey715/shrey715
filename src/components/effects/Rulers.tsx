'use client';
import { useEffect, useRef, useState } from 'react';

const SIZE = 14; // ruler thickness, px
const MAJOR = 100; // labelled tick spacing, px

/**
 * Drafting-table rulers along the top and left edges of the viewport. The
 * top ruler measures x; the left one measures the *page* — its numbers scroll
 * with the content. An accent marker on each tracks the cursor. Drawn with
 * mix-blend-difference so they read on both paper and ink sheets.
 * Desktop pointers only.
 */
export default function Rulers() {
  const [show, setShow] = useState(false);
  const leftRef = useRef<HTMLDivElement>(null);
  const leftLabels = useRef<HTMLDivElement>(null);
  const markX = useRef<HTMLDivElement>(null);
  const markY = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
    const sync = () => {
      setShow(mq.matches);
      setRows(Math.ceil(window.innerHeight / MAJOR) + 2);
    };
    const id = requestAnimationFrame(sync);
    mq.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const y = window.scrollY;
      const off = y % MAJOR;
      if (leftRef.current) leftRef.current.style.backgroundPositionY = `${-off}px`;
      const labels = leftLabels.current;
      if (labels) {
        labels.style.transform = `translateY(${-off}px)`;
        const base = Math.floor(y / MAJOR) * MAJOR;
        [...labels.children].forEach((c, i) => {
          (c as HTMLElement).textContent = String(base + i * MAJOR);
        });
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onMove = (e: MouseEvent) => {
      if (markX.current) markX.current.style.transform = `translateX(${e.clientX}px)`;
      if (markY.current) markY.current.style.transform = `translateY(${e.clientY}px)`;
    };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
    };
  }, [show, rows]);

  if (!show) return null;

  // Minor ticks every 10px, mid every 50, major every 100.
  const ticks = (len: 'x' | 'y') => {
    const across = len === 'x' ? 'to right' : 'to bottom';
    return [
      `linear-gradient(${across}, rgba(255,255,255,0.9) 1px, transparent 1px)`,
      `linear-gradient(${across}, rgba(255,255,255,0.55) 1px, transparent 1px)`,
      `linear-gradient(${across}, rgba(255,255,255,0.3) 1px, transparent 1px)`,
    ].join(',');
  };

  const label = 'absolute font-mono text-[8px] leading-none text-white/80 tabular-nums';

  return (
    <div aria-hidden="true" className="fixed inset-0 z-[9996] pointer-events-none print:hidden">
      {/* Top ruler (x) */}
      <div
        className="absolute top-0 left-0 right-0 mix-blend-difference"
        style={{
          height: SIZE,
          backgroundImage: ticks('x'),
          backgroundSize: `${MAJOR}px ${SIZE}px, ${MAJOR / 2}px ${SIZE * 0.6}px, 10px ${SIZE * 0.35}px`,
          backgroundRepeat: 'repeat-x',
          backgroundPositionX: `${SIZE}px`,
        }}
      >
        {Array.from({ length: 30 }, (_, i) => (
          <span key={i} className={label} style={{ left: SIZE + i * MAJOR + 3, top: 2 }}>
            {i * MAJOR}
          </span>
        ))}
        <div ref={markX} className="absolute top-0 left-0 w-px bg-white" style={{ height: SIZE + 4 }} />
      </div>

      {/* Left ruler (page y) */}
      <div
        ref={leftRef}
        className="absolute top-0 bottom-0 left-0 overflow-hidden mix-blend-difference"
        style={{
          width: SIZE,
          backgroundImage: ticks('y'),
          backgroundSize: `${SIZE}px ${MAJOR}px, ${SIZE * 0.6}px ${MAJOR / 2}px, ${SIZE * 0.35}px 10px`,
          backgroundRepeat: 'repeat-y',
        }}
      >
        <div ref={leftLabels} className="absolute inset-x-0 top-0 will-change-transform">
          {Array.from({ length: rows }, (_, i) => (
            <span
              key={i}
              className={`${label} left-[3px] [writing-mode:vertical-rl] rotate-180`}
              style={{ top: i * MAJOR + 3 }}
            />
          ))}
        </div>
        <div ref={markY} className="absolute top-0 left-0 h-px bg-white" style={{ width: SIZE + 4 }} />
      </div>

    </div>
  );
}
