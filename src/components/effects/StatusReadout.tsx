'use client';
import { useEffect, useState } from 'react';

/**
 * Fixed HUD tag: a live clock + scroll-depth percentage, styled like an
 * exposed technical stamp on a spec sheet. Desktop only — too tight for
 * mobile chrome, and the ScrollIndicator already covers scroll feedback there.
 */
export default function StatusReadout() {
  const [time, setTime] = useState('');
  const [scrollPct, setScrollPct] = useState(0);

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

    let ticking = false;
    const updateScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        setScrollPct(max > 0 ? Math.round((el.scrollTop / max) * 100) : 0);
        ticking = false;
      });
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', updateScroll);
    };
  }, []);

  return (
    <div
      className="fixed bottom-4 left-4 z-[9998] hidden lg:flex items-stretch hard-border bg-paper font-mono-label text-[10px] text-ink/70 pointer-events-none select-none"
      aria-hidden="true"
    >
      <span className="px-2.5 py-1.5 border-r-2 border-ink tabular-nums">
        {time || '--:--:--'}&nbsp;IST
      </span>
      <span className="px-2.5 py-1.5 flex items-center gap-1.5 tabular-nums">
        SCROLL
        <span className="text-accent">{String(scrollPct).padStart(3, '0')}%</span>
      </span>
    </div>
  );
}
