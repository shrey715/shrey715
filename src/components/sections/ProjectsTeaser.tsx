'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Section, { Container } from '@/components/ui/Section';
import { ACCENT } from '@/lib/constants';
import type { Project } from '@/types';

interface ProjectsTeaserProps {
  projects: Project[];
}

// Uneven spans (12-col) so the featured grid reads as composed rather than
// a monotonous tile wall — mirrors the bento rhythm used in SkillsSection.
const SPANS = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-4', 'lg:col-span-4', 'lg:col-span-4', 'lg:col-span-12'];

export default function ProjectsTeaser({ projects }: ProjectsTeaserProps) {
  const featured = projects.filter((p) => p.featured);
  const total = projects.length;

  return (
    <Section id="projects">
      <Container>
        <SectionHeader index="04" kicker="SELECTED" title="PROJECTS" className="mb-10" />

        <div className="max-w-2xl mb-12">
          <p className="text-lg sm:text-xl font-medium leading-snug mb-8">
            <span className="text-accent font-bold">{String(total).padStart(2, '0')+" "}</span> shipped
            builds spanning distributed systems, quant research, and applied ML — the
            full index lives on its own page, with search that actually understands
            what you&apos;re looking for.
          </p>

          <Link href="/projects" data-cursor="Browse">
            <motion.span
              whileHover={{ x: -3, y: -3, boxShadow: `8px 8px 0 0 ${ACCENT}` }}
              initial={{ boxShadow: '5px 5px 0 0 #0e0e0e' }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="inline-flex items-center gap-3 px-6 py-4 bg-ink text-paper hard-border font-mono-label text-xs sm:text-sm"
            >
              VIEW ALL PROJECTS
              <ArrowUpRight size={18} />
            </motion.span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {featured.map((project, i) => (
            <FeaturedPanel key={project.id} project={project} index={i} span={SPANS[i] ?? 'lg:col-span-4'} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function FeaturedPanel({ project, index, span }: { project: Project; index: number; span: string }) {
  const num = String(index + 1).padStart(2, '0');

  return (
    <Link href="/projects" data-cursor="Open" className={span}>
      <motion.div
        initial={{ opacity: 0, y: 24, boxShadow: '0 0 0 0 transparent' }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: index * 0.07 }}
        whileHover={{ x: -4, y: -4, boxShadow: `8px 8px 0 0 ${ACCENT}` }}
        className="relative overflow-hidden p-6 min-h-[190px] h-full flex flex-col bg-paper text-ink hard-border cursor-pointer group"
      >
        {/* Oversized faded watermark index, fully contained in the top-right */}
        <span
          className="font-display absolute top-2 right-3 leading-none select-none pointer-events-none"
          style={{ fontSize: 'clamp(3.5rem, 7vw, 6rem)', color: 'rgba(14,14,14,0.06)' }}
          aria-hidden="true"
        >
          {num}
        </span>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono-label text-[11px] text-accent">{num}</span>
            <ArrowUpRight
              size={18}
              className="opacity-40 group-hover:opacity-100 group-hover:text-accent transition-all"
            />
          </div>

          <h4 className="font-display text-2xl sm:text-3xl leading-[0.9] mb-3">{project.title}</h4>

          <p className="text-sm text-ink/65 leading-relaxed line-clamp-2 mb-5">{project.description}</p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {project.tech.slice(0, 3).map((t) => (
              <span key={t} className="px-2.5 py-1 font-mono-label text-[10px] border border-ink/25 text-ink/70">
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
