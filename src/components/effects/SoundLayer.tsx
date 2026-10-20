'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { playSound } from '@/lib/sound';

/**
 * Wires the optional UI sounds to the page: a soft tick when the pointer
 * lands on a link or button, a paper shuffle on every route change.
 * (playSound is a no-op unless the visitor turned sound on.)
 */
export default function SoundLayer() {
  const pathname = usePathname();

  useEffect(() => {
    let last: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest('a, button');
      if (el && el !== last) playSound('tick');
      last = el ?? null;
    };
    document.addEventListener('pointerover', onOver, { passive: true });
    return () => document.removeEventListener('pointerover', onOver);
  }, []);

  useEffect(() => {
    playSound('paper');
  }, [pathname]);

  return null;
}
