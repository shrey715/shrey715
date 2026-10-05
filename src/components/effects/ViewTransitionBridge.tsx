'use client';
import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { resolvePendingTransition } from '@/lib/viewTransition';

/** Resolves an in-flight view transition as soon as the new route commits. */
export default function ViewTransitionBridge() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    resolvePendingTransition();
  }, [pathname]);
  return null;
}
