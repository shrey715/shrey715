'use client';
import { useRef } from 'react';
import DiagramFrame, { ease, lerp, prog, useLoopClock } from './DiagramFrame';

const L = 11;
const VW = 860;
const VH = 360;

// Columns
const QX = 40;
const LIST_X = 300; // per-retriever ranked lists
const FUSE_X = 500; // RRF merged list
const RANK_X = 680; // LambdaMART reranked list
const ROW_H = 30;
const CHIP_W = 58;
const CHIP_H = 22;

// Illustrative rankings (relevance marks are what a qrels file would say).
const RELEVANT = new Set(['D3', 'D5']);
const BM25 = ['D1', 'D4', 'D3', 'D7', 'D2'];
const DENSE = ['D3', 'D5', 'D1', 'D8', 'D4'];
const K = 60;
function rrf(): string[] {
  const score = new Map<string, number>();
  [BM25, DENSE].forEach((list) => list.forEach((d, i) => score.set(d, (score.get(d) ?? 0) + 1 / (K + i + 1))));
  return [...score.entries()].sort((a, b) => b[1] - a[1]).map(([d]) => d);
}
const FUSED = rrf();
const RERANKED = ['D3', 'D5', 'D1', 'D4', 'D8', 'D7', 'D2'];

// Real SciFact results from the natsuki README.
const STAGES = [
  { label: 'BM25', ndcg: '0.669', ms: '0.7 ms' },
  { label: 'DENSE', ndcg: '0.722', ms: '42 ms' },
  { label: 'HYBRID RRF', ndcg: '0.725', ms: '48 ms' },
  { label: 'RERANK', ndcg: '0.746', ms: '52 ms' },
];

// Timeline
const T_QUERY = 0.2;
const T_LISTS = 1.0;
const T_FUSE = 3.4;
const T_RANK = 5.6;
const T_DONE = 7.4;

const LOG: [number, string][] = [
  [0, 'QUERY: A SCIENTIFIC CLAIM FROM BEIR/SCIFACT (5,183 DOCS)'],
  [T_LISTS, '→ BM25 (INVERTED INDEX, BUILT FROM SCRATCH) + DENSE (BI-ENCODER) RETRIEVE IN PARALLEL'],
  [T_FUSE, '⇢ RECIPROCAL RANK FUSION: Σ 1 / (60 + RANK) ACROSS BOTH LISTS'],
  [T_RANK, '⇅ LAMBDAMART RERANKS (TRAINED ON THE 809-QUERY TRAIN SPLIT)'],
  [T_DONE, '✓ RELEVANT DOCS RISE TO THE TOP · NDCG@10 0.669 → 0.746'],
];

const listY = (lane: 'bm25' | 'dense', i: number) => (lane === 'bm25' ? 46 : 206) + i * 26;
const rowY = (i: number) => 70 + i * ROW_H;

export default function RetrievalDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const clock = useLoopClock(L, ref, T_DONE + 1);
  const t = clock.t;
  const log = [...LOG].reverse().find(([at]) => t >= at)?.[1] ?? '';
  const stage = t < T_FUSE ? 1 : t < T_RANK ? 2 : 3;

  // Every (doc, lane) copy travels: lane list → fused slot → reranked slot.
  const chips = [
    ...BM25.map((d, i) => ({ d, lane: 'bm25' as const, i })),
    ...DENSE.map((d, i) => ({ d, lane: 'dense' as const, i })),
  ];

  return (
    <div ref={ref}>
      <DiagramFrame
        fig="SYS.03"
        title="NATSUKI — HYBRID RETRIEVAL + LEARNED RERANKING"
        caption="Sparse and dense retrievers each rank the corpus; reciprocal rank fusion merges them; a LambdaMART reranker reorders the merged list. Rankings here are illustrative — the stage metrics are natsuki's real SciFact results."
        clock={clock}
        length={L}
        log={log}
        vw={VW}
        vh={VH}
      >
        {/* Column labels */}
        <g fontSize={9} letterSpacing={1.5} className="fill-ink/45">
          <text x={QX} y={30}>QUERY</text>
          <text x={LIST_X - 120} y={30}>RETRIEVERS</text>
          <text x={FUSE_X} y={30}>FUSED (RRF)</text>
          <text x={RANK_X} y={30}>RERANKED</text>
        </g>

        {/* Query */}
        <g transform={`translate(${QX} 140)`}>
          <rect width={110} height={70} className="fill-ink" />
          <text x={10} y={20} fontSize={8.5} letterSpacing={1} className="fill-paper/60">CLAIM</text>
          <text x={10} y={40} fontSize={10} className="fill-paper">“vitamin D</text>
          <text x={10} y={55} fontSize={10} className="fill-paper">reduces …”</text>
        </g>

        {/* Query → retrievers */}
        {(['bm25', 'dense'] as const).map((lane) => {
          const y = lane === 'bm25' ? 100 : 260;
          const p = prog(t, T_QUERY, T_LISTS);
          return (
            <g key={lane}>
              <path d={`M${QX + 110} 175 C ${QX + 150} 175, ${QX + 140} ${y}, 180 ${y}`} className="fill-none stroke-draft" strokeWidth={1.2} strokeDasharray="3 4" />
              {p > 0 && p < 1 && (
                <circle cx={lerp(QX + 110, 180, ease(p))} cy={lerp(175, y, ease(p))} r={4} className="fill-accent" />
              )}
              <rect x={180} y={y - 18} width={92} height={36} className="fill-paper stroke-ink" strokeWidth={2} />
              <text x={226} y={y + 4} fontSize={10} textAnchor="middle" letterSpacing={1.2} className="fill-ink">
                {lane === 'bm25' ? 'BM25' : 'DENSE'}
              </text>
              <text x={226} y={y + 32} fontSize={8} textAnchor="middle" className="fill-ink/45">
                {lane === 'bm25' ? 'sparse · exact terms' : 'bi-encoder · meaning'}
              </text>
            </g>
          );
        })}

        {/* Fused + reranked slot guides */}
        {FUSED.map((_, i) => (
          <g key={i} className="stroke-ink/12" strokeWidth={1} strokeDasharray="2 3" fill="none">
            <rect x={FUSE_X} y={rowY(i) - CHIP_H / 2} width={CHIP_W} height={CHIP_H} />
            <rect x={RANK_X} y={rowY(i) - CHIP_H / 2} width={CHIP_W} height={CHIP_H} />
          </g>
        ))}
        <g fontSize={8.5} className="fill-ink/35">
          {FUSED.map((_, i) => (
            <text key={i} x={RANK_X + CHIP_W + 10} y={rowY(i) + 3}>
              {i + 1}
            </text>
          ))}
        </g>

        {/* Doc chips */}
        {chips.map((c, k) => {
          const appear = prog(t, T_LISTS + c.i * 0.18 + (c.lane === 'dense' ? 0.1 : 0), T_LISTS + c.i * 0.18 + 0.4);
          if (appear <= 0) return null;
          const fi = FUSED.indexOf(c.d);
          const ri = RERANKED.indexOf(c.d);
          const toFuse = ease(prog(t, T_FUSE + fi * 0.08, T_FUSE + fi * 0.08 + 1.1));
          const toRank = ease(prog(t, T_RANK + ri * 0.06, T_RANK + ri * 0.06 + 1.2));
          let x = lerp(LIST_X, FUSE_X, toFuse);
          let y = lerp(listY(c.lane, c.i), rowY(fi), toFuse);
          x = lerp(x, RANK_X, toRank);
          y = lerp(y, rowY(ri), toRank);
          const rel = RELEVANT.has(c.d);
          const top3 = t >= T_DONE && ri < 3;
          return (
            <g key={k} transform={`translate(${x} ${y - CHIP_H / 2})`} opacity={appear}>
              <rect
                width={CHIP_W}
                height={CHIP_H}
                className={top3 ? 'fill-ink' : 'fill-paper stroke-ink'}
                strokeWidth={1.5}
              />
              <text x={10} y={15} fontSize={10} className={top3 ? 'fill-paper' : 'fill-ink'}>
                {c.d}
              </text>
              {rel && <circle cx={CHIP_W - 11} cy={CHIP_H / 2} r={4} className="fill-accent" />}
            </g>
          );
        })}

        {/* Top-3 bracket */}
        {t >= T_DONE && (
          <g>
            <path d={`M${RANK_X - 10} ${rowY(0) - 13}h-6v${ROW_H * 2 + 26}h6`} className="stroke-accent fill-none" strokeWidth={2} />
            <text x={RANK_X - 22} y={rowY(1) + 3} fontSize={8.5} textAnchor="end" letterSpacing={1} className="fill-accent">
              TOP 3
            </text>
          </g>
        )}

        {/* Metrics strip (real numbers) */}
        <g transform={`translate(${LIST_X - 120} 318)`}>
          {STAGES.map((s, i) => {
            const on = i === stage || (i === 0 && stage === 1) || (i === 1 && stage === 1);
            const passed = i <= stage;
            return (
              <g key={s.label} transform={`translate(${i * 150} 0)`}>
                <rect width={140} height={28} className={on ? 'fill-ink' : 'fill-paper stroke-ink/30'} strokeWidth={1.5} />
                <text x={8} y={12} fontSize={7.5} letterSpacing={1} className={on ? 'fill-paper/60' : 'fill-ink/45'}>
                  {s.label} · {s.ms}
                </text>
                <text x={8} y={24} fontSize={10} className={on ? 'fill-paper' : passed ? 'fill-ink' : 'fill-ink/40'}>
                  nDCG@10 {s.ndcg}
                </text>
              </g>
            );
          })}
        </g>

        {/* Legend */}
        <g transform={`translate(${QX} 300)`} fontSize={8.5} className="fill-ink/50">
          <circle cx={4} cy={-3} r={4} className="fill-accent" />
          <text x={14} y={0}>relevant (qrels)</text>
        </g>
      </DiagramFrame>
    </div>
  );
}
