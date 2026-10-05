'use client';
import { useMemo, useState } from 'react';
import FieldCanvas from './FieldCanvas';
import ParticleField, { type FieldLayout } from './ParticleField';
import { FORMATION_VIEW, buildFormation, buildScatter, type FormationName } from './formations';
import { ACCENT } from '@/lib/constants';
import type { Domain } from '@/lib/projectMeta';

/** Each domain's figure is something you'd recognise from that field. */
export const DOMAIN_SHAPE: Record<Domain, FormationName> = {
  ai: 'network', // layers of neurons and weights
  systems: 'chip', // a CPU package: cores, pins, traces
  quant: 'candles', // a candlestick chart with a moving average
  web: 'browser', // a browser window exploded into DOM layers
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function layout({ width, height }: { width: number; height: number }): FieldLayout {
  return { x: 0, y: 0, scale: Math.min(width / 5.2, height / 5.2, 1) };
}

/** A project's particle figure: its domain's shape, with details seeded by its slug. */
export default function ProjectScene({
  slug,
  domain,
  still,
  className,
}: {
  slug: string;
  domain: Domain;
  still: boolean;
  className?: string;
}) {
  const [count] = useState(() => (window.innerWidth < 768 ? 5000 : 9000));
  const seed = hash(slug);
  const shape = DOMAIN_SHAPE[domain];
  const view = FORMATION_VIEW[shape];
  const target = useMemo(() => buildFormation(shape, count, seed), [shape, count, seed]);
  const initial = useMemo(() => buildScatter(count, 3.2, seed + 1), [count, seed]);

  return (
    <FieldCanvas className={className} still={still}>
      {(pointer) => (
        <ParticleField
          count={count}
          initial={initial}
          target={target}
          started
          still={still}
          ink="#0e0e0e"
          accent={ACCENT}
          size={2.5}
          accentRatio={0.03}
          opacity={0.62}
          heatTint={0.45}
          spin={0.09}
          tilt={view.tilt}
          oscillate={view.sway}
          repel={0.6}
          morphDuration={2}
          pointer={pointer}
          layout={layout}
        />
      )}
    </FieldCanvas>
  );
}
