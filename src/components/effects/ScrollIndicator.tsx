'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      setIsVisible(true);
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => setIsVisible(false), 1500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const initial = requestAnimationFrame(() => window.scrollY > 0 && setIsVisible(true));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(initial);
      clearTimeout(hideTimeout);
    };
  }, []);

  // Blog posts carry their own reading-progress bar (components/blog/ReadingProgress).
  const isPost = pathname.startsWith('/blog/');
  if (prefersReducedMotion || isPost) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed right-0 top-0 bottom-0 w-1.5 z-[9999] pointer-events-none print:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-transparent" />
      <motion.div
        className="absolute top-0 left-0 right-0 origin-top"
        style={{
          scaleY,
          height: '100%',
          background: 'var(--color-accent)',
        }}
      />
    </motion.div>
  );
}
