'use client';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import GlowOrb from '@/components/effects/GlowOrb';
import { ProjectCard, ProjectModal, CarouselPagination, CARD_WIDTH_MOBILE, CARD_WIDTH_DESKTOP } from '@/components/projects';
import type { Project } from '@/types';

interface ProjectsCarouselProps {
  projects: Project[];
}

const CARD_GAP = 24;
const MD_BREAKPOINT = 768;

export default function ProjectsCarousel({ projects }: ProjectsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);
  const [sidePadding, setSidePadding] = useState(16);

  const getCardWidth = () => window.innerWidth >= MD_BREAKPOINT ? CARD_WIDTH_DESKTOP : CARD_WIDTH_MOBILE;
  const getGap = () => CARD_GAP;

  const calculatePadding = () => {
    const cardWidth = getCardWidth();
    const viewportWidth = window.innerWidth;
    setSidePadding(Math.max(16, (viewportWidth / 2) - (cardWidth / 2)));
  };

  useEffect(() => {
    calculatePadding();
    window.addEventListener('resize', calculatePadding);
    return () => window.removeEventListener('resize', calculatePadding);
  }, []);

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    
    const cardStep = getCardWidth() + getGap();
    const newIndex = Math.round(scrollLeft / cardStep);
    setActiveIndex(Math.max(0, Math.min(newIndex, projects.length - 1)));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollButtons, { passive: true });
      checkScrollButtons();
      return () => el.removeEventListener('scroll', checkScrollButtons);
    }
  }, [projects.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    let scrollEndTimer: NodeJS.Timeout | null = null;
    let isWheelScrolling = false;
    
    const snapToNearestCard = () => {
      const cardWidth = getCardWidth() + getGap();
      const nearestCardIndex = Math.round(el.scrollLeft / cardWidth);
      el.scrollTo({ left: nearestCardIndex * cardWidth, behavior: 'smooth' });
      isWheelScrolling = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (activeModalProject) return;

      const isAtLeft = el.scrollLeft <= 0;
      const isAtRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

      if ((isAtLeft && e.deltaY < 0) || (isAtRight && e.deltaY > 0)) return;

      e.preventDefault();
      isWheelScrolling = true;
      el.scrollLeft += e.deltaY;
      
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(snapToNearestCard, 120);
    };

    const handleScrollEnd = () => {
      if (!isWheelScrolling) {
        if (scrollEndTimer) clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(snapToNearestCard, 150);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scrollend', handleScrollEnd, { passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scrollend', handleScrollEnd);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
    };
  }, [activeModalProject]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = getCardWidth() + getGap();
    scrollRef.current.scrollTo({
      left: scrollRef.current.scrollLeft + (direction === 'left' ? -cardWidth : cardWidth),
      behavior: 'smooth'
    });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * (getCardWidth() + getGap()),
      behavior: 'smooth'
    });
  };

  return (
    <section className="py-28 bg-[#f1efe7] relative overflow-visible">
      <GlowOrb color="bg-amber-500/15" size="xl" blur="xl" position={{ top: '10%', left: '-8%' }} />
      <GlowOrb color="bg-orange-400/10" size="lg" blur="xl" position={{ bottom: '5%', right: '-5%' }} />

      <div className="max-w-5xl mx-auto px-4 mb-14">
        <FadeIn duration={0.6} className="flex items-end justify-between">
          <div>
            <h2 
              className="text-4xl md:text-5xl font-bold text-gradient-dark mb-3"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Projects
            </h2>
            <p className="text-[#6b6b6b] text-lg">A selection of my recent work</p>
          </div>
          
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
        </FadeIn>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 relative"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          paddingLeft: sidePadding,
          paddingRight: sidePadding,
        }}
      >
        {projects.map((project, index) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            index={index} 
            onOpenModal={() => setActiveModalProject(project)}
          />
        ))}
      </div>

      <CarouselPagination 
        total={projects.length}
        activeIndex={activeIndex}
        onDotClick={scrollToIndex}
      />

      <p className="text-center text-sm text-[#808080] mt-4 md:hidden">
        ← Swipe to explore →
      </p>

      <ProjectModal 
        project={activeModalProject} 
        onClose={() => setActiveModalProject(null)} 
      />
    </section>
  );
}
