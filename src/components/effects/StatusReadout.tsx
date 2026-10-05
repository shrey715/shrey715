'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useIntroReady } from '@/hooks/useIntroReady';
import type { LatestPush } from '@/lib/github';

/**
 * Fixed HUD tag: a live clock plus a live cursor-coordinate readout, styled
 * like an exposed technical stamp on a spec sheet. Desktop only — too tight
 * for mobile chrome.
 *
 * Sits bottom-right (the bottom-left corner is where sections put their own
 * labels) and steps aside whenever a page footer is on screen, so it never
 * covers footer links or bottom bars.
 */
function ago(iso: string) {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}M`;
  if (s < 86400) return `${Math.round(s / 3600)}H`;
  return `${Math.round(s / 86400)}D`;
}

export default function StatusReadout({ latestPush }: { latestPush: LatestPush | null }) {
  const [time, setTime] = useState('');
  const [footerVisible, setFooterVisible] = useState(false);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const introReady = useIntroReady();

  useEffect(() => {
    const updateTime = () =>
      setTime(
        new Date().toLocaleTimeString('en-GB', {
          hour12: false,
          timeZone: 'Asia/Kolkata',
        }),
      );
    const first = setTimeout(updateTime, 0);
    const timer = setInterval(updateTime, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
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

  // Re-scan on every route: each page mounts its own footer.
  useEffect(() => {
    const footers = document.querySelectorAll('footer');
    if (footers.length === 0) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setFooterVisible(visible.size > 0);
    });
    footers.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, [pathname]);

  return (
    <div
      className={`fixed bottom-4 right-6 z-[9998] hidden lg:flex items-stretch hard-border bg-paper font-mono-label text-[10px] text-ink/70 pointer-events-none select-none print:hidden transition-[opacity,transform] duration-300 ${
        footerVisible || !introReady ? 'opacity-0 translate-y-2' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {latestPush && time && (
        <span className="px-2.5 py-1.5 border-r-2 border-ink">
          LAST&nbsp;PUSH&nbsp;<span className="text-accent">{latestPush.repo.toUpperCase()}</span>&nbsp;·&nbsp;{ago(latestPush.at)}&nbsp;AGO
        </span>
      )}
      <span className="px-2.5 py-1.5 tabular-nums border-r-2 border-ink">
        {time || '--:--:--'}&nbsp;IST
      </span>
      <span ref={coordsRef} className="px-2.5 py-1.5 tabular-nums">
        X:---- Y:----
      </span>
    </div>
  );
}
