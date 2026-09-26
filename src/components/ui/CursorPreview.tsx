'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { EASE_OUT } from '@/lib/constants';

export interface PreviewItem {
  id: string;
  src: string;
  label: string;
  /** Tailwind aspect-ratio class for the image. */
  aspect?: string;
}

/**
 * Image card that trails the cursor while a list row is hovered — used by
 * the project and blog indexes. Hover-capable pointers only.
 */
export default function CursorPreview({ item }: { item: PreviewItem | null }) {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setEnabled(mq.matches);
    mq.addEventListener('change', sync);
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX + 36);
      y.set(e.clientY - 90);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    // Initial sync happens in a callback so it isn't a synchronous effect update.
    queueMicrotask(sync);
    return () => {
      mq.removeEventListener('change', sync);
      window.removeEventListener('mousemove', onMove);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy }}
      className="fixed left-0 top-0 z-[9000] pointer-events-none print:hidden"
    >
      <AnimatePresence mode="popLayout">
        {item && (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9, rotate: -3, clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ opacity: 1, scale: 1, rotate: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="w-[340px] bg-paper hard-border hard-shadow"
          >
            <div className={`relative overflow-hidden bg-paper-dim border-b-2 border-ink ${item.aspect ?? 'aspect-[2/1]'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt="" className="w-full h-full object-cover grayscale contrast-110" />
              <div className="absolute inset-0 bg-accent/10 mix-blend-multiply" />
            </div>
            <div className="flex justify-between px-3 py-1.5 font-mono-label text-[9px] text-ink/60">
              <span>PREVIEW</span>
              <span className="truncate ml-3">{item.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
