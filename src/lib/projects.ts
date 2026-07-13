import { promises as fs } from 'fs';
import path from 'path';
import type { Project } from '@/types';

export async function getProjects(): Promise<Project[]> {
  const filePath = path.join(process.cwd(), 'src/data/projects.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(jsonData);
}
