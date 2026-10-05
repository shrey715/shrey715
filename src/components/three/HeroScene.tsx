'use client';
import { useEffect, useMemo, useState } from 'react';
import FieldCanvas from './FieldCanvas';
import ParticleField, { type FieldLayout } from './ParticleField';
import { FORMATIONS, FORMATION_VIEW, buildFormation, buildScatter, buildTextFormation } from './formations';
import { ACCENT, HERO_READY_EVENT } from '@/lib/constants';

interface HeroSceneProps {
  /** Index into FORMATIONS. */
  index: number;
  started: boolean;
  still: boolean;
  scatter: React.RefObject<number>;
  className?: string;
}

// Sculpture sits to the right of the name on landscape screens, and above
// it (smaller) on portrait/mobile where the text stacks underneath.
function heroLayout({ width, height }: { width: number; height: number }): FieldLayout {
  if (width / height > 1.15) {
    return { x: width * 0.25, y: -height * 0.03, scale: Math.min(0.64, width / 14) };
  }
  return { x: 0, y: height * 0.21, scale: Math.min(width / 6.4, 0.6) };
}

const MONO_WIDTH = 4; // world units the SD monogram is sampled at
const MONO_GLYPH_HEIGHT = 5.2; // resulting cap height in world units (Anton "SD")

// During the preloader the monogram sits dead centre: ~half the viewport tall,
// or ~55% of its width on narrow screens.
function monogramLayout({ width, height }: { width: number; height: number }): FieldLayout {
  return { x: 0, y: height * 0.03, scale: Math.min((width * 0.55) / MONO_WIDTH, (height * 0.5) / MONO_GLYPH_HEIGHT) };
}

const FLAT: [number, number, number] = [0, 0, 0];

/**
 * The hero's particle figure. On a first visit it starts as the SD monogram
 * (formed while the Preloader counts), then — when the intro fires — flows
 * straight into the first hero shape. Repeat visits skip to the shapes.
 */
export default function HeroScene({ index, started, still, scatter, className }: HeroSceneProps) {
  const [count] = useState(() => (window.innerWidth < 768 ? 6000 : 11000));
  const [monogramPhase] = useState(
    () =>
      sessionStorage.getItem('preloaded') !== '1' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [monogram, setMonogram] = useState<{ positions: Float32Array; splitX: number | null } | null>(null);

  const targets = useMemo(() => FORMATIONS.map((f) => buildFormation(f.id, count)), [count]);
  const initial = useMemo(() => buildScatter(count), [count]);

  // Build the monogram once the display face is loaded (the sampler draws text).
  useEffect(() => {
    if (!monogramPhase) return;
    let cancelled = false;
    const family =
      getComputedStyle(document.documentElement).getPropertyValue('--font-anton').trim() || 'Impact, sans-serif';
    document.fonts
      .load(`260px ${family}`)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setMonogram(buildTextFormation('SD', count, family, MONO_WIDTH, 1));
      });
    return () => {
      cancelled = true;
    };
  }, [monogramPhase, count]);

  // Tell the Preloader the scene is real: either the monogram is built, or
  // (repeat visit / reduced motion) there's nothing to wait for.
  useEffect(() => {
    if (monogramPhase && !monogram) return;
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event(HERO_READY_EVENT)));
    return () => cancelAnimationFrame(id);
  }, [monogramPhase, monogram]);

  const inMonogram = monogramPhase && !started;
  const shape = FORMATIONS[index % FORMATIONS.length].id;
  const view = FORMATION_VIEW[shape];

  return (
    <FieldCanvas className={className} still={still}>
      {(pointer) => (
        <ParticleField
          count={count}
          initial={initial}
          target={inMonogram ? (monogram?.positions ?? initial) : targets[index % targets.length]}
          started={monogramPhase || started || still}
          still={still}
          ink="#0e0e0e"
          accent={ACCENT}
          size={count > 8000 ? 2.3 : 2.7}
          accentRatio={inMonogram ? 0 : 0.025}
          opacity={inMonogram ? 0.9 : 0.55}
          heatTint={0.45}
          spin={inMonogram ? 0 : 0.07}
          tilt={inMonogram ? FLAT : view.tilt}
          oscillate={!inMonogram && view.sway}
          splitX={inMonogram ? (monogram?.splitX ?? null) : null}
          repel={0.55}
          morphDuration={inMonogram ? 1.6 : 2.2}
          scatter={scatter}
          pointer={pointer}
          layout={inMonogram ? monogramLayout : heroLayout}
        />
      )}
    </FieldCanvas>
  );
}
