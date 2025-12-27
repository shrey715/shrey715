'use client';
import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(false);
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
    if (window.scrollY > 0) setIsVisible(true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(hideTimeout);
    };
  }, []);

  return (
    <motion.div
      className="fixed right-0 top-0 bottom-0 w-1 z-[9999] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-transparent" />
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
