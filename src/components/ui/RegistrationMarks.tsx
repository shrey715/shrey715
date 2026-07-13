interface RegistrationMarksProps {
  /** Light ticks for dark (ink) surfaces instead of the default dark-on-paper. */
  dark?: boolean;
}

/**
 * Print-registration crosshair ticks pinned to all four corners of the
 * nearest positioned ancestor — a recurring "technical document" signature
 * used across every full-bleed section.
 */
export default function RegistrationMarks({ dark = false }: RegistrationMarksProps) {
  const color = dark ? 'bg-paper/35' : 'bg-ink/20';
  const corners = ['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'];

  return (
    <>
      {corners.map((pos) => (
        <span
          key={pos}
          className={`absolute ${pos} w-3 h-3 pointer-events-none select-none z-10 hidden sm:block`}
          aria-hidden="true"
        >
          <span className={`absolute left-1/2 top-0 -translate-x-1/2 w-px h-full ${color}`} />
          <span className={`absolute top-1/2 left-0 -translate-y-1/2 h-px w-full ${color}`} />
        </span>
      ))}
    </>
  );
}
