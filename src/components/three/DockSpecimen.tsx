'use client';
import { useEffect, useMemo, useState } from 'react';
import FieldCanvas from './FieldCanvas';
import ParticleField, { type FieldLayout } from './ParticleField';
import { FORMATION_VIEW, buildFormation, buildScatter, buildTextFormation, type FormationName } from './formations';
import { ACCENT } from '@/lib/constants';

const COUNT = 1000;
const SHAPES: FormationName[] = ['cell', 'helix', 'network', 'chip', 'candles', 'browser'];

function layout({ width, height }: { width: number; height: number }): FieldLayout {
  return { x: 0, y: 0, scale: Math.min(width, height) / 5.4 };
}

/**
 * The hero's specimen, docked: a small particle figure living in the title
 * block that re-forms into whatever the current sheet is about. `shape` is a
 * formation name or "monogram"; null scatters it into a faint cloud.
 */
export default function DockSpecimen({ shape, still }: { shape: string | null; still: boolean }) {
  const scatter = useMemo(() => buildScatter(COUNT, 2.6, 41), []);
  const targets = useMemo(
    () => Object.fromEntries(SHAPES.map((s) => [s, buildFormation(s, COUNT, 13)])) as Record<FormationName, Float32Array>,
    [],
  );
  const [mono, setMono] = useState<Float32Array | null>(null);

  useEffect(() => {
    if (shape !== 'monogram' || mono) return;
    const family = getComputedStyle(document.documentElement).getPropertyValue('--font-anton').trim() || 'Impact';
    let cancelled = false;
    document.fonts.load(`260px ${family}`).catch(() => undefined).then(() => {
      if (!cancelled) setMono(buildTextFormation('SD', COUNT, family, 4.2).positions);
    });
    return () => {
      cancelled = true;
    };
  }, [shape, mono]);

  const isFormation = shape !== null && (SHAPES as string[]).includes(shape);
  const target =
    shape === 'monogram' && mono ? mono : isFormation ? targets[shape as FormationName] : scatter;
  const view = isFormation ? FORMATION_VIEW[shape as FormationName] : { tilt: [0, 0, 0] as [number, number, number], sway: false };

  return (
    <FieldCanvas className="absolute inset-0" still={still}>
      {(pointer) => (
        <ParticleField
          count={COUNT}
          initial={scatter}
          target={target}
          started
          still={still}
          ink="#0e0e0e"
          accent={ACCENT}
          size={2.8}
          accentRatio={0.04}
          opacity={shape ? 0.85 : 0.25}
          heatTint={0.3}
          spin={0.1}
          tilt={view.tilt}
          oscillate={view.sway}
          repel={0.3}
          morphDuration={1.4}
          pointer={pointer}
          layout={layout}
        />
      )}
    </FieldCanvas>
  );
}
