'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLenis } from 'lenis/react';

const STORAGE_KEY = 'pendingSectionScroll';

/**
 * Cross-page navigation to a home-page section id, without ever touching
 * the URL (no #hash). From another route, the target is stashed and the
 * router navigates to a plain "/"; once mounted there, the pending target
 * is picked up and scrolled to.
 *
 * Scrolling goes through Lenis when it's active, with a native fallback.
 */
export function useSectionNav() {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (pathname !== '/') return;
    const target = sessionStorage.getItem(STORAGE_KEY);
    if (!target) return;
    sessionStorage.removeItem(STORAGE_KEY);
    requestAnimationFrame(() => {
      const el = document.getElementById(target);
      if (!el) return;
      if (lenis) {
        lenis.scrollTo(el, { duration: 1.4 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }, [pathname, lenis]);

  const goToSection = (id: string) => {
    if (pathname !== '/') {
      sessionStorage.setItem(STORAGE_KEY, id);
      router.push('/');
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.4 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return { goToSection };
}
