'use client';
import RevealText from '@/components/ui/RevealText';

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
 * Editorial section header: a mono index row with a rule, then a huge
 * display-type title that reveals word-by-word.
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
      {/* Bleeding outline numeral — sits behind the title, cropped by the section. */}
      <span
        className="hidden md:block absolute -z-10 top-[-0.42em] right-[-0.04em] font-display leading-none select-none"
        style={{
          fontSize: 'clamp(9rem, 24vw, 20rem)',
          WebkitTextStroke: `1.5px ${dark ? 'rgba(237,232,220,0.16)' : 'rgba(14,14,14,0.1)'}`,
          color: 'transparent',
        }}
        aria-hidden="true"
      >
        {index}
      </span>

      <div className={`flex items-center gap-4 mb-3 font-mono-label text-[11px] ${metaColor}`}>
        <span className="text-accent">({index})</span>
        {kicker && <span>{kicker}</span>}
        <span className={`flex-1 h-px ${ruleColor}`} />
      </div>
      <h2
        className={`font-display ${titleColor}`}
        style={{ fontSize: 'clamp(3rem, 11vw, 9rem)' }}
      >
        <RevealText text={title} />
      </h2>
    </div>
  );
}
