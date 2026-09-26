'use client';
import { useMemo, useState } from 'react';
import FieldCanvas from './FieldCanvas';
import ParticleField, { type FieldLayout } from './ParticleField';
import { FORMATIONS, buildFormation, buildScatter } from './formations';
import { ACCENT } from '@/lib/constants';

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

export default function HeroScene({ index, started, still, scatter, className }: HeroSceneProps) {
  const [count] = useState(() => (window.innerWidth < 768 ? 6000 : 11000));
  const targets = useMemo(() => FORMATIONS.map((f) => buildFormation(f.id, count)), [count]);
  const initial = useMemo(() => buildScatter(count), [count]);

  return (
    <FieldCanvas className={className} still={still}>
      {(pointer) => (
        <ParticleField
          count={count}
          initial={initial}
          target={targets[index % targets.length]}
          started={started || still}
          still={still}
          ink="#0e0e0e"
          accent={ACCENT}
          size={count > 8000 ? 2.3 : 2.7}
          accentRatio={0.025}
          opacity={0.55}
          heatTint={0.45}
          spin={0.07}
          repel={0.55}
          scatter={scatter}
          pointer={pointer}
          layout={heroLayout}
        />
      )}
    </FieldCanvas>
  );
}
