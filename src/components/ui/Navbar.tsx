'use client';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight, Check, Copy } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { Rss } from 'lucide-react';
import Link from 'next/link';
import { useLenis } from 'lenis/react';
import { useSectionNav } from '@/hooks/useSectionNav';
import RegistrationMarks from '@/components/ui/RegistrationMarks';
import ScrambleText from '@/components/ui/ScrambleText';
import { EASE_OUT } from '@/lib/constants';
import type { SiteIndex } from '@/lib/siteIndex';
import { OPEN_PALETTE_EVENT } from '@/components/ui/CommandPalette';

type NavItem =
  | { type: 'section'; label: string; id: string; blurb: (c: SiteIndex['counts']) => string }
  | { type: 'route'; label: string; href: string; blurb: (c: SiteIndex['counts']) => string };

// "Projects" and "Blog" are real pages, not home-page sections — they route
// directly rather than going through useSectionNav's scroll-to-id.
const NAV_ITEMS: NavItem[] = [
  { type: 'section', label: 'About', id: 'about', blurb: () => 'Who I am — the academic, the engineer and the human.' },
  {
    type: 'section',
    label: 'Experience',
    id: 'experience',
    blurb: (c) => `${c.roles} roles across research, industry and leadership.`,
  },
  {
    type: 'section',
    label: 'Skills',
    id: 'skills',
    blurb: (c) => `${c.tools}+ tools across ${c.domains} domains, mapped to the projects that use them.`,
  },
  {
    type: 'route',
    label: 'Projects',
    href: '/projects',
    blurb: (c) => `${c.projects} projects — retrieval engines to transport protocols.`,
  },
  { type: 'route', label: 'Blog', href: '/blog', blurb: (c) => `${c.posts} field notes from the workbench.` },
];

const EMAIL = 'shreyas.deb@research.iiit.ac.in';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const MotionLink = motion.create(Link);

const ITEM_CLASS =
  'group grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3.5rem_1fr] items-baseline font-display text-[13vw] sm:text-7xl lg:text-8xl leading-[0.95] text-left hover:text-accent focus-visible:text-accent transition-colors';

function ItemLabel({ index, label }: { index: number; label: string }) {
  return (
    <>
      <span className="font-mono-label text-xs sm:text-sm text-accent tabular-nums">{String(index + 1).padStart(2, '0')}</span>
      <span className="flex items-center gap-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
        {label}
        <ArrowUpRight size={36} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    </>
  );
}

function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata' }));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return time;
}

/**
 * Full-screen nav: a corner toggle that opens an index of the site — a
 * left-aligned list with a preview panel describing whatever's hovered, and
 * a bottom bar of clock, socials and contact. The toggle tucks away while
 * scrolling down and returns on any scroll up.
 */
export default function Navbar({ counts }: { counts: SiteIndex['counts'] }) {
  const [isOpen, setIsOpen] = useState(false);
  // When a close is triggered by an actual navigation, the menu's own
  // wipe-close and the route transition would both play — a double move that
  // reads as a jitter. `instant` collapses the menu's exit to 0.
  const [instantClose, setInstantClose] = useState(false);
  const [hovered, setHovered] = useState(0);
  const [tucked, setTucked] = useState(false);
  const [copied, setCopied] = useState(false);
  const { goToSection } = useSectionNav();
  const lenis = useLenis();
  const pathname = usePathname();
  const time = useClock();
  const lastY = useRef(0);

  // Closing needs to synchronously restore scroll before anything that might
  // scroll (goToSection) runs right after it in the same click handler.
  const closeMenu = (instant = false) => {
    document.body.style.overflow = '';
    lenis?.start();
    if (instant) {
      // flushSync commits the 0-duration transition while the panel is still
      // mounted, before AnimatePresence captures it for the exit animation.
      flushSync(() => setInstantClose(true));
    }
    setIsOpen(false);
  };

  const openMenu = () => {
    setInstantClose(false);
    setIsOpen(true);
  };

  // Tuck the toggle away while scrolling down; bring it back on scroll up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      if (Math.abs(dy) > 6) {
        setTucked(dy > 0 && y > 240);
        lastY.current = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Safety net for navigations that bypass the click handlers (back/forward).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on route change
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
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lenis]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  const preview = NAV_ITEMS[hovered];

  return (
    <>
      <button
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        data-cursor={isOpen ? 'CLOSE' : 'MENU'}
        className={`fixed top-4 right-4 z-[100001] flex items-center justify-center p-3 sm:p-4 bg-ink text-paper hard-border print:hidden transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          tucked && !isOpen ? '-translate-y-[150%]' : ''
        }`}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
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
            className="fixed inset-0 z-[100000] bg-ink text-paper grid-lines-dark flex flex-col print:hidden"
          >
            <RegistrationMarks dark />

            <div className="flex-1 min-h-0 w-full max-w-[1500px] mx-auto px-4 sm:px-6 pt-20 sm:pt-24 grid lg:grid-cols-12 gap-10 items-center overflow-y-auto">
              <div className="lg:col-span-7">
                <div className="font-mono-label text-[11px] text-paper/50 mb-8 flex items-center gap-3">
                  <span className="text-accent">(NAV)</span>
                  <ScrambleText text="[ INDEX ]" duration={700} />
                </div>
                <nav className="flex flex-col gap-1 sm:gap-2">
                  {NAV_ITEMS.map((item, i) => {
                    const common = {
                      initial: { opacity: 0, y: 28 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.55, delay: 0.08 + i * 0.06, ease: EASE_OUT },
                      onMouseEnter: () => setHovered(i),
                      onFocus: () => setHovered(i),
                      className: ITEM_CLASS,
                    };
                    return item.type === 'section' ? (
                      <motion.button
                        key={item.label}
                        {...common}
                        onClick={() => {
                          // Cross-page section clicks route through "/" — a real
                          // navigation, so close instantly; same-page clicks just scroll.
                          closeMenu(pathname !== '/');
                          goToSection(item.id);
                        }}
                      >
                        <ItemLabel index={i} label={item.label} />
                      </motion.button>
                    ) : (
                      <MotionLink key={item.label} href={item.href} {...common} onClick={() => closeMenu(true)}>
                        <ItemLabel index={i} label={item.label} />
                      </MotionLink>
                    );
                  })}
                </nav>
              </div>

              {/* Preview of whatever's hovered */}
              <div className="hidden lg:block lg:col-span-5 relative h-[22rem]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={hovered}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="absolute inset-0 flex flex-col justify-end border-l-2 border-paper/15 pl-10"
                  >
                    <span
                      aria-hidden="true"
                      className="font-display leading-none select-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,61,0,0.7)]"
                      style={{ fontSize: '12rem' }}
                    >
                      {String(hovered + 1).padStart(2, '0')}
                    </span>
                    <p className="mt-6 text-xl text-paper/80 leading-snug max-w-sm text-pretty">{preview.blurb(counts)}</p>
                    <span className="mt-4 font-mono-label text-[10px] text-paper/40">
                      {preview.type === 'route' ? `GO TO ${preview.href.toUpperCase()}` : `JUMP TO #${preview.id.toUpperCase()}`}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom bar: clock · socials · contact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="border-t-2 border-paper/15"
            >
              <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 font-mono-label text-[10px] text-paper/55">
                <span className="tabular-nums">{time || '--:--:--'} IST · HYDERABAD</span>
                <span className="flex items-center gap-5">
                  <a href="https://github.com/shrey715" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-accent">
                    <FaGithub size={13} /> GITHUB
                  </a>
                  <a href="https://www.linkedin.com/in/shreyasdeb/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-accent">
                    <FaLinkedin size={13} /> LINKEDIN
                  </a>
                  <a href={`${basePath}/assets/shreyas_deb_resume.pdf`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-accent">
                    <HiOutlineDocumentText size={13} /> RESUME
                  </a>
                  <a href={`${basePath}/rss.xml`} className="flex items-center gap-1.5 hover:text-accent">
                    <Rss size={12} /> RSS
                  </a>
                </span>
                <span className="flex items-center gap-4">
                  <button type="button" onClick={copyEmail} className="flex items-center gap-1.5 hover:text-accent">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'EMAIL COPIED' : 'COPY EMAIL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
                    }}
                    className="hidden sm:inline-flex items-center gap-1.5 text-paper/45 hover:text-accent"
                  >
                    <kbd className="px-1.5 py-0.5 border border-paper/25">⌘K</kbd> SEARCH
                  </button>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
