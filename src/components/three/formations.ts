// Point-cloud "specimens" for the ParticleField. Each generator fills a flat
// xyz Float32Array of `count` points, roughly bounded by a radius-2 sphere so
// every formation shares the same framing.

export type FormationName = 'cell' | 'helix' | 'network' | 'lattice';

export interface FormationMeta {
  id: FormationName;
  label: string;
  caption: string;
}

export const FORMATIONS: FormationMeta[] = [
  { id: 'cell', label: 'CELL', caption: 'SYSTEMS BIOLOGY' },
  { id: 'helix', label: 'DOUBLE HELIX', caption: 'NETWORK BIOLOGY' },
  { id: 'network', label: 'NEURAL NET', caption: 'DEEP LEARNING' },
  { id: 'lattice', label: 'MEM LATTICE', caption: 'LOW-LEVEL SYSTEMS' },
];

// Deterministic PRNG so server/client and every remount agree on layouts.
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  const u = Math.max(rand(), 1e-6);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

/** A membrane shell, a dense nucleus, and a few organelle clusters drifting between. */
function cell(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const organelles = Array.from({ length: 6 }, () => {
    const t = rand() * Math.PI * 2;
    const p = Math.acos(2 * rand() - 1);
    const r = 1.05 + rand() * 0.35;
    return [r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)];
  });
  const golden = Math.PI * (3 - Math.sqrt(5));
  const shell = Math.floor(count * 0.55);
  const nucleus = Math.floor(count * 0.25);

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < shell) {
      // Fibonacci sphere keeps the membrane evenly dotted — reads like a halftone.
      const yy = 1 - (i / (shell - 1)) * 2;
      const rr = Math.sqrt(1 - yy * yy);
      const th = golden * i;
      const r = 2 + gaussian(rand) * 0.03;
      x = Math.cos(th) * rr * r;
      y = yy * r;
      z = Math.sin(th) * rr * r;
    } else if (i < shell + nucleus) {
      const t = rand() * Math.PI * 2;
      const p = Math.acos(2 * rand() - 1);
      const r = 0.62 * Math.cbrt(rand());
      x = r * Math.sin(p) * Math.cos(t) + 0.25;
      y = r * Math.cos(p) + 0.1;
      z = r * Math.sin(p) * Math.sin(t);
    } else {
      const o = organelles[i % organelles.length];
      x = o[0] + gaussian(rand) * 0.12;
      y = o[1] + gaussian(rand) * 0.12;
      z = o[2] + gaussian(rand) * 0.12;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** Two phase-offset backbones joined by base-pair rungs. */
function helix(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const turns = 2.6;
  const height = 4.4;
  const radius = 0.95;
  const rungs = 34;
  const backbone = Math.floor(count * 0.7);

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < backbone) {
      const strand = i % 2;
      const t = rand();
      const a = t * turns * Math.PI * 2 + strand * Math.PI;
      const r = radius + gaussian(rand) * 0.05;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
      y = (t - 0.5) * height + gaussian(rand) * 0.03;
    } else {
      const k = Math.floor(rand() * rungs);
      const t = (k + 0.5) / rungs;
      const a = t * turns * Math.PI * 2;
      const s = rand() * 2 - 1; // across the rung
      x = Math.cos(a) * radius * s;
      z = Math.sin(a) * radius * s;
      y = (t - 0.5) * height + gaussian(rand) * 0.015;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** Fully-connected layers laid out along x: dense node clusters, sparse weight edges. */
function network(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const layers = [4, 7, 9, 7, 3];
  const nodes: number[][][] = layers.map((n, li) => {
    const x = (li / (layers.length - 1) - 0.5) * 4.2;
    return Array.from({ length: n }, (_, ni) => {
      const y = (n === 1 ? 0 : ni / (n - 1) - 0.5) * Math.min(3.6, n * 0.5);
      return [x, y, (rand() - 0.5) * 0.6];
    });
  });
  const nodeShare = Math.floor(count * 0.45);

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < nodeShare) {
      const layer = nodes[Math.floor(rand() * nodes.length)];
      const n = layer[Math.floor(rand() * layer.length)];
      x = n[0] + gaussian(rand) * 0.07;
      y = n[1] + gaussian(rand) * 0.07;
      z = n[2] + gaussian(rand) * 0.07;
    } else {
      const li = Math.floor(rand() * (nodes.length - 1));
      const a = nodes[li][Math.floor(rand() * nodes[li].length)];
      const b = nodes[li + 1][Math.floor(rand() * nodes[li + 1].length)];
      const t = rand();
      x = a[0] + (b[0] - a[0]) * t;
      y = a[1] + (b[1] - a[1]) * t;
      z = a[2] + (b[2] - a[2]) * t;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** A cube of addressable cells with a few "hot" rows lit along one face. */
function lattice(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const n = 11;
  const size = 3;
  const step = size / (n - 1);
  const edgeShare = Math.floor(count * 0.35);

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < count - edgeShare) {
      x = Math.floor(rand() * n) * step - size / 2;
      y = Math.floor(rand() * n) * step - size / 2;
      z = Math.floor(rand() * n) * step - size / 2;
      const j = gaussian(rand) * 0.018;
      x += j;
      y += j;
      z += j;
    } else {
      // Points along grid lines so the lattice reads as wired, not just dotted.
      const axis = Math.floor(rand() * 3);
      const a = Math.floor(rand() * n) * step - size / 2;
      const b = Math.floor(rand() * n) * step - size / 2;
      const t = rand() * size - size / 2;
      [x, y, z] = axis === 0 ? [t, a, b] : axis === 1 ? [a, t, b] : [a, b, t];
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

const GENERATORS: Record<FormationName, (count: number, rand: () => number) => Float32Array> = {
  cell,
  helix,
  network,
  lattice,
};

export function buildFormation(name: FormationName, count: number, seed = 7) {
  return GENERATORS[name](count, mulberry32(seed));
}

/** Loose cloud the particles assemble from on first load. */
export function buildScatter(count: number, radius = 9, seed = 3) {
  const rand = mulberry32(seed);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = rand() * Math.PI * 2;
    const p = Math.acos(2 * rand() - 1);
    const r = radius * (0.4 + rand() * 0.6);
    out[i * 3] = r * Math.sin(p) * Math.cos(t);
    out[i * 3 + 1] = r * Math.cos(p);
    out[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
  }
  return out;
}
