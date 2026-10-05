// Client-safe project helpers (lib/projects.ts reads the filesystem, so it
// can't be imported from client components).
import type { Project } from '@/types';
import { mulberry32 } from '@/components/three/formations';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function getRepoInfo(url: string) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    if (parts.length >= 2) return { user: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
  return null;
}

/** Brand-styled cover generated at build time (works for private repos too). */
export function previewImage(project: Pick<Project, 'slug'>) {
  return `${basePath}/og/projects/${project.slug}/cover.png`;
}

export const DOT_COLS = 28;
export const DOT_ROWS = 9;

export interface DotCell {
  x: number;
  y: number;
  hot: boolean;
  /** Faint placeholder on an empty column, so the axis always reads. */
  base?: boolean;
}

/**
 * The dot-plot "specimen readout" on project cards. With real commit bins
 * each column's height is that slice's commit count; without (private repo,
 * no network) it falls back to a seeded wave so the card still has texture.
 */
export function dotPlotCells(seed: string, bins?: number[] | null): DotCell[] {
  const out: DotCell[] = [];
  if (bins && bins.length === DOT_COLS && Math.max(...bins) > 0) {
    const max = Math.max(...bins);
    bins.forEach((b, c) => {
      const filled = b === 0 ? 0 : Math.max(1, Math.round((b / max) * DOT_ROWS));
      if (filled === 0) out.push({ x: c, y: DOT_ROWS - 1, hot: false, base: true });
      for (let r = DOT_ROWS - filled; r < DOT_ROWS; r++) {
        out.push({ x: c, y: r, hot: r === DOT_ROWS - filled && b >= max * 0.6 });
      }
    });
    return out;
  }

  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const rand = mulberry32(h);
  const f1 = 0.15 + rand() * 0.35;
  const f2 = 0.2 + rand() * 0.5;
  const ph = rand() * Math.PI * 2;
  for (let c = 0; c < DOT_COLS; c++) {
    const level = (Math.sin(c * f1 + ph) * 0.5 + 0.5) * 0.6 + (Math.sin(c * f2) * 0.5 + 0.5) * 0.4;
    const filled = Math.round(level * DOT_ROWS);
    for (let r = 0; r < DOT_ROWS; r++) {
      if (DOT_ROWS - r <= filled) out.push({ x: c, y: r, hot: DOT_ROWS - r === filled && rand() > 0.55 });
    }
  }
  return out;
}

export type Domain = 'ai' | 'systems' | 'quant' | 'web';

export const DOMAINS: { id: Domain; label: string }[] = [
  { id: 'ai', label: 'AI / ML' },
  { id: 'systems', label: 'SYSTEMS' },
  { id: 'quant', label: 'QUANT' },
  { id: 'web', label: 'WEB' },
];

// Tech tag -> domain. A project belongs to every domain any of its tags hits.
const TAG_DOMAINS: Record<string, Domain> = {
  'Information Retrieval': 'ai',
  LangGraph: 'ai',
  MCP: 'ai',
  'Knowledge Graph': 'ai',
  PyTorch: 'ai',
  'Deep Learning': 'ai',
  Transformers: 'ai',
  NLP: 'ai',
  LLM: 'ai',
  'Multi-Agent': 'ai',
  Ollama: 'ai',
  CodeLlama: 'ai',
  'Gemini API': 'ai',
  XGBoost: 'ai',
  OpenCV: 'ai',
  C: 'systems',
  'C++': 'systems',
  Go: 'systems',
  Raft: 'systems',
  'Distributed Systems': 'systems',
  'Pub/Sub': 'systems',
  POSIX: 'systems',
  Sockets: 'systems',
  'Multi-threading': 'systems',
  Shell: 'systems',
  OpenSSL: 'systems',
  Networking: 'systems',
  UDP: 'systems',
  Cointegration: 'quant',
  'Kalman Filter': 'quant',
  'Statistical Arbitrage': 'quant',
  'Quantitative Finance': 'quant',
  Backtesting: 'quant',
  'Time Series': 'quant',
  TypeScript: 'web',
  JavaScript: 'web',
  'Next.js': 'web',
  React: 'web',
  'Node.js': 'web',
  Express: 'web',
  Flask: 'web',
  HTML: 'web',
  MySQL: 'web',
};

export function projectDomains(project: Project): Set<Domain> {
  const out = new Set<Domain>();
  for (const t of project.tech) {
    const d = TAG_DOMAINS[t];
    if (d) out.add(d);
  }
  return out;
}

/**
 * The project's main domain: whichever domain most of its tags point at.
 * Ties go to the earlier entry in DOMAINS (AI first). Untagged → systems.
 */
export function primaryDomain(project: Project): Domain {
  const tally = new Map<Domain, number>();
  for (const t of project.tech) {
    const d = TAG_DOMAINS[t];
    if (d) tally.set(d, (tally.get(d) ?? 0) + 1);
  }
  let best: Domain = 'systems';
  let n = 0;
  for (const { id } of DOMAINS) {
    const c = tally.get(id) ?? 0;
    if (c > n) {
      best = id;
      n = c;
    }
  }
  return best;
}
