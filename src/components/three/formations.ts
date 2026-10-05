// Point-cloud "specimens" for the ParticleField. Each generator fills a flat
// xyz Float32Array of `count` points, roughly bounded by a radius-2 sphere so
// every formation shares the same framing.

export type FormationName = 'cell' | 'helix' | 'network' | 'chip' | 'candles' | 'browser';

export interface FormationMeta {
  id: FormationName;
  label: string;
  caption: string;
}

/** The hero's rotation: the research and engineering threads of the work. */
export const FORMATIONS: FormationMeta[] = [
  { id: 'cell', label: 'CELL', caption: 'SYSTEMS BIOLOGY' },
  { id: 'helix', label: 'DOUBLE HELIX', caption: 'NETWORK BIOLOGY' },
  { id: 'network', label: 'NEURAL NET', caption: 'DEEP LEARNING' },
  { id: 'chip', label: 'CPU DIE', caption: 'LOW-LEVEL SYSTEMS' },
];

/**
 * How each shape wants to be viewed. Flat shapes (chip lies in the xz plane;
 * chart and browser in xy) need a different resting tilt, and the 2D-ish ones
 * sway instead of spinning so they never turn edge-on.
 */
export const FORMATION_VIEW: Record<FormationName, { tilt: [number, number, number]; sway: boolean }> = {
  cell: { tilt: [0.18, 0, 0.08], sway: false },
  helix: { tilt: [0.18, 0, 0.08], sway: false },
  network: { tilt: [0.18, 0, 0.08], sway: false },
  chip: { tilt: [0.82, 0, 0], sway: false },
  candles: { tilt: [0.12, 0, 0], sway: true },
  browser: { tilt: [0.1, 0, 0], sway: true },
};

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

// ---- primitive sampler for the hard-edged shapes ---------------------------

type Vec3 = [number, number, number];
interface Prim {
  /** Relative share of particles (roughly the primitive's length/area). */
  w: number;
  at: (rand: () => number) => Vec3;
}

const line = (a: Vec3, b: Vec3, w = 1, jitter = 0.012): Prim => ({
  w: w * Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]),
  at: (r) => {
    const t = r();
    return [
      a[0] + (b[0] - a[0]) * t + (r() - 0.5) * jitter,
      a[1] + (b[1] - a[1]) * t + (r() - 0.5) * jitter,
      a[2] + (b[2] - a[2]) * t + (r() - 0.5) * jitter,
    ];
  },
});

/** Filled axis-aligned box (any extent may be ~0 for a plane). */
const box = (min: Vec3, max: Vec3, w = 1): Prim => {
  const dx = max[0] - min[0];
  const dy = max[1] - min[1];
  const dz = max[2] - min[2];
  return {
    w: w * Math.max(dx * dy + dy * dz + dx * dz, 0.002),
    at: (r) => [min[0] + r() * dx, min[1] + r() * dy, min[2] + r() * dz],
  };
};

/** Rectangle outline in the xy plane at depth z. */
const rectOutline = (x0: number, y0: number, x1: number, y1: number, z: number, w = 1): Prim[] => [
  line([x0, y0, z], [x1, y0, z], w),
  line([x1, y0, z], [x1, y1, z], w),
  line([x1, y1, z], [x0, y1, z], w),
  line([x0, y1, z], [x0, y0, z], w),
];

const disc = (cx: number, cy: number, z: number, radius: number, w = 1): Prim => ({
  w: w * Math.PI * radius * radius * 4,
  at: (r) => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * radius;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d, z];
  },
});

function sampleShapes(prims: Prim[], count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const total = prims.reduce((a, p) => a + p.w, 0);
  const cum: number[] = [];
  let acc = 0;
  for (const p of prims) cum.push((acc += p.w / total));
  for (let i = 0; i < count; i++) {
    const u = rand();
    let k = 0;
    while (k < cum.length - 1 && u > cum[k]) k++;
    const [x, y, z] = prims[k].at(rand);
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/**
 * A CPU package lying flat (xz plane, y up): the die, four raised cores,
 * gull-wing pins down every edge and traces routed from cores to pins.
 */
function chip(count: number, rand: () => number) {
  const S = 1.35; // die half-size
  const top = 0.1;
  const prims: Prim[] = [];

  // Die body: top face + rim.
  prims.push(box([-S, top, -S], [S, top, S], 0.28));
  prims.push(
    line([-S, top, -S], [S, top, -S], 0.8),
    line([S, top, -S], [S, top, S], 0.8),
    line([S, top, S], [-S, top, S], 0.8),
    line([-S, top, S], [-S, top, -S], 0.8),
  );
  prims.push(box([-S, -top, -S], [S, top, -S], 0.25), box([-S, -top, S], [S, top, S], 0.25));
  prims.push(box([-S, -top, -S], [-S, top, S], 0.25), box([S, -top, -S], [S, top, S], 0.25));

  // Four cores, raised and dense.
  const c = 0.5;
  const h = 0.32;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const cx = sx * c;
      const cz = sz * c;
      const k = 0.36;
      prims.push(box([cx - k, top + h, cz - k], [cx + k, top + h, cz + k], 5.5));
      prims.push(box([cx - k, top, cz - k], [cx + k, top + h, cz - k], 1.4), box([cx - k, top, cz + k], [cx + k, top + h, cz + k], 1.4));
      prims.push(box([cx - k, top, cz - k], [cx - k, top + h, cz + k], 1.4), box([cx + k, top, cz - k], [cx + k, top + h, cz + k], 1.4));
    }

  // Pins: 11 per side, out then down.
  const pins = 11;
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < pins; i++) {
      const t = -S * 0.82 + (i / (pins - 1)) * S * 1.64;
      const out = S + 0.28;
      const map = (a: number, y: number): Vec3 =>
        side === 0 ? [t, y, -a] : side === 1 ? [a, y, t] : side === 2 ? [t, y, a] : [-a, y, t];
      prims.push(line(map(S, 0), map(out, 0), 1.6), line(map(out, 0), map(out, -0.32), 1.6));
    }
  }

  // Traces from each core to the nearest edge's pins (manhattan routing).
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      for (let j = 0; j < 3; j++) {
        const px = sx * (0.15 + j * 0.28);
        prims.push(line([sx * c, top + 0.005, sz * (c + 0.36)], [sx * c, top + 0.005, sz * (S - 0.06)], 0.5));
        prims.push(line([px, top + 0.005, sz * (S - 0.06)], [sx * c, top + 0.005, sz * (S - 0.06)], 0.35));
        const pz = sz * (0.15 + j * 0.28);
        prims.push(line([sx * (c + 0.36), top + 0.005, pz], [sx * (S - 0.06), top + 0.005, pz], 0.5));
      }
    }

  return sampleShapes(prims, count, rand);
}

/** A run of 3D candlesticks (bodies + wicks) with a moving-average line threaded through. */
function candles(count: number, rand: () => number) {
  const n = 16;
  const ohlc: { o: number; c: number; hi: number; lo: number }[] = [];
  let p = 0;
  for (let i = 0; i < n; i++) {
    const o = p;
    const c = o + gaussian(rand) * 0.32 + 0.05;
    ohlc.push({ o, c, hi: Math.max(o, c) + Math.abs(gaussian(rand)) * 0.16, lo: Math.min(o, c) - Math.abs(gaussian(rand)) * 0.16 });
    p = c;
  }
  const lo = Math.min(...ohlc.map((d) => d.lo));
  const hi = Math.max(...ohlc.map((d) => d.hi));
  const Y = (v: number) => -1.25 + ((v - lo) / (hi - lo || 1)) * 2.5;
  const X = (i: number) => -2.05 + (i / (n - 1)) * 4.1;
  const w = 0.11;

  const prims: Prim[] = [];
  ohlc.forEach((d, i) => {
    const x = X(i);
    const y0 = Y(Math.min(d.o, d.c));
    const y1 = Math.max(Y(Math.max(d.o, d.c)), y0 + 0.05);
    prims.push(box([x - w, y0, -w], [x + w, y1, w], 2.4));
    prims.push(line([x, Y(d.lo), 0], [x, Y(d.hi), 0], 0.9, 0.008));
  });
  // 3-period moving average of closes, as a smooth polyline.
  const ma = ohlc.map((_, i) => {
    const win = ohlc.slice(Math.max(0, i - 2), i + 1);
    return win.reduce((a, d) => a + d.c, 0) / win.length;
  });
  for (let i = 0; i < n - 1; i++) prims.push(line([X(i), Y(ma[i]), 0.22], [X(i + 1), Y(ma[i + 1]), 0.22], 0.7, 0.02));
  // Axis + faint gridlines.
  prims.push(line([-2.2, -1.42, 0], [2.2, -1.42, 0], 0.9));
  for (const gy of [-0.6, 0.2, 1.0]) prims.push(line([-2.2, gy, -0.3], [2.2, gy, -0.3], 0.12, 0.004));

  return sampleShapes(prims, count, rand);
}

/** A browser window exploded into depth layers: chrome at the back, layout in the middle, content in front. */
function browser(count: number, rand: () => number) {
  const L = -2.05;
  const R = 2.05;
  const T = 1.4;
  const B = -1.4;
  const back = -0.6;
  const mid = 0;
  const front = 0.6;
  const prims: Prim[] = [];

  // Back: window frame, title bar, traffic lights, address bar.
  prims.push(...rectOutline(L, B, R, T, back, 1.2));
  prims.push(line([L, T - 0.32, back], [R, T - 0.32, back], 1));
  for (let i = 0; i < 3; i++) prims.push(disc(L + 0.22 + i * 0.2, T - 0.16, back, 0.055, 1.4));
  prims.push(...rectOutline(-1.0, T - 0.24, 1.6, T - 0.08, back, 0.8));

  // Middle: page layout — nav, hero block, image placeholder, three cards.
  prims.push(box([L + 0.15, 0.78, mid], [R - 0.15, 0.9, mid], 0.9));
  prims.push(box([L + 0.15, -0.05, mid], [0.35, 0.62, mid], 0.55));
  prims.push(...rectOutline(0.55, -0.05, R - 0.15, 0.62, mid, 0.8));
  prims.push(line([0.55, -0.05, mid], [R - 0.15, 0.62, mid], 0.6), line([0.55, 0.62, mid], [R - 0.15, -0.05, mid], 0.6));
  for (let i = 0; i < 3; i++) {
    const x0 = L + 0.15 + i * 1.33;
    prims.push(...rectOutline(x0, B + 0.15, x0 + 1.18, -0.3, mid, 0.7));
  }

  // Front: text lines, a button, card captions.
  [0.48, 0.36, 0.24].forEach((y, i) => prims.push(line([L + 0.3, y, front], [L + 0.3 + (i === 2 ? 1.1 : 1.9), y, front], 1.1, 0.02)));
  prims.push(box([L + 0.3, 0.02, front], [L + 0.95, 0.12, front], 1.2));
  for (let i = 0; i < 3; i++) {
    const x0 = L + 0.3 + i * 1.33;
    prims.push(line([x0, -0.62, front], [x0 + 0.85, -0.62, front], 0.6, 0.02), line([x0, -0.78, front], [x0 + 0.6, -0.78, front], 0.6, 0.02));
  }

  return sampleShapes(prims, count, rand);
}

const GENERATORS: Record<FormationName, (count: number, rand: () => number) => Float32Array> = {
  cell,
  helix,
  network,
  chip,
  candles,
  browser,
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


/**
 * Samples filled pixels of `text` (drawn with `font`) into world space at the
 * given width. Browser-only (2D canvas). `splitAfter` returns the world-x of
 * the boundary after that many leading characters — used to colour the "D"
 * of the SD monogram.
 */
export function buildTextFormation(
  text: string,
  count: number,
  font: string,
  worldWidth: number,
  splitAfter = 0,
  seed = 11,
): { positions: Float32Array; splitX: number | null } {
  const rand = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { positions, splitX: null };

  const fontSize = 260;
  const pad = 10;
  ctx.font = `${fontSize}px ${font}`;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = Math.ceil(fontSize * 1.1);
  canvas.width = w;
  canvas.height = h;
  ctx.font = `${fontSize}px ${font}`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';
  ctx.fillText(text, pad, h / 2);

  const data = ctx.getImageData(0, 0, w, h).data;
  const filled: number[] = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (data[(y * w + x) * 4 + 3] > 128) filled.push(x, y);
    }
  }
  if (filled.length === 0) return { positions, splitX: null };

  const scale = worldWidth / w;
  const pairs = filled.length / 2;
  for (let i = 0; i < count; i++) {
    const k = Math.floor(rand() * pairs) * 2;
    positions[i * 3] = (filled[k] + rand() * 2 - w / 2) * scale;
    positions[i * 3 + 1] = -(filled[k + 1] + rand() * 2 - h / 2) * scale;
    positions[i * 3 + 2] = (rand() - 0.5) * 0.18;
  }

  let splitX: number | null = null;
  if (splitAfter > 0) {
    const lead = ctx.measureText(text.slice(0, splitAfter)).width;
    splitX = (pad + lead - w / 2) * scale;
  }
  return { positions, splitX };
}
