// The site's motion system. Every animation picks from these instead of
// inventing its own numbers — one vocabulary, so the page feels choreographed.
//
// The signature verb is "plot": things are traced as outlines (like a pen
// plotter drafting a sheet), then inked in.

/** Expo-out: entrances, reveals, anything settling into place. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
/** Symmetric in-out: transitions between two states (wipes, morphs). */
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;

/** Durations in seconds. */
export const DUR = {
  /** Micro-interactions: hovers, toggles. */
  fast: 0.3,
  /** Standard entrance / reveal. */
  base: 0.7,
  /** A full plot (trace, then ink). */
  plot: 1.4,
} as const;

/** Stagger between siblings (seconds). */
export const STAGGER = 0.06;

/** Default viewport trigger for scroll-in reveals. */
export const VIEWPORT = { once: true, margin: '-12% 0px' } as const;

/**
 * The site's standard entrance — a plotter pass: the element is wiped in
 * left-to-right (clip-path), as if the pen were laying it down. Spread onto
 * any motion element: <motion.li {...plotIn(i * STAGGER)} />.
 * The clip box is padded so hard shadows and focus rings aren't cut off, and
 * starts with a hair-thin visible sliver: a *fully* clipped element never
 * registers as intersecting, so the reveal would never fire.
 */
export function plotIn(delay = 0) {
  return {
    initial: { clipPath: 'inset(-12% 99.4% -12% -12%)', x: -8 },
    whileInView: { clipPath: 'inset(-12% -12% -12% -12%)', x: 0 },
    viewport: VIEWPORT,
    transition: { duration: DUR.base, ease: EASE_OUT, delay },
  } as const;
}
