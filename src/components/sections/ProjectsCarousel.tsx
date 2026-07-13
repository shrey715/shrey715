'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Magnetic from '@/components/ui/Magnetic';
import SectionHeader from '@/components/ui/SectionHeader';
import Section, { Container } from '@/components/ui/Section';
import { CONTENT_MAX_WIDTH } from '@/lib/constants';
import { ProjectCard, ProjectModal, CarouselPagination, CARD_WIDTH_MOBILE, CARD_WIDTH_DESKTOP } from '@/components/projects';
import type { Project } from '@/types';

interface ProjectsCarouselProps {
  projects: Project[];
}

const CARD_GAP = 24;
const MD_BREAKPOINT = 768;

export default function ProjectsCarousel({ projects }: ProjectsCarouselProps) {
  const total = projects.length;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [sidePadding, setSidePadding] = useState(16);

  // Pointer drag-to-scroll state (mouse only — touch/trackpad use native scroll).
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  const getStep = useCallback(() => {
    const cardWidth = window.innerWidth >= MD_BREAKPOINT ? CARD_WIDTH_DESKTOP : CARD_WIDTH_MOBILE;
    return cardWidth + CARD_GAP;
  }, []);

  // Align the first card with the section header's left edge.
  const calculatePadding = useCallback(() => {
    const gutter = Math.max(0, (window.innerWidth - CONTENT_MAX_WIDTH) / 2);
    setSidePadding(gutter + (window.innerWidth >= 640 ? 24 : 16));
  }, []);

  useEffect(() => {
    calculatePadding();
    window.addEventListener('resize', calculatePadding);
    return () => window.removeEventListener('resize', calculatePadding);
  }, [calculatePadding]);

  const syncScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScroll - 10);
    // Continuous progress so the bar fills fully at the end, even when the
    // last cards share the viewport and can't snap to the left.
    setProgress(maxScroll > 0 ? Math.min(1, scrollLeft / maxScroll) : 1);
    const atEnd = maxScroll > 0 && scrollLeft >= maxScroll - 2;
    const idx = atEnd ? total - 1 : Math.round(scrollLeft / getStep());
    setActiveIndex(Math.max(0, Math.min(idx, total - 1)));
  }, [getStep, total]);

  // rAF-throttle the scroll handler so we don't setState on every scroll event.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        syncScrollState();
        ticking = false;
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    syncScrollState();
    return () => el.removeEventListener('scroll', onScroll);
  }, [syncScrollState]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(index, total - 1));
      el.scrollTo({ left: clamped * getStep(), behavior: 'smooth' });
    },
    [getStep, total],
  );

  const scroll = (direction: 'left' | 'right') => {
    // Step from the real scroll position, not the end-clamped activeIndex —
    // otherwise at max scroll the target stays beyond reach and nothing moves.
    const el = scrollRef.current;
    if (!el) return;
    const current = Math.round(el.scrollLeft / getStep());
    scrollToIndex(current + (direction === 'left' ? -1 : 1));
  };

  // --- mouse drag-to-scroll ---
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || activeProject) return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    el.style.scrollSnapType = 'none'; // free scrolling while dragging
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    // Real clicks carry a few px of pointer jitter (mouse/trackpad) between
    // down and up — a tight threshold here was swallowing genuine clicks as
    // drags. A real drag-to-scroll covers a card width, so this stays safe.
    if (Math.abs(dx) > 10) d.moved = true;
    const el = scrollRef.current;
    if (el) el.scrollLeft = d.startScroll - dx;
  };

  const endDrag = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    const el = scrollRef.current;
    if (!el) return;
    el.style.scrollSnapType = ''; // restore mandatory snap -> lands on a card
    // Only re-snap if an actual drag happened — calling scrollTo() here
    // unconditionally (even a no-op, same-position one) was enough for the
    // browser to suppress the click event that follows a plain click.
    if (d.moved) {
      scrollToIndex(Math.round(el.scrollLeft / getStep()));
    }
  };

  // Swallow the click that ends a drag so it doesn't open a project.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const arrowClass = (enabled: boolean) =>
    `p-4 hard-border transition-colors ${
      enabled
        ? 'bg-paper text-ink hover:bg-ink hover:text-paper'
        : 'bg-paper-dim text-ink/30 cursor-not-allowed'
    }`;

  return (
    <Section id="projects">
      <Container className="mb-12 relative">
        <SectionHeader index="04" kicker="SELECTED" title="PROJECTS" />

        <div className="hidden md:flex gap-3 absolute right-4 sm:right-6 bottom-0">
          <Magnetic strength={0.5}>
            <motion.button
              onClick={() => scroll('left')}
              whileTap={{ scale: 0.95 }}
              disabled={!canScrollLeft}
              className={arrowClass(canScrollLeft)}
              aria-label="Previous project"
            >
              <ArrowLeft size={22} />
            </motion.button>
          </Magnetic>
          <Magnetic strength={0.5}>
            <motion.button
              onClick={() => scroll('right')}
              whileTap={{ scale: 0.95 }}
              disabled={!canScrollRight}
              className={arrowClass(canScrollRight)}
              aria-label="Next project"
            >
              <ArrowRight size={22} />
            </motion.button>
          </Magnetic>
        </div>
      </Container>

      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none [scrollbar-width:none]"
        style={{
          msOverflowStyle: 'none',
          paddingLeft: sidePadding,
          paddingRight: sidePadding,
          // Snap cards to the same inset as the header, not the viewport edge.
          scrollPaddingLeft: sidePadding,
          scrollPaddingRight: sidePadding,
        }}
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="flex-shrink-0 w-[320px] md:w-[400px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProjectCard project={project} index={index} onOpen={setActiveProject} />
          </div>
        ))}
      </div>

      <Container className="mt-10">
        <CarouselPagination total={total} activeIndex={activeIndex} progress={progress} onDotClick={scrollToIndex} />
        <p className="font-mono-label text-[11px] text-ink/45 mt-4">DRAG · SWIPE · OR USE THE ARROWS</p>
      </Container>

      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
    </Section>
  );
}
