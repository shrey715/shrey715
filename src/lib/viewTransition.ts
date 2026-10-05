'use client';
// Same-document View Transitions on top of the Next app router.
//
// navigateWithTransition() starts document.startViewTransition and pushes the
// route; the transition's update callback stays pending until
// <ViewTransitionBridge> (mounted once in the root layout) sees the new
// pathname commit and resolves it in a layout effect — i.e. before paint, so
// the browser snapshots the *new* page. Elements sharing a
// `view-transition-name` across the two pages then morph into each other.

type Router = { push: (href: string, opts?: { scroll?: boolean }) => void };

let pending: (() => void) | null = null;
let lastTransitionNav = -Infinity;

/** Called by the bridge after every route commit. */
export function resolvePendingTransition() {
  pending?.();
  pending = null;
}

/**
 * True right after a view-transition navigation, so the route wipe can stand
 * down. Time-based rather than read-once: React dev mode runs effects twice.
 */
export function consumeTransitionNav() {
  return performance.now() - lastTransitionNav < 1500;
}

export function supportsViewTransitions() {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

export function navigateWithTransition(router: Router, href: string) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!supportsViewTransitions() || reduced) {
    router.push(href);
    return;
  }
  lastTransitionNav = performance.now();
  document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        pending = resolve;
        router.push(href);
        // Never hang the page if the route never commits (e.g. same URL).
        setTimeout(resolve, 2500);
      }),
  );
}
