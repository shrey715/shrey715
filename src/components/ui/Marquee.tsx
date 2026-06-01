'use client';

interface MarqueeProps {
  items: string[];
  reverse?: boolean;
  /** Lower = faster. Seconds per loop. */
  durationSec?: number;
  className?: string;
  /** Glyph shown between items. */
  separator?: string;
}

/**
 * Seamless infinite marquee. Renders the item row twice and slides by -50%,
 * so the loop is gapless regardless of content width.
 */
export default function Marquee({
  items,
  reverse = false,
  durationSec = 28,
  className = '',
  separator = '✦',
}: MarqueeProps) {
  const Row = () => (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 whitespace-nowrap">{item}</span>
          <span className="text-accent">{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ '--marquee-duration': `${durationSec}s` } as React.CSSProperties}
      >
        <Row />
        <Row />
      </div>
    </div>
  );
}
