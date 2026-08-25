'use client';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useLenis } from 'lenis/react';
import { useSectionNav } from '@/hooks/useSectionNav';
import RegistrationMarks from '@/components/ui/RegistrationMarks';
import ScrambleText from '@/components/ui/ScrambleText';
import { EASE_OUT } from '@/lib/constants';

type NavItem =
  | { type: 'section'; label: string; id: string }
  | { type: 'route'; label: string; href: string };

// "Projects" and "Blog" are real pages, not home-page sections — they route
// directly rather than going through useSectionNav's scroll-to-id.
const NAV_ITEMS: NavItem[] = [
  { type: 'section', label: 'About', id: 'about' },
  { type: 'section', label: 'Experience', id: 'experience' },
  { type: 'section', label: 'Skills', id: 'skills' },
  { type: 'route', label: 'Projects', href: '/projects' },
  { type: 'route', label: 'Blog', href: '/blog' },
];

const MotionLink = motion(Link);

const ITEM_CLASS =
  'group flex items-baseline gap-4 sm:gap-5 font-display text-5xl sm:text-7xl leading-none hover:text-accent transition-colors';

function ItemLabel({ index, label }: { index: number; label: string }) {
  return (
    <>
      <span className="font-mono-label text-sm sm:text-base text-accent tabular-nums">
        {String(index + 1).padStart(2, '0')}
      </span>
      {label}
      <ArrowUpRight size={28} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </>
  );
}

/**
 * Full-screen nav: a persistent corner toggle that opens a centered,
 * vertically-stacked menu covering the whole viewport. Scrolling the page
 * underneath is locked while it's open.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  // When a close is triggered by an actual navigation, the menu's own
  // wipe-close animation and the route curtain (Template.tsx) would both
  // play at once — a double transition that reads as a jitter. `instant`
  // collapses the menu's exit transition to 0 so the curtain is the only
  // thing the user sees move.
  const [instantClose, setInstantClose] = useState(false);
  const { goToSection } = useSectionNav();
  const lenis = useLenis();
  const pathname = usePathname();

  // Closing needs to synchronously restore scroll before anything that might
  // scroll (goToSection) runs right after it in the same click handler — the
  // effect cleanup below fires too late (after the next paint) for that.
  const closeMenu = (instant = false) => {
    document.body.style.overflow = '';
    lenis?.start();
    if (instant) {
      // flushSync forces this to commit while isOpen is still true, so the
      // still-mounted panel re-renders with the 0-duration transition
      // BEFORE AnimatePresence captures it for the exit animation. Without
      // this, both state updates land in the same batch and the exit would
      // still play with the old (slow) transition.
      flushSync(() => setInstantClose(true));
    }
    setIsOpen(false);
  };

  const openMenu = () => {
    setInstantClose(false);
    setIsOpen(true);
  };

  // Safety net for navigations that bypass the click handlers below (e.g.
  // browser back/forward) — plain reset, no flushSync. flushSync can only
  // be called from a direct event handler, never from inside an effect.
  useEffect(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
    lenis?.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    lenis?.stop();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Safety net for unmounts/dependency changes that bypass closeMenu().
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lenis]);

  return (
    <>
      <button
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        data-cursor={isOpen ? 'CLOSE' : 'MENU'}
        className="fixed top-4 right-4 z-[100001] flex items-center justify-center p-3.5 sm:p-4 bg-ink text-paper hard-border print:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: instantClose ? 0 : 0.55, ease: EASE_OUT }}
            className="fixed inset-0 z-[100000] bg-ink text-paper grid-lines-dark flex flex-col items-center justify-center print:hidden"
          >
            <RegistrationMarks dark />

            <div className="font-mono-label text-[11px] text-paper/50 mb-10 flex items-center gap-3">
              <span className="text-accent">(NAV)</span>
              <ScrambleText text="[ NAVIGATE ]" duration={700} />
            </div>

            <nav className="flex flex-col items-center gap-3 sm:gap-4">
              {NAV_ITEMS.map((item, i) =>
                item.type === 'section' ? (
                  <motion.button
                    key={item.label}
                    onClick={() => {
                      // Cross-page section clicks redirect through "/" — a
                      // real navigation, so close instantly like the other
                      // route items. Same-page clicks just scroll, so the
                      // menu's own wipe-close animation is the only thing
                      // moving and looks fine playing out normally.
                      closeMenu(pathname !== '/');
                      goToSection(item.id);
                    }}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: EASE_OUT }}
                    className={ITEM_CLASS}
                  >
                    <ItemLabel index={i} label={item.label} />
                  </motion.button>
                ) : (
                  <MotionLink
                    key={item.label}
                    href={item.href}
                    onClick={() => closeMenu(true)}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: EASE_OUT }}
                    className={ITEM_CLASS}
                  >
                    <ItemLabel index={i} label={item.label} />
                  </MotionLink>
                ),
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
