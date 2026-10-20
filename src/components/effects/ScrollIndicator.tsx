'use client';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Small screens' stand-in for the desktop rulers: a thin ruler across the top
 * whose accent fill tracks page progress, with tick marks every 10%.
 * Blog posts carry their own reading-progress bar instead.
 */
export default function ScrollIndicator() {
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  if (prefersReducedMotion || pathname.startsWith('/blog/')) return null;

  return (
    <div aria-hidden="true" className="lg:hidden fixed top-0 inset-x-0 h-[5px] z-[9999] pointer-events-none print:hidden">
      <div
        className="absolute inset-0 mix-blend-difference"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '10% 100%',
        }}
      />
      <motion.div className="absolute inset-y-0 left-0 right-0 bg-accent origin-left" style={{ scaleX }} />
    </div>
  );
}
