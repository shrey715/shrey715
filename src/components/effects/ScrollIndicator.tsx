'use client';
import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Custom scroll indicator that uses mix-blend-mode to adapt colors
 * based on the background it's positioned over.
 */
export default function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const handleScroll = () => {
      // Show indicator when user starts scrolling
      setIsVisible(true);
    };

    const handleScrollEnd = () => {
      // Keep visible while scrolling, hide after idle
      const timeout = setTimeout(() => setIsVisible(false), 1500);
      return () => clearTimeout(timeout);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    if (window.scrollY > 0) setIsVisible(true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <motion.div
      className="fixed right-2 top-0 bottom-0 w-1 z-[9999] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Track (invisible) */}
      <div className="absolute inset-0 bg-transparent" />
      
      {/* Thumb with mix-blend-mode */}
      <motion.div
        className="absolute top-0 left-0 right-0 origin-top rounded-full"
        style={{
          scaleY,
          height: '100%',
          background: 'gray',
          mixBlendMode: 'difference',
        }}
      />
    </motion.div>
  );
}
