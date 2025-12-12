'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
  image?: string;
  year?: string;
  status?: string;
}

interface ProjectsCarouselProps {
  projects: Project[];
}

export default function ProjectsCarousel({ projects }: ProjectsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Card dimensions
  const getCardWidth = () => window.innerWidth >= 768 ? 424 : 364;

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    
    // Update active index
    const cardWidth = getCardWidth();
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.max(0, Math.min(newIndex, projects.length - 1)));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollButtons, { passive: true });
      checkScrollButtons();
      return () => el.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  // Convert vertical scroll to horizontal scroll within the carousel
  // Using window-level listener with hover detection to bypass child element event capturing
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    let isOverCarousel = false;
    let snapTimeout: NodeJS.Timeout | null = null;
    let velocity = 0;
    let lastScrollTime = 0;
    
    // Snap to nearest card after scrolling stops
    const snapToNearestCard = () => {
      const cardWidth = getCardWidth();
      const currentScroll = el.scrollLeft;
      const nearestCardIndex = Math.round(currentScroll / cardWidth);
      const targetScroll = nearestCardIndex * cardWidth;
      
      // Smooth snap with CSS transition
      el.style.scrollBehavior = 'smooth';
      el.scrollLeft = targetScroll;
      
      setTimeout(() => {
        el.style.scrollBehavior = 'auto';
      }, 350);
    };

    const handleMouseEnter = () => { isOverCarousel = true; };
    const handleMouseLeave = () => { 
      isOverCarousel = false;
      // Snap when leaving the carousel area
      if (snapTimeout) clearTimeout(snapTimeout);
      snapToNearestCard();
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isOverCarousel) return;
      
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        
        // Apply momentum-based scrolling with damping
        const now = Date.now();
        const timeDelta = now - lastScrollTime;
        lastScrollTime = now;
        
        // Smooth out rapid scroll events
        const scrollMultiplier = timeDelta < 50 ? 0.8 : 1;
        const scrollAmount = e.deltaY * scrollMultiplier;
        
        // Update velocity for momentum
        velocity = velocity * 0.3 + scrollAmount * 0.7;
        el.scrollLeft += velocity;
        
        // Debounce snap - wait for scrolling to stop
        if (snapTimeout) clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
          velocity = 0;
          snapToNearestCard();
        }, 120);
      }
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('wheel', handleWheel);
      if (snapTimeout) clearTimeout(snapTimeout);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = getCardWidth();
    const targetIndex = direction === 'left' 
      ? Math.max(0, activeIndex - 1) 
      : Math.min(projects.length - 1, activeIndex + 1);
    
    scrollRef.current.style.scrollBehavior = 'smooth';
    scrollRef.current.scrollLeft = targetIndex * cardWidth;
    
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.style.scrollBehavior = 'auto';
      }
    }, 400);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = getCardWidth();
    
    scrollRef.current.style.scrollBehavior = 'smooth';
    scrollRef.current.scrollLeft = index * cardWidth;
    
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.style.scrollBehavior = 'auto';
      }
    }, 400);
  };

  return (
    <section className="py-28 bg-[#f1efe7] dot-grid relative">
      {/* Section Header */}
      <div className="max-w-5xl mx-auto px-4 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-dark mb-3">Projects</h2>
            <p className="text-[#6b6b6b] text-lg">A selection of my recent work</p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="hidden md:flex gap-3">
            <motion.button
              onClick={() => scroll('left')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!canScrollLeft}
              className={`p-4 rounded-full border transition-all shadow-sm ${
                canScrollLeft 
                  ? 'bg-white border-[#e0e0e0] text-[#4a4a4a] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a]' 
                  : 'bg-[#f5f5f5] border-[#e8e8e8] text-[#c0c0c0] cursor-not-allowed'
              }`}
              aria-label="Previous project"
            >
              <ChevronLeft size={22} />
            </motion.button>
            <motion.button
              onClick={() => scroll('right')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!canScrollRight}
              className={`p-4 rounded-full border transition-all shadow-sm ${
                canScrollRight 
                  ? 'bg-white border-[#e0e0e0] text-[#4a4a4a] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a]' 
                  : 'bg-[#f5f5f5] border-[#e8e8e8] text-[#c0c0c0] cursor-not-allowed'
              }`}
              aria-label="Next project"
            >
              <ChevronRight size={22} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Container - Enhanced smoothness */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-4 md:px-8 pb-6"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Left spacer */}
        <div className="flex-shrink-0 w-4 md:w-[calc(50vw-240px)]" />
        
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
        
        {/* Right spacer */}
        <div className="flex-shrink-0 w-4 md:w-[calc(50vw-240px)]" />
      </div>

      {/* Progress Dots - Sliding Window */}
      <div className="flex justify-center items-center gap-1.5 mt-8">
        {(() => {
          const maxVisible = 5;
          const total = projects.length;
          
          // Calculate the visible window
          let windowStart: number;
          let windowEnd: number;
          
          if (total <= maxVisible) {
            // Show all dots if we have 5 or fewer
            windowStart = 0;
            windowEnd = total - 1;
          } else {
            // Center the active index in the window when possible
            const halfWindow = Math.floor(maxVisible / 2);
            windowStart = Math.max(0, activeIndex - halfWindow);
            windowEnd = windowStart + maxVisible - 1;
            
            // Adjust if we're near the end
            if (windowEnd >= total) {
              windowEnd = total - 1;
              windowStart = windowEnd - maxVisible + 1;
            }
          }
          
          const hasMoreLeft = windowStart > 0;
          const hasMoreRight = windowEnd < total - 1;
          
          return (
            <>
              {/* Left indicator dot */}
              {hasMoreLeft && (
                <motion.button
                  onClick={() => scrollToIndex(windowStart - 1)}
                  className="w-3 h-3 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  aria-label="Previous projects"
                >
                  <div className="w-1 h-1 rounded-full bg-[#a0a0a0]" />
                </motion.button>
              )}
              
              {/* Visible dots */}
              {projects.slice(windowStart, windowEnd + 1).map((_, i) => {
                const actualIndex = windowStart + i;
                return (
                  <motion.button
                    key={actualIndex}
                    onClick={() => scrollToIndex(actualIndex)}
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
              
              {/* Right indicator dot */}
              {hasMoreRight && (
                <motion.button
                  onClick={() => scrollToIndex(windowEnd + 1)}
                  className="w-3 h-3 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  aria-label="More projects"
                >
                  <div className="w-1 h-1 rounded-full bg-[#a0a0a0]" />
                </motion.button>
              )}
            </>
          );
        })()}
      </div>

      {/* Mobile swipe hint */}
      <p className="text-center text-sm text-[#808080] mt-4 md:hidden">
        ← Swipe to explore →
      </p>
    </section>
  );
}

const getRepoInfo = (url: string) => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { user: parts[0], repo: parts[1] };
    }
  } catch (e) {
    return null;
  }
  return null;
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), { stiffness: 300, damping: 30 });

  const repoInfo = getRepoInfo(project.link);
  // Fallback to standard social card if not github, or default gradient
  const imageUrl = repoInfo 
    ? `https://opengraph.githubassets.com/1/${repoInfo.user}/${repoInfo.repo}`
    : project.image;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
      className="flex-shrink-0 w-[340px] md:w-[400px] snap-center"
      style={{ scrollSnapAlign: 'center' }}
    >
      <a href={project.link} target="_blank" rel="noopener noreferrer" className="block h-full group">
        <motion.div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 25 } }}
          className="h-full rounded-2xl bg-white border border-[#e8e8e8] shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-shadow duration-500"
        >
          {/* Project Preview */}
          <div className="h-48 bg-gray-100 flex items-center justify-center border-b border-[#e8e8e8] relative overflow-hidden group-hover:brightness-95 transition-all">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={`${project.title} preview`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <motion.span 
                className="text-6xl select-none"
                initial={{ opacity: 0.3 }}
                whileHover={{ opacity: 0.5, scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >
                🚀
              </motion.span>
            )}
            
            {project.year && (
              <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/90 text-[#4a4a4a] border border-[#e0e0e0] shadow-sm backdrop-blur-sm z-10">
                {project.year}
              </span>
            )}
            
            {project.status && (
              <span className="absolute top-4 right-4 px-3 py-1.5 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200 z-10">
                {project.status}
              </span>
            )}
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="flex justify-between items-start gap-3 mb-3">
              <h3 className="text-xl font-bold text-[#1a1a1a] group-hover:text-black transition-colors line-clamp-1">
                {project.title}
              </h3>
              <motion.div 
                className="flex-shrink-0 p-2 rounded-full bg-[#f5f5f5] border border-[#e8e8e8] group-hover:bg-[#1a1a1a] group-hover:border-[#1a1a1a] transition-all"
                whileHover={{ scale: 1.1 }}
              >
                <ArrowUpRight className="w-4 h-4 text-[#4a4a4a] group-hover:text-white transition-colors" />
              </motion.div>
            </div>
            
            <p className="text-[#6b6b6b] text-sm leading-relaxed mb-5 line-clamp-2 min-h-[44px]">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {project.tech.slice(0, 4).map((t) => (
                <span 
                  key={t}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#f5f5f5] text-[#4a4a4a] border border-[#e8e8e8]"
                >
                  {t}
                </span>
              ))}
              {project.tech.length > 4 && (
                <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#f0f0f0] text-[#808080]">
                  +{project.tech.length - 4}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </a>
    </motion.div>
  );
}
