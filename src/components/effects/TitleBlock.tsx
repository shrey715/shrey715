'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useIntroReady } from '@/hooks/useIntroReady';
import { useSheets } from '@/hooks/useSheets';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DUR, EASE_OUT } from '@/lib/motion';
import { SOUND_EVENT, setSoundEnabled, soundEnabled } from '@/lib/sound';
import type { LatestPush } from '@/lib/github';

const DockSpecimen = dynamic(() => import('@/components/three/DockSpecimen'), { ssr: false });

function ago(iso: string) {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}M`;
  if (s < 86400) return `${Math.round(s / 3600)}H`;
  return `${Math.round(s / 86400)}D`;
}

function subscribeSound(cb: () => void) {
  window.addEventListener(SOUND_EVENT, cb);
  return () => window.removeEventListener(SOUND_EVENT, cb);
}

/**
 * The drawing set's title block, pinned bottom-right like the corner of an
 * engineering sheet: which sheet you're on, drafter, scale, revision, live
 * time, last push — plus the docked particle specimen (which re-forms for
 * each sheet) and the sound toggle. Steps aside while a footer is on screen.
 * Desktop only.
 */
export default function TitleBlock({ latestPush }: { latestPush: LatestPush | null }) {
  const [time, setTime] = useState('');
  const [footerVisible, setFooterVisible] = useState(false);
  const pathname = usePathname();
  const introReady = useIntroReady();
  const prefersReducedMotion = useReducedMotion();
  const { names, specimens, index } = useSheets();
  const sound = useSyncExternalStore(subscribeSound, soundEnabled, () => false);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata' }));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  // Each page mounts its own footer; re-scan per route.
  useEffect(() => {
    const footers = document.querySelectorAll('footer');
    if (footers.length === 0) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setFooterVisible(visible.size > 0);
    });
    footers.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, [pathname]);

  // A drawing set's cover is sheet 00, so section headers (01…) line up.
  const hasCover = names[0] === 'COVER';
  const sheetNo = index + (hasCover ? 0 : 1);
  const total = Math.max(names.length - (hasCover ? 1 : 0), 1);
  const sheetName = names[index] ?? '—';
  const specimen = specimens[index] ?? null;
  const hasSpecimens = specimens.some(Boolean);
  const pad = (n: number) => String(n).padStart(2, '0');
  const rev = new Date();

  const cell = 'px-2.5 py-1.5 border-ink';

  return (
    <div
      className={`fixed bottom-4 right-6 z-[9998] hidden lg:flex items-stretch hard-border bg-paper font-mono-label text-[9px] text-ink/70 select-none print:hidden transition-[opacity,transform] duration-300 ${
        footerVisible || !introReady ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Docked specimen */}
      {hasSpecimens && (
        <div aria-hidden="true" className="relative w-[112px] border-r-2 border-ink bg-paper grid-lines overflow-hidden">
          {/* Only mounted while there's something to show — no idle WebGL. */}
          {specimen && <DockSpecimen shape={specimen} still={prefersReducedMotion} />}
          {/* Registration cross when there's nothing docked */}
          {!specimen && (
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="relative w-4 h-4">
                <span className="absolute left-1/2 top-0 h-full w-px bg-ink/30" />
                <span className="absolute top-1/2 left-0 w-full h-px bg-ink/30" />
              </span>
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col min-w-[290px]">
        <div className={`${cell} border-b-2 flex justify-between gap-4 text-ink`}>
          <span>SHREYAS DEB — DRAWING SET</span>
          <span className="tabular-nums">
            SHEET <span className="text-accent">{pad(sheetNo)}</span>/{pad(total)}
          </span>
        </div>
        <div className={`${cell} border-b-2 relative h-[30px] overflow-hidden`}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={sheetName}
              className="absolute inset-x-2.5 inset-y-0 flex items-center font-display normal-case tracking-normal text-[16px] leading-none text-ink"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: DUR.fast * 1.4, ease: EASE_OUT }}
            >
              <span className="truncate">{sheetName}</span>
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex border-b-2 border-ink">
          <span className={`${cell} border-r-2 flex-1`}>DRN S.DEB</span>
          <span className={`${cell} border-r-2`}>SCALE 1:1</span>
          <span className={`${cell} tabular-nums`}>
            REV {rev.getFullYear()}.{pad(rev.getMonth() + 1)}
          </span>
        </div>
        <div className="flex items-stretch">
          <span className={`${cell} border-r-2 tabular-nums`}>{time || '--:--:--'} IST</span>
          <span className={`${cell} flex-1 truncate`}>
            {latestPush && time ? (
              <>
                PUSH <span className="text-accent">{latestPush.repo.toUpperCase()}</span> · {ago(latestPush.at)}
              </>
            ) : (
              'HYDERABAD'
            )}
          </span>
          <button
            type="button"
            onClick={() => setSoundEnabled(!sound)}
            aria-label={sound ? 'Turn sound off' : 'Turn sound on'}
            data-cursor={sound ? 'MUTE' : 'SOUND'}
            className="pointer-events-auto flex items-center gap-1 px-2.5 border-l-2 border-ink hover:bg-ink hover:text-paper transition-colors"
          >
            {sound ? <Volume2 size={11} /> : <VolumeX size={11} />}
            {sound ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}
