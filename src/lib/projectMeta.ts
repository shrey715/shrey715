// Client-safe project helpers (lib/projects.ts reads the filesystem, so it
// can't be imported from client components).
import type { Project } from '@/types';

export function getRepoInfo(url: string) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    if (parts.length >= 2) return { user: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
  return null;
}

/** GitHub's generated social card for the repo, falling back to a custom image. */
export function previewImage(project: Project) {
  const repo = getRepoInfo(project.link);
  return repo ? `https://opengraph.githubassets.com/1/${repo.user}/${repo.repo}` : project.image;
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
