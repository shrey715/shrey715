'use client';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import type { Experience } from '@/types';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "Aug 2025" → month index since year 0; null if unparseable. */
export function parseMonth(s: string): number | null {
  const m = s.trim().toLowerCase().match(/^([a-z]+)\.?\s+(\d{4})$/);
  if (!m) return null;
  const mi = MONTHS.indexOf(m[1].slice(0, 3));
  return mi === -1 ? null : Number(m[2]) * 12 + mi;
}

interface Span {
  exp: Experience;
  kind: 'work' | 'lead';
  start: number;
  /** Exclusive: the month after the last one worked. */
  end: number;
  current: boolean;
  lane: number;
}

function toSpans(items: Experience[], kind: Span['kind'], now: number): Span[] {
  const spans: Span[] = [];
  for (const exp of items) {
    const [a, b] = exp.duration.split(/\s*[–—-]\s*/);
    const start = parseMonth(a ?? '');
    const current = /present/i.test(b ?? '');
    const end = current ? now + 1 : parseMonth(b ?? '');
    if (start === null || end === null) continue;
    spans.push({ exp, kind, start, end: Math.max(end + (current ? 0 : 1), start + 1), current, lane: 0 });
  }
  // Greedy lanes: earliest-starting first, into the first lane that's free.
  const laneEnds: number[] = [];
  for (const s of [...spans].sort((x, y) => x.start - y.start)) {
    let lane = laneEnds.findIndex((e) => e <= s.start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = s.end;
    s.lane = lane;
  }
  return spans;
}

const noop = () => () => {};
const W = 240;
const H = 560;
const TOP = 18;
const BOTTOM = 18;
const AXIS_X = 44;
const LANE = 16;
const BAR = 9;

/**
 * Career mini-map for the work timeline's empty right rail: every role as a
 * bar on a real time axis (oldest at top, matching the timeline beside it), the role you're reading lit up,
 * hover to name a bar, click a work bar to jump to it.
 */
export default function CareerMap({ work, leadership }: { work: Experience[]; leadership: Experience[] }) {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const lenis = useLenis();

  const now = useMemo(() => {
    const d = new Date();
    return d.getFullYear() * 12 + d.getMonth();
  }, []);

  const { spans, minM, maxM } = useMemo(() => {
    const w = toSpans(work, 'work', now);
    const l = toSpans(leadership, 'lead', now);
    const workLanes = Math.max(0, ...w.map((s) => s.lane)) + 1;
    l.forEach((s) => (s.lane += workLanes + 1)); // one-lane gap between groups
    const all = [...w, ...l];
    const minM = Math.min(...all.map((s) => s.start)) - 2;
    const maxM = Math.max(...all.map((s) => s.end), now + 1) + 2;
    return { spans: all, minM, maxM };
  }, [work, leadership, now]);

  // Which timeline entry is in the middle band of the viewport.
  useEffect(() => {
    const els = work.map((e) => document.getElementById(`exp-${e.id}`)).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id.replace(/^exp-/, ''));
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [work]);

  if (!isClient || spans.length === 0) return null;

  const y = (m: number) => TOP + ((m - minM) / (maxM - minM)) * (H - TOP - BOTTOM);
  const years: number[] = [];
  for (let yr = Math.ceil(minM / 12); yr * 12 <= maxM; yr++) years.push(yr);
  const focus = spans.find((s) => s.exp.id === (hovered ?? active));

  const jump = (s: Span) => {
    if (s.kind !== 'work') return;
    const el = document.getElementById(`exp-${s.exp.id}`);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -120, duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="font-mono-label text-[9px] text-ink/50 select-none">
      <div className="flex items-center justify-between mb-3">
        <span className="text-ink/60">CAREER MAP</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-ink" /> WORK
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-ink/25" /> LEAD
          </span>
        </span>
      </div>

      {/* What's lit: hovered bar, else the role in view */}
      <div className="h-14 border-2 border-ink bg-paper px-3 py-2 mb-3 overflow-hidden">
        {focus ? (
          <motion.div key={focus.exp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <span className="block normal-case tracking-normal font-sans text-[12px] font-bold text-ink truncate">{focus.exp.title}</span>
            <span className="block mt-1 text-accent truncate">{focus.exp.organization}</span>
          </motion.div>
        ) : (
          <span className="text-ink/40">HOVER A BAR</span>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" role="img" aria-label="Timeline of roles by date">
        {years.map((yr) => (
          <g key={yr}>
            <line x1={AXIS_X - 6} x2={W} y1={y(yr * 12)} y2={y(yr * 12)} className="stroke-ink/10" strokeDasharray="2 4" />
            <text x={0} y={y(yr * 12) + 3} className="fill-ink/45 text-[10px] font-mono">
              {yr}
            </text>
          </g>
        ))}
        <line x1={AXIS_X - 6} x2={AXIS_X - 6} y1={TOP} y2={H - BOTTOM} className="stroke-ink/25" />

        {/* Now marker */}
        <line x1={AXIS_X - 10} x2={W} y1={y(now + 0.5)} y2={y(now + 0.5)} className="stroke-accent" strokeWidth={1.5} />
        <text x={W} y={y(now + 0.5) + 12} textAnchor="end" className="fill-accent text-[9px] font-mono tracking-widest">
          NOW
        </text>

        {spans.map((s) => {
          const lit = s.exp.id === (hovered ?? active);
          const x = AXIS_X + s.lane * LANE;
          return (
            <motion.rect
              key={`${s.kind}-${s.exp.id}`}
              x={x}
              width={BAR}
              initial={{ y: y(s.start), height: 0 }}
              whileInView={{ y: y(s.start), height: Math.max(3, y(s.end) - y(s.start)) }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 + s.lane * 0.05 }}
              className={`${lit ? 'fill-accent' : s.kind === 'work' ? 'fill-ink' : 'fill-ink/25'} transition-colors duration-300 ${
                s.kind === 'work' ? 'cursor-pointer' : ''
              }`}
              onMouseEnter={() => setHovered(s.exp.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => jump(s)}
            />
          );
        })}
      </svg>
    </div>
  );
}
