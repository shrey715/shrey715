'use client';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const imageY = useTransform(smoothProgress, [0, 1], [0, 60]);
  const imageScale = useTransform(smoothProgress, [0, 1], [1, 1.05]);

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen relative bg-[#f1efe7] overflow-hidden"
    >
      {/* Background effects */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(251, 191, 36, 0.08) 0%, transparent 60%)'
        }}
      />
      
      {/* Ambient floating shapes - Golden Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute w-[700px] h-[700px] rounded-full bg-gradient-to-br from-amber-400/20 to-orange-300/15 blur-[150px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '-20%', right: '-10%' }}
        />
        <motion.div 
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-yellow-400/15 to-amber-200/10 blur-[120px]"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: '10%', left: '-15%' }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-t from-orange-100/30 to-transparent blur-[100px]"
          style={{ bottom: '-10%', left: '50%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Mobile: Stack layout - heading + info, then image */}
      {/* Desktop: Heading at top, role on side */}
      
      {/* Heading */}
      <div className="absolute top-0 left-0 right-0 pt-6 md:pt-10 text-center z-30 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          <span className="bg-gradient-to-b from-[#1a1a1a] via-[#2a2a2a] to-[#4a4a4a] bg-clip-text text-transparent">
            Hey there! I'm Shreyas :)
          </span>
        </motion.h1>
        
        {/* Mobile: Info right after heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 md:hidden"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-[#1a1a1a]/50 font-medium">
            Undergraduate Researcher & Developer
          </p>
          <p className="text-xs tracking-[0.15em] text-[#1a1a1a]/40 mt-1">
            AI · Biology · Systems
          </p>
        </motion.div>
      </div>

      {/* Desktop: Role caption - right side */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-30 text-right hidden md:block"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-[#1a1a1a]/50 font-medium mb-1">
          Undergraduate
        </p>
        <p className="text-sm uppercase tracking-[0.2em] text-[#1a1a1a]/50 font-medium mb-1">
          Researcher
        </p>
        <p className="text-sm uppercase tracking-[0.2em] text-[#1a1a1a]/50 font-medium mb-3">
          & Developer
        </p>
        <div className="w-8 h-px bg-[#1a1a1a]/20 ml-auto mb-3" />
        <p className="text-xs tracking-[0.15em] text-[#1a1a1a]/40 font-normal">
          AI · Biology · Systems
        </p>
      </motion.div>

      {/* Image */}
      <motion.div 
        style={{ y: imageY, scale: imageScale }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[100vw] max-w-[800px] h-[60vh] sm:h-[65vh] md:h-[75vh] lg:h-[80vh]"
        >
          <Image 
            src={`${basePath}/shreyas_cropped.png`}
            alt="Shreyas Deb" 
            fill 
            className="object-contain object-bottom" 
            priority
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </motion.div>
      </motion.div>

      {/* Corner badge - left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8 left-4 sm:left-8 z-40 flex flex-col gap-0.5"
      >
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#1a1a1a]/40 font-medium">
          Third Year CND
        </span>
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#1a1a1a]/60 font-semibold">
          IIIT Hyderabad
        </span>
      </motion.div>

    </section>
  );
}
