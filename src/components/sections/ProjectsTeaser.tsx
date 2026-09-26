'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
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
import { mulberry32 } from '@/components/three/formations';
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

/** Seeded dot-plot per project — a tiny "specimen readout" echoing the hero particles. */
function DotPlot({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    const rand = mulberry32(h);
    const cols = 28;
    const rows = 9;
    const f1 = 0.15 + rand() * 0.35;
    const f2 = 0.2 + rand() * 0.5;
    const ph = rand() * Math.PI * 2;
    const out: { x: number; y: number; hot: boolean }[] = [];
    for (let c = 0; c < cols; c++) {
      // A wavy "signal" height per column; dots fill up to it.
      const level = (Math.sin(c * f1 + ph) * 0.5 + 0.5) * 0.6 + (Math.sin(c * f2) * 0.5 + 0.5) * 0.4;
      const filled = Math.round(level * rows);
      for (let r = 0; r < rows; r++) {
        if (rows - r <= filled) out.push({ x: c, y: r, hot: rows - r === filled && rand() > 0.55 });
      }
    }
    return out;
  }, [seed]);

  return (
    <svg viewBox="0 0 28 9" className="w-full h-auto" aria-hidden="true" shapeRendering="crispEdges">
      {cells.map((d) => (
        <rect
          key={`${d.x}-${d.y}`}
          x={d.x + 0.2}
          y={d.y + 0.2}
          width={0.6}
          height={0.6}
          className={
            d.hot
              ? 'fill-accent'
              : 'fill-ink/25 group-hover:fill-paper/40 transition-colors duration-300'
          }
          style={{ transitionDelay: `${d.x * 12}ms` }}
        />
      ))}
    </svg>
  );
}

function GalleryCard({ project, index }: { project: Project; index: number }) {
  const num = String(index + 1).padStart(2, '0');

  return (
    <Link
      href="/projects"
      data-cursor="Open"
      className="group relative flex flex-col w-[min(38vw,560px)] h-[min(56vh,520px)] p-7 bg-paper text-ink hard-border overflow-hidden transition-[box-shadow,transform] duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--color-accent)]"
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
        <DotPlot seed={project.id} />
      </div>

      <h3
        className="relative z-10 font-display mt-auto leading-[0.88] group-hover:text-paper transition-colors"
        style={{ fontSize: 'clamp(2.4rem, 3.6vw, 3.8rem)' }}
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
    </Link>
  );
}

function FeaturedPanel({ project, index, span }: { project: Project; index: number; span: string }) {
  const num = String(index + 1).padStart(2, '0');

  return (
    <Link href="/projects" data-cursor="Open" className={span}>
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
          <DotPlot seed={project.id} />
        </div>
        <h4 className="font-display text-3xl leading-[0.9] mb-3">{project.title}</h4>
        <p className="text-sm text-ink/65 leading-relaxed line-clamp-2 mb-5">{project.description}</p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {project.tech.slice(0, 3).map((t) => (
            <span key={t} className="px-2.5 py-1 font-mono-label text-[10px] border border-ink/25 text-ink/70">
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}
