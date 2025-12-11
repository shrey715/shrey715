'use client';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

interface WaveDividerProps {
  fromColor: string;
  toColor: string;
  flip?: boolean;
}

const WAVE_PATHS = [
  // Wave 1 - Slowest
  "M0,160L80,144C160,128,320,96,480,106.7C640,117,800,171,960,186.7C1120,203,1280,181,1440,160C1440,160,1520,144,1600,144C1680,144,1760,128,1920,106.7C2080,117,2240,171,2400,186.7C2560,203,2720,181,2880,160L2880,320L0,320Z",
  // Wave 2 - Medium
  "M0,192L80,181.3C160,171,320,149,480,160C640,171,800,213,960,218.7C1120,224,1280,192,1440,192C1440,192,1520,181.3,1600,181.3C1680,181,1760,149,1920,160C2080,171,2240,213,2400,218.7C2560,224,2720,192,2880,192L2880,320L0,320Z",
  // Wave 3 - Faster
  "M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,234.7C1120,245,1280,235,1440,224C1440,224,1520,213.3,1600,213.3C1680,213,1760,181,1920,186.7C2080,192,2240,224,2400,234.7C2560,245,2720,235,2880,224L2880,320L0,320Z",
  // Wave 4 - Solid front
  "M0,256L80,250.7C160,245,320,235,480,224C640,213,800,203,960,213.3C1120,224,1280,256,1440,256C1440,256,1520,250.7,1600,250.7C1680,250,1760,235,1920,224C2080,213,2240,203,2400,213.3C2560,224,2720,256,2880,256L2880,320L0,320Z"
];

const WAVES = [
  { opacity: 0.2, duration: 25, yRange: [15, -15], animateX: [0, '-50vw'] },
  { opacity: 0.4, duration: 18, yRange: [25, -25], animateX: ['-50vw', 0] },
  { opacity: 0.65, duration: 12, yRange: [10, -10], animateX: [0, '-50vw'] },
  { opacity: 1, duration: 8, yRange: [0, 0], animateX: ['-50vw', 0] }
];

export default function WaveDivider({ fromColor, toColor, flip = false }: WaveDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const transforms = WAVES.map(w => useTransform(smoothProgress, [0, 1], w.yRange));

  return (
    <div 
      ref={ref}
      className="relative h-24 sm:h-28 md:h-36 lg:h-44 w-full overflow-hidden"
      style={{ 
        background: fromColor,
        transform: flip ? 'scaleY(-1)' : 'none',
        marginBottom: '-2px',
        marginTop: '-2px',
        zIndex: 1
      }}
    >
      {/* Background filler to hide gaps */}
      <div 
        className="absolute inset-0 w-full h-full scale-105" 
        style={{ background: fromColor, zIndex: -1 }} 
      />
      {WAVES.map((wave, i) => (
        <motion.div 
          key={i} 
          className="absolute inset-0 w-full h-full"
          style={{ 
            y: transforms[i],
            zIndex: i
          }}
        >
          <motion.div
            className="absolute bottom-0 h-full w-[200vw]"
            style={{ 
              left: '-50vw',
              willChange: 'transform' // Performance optimization
            }}
            animate={{ x: wave.animateX }}
            transition={{ duration: wave.duration, repeat: Infinity, ease: "linear" }}
          >
            <svg
              viewBox="0 0 2880 320"
              preserveAspectRatio="none"
              className="w-full h-full block"
              style={{ 
                transform: flip ? 'scaleY(-1) scale(1.01)' : 'scale(1.01)', // Slight scale to bleed over edges
              }}
            >
              <path
                fill={toColor}
                fillOpacity={wave.opacity}
                d={WAVE_PATHS[i]}
              />
            </svg>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
