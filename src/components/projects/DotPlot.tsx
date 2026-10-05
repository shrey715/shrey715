import { DOT_COLS, DOT_ROWS, dotPlotCells } from '@/lib/projectMeta';
import type { Project } from '@/types';

interface DotPlotProps {
  project: Pick<Project, 'id' | 'activity'>;
  /** Lighten the dots when a parent `.group` is hovered onto an ink background. */
  invertOnHover?: boolean;
  className?: string;
}

/**
 * Commit-activity readout: one column per slice of the repo's history, height
 * = commits in that slice. Private repos get a seeded wave instead.
 */
export default function DotPlot({ project, invertOnHover = false, className = '' }: DotPlotProps) {
  const cells = dotPlotCells(project.id, project.activity?.bins);
  return (
    <svg
      viewBox={`0 0 ${DOT_COLS} ${DOT_ROWS}`}
      className={`w-full h-auto ${className}`}
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
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
              : `${d.base ? 'fill-ink/10' : 'fill-ink/25'} ${
                  invertOnHover ? 'group-hover:fill-paper/40 transition-colors duration-300' : ''
                }`
          }
          style={invertOnHover ? { transitionDelay: `${d.x * 12}ms` } : undefined}
        />
      ))}
    </svg>
  );
}

/** "32 COMMITS · JUL 2026" caption, or nothing for seeded plots. */
export function activityCaption(project: Pick<Project, 'activity'>) {
  const a = project.activity;
  if (!a) return null;
  const when = new Date(a.last).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' }).toUpperCase();
  return `${a.commits}${a.commits >= 100 ? '+' : ''} COMMITS · ${when}`;
}
