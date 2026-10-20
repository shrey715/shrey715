'use client';
import { useRef } from 'react';
import DiagramFrame, { ease, lerp, prog, useLoopClock } from './DiagramFrame';

const L = 10;
const VW = 820;
const VH = 340;

// Geometry
const SX = 190; // sender port x
const RX = 630; // receiver port x
const PX = 410; // fault proxy centre x
const DATA_Y = 118;
const ACK_Y = 192;
const D_DATA = 1.6; // seconds for a data packet to cross
const D_ACK = 1.4;
const WINDOW = 4;

type Fate = 'ok' | 'drop';
// Sender timeline: initial burst fills the window, #2 is dropped by the proxy,
// its timer expires, it's retransmitted, then the window slides on.
const DATA: { seq: number; t0: number; fate: Fate; retx?: boolean }[] = [
  { seq: 0, t0: 0.0, fate: 'ok' },
  { seq: 1, t0: 0.3, fate: 'ok' },
  { seq: 2, t0: 0.6, fate: 'drop' },
  { seq: 3, t0: 0.9, fate: 'ok' },
  { seq: 2, t0: 3.7, fate: 'ok', retx: true },
  { seq: 4, t0: 7.0, fate: 'ok' },
  { seq: 5, t0: 7.25, fate: 'ok' },
  { seq: 6, t0: 7.5, fate: 'ok' },
  { seq: 7, t0: 7.75, fate: 'ok' },
];
// Cumulative ACKs (value = next byte expected), sent when data arrives.
const ACKS: { label: string; t0: number; ack: number; dup?: boolean }[] = [
  { label: 'ACK 1', t0: 1.6, ack: 1 },
  { label: 'ACK 2', t0: 1.9, ack: 2 },
  { label: 'ACK 2', t0: 2.5, ack: 2, dup: true },
  { label: 'ACK 4', t0: 5.3, ack: 4 },
];
const RTO_START = 0.6;
const RTO_END = 3.7;

const LOG: [number, string][] = [
  [0, '→ SEND #0–#3 · WINDOW FULL (4 IN FLIGHT)'],
  [1.4, '✕ PROXY DROPS #2'],
  [1.6, '← ACK 1, ACK 2 · CUMULATIVE'],
  [2.5, '← DUP ACK 2 · #3 ARRIVED EARLY, BUFFERED'],
  [3.7, '⏱ #2 TIMER EXPIRES (500 ms → BACKS OFF ×2) · RETRANSMIT'],
  [5.3, '✓ #2 FILLS THE GAP · #2 + #3 REASSEMBLED · ACK 4'],
  [6.7, '→ ACK 4 LANDS · WINDOW SLIDES TO #4–#7'],
  [7.0, '→ SEND #4–#7'],
];

export default function TetherDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const clock = useLoopClock(L, ref, 6.2);
  const t = clock.t;

  // Sender window base = highest cumulative ACK received so far.
  const base = ACKS.filter((a) => t >= a.t0 + D_ACK).reduce((m, a) => Math.max(m, a.ack), 0);
  const sent = (seq: number) => DATA.some((d) => d.seq === seq && t >= d.t0);
  // Receiver: what's arrived, and what's deliverable in order.
  const arrived = new Set(DATA.filter((d) => d.fate === 'ok' && t >= d.t0 + D_DATA).map((d) => d.seq));
  let delivered = 0;
  while (arrived.has(delivered)) delivered++;
  const log = [...LOG].reverse().find(([at]) => t >= at)?.[1] ?? '';
  const rto = prog(t, RTO_START, RTO_END);
  const rtoActive = t >= RTO_START && t < RTO_END;

  return (
    <div ref={ref}>
      <DiagramFrame
        fig="SYS.01"
        title="TETHER — S.H.A.M. RELIABLE TRANSPORT OVER UDP"
        caption="Sliding window, a timer per packet, cumulative ACKs and out-of-order buffering — run through a fault proxy that drops packets. (Window drawn at 4 for legibility; tether keeps up to 10 in flight.)"
        clock={clock}
        length={L}
        log={log}
        vw={VW}
        vh={VH}
      >
        {/* Endpoints */}
        <g className="fill-paper stroke-ink" strokeWidth={2}>
          <rect x={40} y={70} width={150} height={170} />
          <rect x={630} y={70} width={150} height={170} />
        </g>
        <rect x={PX - 46} y={56} width={92} height={198} className="fill-paper stroke-ink" strokeWidth={1.5} strokeDasharray="5 4" />
        <g className="fill-ink" fontSize={11} letterSpacing={1.5}>
          <text x={52} y={90}>SENDER</text>
          <text x={642} y={90}>RECEIVER</text>
          <text x={PX} y={76} textAnchor="middle" className="fill-accent">FAULT PROXY</text>
        </g>
        <g className="fill-ink/45" fontSize={9} letterSpacing={1}>
          <text x={52} y={104}>client.c</text>
          <text x={642} y={104}>server.c</text>
          <text x={PX} y={226} textAnchor="middle">loss · delay</text>
          <text x={PX} y={240} textAnchor="middle">reorder · dup</text>
        </g>

        {/* Lanes */}
        <g className="stroke-draft" strokeWidth={1} strokeDasharray="2 5" opacity={0.7}>
          <line x1={SX} y1={DATA_Y} x2={RX} y2={DATA_Y} />
          <line x1={SX} y1={ACK_Y} x2={RX} y2={ACK_Y} />
        </g>
        <g className="fill-draft" fontSize={9} letterSpacing={1}>
          <text x={SX + 8} y={DATA_Y - 10}>DATA →</text>
          <text x={RX - 8} y={ACK_Y + 22} textAnchor="end">← ACK</text>
        </g>

        {/* Data packets in flight */}
        {DATA.map((d, i) => {
          if (t < d.t0) return null;
          const p = prog(t, d.t0, d.t0 + D_DATA);
          if (d.fate === 'drop') {
            const toProxy = prog(t, d.t0, d.t0 + D_DATA / 2);
            const fall = prog(t, d.t0 + D_DATA / 2, d.t0 + D_DATA / 2 + 0.9);
            if (fall >= 1) return null;
            const x = lerp(SX, PX, ease(toProxy)) - 17;
            const y = DATA_Y - 9 + fall * 60;
            return (
              <g key={i} opacity={1 - fall} transform={`translate(${x} ${y}) rotate(${fall * 35} 17 9)`}>
                <rect width={34} height={18} className="fill-accent" />
                <text x={17} y={13} fontSize={10} textAnchor="middle" className="fill-paper">#{d.seq}</text>
                {fall > 0 && (
                  <text x={17} y={-6} fontSize={12} textAnchor="middle" className="fill-accent">✕</text>
                )}
              </g>
            );
          }
          if (p >= 1) return null;
          const x = lerp(SX, RX, ease(p)) - 17;
          return (
            <g key={i} transform={`translate(${x} ${DATA_Y - 9})`}>
              <rect width={34} height={18} className={d.retx ? 'fill-paper stroke-accent' : 'fill-ink'} strokeWidth={1.5} />
              <text x={17} y={13} fontSize={10} textAnchor="middle" className={d.retx ? 'fill-accent' : 'fill-paper'}>
                #{d.seq}
              </text>
            </g>
          );
        })}

        {/* ACKs in flight */}
        {ACKS.map((a, i) => {
          const p = prog(t, a.t0, a.t0 + D_ACK);
          if (t < a.t0 || p >= 1) return null;
          const x = lerp(RX, SX, ease(p)) - 26;
          return (
            <g key={i} transform={`translate(${x} ${ACK_Y - 9})`}>
              <rect width={52} height={18} className="fill-paper stroke-ink" strokeWidth={1.5} strokeDasharray={a.dup ? '3 2' : undefined} />
              <text x={26} y={13} fontSize={9.5} textAnchor="middle" className={a.dup ? 'fill-accent' : 'fill-ink'}>
                {a.label}
              </text>
            </g>
          );
        })}

        {/* Retransmit timer for #2 */}
        {rtoActive && (
          <g transform={`translate(${SX - 30} ${DATA_Y + 38})`}>
            <circle r={13} className="fill-none stroke-ink/15" strokeWidth={3} />
            <circle
              r={13}
              className="fill-none stroke-accent"
              strokeWidth={3}
              pathLength={1}
              strokeDasharray={`${rto} 1`}
              transform="rotate(-90)"
            />
            <text y={3.5} fontSize={8} textAnchor="middle" className="fill-ink">#2</text>
            <text x={-90} y={4} fontSize={8.5} className="fill-ink/50" letterSpacing={1}>RTO</text>
          </g>
        )}

        {/* Sender sequence strip + sliding window */}
        <text x={40} y={276} fontSize={9} letterSpacing={1} className="fill-ink/45">SEND BUFFER</text>
        {Array.from({ length: 10 }, (_, s) => {
          const acked = s < base;
          const inFlight = !acked && sent(s);
          return (
            <g key={s} transform={`translate(${40 + s * 25} 284)`}>
              <rect
                width={21}
                height={21}
                className={acked ? 'fill-ink' : inFlight ? 'fill-paper stroke-accent' : 'fill-paper stroke-ink/30'}
                strokeWidth={1.5}
              />
              <text x={10.5} y={14.5} fontSize={9} textAnchor="middle" className={acked ? 'fill-paper' : 'fill-ink/60'}>
                {s}
              </text>
            </g>
          );
        })}
        <rect
          x={38 + base * 25}
          y={281}
          width={WINDOW * 25 - 0}
          height={27}
          className="fill-none stroke-ink"
          strokeWidth={2}
          style={{ transition: 'x 0.5s cubic-bezier(0.16,1,0.3,1)' }}
        />
        <text x={38 + base * 25} y={322} fontSize={8.5} letterSpacing={1} className="fill-ink">
          WINDOW [{base}, {base + WINDOW})
        </text>

        {/* Receiver buffer */}
        <text x={560} y={276} fontSize={9} letterSpacing={1} className="fill-ink/45">RECV BUFFER</text>
        {Array.from({ length: 8 }, (_, s) => {
          const has = arrived.has(s);
          const inOrder = s < delivered;
          return (
            <g key={s} transform={`translate(${560 + s * 27} 284)`}>
              <rect
                width={23}
                height={21}
                className={inOrder ? 'fill-ink' : has ? 'fill-paper stroke-accent' : 'fill-paper stroke-ink/30'}
                strokeWidth={1.5}
                strokeDasharray={has && !inOrder ? '3 2' : undefined}
              />
              <text x={11.5} y={14.5} fontSize={9} textAnchor="middle" className={inOrder ? 'fill-paper' : has ? 'fill-accent' : 'fill-ink/40'}>
                {s}
              </text>
            </g>
          );
        })}
        <text x={560} y={322} fontSize={8.5} letterSpacing={1} className="fill-ink">
          DELIVERED IN ORDER: {delivered}
        </text>
      </DiagramFrame>
    </div>
  );
}
