'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const orbs = [
  { id: 1, size: 280, x: 8, y: 15, speed: 0.25 },
  { id: 2, size: 200, x: 75, y: 55, speed: 0.4 },
  { id: 3, size: 160, x: 25, y: 75, speed: 0.3 },
];

export default function ParallaxBackground() {
  const { scrollY } = useScroll();
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {orbs.map((orb) => (
        <ParallaxOrb key={orb.id} orb={orb} scrollY={scrollY} />
      ))}
    </div>
  );
}

function ParallaxOrb({ orb, scrollY }: { orb: typeof orbs[0]; scrollY: any }) {
  const y = useTransform(scrollY, [0, 2000], [0, 400 * orb.speed]);
  const smoothY = useSpring(y, { stiffness: 30, damping: 30, mass: 1 });
  
  return (
    <motion.div
      className="absolute rounded-full will-change-transform"
      style={{
        width: orb.size,
        height: orb.size,
        left: `${orb.x}%`,
        top: `${orb.y}%`,
        y: smoothY,
        background: 'rgba(255, 255, 255, 0.35)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.03), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: orb.id * 0.2 }}
    />
  );
}
