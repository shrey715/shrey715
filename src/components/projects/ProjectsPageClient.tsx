'use client';
import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, X } from 'lucide-react';
import RegistrationMarks from '@/components/ui/RegistrationMarks';
import SectionHeader from '@/components/ui/SectionHeader';
import { Container } from '@/components/ui/Section';
import { useSectionNav } from '@/hooks/useSectionNav';
import { DOMAINS, projectDomains, type Domain } from '@/lib/projectMeta';
import { EASE_OUT } from '@/lib/constants';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import ProjectIndex from './ProjectIndex';
import type { Project } from '@/types';

interface ProjectsPageClientProps {
  projects: Project[];
}

type View = 'index' | 'grid';

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const { goToSection } = useSectionNav();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<Domain | 'all'>('all');
  const [view, setView] = useState<View>('index');
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

  const domainsById = useMemo(() => new Map(projects.map((p) => [p.id, projectDomains(p)])), [projects]);
  const numbers = useMemo(() => new Map(projects.map((p, i) => [p.id, i + 1])), [projects]);

  // Fuse scores a query as one fuzzy pattern, which falls apart on multi-word,
  // typo'd input ("kafak raftt") — the combined edit distance rarely clears
  // any single threshold. Matching each word independently and requiring all
  // of them to hit (AND) keeps per-word typo tolerance without that collapse,
  // and keeps a short/generic word (e.g. "agent") from single-handedly
  // dragging in unrelated projects.
  const searched = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return projects;
    const matchSets = words.map((word) => new Set(fuse.search(word).map((r) => r.item.id)));
    return projects.filter((p) => matchSets.every((set) => set.has(p.id)));
  }, [fuse, query, projects]);

  const results = useMemo(
    () => (domain === 'all' ? searched : searched.filter((p) => domainsById.get(p.id)?.has(domain))),
    [searched, domain, domainsById],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: searched.length };
    for (const d of DOMAINS) c[d.id] = searched.filter((p) => domainsById.get(p.id)?.has(d.id)).length;
    return c;
  }, [searched, domainsById]);

  const years = projects.map((p) => Number(p.year)).filter(Boolean);
  const stats = [
    { k: 'TOTAL', v: String(projects.length).padStart(2, '0') },
    { k: 'SPAN', v: `${Math.min(...years)}—${String(Math.max(...years)).slice(2)}` },
    { k: 'LIVE', v: String(projects.filter((p) => p.deployment_link).length).padStart(2, '0') },
  ];

  const chip = (active: boolean) =>
    `shrink-0 inline-flex items-center gap-1.5 px-3 py-2 font-mono-label text-[10px] border-2 transition-colors active:scale-[0.97] ${
      active ? 'bg-ink text-paper border-ink' : 'border-ink/20 hover:border-ink'
    }`;

  return (
    <div className="relative bg-paper text-ink grid-lines border-t-2 border-ink">
      <RegistrationMarks />

      <Container className="pt-28 sm:pt-36 pb-12">
        <button
          onClick={() => goToSection('projects')}
          className="inline-flex items-center gap-2 font-mono-label text-[11px] text-ink/60 hover:text-accent transition-colors mb-10"
        >
          <ArrowLeft size={14} /> BACK TO HOME
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end gap-8">
          <SectionHeader index="ALL" kicker="FULL INDEX" title="PROJECTS" className="flex-1 min-w-0" />
          <motion.dl
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE_OUT }}
            className="grid grid-cols-3 hard-border bg-paper lg:mb-4 shrink-0"
          >
            {stats.map((s, i) => (
              <div key={s.k} className={`px-5 py-3 ${i > 0 ? 'border-l-2 border-ink' : ''}`}>
                <dt className="font-mono-label text-[9px] text-ink/45">{s.k}</dt>
                <dd className="font-display text-3xl leading-none mt-1 tabular-nums">{s.v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
        <p className="mt-6 max-w-xl text-ink/70 leading-relaxed text-pretty">
          Retrieval engines, distributed logs, quant backtesters, shells and the odd web app — everything
          I&apos;ve shipped, newest first. Open a row for the write-up.
        </p>
      </Container>

      {/* Controls — pinned while browsing the list */}
      <div className="sticky top-0 z-30 bg-paper/92 backdrop-blur-sm border-y-2 border-ink">
        <Container className="py-3 pr-20 sm:pr-24 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0 border-2 border-ink/20 focus-within:border-accent px-3 py-2 transition-colors bg-paper">
            <Search size={16} className="text-ink/40 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH NAME, TECH, DESCRIPTION…"
              aria-label="Search projects"
              className="w-full min-w-0 bg-transparent outline-none font-mono-label text-[11px] placeholder:text-ink/35"
            />
            <span className="shrink-0 font-mono-label text-[10px] tabular-nums">
              <span className="text-accent">{String(results.length).padStart(2, '0')}</span>
              <span className="text-ink/40">/{String(projects.length).padStart(2, '0')}</span>
            </span>
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" className="text-ink/40 hover:text-accent shrink-0">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-0.5" role="group" aria-label="Filter by domain">
            <button type="button" onClick={() => setDomain('all')} aria-pressed={domain === 'all'} className={chip(domain === 'all')}>
              ALL <span className="opacity-50 tabular-nums">{counts.all}</span>
            </button>
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDomain(d.id)}
                aria-pressed={domain === d.id}
                className={chip(domain === d.id)}
              >
                {d.label} <span className="opacity-50 tabular-nums">{counts[d.id]}</span>
              </button>
            ))}
            <span className="w-px h-6 bg-ink/20 mx-1 shrink-0" aria-hidden="true" />
            <div className="flex shrink-0 border-2 border-ink" role="group" aria-label="View">
              {(['index', 'grid'] as View[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`px-3 py-1.5 font-mono-label text-[10px] transition-colors ${
                    view === v ? 'bg-accent text-paper' : 'hover:bg-ink/5'
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <Container className="pt-10 pb-24 sm:pb-32">
        {results.length === 0 ? (
          <div className="py-24 text-center hard-border bg-paper">
            <p className="font-mono-label text-sm text-ink/50">NO MATCHES — TRY ANOTHER QUERY OR FILTER.</p>
            <button
              onClick={() => {
                setQuery('');
                setDomain('all');
              }}
              className="mt-5 font-mono-label text-[11px] underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
            >
              RESET
            </button>
          </div>
        ) : view === 'index' ? (
          <div className="border-b-2 border-ink">
            <ProjectIndex projects={results} numbers={numbers} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={(numbers.get(project.id) ?? 1) - 1}
                onOpen={setActiveProject}
              />
            ))}
          </div>
        )}
      </Container>

      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
    </div>
  );
}
