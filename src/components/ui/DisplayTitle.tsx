'use client';
import RevealText from '@/components/ui/RevealText';

interface DisplayTitleProps {
  text: string;
  /** Light-on-dark styling for ink-colored sections. */
  dark?: boolean;
  className?: string;
  delay?: number;
}

/**
 * Display headline with an outlined ghost layer sitting behind the solid
 * reveal: the full title appears as a stroke outline immediately, then the
 * solid words slide up over it word-by-word — an outlined-to-fill transition
 * that reads like the title is being inked in.
 */
export default function DisplayTitle({ text, dark = false, className = '', delay = 0 }: DisplayTitleProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      {/* Ghost stroke layer — the same title, outlined, revealed instantly */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 font-display select-none ${dark ? 'text-stroke-ghost-dark' : 'text-stroke-ghost'}`}
      >
        {text}
      </span>
      {/* Solid layer — slides up over the ghost */}
      <span className="relative">
        <RevealText text={text} delay={delay} />
      </span>
    </span>
  );
}
