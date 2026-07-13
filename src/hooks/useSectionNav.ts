'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const STORAGE_KEY = 'pendingSectionScroll';

/**
 * Cross-page navigation to a home-page section id, without ever touching
 * the URL (no #hash). From another route, the target is stashed and the
 * router navigates to a plain "/"; once mounted there, the pending target
 * is picked up and scrolled to.
 */
export function useSectionNav() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/') return;
    const target = sessionStorage.getItem(STORAGE_KEY);
    if (!target) return;
    sessionStorage.removeItem(STORAGE_KEY);
    requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [pathname]);

  const goToSection = (id: string) => {
    if (pathname !== '/') {
      sessionStorage.setItem(STORAGE_KEY, id);
      router.push('/');
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return { goToSection };
}
