'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentProps } from 'react';
import { navigateWithTransition } from '@/lib/viewTransition';

/**
 * next/link that navigates inside a View Transition, so elements sharing a
 * `view-transition-name` morph between pages. Modified clicks (new tab etc.)
 * fall through to the browser untouched.
 */
export default function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  return (
    <Link
      href={href}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigateWithTransition(router, href);
      }}
    />
  );
}
