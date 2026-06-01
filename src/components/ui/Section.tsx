import { cn } from '@/lib/utils';

/** Shared inner column: centred, max-width, responsive horizontal padding. */
export const CONTAINER = 'w-full max-w-[1500px] mx-auto px-4 sm:px-6';

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(CONTAINER, 'relative z-10', className)}>{children}</div>;
}

interface SectionProps {
  id?: string;
  /** Dark (ink) surface instead of the default paper surface. */
  dark?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Full-viewport page section with the shared brutalist surface treatment:
 * grid lines, a top hard rule, and vertically-centred content so nav jumps
 * land cleanly.
 */
export default function Section({ id, dark = false, className, children }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative min-h-screen flex flex-col justify-center py-24 sm:py-32 overflow-hidden border-t-2 border-ink',
        dark ? 'bg-ink text-paper grid-lines-dark' : 'bg-paper text-ink grid-lines',
        className,
      )}
    >
      {children}
    </section>
  );
}
