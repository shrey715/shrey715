'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Section, { Container } from '@/components/ui/Section';
import RegistrationMarks from '@/components/ui/RegistrationMarks';
import { ACCENT } from '@/lib/constants';
import TransitionLink from '@/components/ui/TransitionLink';
import DotPlot, { activityCaption } from '@/components/projects/DotPlot';
import { projectTitleVT } from '@/lib/vtNames';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Project } from '@/types';

interface ProjectsTeaserProps {
  projects: Project[];
}

// Uneven spans (12-col) for the stacked (below-lg) grid fallback.
const SPANS = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-4', 'lg:col-span-4', 'lg:col-span-4', 'lg:col-span-12'];

export default function ProjectsTeaser({ projects }: ProjectsTeaserProps) {
  const featured = projects.filter((p) => p.featured);

  return (
    <div id="projects">
      <PinnedGallery projects={featured} total={projects.length} />

      {/* Below lg: the composed grid — pinned horizontal scroll is a desktop move. */}
      <Section className="lg:hidden">
        <Container>
          <SectionHeader index="04" kicker="SELECTED" title="PROJECTS" className="mb-10" />
          <ViewAllButton className="mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {featured.map((project, i) => (
              <FeaturedPanel key={project.id} project={project} index={i} span={SPANS[i] ?? ''} />
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}

function ViewAllButton({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <Link href="/projects" data-cursor="Browse">
        <motion.span
          whileHover={{ x: -3, y: -3, boxShadow: `8px 8px 0 0 ${ACCENT}` }}
          whileTap={{ scale: 0.97 }}
          initial={{ boxShadow: '5px 5px 0 0 #0e0e0e' }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="inline-flex items-center gap-3 px-6 py-4 bg-ink text-paper hard-border font-mono-label text-xs sm:text-sm"
        >
          VIEW ALL PROJECTS
          <ArrowUpRight size={18} />
        </motion.span>
      </Link>
    </div>
  );
}

/**
 * Vertical scroll drives a horizontal track: the section pins for exactly
 * as long as the track needs to slide past, so scroll distance == travel.
 */
function PinnedGallery({ projects, total }: { projects: Project[]; total: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, (v) => -v * distance);
  const bar = useTransform(smooth, [0, 1], [0, 1]);

  // Shear the cards a touch with scroll speed, so the track feels like it has mass.
  const velocity = useSpring(useVelocity(scrollYProgress), { stiffness: 300, damping: 40 });
  const skewX = useTransform(velocity, [-1.5, 1.5], [5, -5], { clamp: true });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(projects.length - 1, Math.floor(v * projects.length)));
  });

  return (
    <section
      ref={sectionRef}
      aria-label="Selected projects"
      className="hidden lg:block relative bg-paper text-ink border-t-2 border-ink"
      style={{ height: `calc(100dvh + ${distance}px)` }}
    >
      <div className="sticky top-0 h-dvh overflow-hidden grid-lines flex flex-col">
        <RegistrationMarks />

        <Container className="pt-20 xl:pt-24 flex items-end justify-between gap-8">
          <SectionHeader index="04" kicker="SELECTED" title="PROJECTS" className="flex-1 min-w-0" />
          <div className="flex flex-col items-end gap-5 pb-3 shrink-0">
            <span className="font-mono-label text-[11px] text-ink/50 tabular-nums">
              <span className="text-accent">{String(active + 1).padStart(2, '0')}</span>
              {' / '}
              {String(projects.length).padStart(2, '0')}
            </span>
            <ViewAllButton />
          </div>
        </Container>

        <div className="flex-1 flex items-center min-h-0">
          <motion.div
            ref={trackRef}
            style={{ x, paddingInline: 'max(24px, calc((100vw - 1500px) / 2 + 24px))' }}
            className="flex gap-6 will-change-transform"
          >
            {projects.map((project, i) => (
              <motion.div key={project.id} style={{ skewX }} className="shrink-0">
                <GalleryCard project={project} index={i} />
              </motion.div>
            ))}
            <Link
              href="/projects"
              data-cursor="Browse"
              className="group shrink-0 w-[min(30vw,420px)] h-[min(56vh,520px)] hard-border border-dashed flex flex-col items-center justify-center gap-4 hover:bg-ink hover:text-paper transition-colors"
            >
              <ArrowUpRight size={56} strokeWidth={1.5} className="group-hover:text-accent transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              <span className="font-display text-5xl">ALL WORK</span>
              <span className="font-mono-label text-[11px] opacity-60">{total} PROJECTS · ARCHIVE</span>
            </Link>
          </motion.div>
        </div>

        <Container className="pb-8">
          <div className="h-1.5 bg-ink/10 border border-ink/20">
            <motion.div style={{ scaleX: bar }} className="h-full bg-accent origin-left" />
          </div>
          <p className="font-mono-label text-[10px] text-ink/45 mt-3">KEEP SCROLLING — THE TRACK MOVES SIDEWAYS</p>
        </Container>
      </div>
    </section>
  );
}

/** Long titles step down in size so they hold to two clean lines. */
function titleSize(title: string) {
  if (title.length <= 10) return 'clamp(2.4rem, 3.6vw, 3.8rem)';
  if (title.length <= 16) return 'clamp(2.1rem, 3vw, 3.2rem)';
  return 'clamp(1.8rem, 2.4vw, 2.6rem)';
}

function GalleryCard({ project, index }: { project: Project; index: number }) {
  const num = String(index + 1).padStart(2, '0');
  const caption = activityCaption(project);
  const prefersReducedMotion = useReducedMotion();

  // Cursor tilt: springs keep it weighty rather than twitchy.
  const tx = useMotionValue(0.5);
  const ty = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(ty, [0, 1], [5, -5]), { stiffness: 160, damping: 20 });
  const rotateY = useSpring(useTransform(tx, [0, 1], [-6, 6]), { stiffness: 160, damping: 20 });
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    tx.set((e.clientX - r.left) / r.width);
    ty.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    tx.set(0.5);
    ty.set(0.5);
  };

  return (
    <TransitionLink
      href={`/projects/${project.slug}`}
      data-cursor="Open"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="block [perspective:1000px]"
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="group relative flex flex-col w-[min(38vw,560px)] h-[min(56vh,520px)] p-7 bg-paper text-ink hard-border overflow-hidden transition-[box-shadow] duration-300 hover:shadow-[8px_8px_0_0_var(--color-accent)]"
      >
        {/* Ink flood that rises from the bottom on hover */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-ink origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />

        <div className="relative z-10 flex items-center justify-between font-mono-label text-[11px]">
          <span className="text-accent tabular-nums">{num}</span>
          <span className="flex items-center gap-3 text-ink/50 group-hover:text-paper/60 transition-colors">
            {project.year && <data className="tabular-nums">{project.year}</data>}
            <ArrowUpRight size={18} className="text-ink group-hover:text-accent transition-all group-hover:rotate-45" />
          </span>
        </div>

        <div className="relative z-10 mt-6">
          <DotPlot project={project} invertOnHover />
          {caption && (
            <span className="block mt-2 font-mono-label text-[9px] text-ink/40 group-hover:text-paper/45 transition-colors">
              {caption}
            </span>
          )}
        </div>

        <h3
          className="relative z-10 font-display mt-auto leading-[0.9] text-balance group-hover:text-paper transition-colors"
          style={{ fontSize: titleSize(project.title), viewTransitionName: projectTitleVT(project.slug) }}
        >
          {project.title}
        </h3>
        <p className="relative z-10 text-sm leading-relaxed mt-3 line-clamp-3 text-ink/65 group-hover:text-paper/70 transition-colors">
          {project.description}
        </p>
        <div className="relative z-10 flex flex-wrap gap-2 mt-5">
          {project.tech.slice(0, 4).map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 font-mono-label text-[10px] border border-ink/25 text-ink/70 group-hover:border-paper/30 group-hover:text-paper/80 transition-colors"
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </TransitionLink>
  );
}

function FeaturedPanel({ project, index, span }: { project: Project; index: number; span: string }) {
  const num = String(index + 1).padStart(2, '0');
  const caption = activityCaption(project);

  return (
    <TransitionLink href={`/projects/${project.slug}`} data-cursor="Open" className={span}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: (index % 2) * 0.07 }}
        whileTap={{ x: -2, y: -2, scale: 0.99 }}
        className="relative overflow-hidden p-6 min-h-[190px] h-full flex flex-col bg-paper text-ink hard-border cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono-label text-[11px] text-accent">{num}</span>
          <ArrowUpRight size={18} className="opacity-40" />
        </div>
        <div className="mb-4">
          <DotPlot project={project} />
          {caption && <span className="block mt-2 font-mono-label text-[9px] text-ink/40">{caption}</span>}
        </div>
        <h4 className="font-display text-3xl leading-[0.9] mb-3 text-balance" style={{ viewTransitionName: projectTitleVT(project.slug) }}>
          {project.title}
        </h4>
        <p className="text-sm text-ink/65 leading-relaxed line-clamp-2 mb-5">{project.description}</p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {project.tech.slice(0, 3).map((t) => (
            <span key={t} className="px-2.5 py-1 font-mono-label text-[10px] border border-ink/25 text-ink/70">
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </TransitionLink>
  );
}
