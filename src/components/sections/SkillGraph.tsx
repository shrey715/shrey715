'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import { primaryDomain, type Domain } from '@/lib/projectMeta';
import { navigateWithTransition } from '@/lib/viewTransition';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Project } from '@/types';

interface GNode extends SimulationNodeDatum {
  id: string;
  kind: 'project' | 'tag';
  label: string;
  slug?: string;
  domain?: Domain;
  degree: number;
}
type GLink = SimulationLinkDatum<GNode> & { source: string | GNode; target: string | GNode };

const H = 620;
// Where each domain's projects gather (fractions of width / height).
const ANCHOR: Record<Domain, [number, number]> = {
  ai: [0.3, 0.32],
  systems: [0.72, 0.3],
  quant: [0.3, 0.74],
  web: [0.72, 0.74],
};

const id = (n: string | GNode) => (typeof n === 'string' ? n : n.id);

/**
 * Stack × projects graph: every project linked to the tools it actually uses
 * (straight from projects.json). Hover traces a node's connections; click a
 * project to open it; drag anything.
 */
export default function SkillGraph({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef(new Map<string, SVGGElement>());
  const linkEls = useRef<(SVGLineElement | null)[]>([]);
  const simRef = useRef<Simulation<GNode, GLink> | null>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<string | null>(null);

  const { nodes, links, neighbours } = useMemo(() => {
    const tagDegree = new Map<string, number>();
    for (const p of projects) for (const t of p.tech) tagDegree.set(t, (tagDegree.get(t) ?? 0) + 1);
    const nodes: GNode[] = [
      ...projects.map((p) => ({
        id: `p:${p.slug}`,
        kind: 'project' as const,
        label: p.title,
        slug: p.slug,
        domain: primaryDomain(p),
        degree: p.tech.length,
      })),
      ...[...tagDegree.entries()].map(([t, d]) => ({ id: `t:${t}`, kind: 'tag' as const, label: t, degree: d })),
    ];
    const links: GLink[] = projects.flatMap((p) => p.tech.map((t) => ({ source: `p:${p.slug}`, target: `t:${t}` })));
    const neighbours = new Map<string, Set<string>>();
    for (const l of links) {
      const a = id(l.source);
      const b = id(l.target);
      if (!neighbours.has(a)) neighbours.set(a, new Set());
      if (!neighbours.has(b)) neighbours.set(b, new Set());
      neighbours.get(a)!.add(b);
      neighbours.get(b)!.add(a);
    }
    return { nodes, links, neighbours };
  }, [projects]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!width) return;
    const draw = () => {
      for (const n of nodes) nodeEls.current.get(n.id)?.setAttribute('transform', `translate(${n.x ?? 0},${n.y ?? 0})`);
      links.forEach((l, i) => {
        const el = linkEls.current[i];
        const s = l.source as GNode;
        const t = l.target as GNode;
        if (!el) return;
        el.setAttribute('x1', String(s.x ?? 0));
        el.setAttribute('y1', String(s.y ?? 0));
        el.setAttribute('x2', String(t.x ?? 0));
        el.setAttribute('y2', String(t.y ?? 0));
      });
    };

    const pad = 40;
    const sim = forceSimulation<GNode>(nodes)
      .force(
        'link',
        forceLink<GNode, GLink>(links)
          .id((d) => d.id)
          .distance((l) => ((l.target as GNode).degree > 2 ? 90 : 55))
          .strength(0.35),
      )
      .force('charge', forceManyBody<GNode>().strength((d) => (d.kind === 'project' ? -320 : -90)))
      .force('collide', forceCollide<GNode>().radius((d) => (d.kind === 'project' ? 34 : 10 + Math.min(d.label.length, 14))))
      .force('x', forceX<GNode>((d) => (d.domain ? ANCHOR[d.domain][0] : 0.5) * width).strength((d) => (d.kind === 'project' ? 0.12 : 0.02)))
      .force('y', forceY<GNode>((d) => (d.domain ? ANCHOR[d.domain][1] : 0.5) * H).strength((d) => (d.kind === 'project' ? 0.12 : 0.03)))
      .on('tick', () => {
        for (const n of nodes) {
          n.x = Math.max(pad, Math.min(width - pad, n.x ?? 0));
          n.y = Math.max(pad, Math.min(H - pad, n.y ?? 0));
        }
        draw();
      });
    simRef.current = sim;

    if (prefersReducedMotion) {
      sim.stop();
      sim.tick(300);
      draw();
    } else {
      // A whisper of residual energy keeps the graph breathing.
      sim.alphaTarget(0.008);
    }
    return () => {
      sim.stop();
    };
  }, [nodes, links, width, prefersReducedMotion]);

  // Drag (pointer events): pin the node under the pointer while dragging.
  const dragging = useRef<{ node: GNode; moved: boolean } | null>(null);
  const toLocal = (e: React.PointerEvent) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (e: React.PointerEvent, node: GNode) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragging.current = { node, moved: false };
    simRef.current?.alphaTarget(0.25).restart();
    const p = toLocal(e);
    node.fx = p.x;
    node.fy = p.y;
  };
  const onMove = (e: React.PointerEvent) => {
    const d = dragging.current;
    if (!d) return;
    const p = toLocal(e);
    d.moved = true;
    d.node.fx = p.x;
    d.node.fy = p.y;
  };
  const onUp = () => {
    const d = dragging.current;
    if (!d) return;
    d.node.fx = null;
    d.node.fy = null;
    simRef.current?.alphaTarget(prefersReducedMotion ? 0 : 0.008);
    if (!d.moved && d.node.slug) navigateWithTransition(router, `/projects/${d.node.slug}`);
    dragging.current = null;
  };

  const lit = hover ? neighbours.get(hover) : null;
  const isLit = (nid: string) => !hover || nid === hover || lit?.has(nid);

  return (
    <div ref={wrapRef} className="relative w-full border-2 border-paper/20 bg-ink/40" style={{ height: H }}>
      {width > 0 && (
        <svg width={width} height={H} className="absolute inset-0 overflow-visible" onPointerMove={onMove} onPointerUp={onUp}>
          <g>
            {links.map((l, i) => {
              const on = hover && (id(l.source) === hover || id(l.target) === hover);
              return (
                <line
                  key={i}
                  ref={(el) => {
                    linkEls.current[i] = el;
                  }}
                  className={`transition-[stroke,stroke-opacity] duration-300 ${on ? 'stroke-accent' : 'stroke-paper'}`}
                  strokeOpacity={on ? 0.9 : hover ? 0.04 : 0.12}
                  strokeWidth={on ? 1.5 : 1}
                />
              );
            })}
          </g>
          {nodes.map((n) => {
            const on = isLit(n.id);
            const showLabel = n.kind === 'project' || n.degree >= 2 || (hover && on);
            return (
              <g
                key={n.id}
                ref={(el) => {
                  if (el) nodeEls.current.set(n.id, el);
                }}
                className={`transition-opacity duration-300 ${n.kind === 'project' ? 'cursor-pointer' : 'cursor-grab'}`}
                opacity={on ? 1 : 0.18}
                onPointerEnter={() => setHover(n.id)}
                onPointerLeave={() => setHover(null)}
                onPointerDown={(e) => onDown(e, n)}
                data-cursor={n.kind === 'project' ? 'OPEN' : 'DRAG'}
              >
                {n.kind === 'project' ? (
                  <>
                    <rect x={-6} y={-6} width={12} height={12} className={hover === n.id ? 'fill-accent' : 'fill-paper'} />
                    <text
                      y={-12}
                      textAnchor="middle"
                      className="fill-paper font-display uppercase text-[13px] tracking-wide pointer-events-none"
                    >
                      {n.label.length > 22 ? `${n.label.slice(0, 21)}…` : n.label}
                    </text>
                  </>
                ) : (
                  <>
                    <circle r={2.5 + Math.min(n.degree, 6) * 0.9} className={hover === n.id || (hover && on) ? 'fill-accent' : 'fill-paper/60'} />
                    {showLabel && (
                      <text y={-9} textAnchor="middle" className="fill-paper/60 font-mono text-[9px] tracking-[0.12em] uppercase pointer-events-none">
                        {n.label}
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      )}
      <div className="absolute bottom-3 left-4 right-4 flex justify-between font-mono-label text-[9px] text-paper/40 pointer-events-none">
        <span>■ PROJECT · ● TOOL — SIZE = HOW OFTEN IT&apos;S USED</span>
        <span>HOVER TO TRACE · CLICK A PROJECT · DRAG ANYTHING</span>
      </div>
    </div>
  );
}
