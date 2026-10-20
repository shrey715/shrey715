'use client';
import dynamic from 'next/dynamic';

// Loaded on demand: only three project pages have one.
const DIAGRAMS: Record<string, React.ComponentType> = {
  tether: dynamic(() => import('./TetherDiagram')),
  'cuffka-kafka-with-raft': dynamic(() => import('./RaftDiagram')),
  natsuki: dynamic(() => import('./RetrievalDiagram')),
};

/** The animated system diagram for a project, if it has one. */
export default function SystemDiagram({ slug }: { slug: string }) {
  const D = DIAGRAMS[slug];
  return D ? <D /> : null;
}
