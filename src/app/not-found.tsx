import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProjects } from '@/lib/projects';
import Shell404 from '@/components/ui/Shell404';

export default async function NotFound() {
  const projects = (await getProjects()).map((p) => ({ slug: p.slug, title: p.title }));

  return (
    <main id="main" className="relative min-h-dvh bg-paper text-ink grid-lines flex flex-col overflow-hidden">
      {/* Top metadata bar */}
      <div className="w-full border-b-2 border-ink flex items-stretch justify-between font-mono-label text-[10px] sm:text-[11px]">
        <span className="px-4 py-2.5 border-r-2 border-ink hidden sm:block">ERROR</span>
        <span className="px-4 py-2.5 flex-1 hidden md:flex items-center">SIGNAL&nbsp;LOST</span>
        <span className="px-4 py-2.5 border-l-2 border-ink flex items-center gap-2 mr-16 sm:mr-20">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          404
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 relative">
        {/* Bleeding ghost numeral */}
        <span
          aria-hidden="true"
          className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display leading-none select-none text-stroke-ghost"
          style={{ fontSize: 'clamp(16rem, 42vw, 38rem)' }}
        >
          404
        </span>

        <div className="relative z-10 w-full flex flex-col items-center">
          <p className="font-mono-label text-xs text-ink/60 mb-4">
            <span className="text-accent">{'// ERR_PAGE_NOT_FOUND'}</span>
          </p>
          <h1 className="font-display text-ink leading-none" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)' }}>
            SEGMENTATION&nbsp;FAULT
            <span className="text-accent">&nbsp;(CORE&nbsp;DUMPED)</span>
          </h1>
          <p className="text-ink/70 max-w-md mx-auto leading-relaxed mt-4 mb-10">
            This address isn&apos;t mapped. The shell below works, though — find your way out.
          </p>

          <Shell404 projects={projects} />

          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <Link
              href="/"
              data-cursor="HOME"
              className="inline-flex items-center gap-3 px-5 py-3.5 bg-ink text-paper hard-border font-mono-label text-xs hover:bg-accent hover:border-accent transition-colors"
            >
              <ArrowLeft size={15} />
              RETURN&nbsp;HOME
            </Link>
            <Link
              href="/projects"
              data-cursor="OPEN"
              className="inline-flex items-center gap-3 px-5 py-3.5 bg-paper text-ink hard-border font-mono-label text-xs hover:bg-ink hover:text-paper transition-colors"
            >
              VIEW&nbsp;PROJECTS
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar (a <footer>, so the HUD steps aside for it) */}
      <footer className="border-t-2 border-ink flex items-center justify-between font-mono-label text-[10px] text-ink/50 px-4 sm:px-6 py-2.5">
        <span>SHREYAS&nbsp;DEB</span>
        <span>
          EXIT&nbsp;CODE&nbsp;<span className="text-accent">1</span>
        </span>
      </footer>
    </main>
  );
}
