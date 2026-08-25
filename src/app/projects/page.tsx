import type { Metadata } from 'next';
import Footer from '@/components/sections/Footer';
import ProjectsPageClient from '@/components/projects/ProjectsPageClient';
import { getProjects } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Projects | Shreyas Deb',
  description: 'The full project index — systems, AI, and everything in between.',
  alternates: {
    canonical: '/projects',
  },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="relative overflow-x-hidden bg-paper">
      <ProjectsPageClient projects={projects} />
      <Footer />
    </main>
  );
}
