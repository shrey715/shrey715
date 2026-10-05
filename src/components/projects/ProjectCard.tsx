'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { ACCENT } from '@/lib/constants';
import { previewImage } from '@/lib/projectMeta';
import { projectTitleVT } from '@/lib/vtNames';
import TransitionLink from '@/components/ui/TransitionLink';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index: number;
}

/** Grid-view card: generated cover, title, pitch, stack. Opens the project's page. */
function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min((index % 3) * 0.08, 0.3) }}
      className="h-full py-2"
    >
      <TransitionLink href={`/projects/${project.slug}`} data-cursor="Open" className="block h-full">
        <motion.div
          initial={{ boxShadow: '6px 6px 0 0 #0e0e0e' }}
          whileHover={{ x: -4, y: -4, boxShadow: `12px 12px 0 0 ${ACCENT}` }}
          whileTap={{ x: -2, y: -2, scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="h-full bg-paper hard-border overflow-hidden group"
        >
          {/* Index + meta bar */}
          <div className="flex items-stretch justify-between border-b-2 border-ink font-mono-label text-[10px]">
            <span className="px-3 py-2 border-r-2 border-ink tabular-nums">{String(index + 1).padStart(2, '0')}</span>
            <data className="px-3 py-2 flex-1 flex items-center text-ink/50 tabular-nums">{project.year || '—'}</data>
            {project.deployment_link && <span className="px-3 py-2 bg-accent text-paper flex items-center">LIVE</span>}
          </div>

          {/* Generated cover */}
          <div className="aspect-[1200/630] bg-paper-dim border-b-2 border-ink relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage(project)}
              alt=""
              loading="lazy"
              draggable={false}
              className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="flex justify-between items-start gap-3 mb-3">
              <h3 className="text-xl font-bold leading-tight line-clamp-1" style={{ viewTransitionName: projectTitleVT(project.slug) }}>
                {project.title}
              </h3>
              <div className="flex-shrink-0 p-1.5 border-2 border-ink group-hover:bg-accent group-hover:border-accent transition-colors">
                <ArrowUpRight className="w-4 h-4 group-hover:text-paper transition-colors" />
              </div>
            </div>

            <p className="text-sm text-ink/70 leading-relaxed mb-4 line-clamp-2 min-h-[40px]">{project.description}</p>

            <div className="flex flex-wrap gap-2">
              {project.tech.slice(0, 4).map((t) => (
                <span key={t} className="px-2 py-1 font-mono-label text-[10px] border border-ink/40">
                  {t}
                </span>
              ))}
              {project.tech.length > 4 && (
                <span className="px-2 py-1 font-mono-label text-[10px] text-ink/50">+{project.tech.length - 4}</span>
              )}
            </div>
          </div>
        </motion.div>
      </TransitionLink>
    </motion.div>
  );
}

export default memo(ProjectCard);
