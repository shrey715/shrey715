import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import path from 'path';
import { getProjects, getProjectBySlug } from '@/lib/projects';
import { DOMAINS, DOT_COLS, DOT_ROWS, dotPlotCells, projectDomains } from '@/lib/projectMeta';

// Rendered once per project at build time; also works under `output: export`
// (the folder is literally named cover.png, so the exported file is a .png).
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

const PAPER = '#ede8dc';
const INK = '#0e0e0e';
const ACCENT = '#ff3d00';
const W = 1200;
const H = 630;

function titleSize(title: string) {
  const n = title.length;
  if (n <= 10) return 168;
  if (n <= 16) return 132;
  if (n <= 24) return 104;
  return 84;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) return new Response('Not found', { status: 404 });
  const { project, index, total } = found;

  const fontDir = path.join(process.cwd(), 'src/assets/fonts');
  const [anton, mono, monoBold] = await Promise.all([
    readFile(path.join(fontDir, 'Anton-Regular.ttf')),
    readFile(path.join(fontDir, 'JetBrainsMono-Regular.ttf')),
    readFile(path.join(fontDir, 'JetBrainsMono-Bold.ttf')),
  ]);

  const cells = dotPlotCells(project.id, project.activity?.bins);
  const domains = [...projectDomains(project)].map((d) => DOMAINS.find((x) => x.id === d)?.label).filter(Boolean);
  const num = String(index + 1).padStart(2, '0');
  const cell = 15;
  const gap = 6;
  const label = { fontFamily: 'Mono', fontSize: 18, letterSpacing: 3.5, textTransform: 'uppercase' as const };

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          flexDirection: 'column',
          background: PAPER,
          backgroundImage:
            'linear-gradient(to right, rgba(14,14,14,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,14,14,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          padding: 28,
          color: INK,
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: `3px solid ${INK}`, background: 'rgba(237,232,220,0.6)' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', borderBottom: `3px solid ${INK}`, ...label }}>
            <div style={{ display: 'flex', padding: '14px 22px', background: INK, color: PAPER }}>FIG.{num}</div>
            <div style={{ display: 'flex', padding: '14px 22px', flex: 1, opacity: 0.7 }}>SHREYAS DEB / PROJECTS</div>
            <div style={{ display: 'flex', padding: '14px 22px', borderLeft: `3px solid ${INK}` }}>
              {project.year ?? ''}
              {domains.length ? `  ·  ${domains.join(' / ')}` : ''}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '30px 36px 32px' }}>
            {/* Dot plot — real commit activity when the repo is public */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', position: 'relative', width: DOT_COLS * (cell + gap), height: DOT_ROWS * (cell + gap) }}>
                {cells.map((d) => (
                  <div
                    key={`${d.x}-${d.y}`}
                    style={{
                      position: 'absolute',
                      left: d.x * (cell + gap),
                      top: d.y * (cell + gap),
                      width: cell,
                      height: cell,
                      background: d.hot ? ACCENT : d.base ? 'rgba(14,14,14,0.1)' : 'rgba(14,14,14,0.28)',
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ...label, fontSize: 16, opacity: 0.55 }}>
                <span>{project.activity ? `${project.activity.commits} COMMITS` : 'SPECIMEN'}</span>
                <span style={{ marginTop: 6 }}>
                  {num} / {String(total).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Anton',
                  fontSize: titleSize(project.title),
                  lineHeight: 0.9,
                  textTransform: 'uppercase',
                  letterSpacing: -1,
                  maxWidth: 1060,
                }}
              >
                {project.title}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                {project.tech.slice(0, 4).map((t) => (
                  <div key={t} style={{ display: 'flex', border: `2px solid rgba(14,14,14,0.3)`, padding: '6px 12px', ...label, fontSize: 15 }}>
                    {t}
                  </div>
                ))}
                <div style={{ display: 'flex', flex: 1 }} />
                <div style={{ display: 'flex', width: 34, height: 34, background: ACCENT }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: 'Anton', data: anton, weight: 400, style: 'normal' },
        { name: 'Mono', data: mono, weight: 400, style: 'normal' },
        { name: 'Mono', data: monoBold, weight: 700, style: 'normal' },
      ],
    },
  );
}
