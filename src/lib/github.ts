// Build-time GitHub data. Server-only (used from server components and route
// handlers). Every call is cached in Next's data cache and fails soft: a
// private repo, a rate limit or no network just yields `null`, and callers
// fall back to their decorative defaults.

const OWNER = 'shrey715';
const API = 'https://api.github.com';

export interface RepoActivity {
  /** Commit counts in equal time bins across the repo's commit history. */
  bins: number[];
  commits: number;
  first: string;
  last: string;
}

export interface LatestPush {
  repo: string;
  at: string;
}

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json' };
  // Optional: lifts the 60 req/hr unauthenticated limit on CI/Vercel.
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function getJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: headers(),
      cache: 'force-cache',
      next: { revalidate: 60 * 60 * 6 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function repoPath(link: string): string | null {
  try {
    const [owner, repo] = new URL(link).pathname.split('/').filter(Boolean);
    return owner && repo ? `${owner}/${repo}` : null;
  } catch {
    return null;
  }
}

/** Last ≤100 commits, bucketed into `binCount` equal slices between first and last. */
export async function getRepoActivity(link: string, binCount = 28): Promise<RepoActivity | null> {
  const path = repoPath(link);
  if (!path) return null;
  const commits = await getJSON<{ commit: { author: { date: string } } }[]>(
    `${API}/repos/${path}/commits?per_page=100`,
  );
  if (!commits || commits.length === 0) return null;

  const times = commits.map((c) => Date.parse(c.commit.author.date)).filter(Number.isFinite).sort((a, b) => a - b);
  const t0 = times[0];
  const t1 = times[times.length - 1];
  const span = Math.max(t1 - t0, 1);
  const bins = new Array(binCount).fill(0);
  for (const t of times) bins[Math.min(binCount - 1, Math.floor(((t - t0) / span) * binCount))]++;

  return { bins, commits: times.length, first: new Date(t0).toISOString(), last: new Date(t1).toISOString() };
}

/** Most recent public push, for the "last push" readout. */
export async function getLatestPush(): Promise<LatestPush | null> {
  const events = await getJSON<{ type: string; repo: { name: string }; created_at: string }[]>(
    `${API}/users/${OWNER}/events/public?per_page=30`,
  );
  const push = events?.find((e) => e.type === 'PushEvent');
  return push ? { repo: push.repo.name.replace(`${OWNER}/`, ''), at: push.created_at } : null;
}
