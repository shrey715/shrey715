'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Plus } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { EASE_OUT } from '@/lib/constants';
import { previewImage } from '@/lib/projectMeta';
import CursorPreview, { type PreviewItem } from '@/components/ui/CursorPreview';
import type { Project } from '@/types';

interface ProjectIndexProps {
  projects: Project[];
  /** Global numbering (position in the full list), keyed by project id. */
  numbers: Map<string, number>;
}

/**
 * Editorial index: projects grouped by year under pinned year labels. Rows
 * expand in place to show the write-up and links; on hover-capable screens
 * a preview card of the repo trails the cursor.
 */
export default function ProjectIndex({ projects, numbers }: ProjectIndexProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Project | null>(null);
  const hoveredSrc = hovered && !openId ? previewImage(hovered) : undefined;
  const preview: PreviewItem | null =
    hovered && hoveredSrc ? { id: hovered.id, src: hoveredSrc, label: hovered.title } : null;

  const groups = new Map<string, Project[]>();
  for (const p of projects) {
    const y = p.year ?? '—';
    if (!groups.has(y)) groups.set(y, []);
    groups.get(y)!.push(p);
  }

  return (
    <div onMouseLeave={() => setHovered(null)}>
      {[...groups.entries()].map(([year, items]) => (
        <section key={year} className="grid lg:grid-cols-12 gap-x-6 border-t-2 border-ink">
          <div className="lg:col-span-2 pt-5 pb-3 lg:pb-10">
            <div className="lg:sticky lg:top-40 flex lg:flex-col items-baseline lg:items-start gap-3">
              <span className="font-display text-5xl lg:text-7xl leading-none">{year}</span>
              <span className="font-mono-label text-[10px] text-ink/45 tabular-nums">
                [{String(items.length).padStart(2, '0')}]
              </span>
            </div>
          </div>

          <ul className="lg:col-span-10">
            <AnimatePresence initial={false}>
              {items.map((p) => (
                <IndexRow
                  key={p.id}
                  project={p}
                  number={numbers.get(p.id) ?? 0}
                  open={openId === p.id}
                  onToggle={() => setOpenId((id) => (id === p.id ? null : p.id))}
                  onHover={setHovered}
                />
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}

      <CursorPreview item={preview} />
    </div>
  );
}

function IndexRow({
  project,
  number,
  open,
  onToggle,
  onHover,
}: {
  project: Project;
  number: number;
  open: boolean;
  onToggle: () => void;
  onHover: (p: Project | null) => void;
}) {
  const num = String(number).padStart(2, '0');

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className={`border-b border-ink/20 last:border-b-0 transition-colors duration-300 ${open ? 'bg-ink text-paper' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={() => onHover(project)}
        onFocus={() => onHover(null)}
        aria-expanded={open}
        data-cursor={open ? 'CLOSE' : 'READ'}
        className="group relative w-full text-left grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,34%)_auto] items-center gap-x-4 px-3 sm:px-4 py-5 sm:py-6 overflow-hidden"
      >
        {/* Accent rule that draws in along the bottom on hover */}
        <span
          aria-hidden="true"
          className={`absolute left-0 bottom-0 h-[3px] w-full bg-accent origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? 'scale-x-0' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        />
        <span className={`font-mono-label text-[11px] tabular-nums ${open ? 'text-accent' : 'text-ink/45 group-hover:text-accent'} transition-colors`}>
          {num}
        </span>
        <span className="min-w-0">
          <span
            className="block font-display leading-[0.9] truncate transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2"
            style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)' }}
          >
            {project.title}
          </span>
        </span>
        <span className="hidden md:flex flex-wrap justify-end gap-1.5">
          {project.tech.slice(0, 3).map((t) => (
            <span
              key={t}
              className={`px-2 py-0.5 font-mono-label text-[9px] border transition-colors ${
                open ? 'border-paper/30 text-paper/70' : 'border-ink/20 text-ink/60'
              }`}
            >
              {t}
            </span>
          ))}
        </span>
        <span className="flex items-center gap-2">
          {project.deployment_link && (
            <span className="hidden sm:inline px-1.5 py-0.5 bg-accent text-paper font-mono-label text-[9px]">LIVE</span>
          )}
          <Plus
            size={20}
            className={`transition-transform duration-300 ${open ? 'rotate-45 text-accent' : 'group-hover:rotate-90'}`}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="grid md:grid-cols-[3rem_1fr] gap-x-4 px-3 sm:px-4 pb-8">
              <div className="hidden md:block" />
              <div className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-8 items-end">
                <div>
                  <p className="text-paper/80 leading-relaxed max-w-[68ch] text-pretty">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-5">
                    {project.tech.map((t) => (
                      <span key={t} className="px-2 py-0.5 font-mono-label text-[9px] border border-paper/25 text-paper/70">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 bg-paper text-ink font-mono-label text-[11px] hover:bg-accent hover:text-paper active:scale-[0.97] transition-[color,background-color,transform]"
                  >
                    <FaGithub size={15} /> SOURCE <ArrowUpRight size={14} />
                  </a>
                  {project.deployment_link && (
                    <a
                      href={project.deployment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-3 bg-accent text-paper font-mono-label text-[11px] hover:bg-paper hover:text-ink active:scale-[0.97] transition-[color,background-color,transform]"
                    >
                      <ExternalLink size={15} /> LIVE DEMO
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
