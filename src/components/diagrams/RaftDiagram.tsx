'use client';
import { useRef } from 'react';
import DiagramFrame, { ease, lerp, prog, useLoopClock } from './DiagramFrame';

const L = 11;
const VW = 820;
const VH = 340;

type Id = 'c1' | 'c2' | 'c3';
const NODES: Record<Id, { x: number; y: number; label: string; timeout: number }> = {
  c1: { x: 230, y: 80, label: 'CTRL 1', timeout: 1.7 },
  c2: { x: 110, y: 230, label: 'CTRL 2', timeout: 1.4 }, // shortest randomized timeout: wins
  c3: { x: 350, y: 230, label: 'CTRL 3', timeout: 1.9 },
};
const BROKERS = [
  { x: 560, y: 120, label: 'BROKER 1' },
  { x: 560, y: 220, label: 'BROKER 2' },
];

const CRASH = 2.4; // ctrl 1 (leader, term 1) goes down
const CANDIDATE = CRASH + NODES.c2.timeout; // ctrl 2's election timer runs out
const VOTE_OUT = 0.45; // RequestVote travel time
const ELECTED = CANDIDATE + VOTE_OUT * 2; // vote back from ctrl 3 → majority (2/3)
const RECOVER = 8.2; // ctrl 1 restarts, rejoins as follower
const HB = 0.6; // heartbeat interval
const HB_TRAVEL = 0.35;

const LOG: [number, string][] = [
  [0, 'CTRL 1 IS LEADER (TERM 1) · HEARTBEATS RESET FOLLOWER TIMERS'],
  [CRASH, '✕ CTRL 1 CRASHES · HEARTBEATS STOP'],
  [CRASH + 0.4, '⏱ FOLLOWER ELECTION TIMERS RUNNING (RANDOMIZED)'],
  [CANDIDATE, '→ CTRL 2 TIMES OUT FIRST · TERM 2 · REQUESTVOTE'],
  [CANDIDATE + VOTE_OUT, '← CTRL 3 GRANTS VOTE'],
  [ELECTED, '✓ 2 OF 3 VOTES · CTRL 2 BECOMES LEADER (TERM 2)'],
  [ELECTED + 0.6, '→ BROKERS RE-ROUTE METADATA TO THE NEW LEADER'],
  [RECOVER, '↺ CTRL 1 RESTARTS · SEES TERM 2 · REJOINS AS FOLLOWER'],
];

function leaderAt(t: number): Id | null {
  if (t < CRASH) return 'c1';
  if (t < ELECTED) return null;
  return 'c2';
}

export default function RaftDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const clock = useLoopClock(L, ref, ELECTED + 1.2);
  const t = clock.t;

  const leader = leaderAt(t);
  const term = t < CANDIDATE ? 1 : 2;
  const down = (id: Id) => id === 'c1' && t >= CRASH && t < RECOVER;
  const candidate = (id: Id) => id === 'c2' && t >= CANDIDATE && t < ELECTED;
  const log = [...LOG].reverse().find(([at]) => t >= at)?.[1] ?? '';

  // Heartbeat pulses from whoever leads, to every live follower.
  const pulses: { from: Id; to: Id; p: number }[] = [];
  if (leader) {
    const since = leader === 'c1' ? 0 : ELECTED;
    const until = leader === 'c1' ? CRASH : L;
    for (let k = since; k < until; k += HB) {
      const p = prog(t, k, k + HB_TRAVEL);
      if (t < k || p >= 1) continue;
      (Object.keys(NODES) as Id[]).forEach((to) => {
        if (to !== leader && !down(to)) pulses.push({ from: leader, to, p });
      });
    }
  }
  // Last heartbeat each follower heard (drives its election-timer ring).
  // Same for every live follower: they all hear the same heartbeats.
  const lastHeard = () => {
    if (t < CRASH) return Math.floor(t / HB) * HB + HB_TRAVEL;
    if (t < ELECTED) return CRASH - HB + HB_TRAVEL;
    return ELECTED + Math.floor((t - ELECTED) / HB) * HB + HB_TRAVEL;
  };

  const vote = (from: Id, to: Id, a: number) => {
    const p = prog(t, a, a + VOTE_OUT);
    if (t < a || p >= 1) return null;
    return { x: lerp(NODES[from].x, NODES[to].x, ease(p)), y: lerp(NODES[from].y, NODES[to].y, ease(p)) };
  };
  const req13 = vote('c2', 'c3', CANDIDATE);
  const req11 = vote('c2', 'c1', CANDIDATE);
  const grant = vote('c3', 'c2', CANDIDATE + VOTE_OUT);

  return (
    <div ref={ref}>
      <DiagramFrame
        fig="SYS.02"
        title="CUFFKA — RAFT LEADER ELECTION IN THE CONTROLLER QUORUM"
        caption="Three controllers run Raft (KRaft-style). When the leader dies, followers' randomized election timers run out; the first candidate to win a majority (2 of 3) becomes leader for the next term, and brokers route cluster operations through it."
        clock={clock}
        length={L}
        log={log}
        vw={VW}
        vh={VH}
      >
        {/* Quorum links */}
        <g className="stroke-ink/15" strokeWidth={1.5}>
          <line x1={NODES.c1.x} y1={NODES.c1.y} x2={NODES.c2.x} y2={NODES.c2.y} />
          <line x1={NODES.c1.x} y1={NODES.c1.y} x2={NODES.c3.x} y2={NODES.c3.y} />
          <line x1={NODES.c2.x} y1={NODES.c2.y} x2={NODES.c3.x} y2={NODES.c3.y} />
        </g>
        <text x={230} y={318} fontSize={9} letterSpacing={1.5} textAnchor="middle" className="fill-ink/45">
          CONTROLLER QUORUM · RAFT
        </text>

        {/* Broker → leader metadata routes */}
        {BROKERS.map((b) => {
          const target = leader ? NODES[leader] : null;
          return (
            <g key={b.label}>
              {target ? (
                <line x1={b.x - 50} y1={b.y} x2={target.x + 30} y2={target.y} className="stroke-draft" strokeWidth={1.2} strokeDasharray="4 4" />
              ) : (
                <text x={b.x - 62} y={b.y + 4} fontSize={9} textAnchor="end" className="fill-accent">? NO LEADER</text>
              )}
              <rect x={b.x - 50} y={b.y - 20} width={100} height={40} className="fill-paper stroke-ink" strokeWidth={2} />
              <text x={b.x} y={b.y + 4} fontSize={10} textAnchor="middle" letterSpacing={1.5} className="fill-ink">
                {b.label}
              </text>
            </g>
          );
        })}

        {/* Heartbeats */}
        {pulses.map((h, i) => (
          <circle
            key={i}
            cx={lerp(NODES[h.from].x, NODES[h.to].x, h.p)}
            cy={lerp(NODES[h.from].y, NODES[h.to].y, h.p)}
            r={3.5}
            className="fill-ink"
          />
        ))}

        {/* Votes */}
        {req13 && <rect x={req13.x - 5} y={req13.y - 5} width={10} height={10} className="fill-accent" />}
        {req11 && prog(t, CANDIDATE, CANDIDATE + VOTE_OUT) < 0.6 && (
          <rect x={req11.x - 5} y={req11.y - 5} width={10} height={10} className="fill-accent" opacity={0.6} />
        )}
        {grant && <path d={`M${grant.x - 6} ${grant.y}l4 4l8 -8`} className="stroke-accent fill-none" strokeWidth={2.5} />}

        {/* Controllers */}
        {(Object.keys(NODES) as Id[]).map((id) => {
          const n = NODES[id];
          const isLeader = leader === id;
          const isDown = down(id);
          const isCand = candidate(id);
          const ring = isDown || isLeader || isCand ? 0 : prog(t, lastHeard(), lastHeard() + n.timeout);
          return (
            <g key={id} transform={`translate(${n.x} ${n.y})`} opacity={isDown ? 0.35 : 1}>
              {!isDown && !isLeader && (
                <circle
                  r={34}
                  className="fill-none stroke-accent"
                  strokeWidth={2.5}
                  pathLength={1}
                  strokeDasharray={`${ring} 1`}
                  transform="rotate(-90)"
                />
              )}
              <circle r={26} className={isLeader ? 'fill-ink' : isCand ? 'fill-accent' : 'fill-paper'} />
              <circle r={26} className="fill-none stroke-ink" strokeWidth={2} />
              <text y={4} fontSize={10} textAnchor="middle" letterSpacing={1} className={isLeader || isCand ? 'fill-paper' : 'fill-ink'}>
                {n.label}
              </text>
              <text y={48} fontSize={9} textAnchor="middle" letterSpacing={1.5} className={isLeader ? 'fill-ink' : isCand ? 'fill-accent' : 'fill-ink/50'}>
                {isDown ? '✕ DOWN' : isLeader ? 'LEADER' : isCand ? 'CANDIDATE' : 'FOLLOWER'}
              </text>
            </g>
          );
        })}

        {/* State panel */}
        <g transform="translate(680 70)">
          <rect width={110} height={180} className="fill-paper stroke-ink" strokeWidth={2} />
          <text x={12} y={24} fontSize={9} letterSpacing={1.5} className="fill-ink/45">TERM</text>
          <text x={12} y={62} fontSize={36} className="fill-ink" fontFamily="var(--font-anton), Impact, sans-serif">
            {term}
          </text>
          <line x1={0} y1={82} x2={110} y2={82} className="stroke-ink" strokeWidth={2} />
          <text x={12} y={104} fontSize={9} letterSpacing={1.5} className="fill-ink/45">LEADER</text>
          <text x={12} y={126} fontSize={13} className={leader ? 'fill-ink' : 'fill-accent'}>
            {leader ? NODES[leader].label : 'ELECTING…'}
          </text>
          <line x1={0} y1={142} x2={110} y2={142} className="stroke-ink" strokeWidth={2} />
          <text x={12} y={164} fontSize={9} letterSpacing={1.2} className="fill-ink/45">
            QUORUM {t >= CRASH && t < RECOVER ? '2' : '3'}/3 UP
          </text>
        </g>
      </DiagramFrame>
    </div>
  );
}
