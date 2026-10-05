'use client';
import Image from 'next/image';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const SRC = `${basePath}/shreyas_cropped.png`;

const HalftonePortrait = dynamic(() => import('@/components/three/HalftonePortrait'), { ssr: false });
const SIZES = '(max-width: 1024px) 80vw, 560px';

/**
 * Framed duotone portrait: cursor-tracked 3D tilt, RGB-split glitch on hover,
 * an offset accent block behind, and a slow scroll parallax inside the frame.
 */
export default function Portrait({
  className = '',
  aspect = 'aspect-[4/5]',
}: {
  className?: string;
  /** Tailwind aspect-ratio classes for the frame. */
  aspect?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const blockX = useTransform(scrollYProgress, [0, 1], [-10, 6]);
  // Halftone → photo as the portrait rises into view.
  const reveal = useRef(0);
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    reveal.current = Math.min(1, Math.max(0, (p - 0.12) / 0.3));
  });

  const tiltX = useMotionValue(0.5);
  const tiltY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(tiltY, [0, 1], [8, -8]), { stiffness: 140, damping: 18 });
  const rotateY = useSpring(useTransform(tiltX, [0, 1], [-8, 8]), { stiffness: 140, damping: 18 });

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    tiltX.set((e.clientX - rect.left) / rect.width);
    tiltY.set((e.clientY - rect.top) / rect.height);
  };
  const resetTilt = () => {
    tiltX.set(0.5);
    tiltY.set(0.5);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div
        aria-hidden="true"
        style={{ x: prefersReducedMotion ? 0 : blockX }}
        className="absolute -inset-3 sm:-inset-4 bg-accent translate-x-3 translate-y-3"
      />
      <motion.div
        onMouseMove={handleTilt}
        onMouseLeave={resetTilt}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformPerspective: 900,
        }}
        data-cursor="FIG.02"
        className="relative"
      >
        <div className={`relative hard-border border-paper bg-paper-dim overflow-hidden group ${aspect}`}>
          <motion.div style={{ y: prefersReducedMotion ? 0 : imageY }} className="absolute -inset-y-[7%] inset-x-0">
            <Image
              src={SRC}
              alt="Portrait of Shreyas Deb"
              fill
              className="object-cover object-top grayscale contrast-125"
              sizes={SIZES}
            />
          </motion.div>
          <div className="absolute inset-0 bg-accent/15 mix-blend-multiply pointer-events-none" />
          {/* WebGL halftone that resolves into the photo as it scrolls in;
              the image underneath is the fallback (and the reduced-motion view). */}
          {!prefersReducedMotion && <HalftonePortrait src={SRC} reveal={reveal} className="absolute inset-0" />}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-ink text-paper font-mono-label text-[10px] flex justify-between">
            <span>FIG.02</span>
            <span>THE&nbsp;HUMAN</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
