import { promises as fs } from 'fs';
import path from 'path';
import type { Project } from '@/types';
import { slugify } from './slug';
import { getRepoActivity } from './github';

type RawProject = Omit<Project, 'slug' | 'activity'>;

/** All projects, newest first, each with a stable URL slug. */
export async function getProjects(): Promise<Project[]> {
  const filePath = path.join(process.cwd(), 'src/data/projects.json');
  const raw: RawProject[] = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  return raw.map((p) => ({ ...p, slug: slugify(p.title) }));
}

/** Projects plus real GitHub commit activity (null for private repos / failures). */
export async function getProjectsWithActivity(): Promise<Project[]> {
  const projects = await getProjects();
  const activity = await Promise.all(projects.map((p) => getRepoActivity(p.link)));
  return projects.map((p, i) => ({ ...p, activity: activity[i] }));
}

export async function getProjectBySlug(slug: string) {
  const projects = await getProjectsWithActivity();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return {
    project: projects[index],
    index,
    total: projects.length,
    prev: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}
