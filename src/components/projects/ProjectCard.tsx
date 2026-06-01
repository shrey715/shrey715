'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { ACCENT } from '@/lib/constants';
import type { Project } from '@/types';

export const CARD_WIDTH_MOBILE = 320;
export const CARD_WIDTH_DESKTOP = 400;

interface ProjectCardProps {
  project: Project;
  index: number;
  /** Opens the destination-picker modal for projects that have a live demo. */
  onOpen: (project: Project) => void;
}

const getRepoInfo = (url: string) => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { user: parts[0], repo: parts[1] };
    }
  } catch {
    return null;
  }
  return null;
};

function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const repoInfo = getRepoInfo(project.link);
  const imageUrl = repoInfo
    ? `https://opengraph.githubassets.com/1/${repoInfo.user}/${repoInfo.repo}`
    : project.image;

  const hasDeploymentLink = !!project.deployment_link;

  const handleCardClick = () => {
    if (hasDeploymentLink) {
      onOpen(project);
    } else {
      window.open(project.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
      className="flex-shrink-0 w-[320px] md:w-[400px] py-2"
      style={{ scrollSnapAlign: 'start' }}
    >
      <motion.div
        onClick={handleCardClick}
        data-cursor={hasDeploymentLink ? 'View' : 'Open'}
        initial={{ boxShadow: '6px 6px 0 0 #0e0e0e' }}
        whileHover={{ x: -4, y: -4, boxShadow: `12px 12px 0 0 ${ACCENT}` }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="h-full bg-paper hard-border overflow-hidden cursor-pointer group"
      >
        {/* Index + meta bar */}
        <div className="flex items-stretch justify-between border-b-2 border-ink font-mono-label text-[10px]">
          <span className="px-3 py-2 border-r-2 border-ink">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="px-3 py-2 flex-1 flex items-center text-ink/50">
            {project.year || '—'}
          </span>
          {hasDeploymentLink ? (
            <span className="px-3 py-2 bg-accent text-paper flex items-center">LIVE</span>
          ) : project.status ? (
            <span className="px-3 py-2 border-l-2 border-ink flex items-center">{project.status}</span>
          ) : null}
        </div>

        {/* Image */}
        <div className="h-48 bg-paper-dim flex items-center justify-center border-b-2 border-ink relative overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`${project.title} preview`}
              draggable={false}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            <span className="text-6xl select-none grayscale">🚀</span>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex justify-between items-start gap-3 mb-3">
            <h3 className="text-xl font-bold leading-tight line-clamp-1">{project.title}</h3>
            <div className="flex-shrink-0 p-1.5 border-2 border-ink group-hover:bg-accent group-hover:border-accent transition-colors">
              <ArrowUpRight className="w-4 h-4 group-hover:text-paper transition-colors" />
            </div>
          </div>

          <p className="text-sm text-ink/70 leading-relaxed mb-4 line-clamp-2 min-h-[40px]">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.tech.slice(0, 4).map((t) => (
              <span key={t} className="px-2 py-1 font-mono-label text-[10px] border border-ink/40">
                {t}
              </span>
            ))}
            {project.tech.length > 4 && (
              <span className="px-2 py-1 font-mono-label text-[10px] text-ink/50">
                +{project.tech.length - 4}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default memo(ProjectCard);
