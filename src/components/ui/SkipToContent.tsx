'use client';

/**
 * Skip to main content link for keyboard/screen reader accessibility.
 * Visible only on focus.
 */
export default function SkipToContent() {
  return (
    <a
      href="#about"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#1a1a1a] focus:text-[#f1efe7] focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
    >
      Skip to main content
    </a>
  );
}
