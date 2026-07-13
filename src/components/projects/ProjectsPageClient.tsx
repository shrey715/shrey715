'use client';
import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { ArrowLeft, Search, X } from 'lucide-react';
import RegistrationMarks from '@/components/ui/RegistrationMarks';
import SectionHeader from '@/components/ui/SectionHeader';
import { Container } from '@/components/ui/Section';
import { useSectionNav } from '@/hooks/useSectionNav';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import type { Project } from '@/types';

interface ProjectsPageClientProps {
  projects: Project[];
}

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const { goToSection } = useSectionNav();
  const [query, setQuery] = useState('');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(projects, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'tech', weight: 0.35 },
          { name: 'description', weight: 0.25 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 3,
      }),
    [projects],
  );

  // Fuse scores a query as one fuzzy pattern, which falls apart on multi-word,
  // typo'd input ("kafak raftt") — the combined edit distance rarely clears
  // any single threshold. Matching each word independently and requiring all
  // of them to hit (AND) keeps per-word typo tolerance without that collapse,
  // and keeps a short/generic word (e.g. "agent") from single-handedly
  // dragging in unrelated projects.
  const results = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return projects;

    const matchSets = words.map((word) => new Set(fuse.search(word).map((r) => r.item.id)));
    return projects.filter((p) => matchSets.every((set) => set.has(p.id)));
  }, [fuse, query, projects]);

  return (
    <div className="relative bg-paper text-ink grid-lines border-t-2 border-ink overflow-hidden">
      <RegistrationMarks />

      <Container className="pt-28 sm:pt-36 pb-10">
        <button
          onClick={() => goToSection('projects')}
          className="inline-flex items-center gap-2 font-mono-label text-[11px] text-ink/60 hover:text-accent transition-colors mb-10"
        >
          <ArrowLeft size={14} /> BACK TO HOME
        </button>

        <SectionHeader index="ALL" kicker="FULL INDEX" title="PROJECTS" className="mb-10" />

        {/* Search */}
        <div className="flex items-center gap-3 hard-border bg-paper px-4 py-3.5">
          <Search size={18} className="text-ink/40 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH BY NAME, TECH, OR DESCRIPTION..."
            className="w-full bg-transparent outline-none font-mono-label text-xs sm:text-sm placeholder:text-ink/35"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="text-ink/40 hover:text-accent transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <p className="font-mono-label text-[11px] text-ink/45 mt-4">
          <span className="text-accent">{String(results.length).padStart(3, '0')}</span>
          {' / '}
          {String(projects.length).padStart(3, '0')} MATCHES
        </p>
      </Container>

      <Container className="pb-24 sm:pb-32">
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} onOpen={setActiveProject} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center hard-border">
            <p className="font-mono-label text-sm text-ink/50">
              NO MATCHES — TRY A DIFFERENT QUERY.
            </p>
          </div>
        )}
      </Container>

      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
    </div>
  );
}
