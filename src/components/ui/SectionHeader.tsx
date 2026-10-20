'use client';
import PlotText from '@/components/plot/PlotText';
import ScrambleText from '@/components/ui/ScrambleText';

interface SectionHeaderProps {
  /** Two-digit index, e.g. "01". */
  index: string;
  title: string;
  /** Small mono kicker shown next to the index. */
  kicker?: string;
  /** Use light-on-dark styling for ink-colored sections. */
  dark?: boolean;
  className?: string;
}

/**
 * Sheet header: a mono index row (with a decoding kicker) and a huge display
 * title that's plotted — outlines traced like a pen plotter, then inked, with
 * a misregistered accent pass snapping into register.
 */
export default function SectionHeader({
  index,
  title,
  kicker,
  dark = false,
  className = '',
}: SectionHeaderProps) {
  const ruleColor = dark ? 'bg-paper/25' : 'bg-ink/20';
  const metaColor = dark ? 'text-paper/60' : 'text-ink/60';
  const titleColor = dark ? 'text-paper' : 'text-ink';

  return (
    <div className={`relative ${className}`}>
      {/* Bleeding outline numeral — traced slowly as a faint construction drawing. */}
      <span
        className={`hidden md:block absolute -z-10 top-[-0.36em] right-[-0.02em] select-none ${dark ? 'text-paper' : 'text-ink'}`}
        style={{ fontSize: 'clamp(9rem, 24vw, 20rem)' }}
        aria-hidden="true"
      >
        <PlotText text={index} variant="ghost" stroke={0.45} />
      </span>

      <div className={`flex items-center gap-4 mb-3 font-mono-label text-[11px] ${metaColor}`}>
        <span className="text-accent">({index})</span>
        {kicker && <ScrambleText text={`[ ${kicker} ]`} duration={800} />}
        <span className={`flex-1 h-px ${ruleColor}`} />
      </div>
      <h2
        className={`font-display ${titleColor}`}
        style={{ fontSize: 'clamp(3rem, 11vw, 9rem)' }}
      >
        <PlotText text={title} delay={0.1} />
      </h2>
    </div>
  );
}
