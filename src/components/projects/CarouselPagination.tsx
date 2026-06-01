'use client';

interface CarouselPaginationProps {
  total: number;
  activeIndex: number;
  /** Continuous scroll progress, 0-1. Drives the fill so it reaches 100% at the end. */
  progress: number;
  onDotClick: (index: number) => void;
}

/**
 * Brutalist progress bar: a hard-bordered track with a continuous accent fill
 * driven by scroll progress, overlaid with clickable segment dividers — one
 * per project — for direct navigation.
 */
export default function CarouselPagination({ total, activeIndex, progress, onDotClick }: CarouselPaginationProps) {
  return (
    <div className="relative hard-border h-3.5 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
      />
      <div className="absolute inset-0 flex">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onDotClick(i)}
            aria-label={`Go to project ${i + 1}`}
            aria-current={i === activeIndex}
            className={`flex-1 ${i !== 0 ? 'border-l-2 border-ink' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
