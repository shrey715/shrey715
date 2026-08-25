import { cn } from '@/lib/utils';

/**
 * Print-inspired separator between sections: a slim accent/ink hazard-stripe
 * band. The ink stripes dissolve into adjacent dark sections while the accent
 * stays visible on both surfaces — no text, no bar, pure tape.
 */
export default function SectionDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('hazard-stripes relative z-10 h-2.5 sm:h-3 w-full print:hidden', className)}
    />
  );
}
