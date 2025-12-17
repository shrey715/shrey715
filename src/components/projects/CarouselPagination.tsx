'use client';
import { motion } from 'framer-motion';

interface CarouselPaginationProps {
  total: number;
  activeIndex: number;
  onDotClick: (index: number) => void;
  maxVisible?: number;
}

export default function CarouselPagination({ 
  total, 
  activeIndex, 
  onDotClick,
  maxVisible = 5 
}: CarouselPaginationProps) {
  // Sliding window calculation
  let windowStart: number;
  let windowEnd: number;
  
  if (total <= maxVisible) {
    windowStart = 0;
    windowEnd = total - 1;
  } else {
    const halfWindow = Math.floor(maxVisible / 2);
    windowStart = Math.max(0, activeIndex - halfWindow);
    windowEnd = windowStart + maxVisible - 1;
    
    if (windowEnd >= total) {
      windowEnd = total - 1;
      windowStart = windowEnd - maxVisible + 1;
    }
  }
  
  const hasMoreLeft = windowStart > 0;
  const hasMoreRight = windowEnd < total - 1;

  return (
    <div className="flex justify-center items-center gap-1.5 mt-8">
      {/* Left indicator */}
      {hasMoreLeft && (
        <motion.button
          onClick={() => onDotClick(windowStart - 1)}
          className="w-3 h-3 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          aria-label="Previous projects"
        >
          <div className="w-1 h-1 rounded-full bg-[#a0a0a0]" />
        </motion.button>
      )}
      
      {/* Visible dots */}
      {Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => {
        const actualIndex = windowStart + i;
        return (
          <motion.button
            key={actualIndex}
            onClick={() => onDotClick(actualIndex)}
            className="relative w-4 h-4 flex items-center justify-center group"
            aria-label={`Go to project ${actualIndex + 1}`}
            layout
          >
            <motion.div
              className={`rounded-full transition-all duration-300 ${
                actualIndex === activeIndex 
                  ? 'w-2.5 h-2.5 bg-[#1a1a1a]' 
                  : 'w-2 h-2 bg-[#c0c0c0] group-hover:bg-[#808080]'
              }`}
              layout
            />
            {actualIndex === activeIndex && (
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#1a1a1a]/30"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.button>
        );
      })}
      
      {/* Right indicator */}
      {hasMoreRight && (
        <motion.button
          onClick={() => onDotClick(windowEnd + 1)}
          className="w-3 h-3 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          aria-label="More projects"
        >
          <div className="w-1 h-1 rounded-full bg-[#a0a0a0]" />
        </motion.button>
      )}
    </div>
  );
}
