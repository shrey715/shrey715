'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import SectionHeader from '@/components/ui/SectionHeader';
import Section, { Container } from '@/components/ui/Section';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import CareerMap, { parseMonth } from './CareerMap';

/** Oldest first by start date (ties: whichever ended first), to read in step with the career map. */
function chronological(items: Experience[]) {
  const key = (e: Experience) => {
    const [a, b] = e.duration.split(/\s*[–—-]\s*/);
    const start = parseMonth(a ?? '') ?? Infinity;
    const end = /present/i.test(b ?? '') ? Infinity : (parseMonth(b ?? '') ?? Infinity);
    return [start, end] as const;
  };
  return [...items].sort((x, y) => {
    const [sx, ex] = key(x);
    const [sy, ey] = key(y);
    return sx - sy || ex - ey;
  });
}
import { ACCENT } from '@/lib/constants';
import type { Experience, Achievement } from '@/types';

interface ExperienceSectionProps {
  workExperience: Experience[];
  leadership: Experience[];
  achievements: Achievement[];
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-2 mt-16 first:mt-0">
      <span className="font-mono-label text-xs text-ink/60">{children}</span>
      <span className="flex-1 h-0.5 bg-ink" />
    </div>
  );
}

function HighlightList({ highlights, invertOnHover = false }: { highlights: string[]; invertOnHover?: boolean }) {
  return (
    <ul className="space-y-1.5 mt-3">
      {highlights.map((h, i) => (
        <li
          key={i}
          className={`text-sm leading-relaxed pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-accent ${
            invertOnHover ? 'text-ink/70 group-hover:text-paper/80' : 'text-ink/70'
          }`}
        >
          {h}
        </li>
      ))}
    </ul>
  );
}

/**
 * Work timeline: dates in a left rail, a spine that draws itself down the
 * page with scroll, and a node per role that fills in as it reaches the
 * middle of the screen. Plain document flow — nothing pins or overlaps.
 */
function WorkTimeline({ items }: { items: Experience[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 60%', 'end 55%'] });
  const draw = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  return (
    <ol ref={ref} className="relative mt-6">
      {/* Spine: faint track + accent fill drawn by scroll (transform only) */}
      <span aria-hidden="true" className="absolute top-2 bottom-2 w-0.5 bg-ink/12 left-[7px] md:left-[calc(14rem+2.5rem-1px)]" />
      <motion.span
        aria-hidden="true"
        style={{ scaleY: prefersReducedMotion ? 1 : draw }}
        className="absolute top-2 bottom-2 w-0.5 bg-accent origin-top left-[7px] md:left-[calc(14rem+2.5rem-1px)]"
      />
      {items.map((exp) => (
        <TimelineItem key={exp.id} exp={exp} />
      ))}
    </ol>
  );
}

/**
 * Fill is scrubbed by the node's own scroll position (not an in-view
 * trigger), so it's correct however fast — or far — the page jumps.
 */
function TimelineNode({ current }: { current: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 62%', 'start 50%'] });
  const backgroundColor = useTransform(scrollYProgress, [0, 1], ['#ede8dc', ACCENT]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      style={{ backgroundColor, scale }}
      className="relative block w-4 h-4 border-2 border-ink"
    >
      {current && <span className="absolute -inset-1.5 border-2 border-accent animate-ping opacity-60" />}
    </motion.span>
  );
}

function TimelineItem({ exp }: { exp: Experience }) {
  const current = /present/i.test(exp.duration);

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      id={`exp-${exp.id}`}
      className="group relative flex flex-col md:flex-row gap-3 md:gap-0 pl-9 md:pl-0 py-9 md:py-11 scroll-mt-28"
    >
      {/* Left rail: when / where / what kind */}
      <div className="md:w-56 md:shrink-0 md:text-right md:pr-2 md:pt-1.5 font-mono-label text-[11px] text-ink/55 space-y-1.5">
        <data className="block text-ink tabular-nums">{exp.duration}</data>
        {exp.location && <div>{exp.location}</div>}
        {exp.type && (
          <span className="inline-block mt-1 px-1.5 py-0.5 border border-ink/25 text-[9px] text-ink/60">{exp.type}</span>
        )}
      </div>

      {/* Node on the spine — fills accent as it crosses the viewport middle */}
      <div className="absolute left-0 top-10 md:static md:w-20 md:shrink-0 md:flex md:justify-center md:pt-2">
        <TimelineNode current={current} />
      </div>

      {/* The role */}
      <div className="flex-1 min-w-0 max-w-3xl">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h4 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
            {exp.title}
          </h4>
          {current && <span className="px-1.5 py-0.5 bg-accent text-paper font-mono-label text-[9px]">NOW</span>}
        </div>
        <p className="font-mono-label text-[11px] text-accent mt-1.5">{exp.organization}</p>
        <HighlightList highlights={exp.highlights} />
      </div>
    </motion.li>
  );
}

function AchievementRow({ a, index }: { a: Achievement; index: number }) {
  // "Monsoon 2024" -> big "2024" with a small "MONSOON" qualifier above it.
  const match = a.year.match(/(\d{4})\s*$/);
  const year = match ? match[1] : a.year;
  const season = match ? a.year.slice(0, match.index).trim() : '';

  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative grid grid-cols-[4.5rem_1fr] md:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1.15fr)] gap-x-6 gap-y-2 py-7 border-b border-ink/15"
    >
      <span
        aria-hidden="true"
        className="absolute left-0 bottom-[-1px] h-0.5 w-full bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      />
      <div className="row-span-2 md:row-span-1">
        {season && <span className="block font-mono-label text-[9px] text-ink/45">{season}</span>}
        <data className="block font-display text-4xl md:text-5xl leading-none text-ink/25 group-hover:text-accent transition-colors duration-300 tabular-nums">
          {year}
        </data>
      </div>
      <div className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
        <h4 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight">{a.title}</h4>
        <p className="font-mono-label text-[10px] text-accent mt-1.5">{a.organization}</p>
      </div>
      <p className="text-sm text-ink/70 leading-relaxed md:pt-1 max-w-[60ch]">{a.description}</p>
    </motion.li>
  );
}

export default function ExperienceSection({ workExperience, leadership, achievements }: ExperienceSectionProps) {
  return (
    <Section id="experience">
      <Container>
        <SectionHeader index="02" kicker="TIMELINE" title="EXPERIENCE" className="mb-16" />

        {/* Work — sticky stacking deck: each row pins and the next slides over it */}
        <SubLabel>WORK</SubLabel>
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-12">
          <WorkTimeline items={chronological(workExperience)} />
          {/* Career mini-map in the timeline's otherwise empty right rail */}
          <aside className="hidden xl:block pt-6">
            <div className="sticky top-28">
              <CareerMap work={workExperience} leadership={leadership} />
            </div>
          </aside>
        </div>

        {/* Leadership — three equal columns hung from a rule, no boxes */}
        <SubLabel>LEADERSHIP</SubLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12 mt-8">
          {leadership.map((exp, i) => (
            <motion.article
              key={exp.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative pt-6"
            >
              {/* Rule: ink at rest, accent draws across on hover */}
              <span aria-hidden="true" className="absolute top-0 left-0 right-0 h-0.5 bg-ink" />
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-0.5 bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
              <div className="flex items-baseline justify-between gap-3 font-mono-label text-[10px] text-ink/50 tabular-nums">
                <span className="text-accent">L/{String(i + 1).padStart(2, '0')}</span>
                <data>{exp.duration}</data>
              </div>
              <h4 className="text-2xl font-bold leading-tight tracking-tight mt-4">{exp.title}</h4>
              <p className="font-mono-label text-[11px] text-accent mt-1.5">{exp.organization}</p>
              <HighlightList highlights={exp.highlights} />
            </motion.article>
          ))}
        </div>

        {/* Achievements — a ledger, one row per honour */}
        <SubLabel>ACHIEVEMENTS</SubLabel>
        <ul className="mt-4">
          {achievements.map((a, i) => (
            <AchievementRow key={a.id} a={a} index={i} />
          ))}
        </ul>
      </Container>
    </Section>
  );
}
