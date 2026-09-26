'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import type { Heading } from '@/lib/blog';

/**
 * Pinned contents rail. The active entry is the last heading that has
 * scrolled past ~30% of the viewport; a sliding accent marker follows it.
 */
export default function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);
  const lenis = useLenis();

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= line) current = h.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [headings]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -96, duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Contents" className="font-mono-label text-[10px]">
      <p className="text-ink/45 mb-4">CONTENTS</p>
      <ol className="border-l-2 border-ink/15">
        {headings.map((h, i) => {
          const isActive = active === h.id;
          return (
            <li key={h.id} className="relative">
              {isActive && (
                <motion.span
                  layoutId="toc-marker"
                  className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
              )}
              <button
                type="button"
                onClick={() => go(h.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`w-full text-left flex gap-3 py-2 pl-4 pr-2 leading-snug normal-case tracking-normal font-sans text-[13px] transition-colors ${
                  isActive ? 'text-ink' : 'text-ink/50 hover:text-ink'
                }`}
              >
                <span className={`font-mono text-[10px] pt-0.5 tabular-nums ${isActive ? 'text-accent' : 'text-ink/35'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{h.text}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
