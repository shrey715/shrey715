// Server-only: a small index of the site for the menu, the ⌘K palette and the
// HUD. Built once in the root layout and passed down as plain data.
import { promises as fs } from 'fs';
import path from 'path';
import { getProjects } from './projects';
import { getAllPosts } from './blog';
import { getLatestPush, type LatestPush } from './github';

export interface SiteIndex {
  projects: { slug: string; title: string; year?: string }[];
  posts: { slug: string; title: string; date: string }[];
  counts: { roles: number; tools: number; domains: number; projects: number; posts: number };
  latestPush: LatestPush | null;
}

export async function getSiteIndex(): Promise<SiteIndex> {
  const data = path.join(process.cwd(), 'src/data');
  const [projects, posts, skillsRaw, expRaw, latestPush] = await Promise.all([
    getProjects(),
    getAllPosts(),
    fs.readFile(path.join(data, 'skills.json'), 'utf-8'),
    fs.readFile(path.join(data, 'experience.json'), 'utf-8'),
    getLatestPush(),
  ]);
  const skills: { categories: { skills: string[] }[] } = JSON.parse(skillsRaw);
  const exp: { workExperience: unknown[]; leadership: unknown[] } = JSON.parse(expRaw);

  return {
    projects: projects.map((p) => ({ slug: p.slug, title: p.title, year: p.year })),
    posts: posts.map((p) => ({ slug: p.slug, title: p.title, date: p.date })),
    counts: {
      roles: exp.workExperience.length + exp.leadership.length,
      tools: skills.categories.reduce((n, c) => n + c.skills.length, 0),
      domains: skills.categories.length,
      projects: projects.length,
      posts: posts.length,
    },
    latestPush,
  };
}
