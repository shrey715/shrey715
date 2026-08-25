'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Fixed HUD tag: a live clock plus a live cursor-coordinate readout, styled
 * like an exposed technical stamp on a spec sheet. Desktop only — too tight
 * for mobile chrome.
 */
export default function StatusReadout() {
  const [time, setTime] = useState('');
  const coordsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const updateTime = () =>
      setTime(
        new Date().toLocaleTimeString('en-GB', {
          hour12: false,
          timeZone: 'Asia/Kolkata',
        }),
      );
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Written directly to the DOM (not useState) — mousemove fires far too
    // often to route through React without re-render thrashing, same
    // reasoning as the cursor block in CustomCursor.tsx.
    const handleMouseMove = (e: MouseEvent) => {
      if (coordsRef.current) {
        coordsRef.current.textContent = `X:${String(e.clientX).padStart(4, '0')} Y:${String(e.clientY).padStart(4, '0')}`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="fixed bottom-4 left-4 z-[9998] hidden lg:flex items-stretch hard-border bg-paper font-mono-label text-[10px] text-ink/70 pointer-events-none select-none print:hidden"
      aria-hidden="true"
    >
      <span className="px-2.5 py-1.5 tabular-nums border-r-2 border-ink">
        {time || '--:--:--'}&nbsp;IST
      </span>
      <span ref={coordsRef} className="px-2.5 py-1.5 tabular-nums">
        X:---- Y:----
      </span>
    </div>
  );
}
