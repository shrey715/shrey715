'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export interface SheetState {
  /** Sheet titles in page order (from `data-sheet` attributes). */
  names: string[];
  /** Optional particle shape per sheet (from `data-specimen`). */
  specimens: (string | null)[];
  /** Index of the sheet crossing the middle of the viewport. */
  index: number;
}

/**
 * The page as a drawing set: every element with `data-sheet="TITLE"` is one
 * sheet. Reports the list and which one is currently under the reader.
 */
export function useSheets(): SheetState {
  const pathname = usePathname();
  const [state, setState] = useState<SheetState>({ names: [], specimens: [], index: 0 });

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    // Wait a frame so the new route's DOM is in place.
    const raf = requestAnimationFrame(() => {
      const els = [...document.querySelectorAll<HTMLElement>('[data-sheet]')];
      const names = els.map((el) => el.dataset.sheet ?? '');
      const specimens = els.map((el) => el.dataset.specimen ?? null);
      setState({ names, specimens, index: 0 });
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const i = els.indexOf(e.target as HTMLElement);
            if (i !== -1) setState((s) => (s.index === i ? s : { ...s, index: i }));
          }
        },
        { rootMargin: '-48% 0px -50% 0px' },
      );
      els.forEach((el) => io!.observe(el));
    });
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [pathname]);

  return state;
}
