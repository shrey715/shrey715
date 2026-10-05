'use client';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Fuse from 'fuse.js';
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { useSectionNav } from '@/hooks/useSectionNav';
import { navigateWithTransition } from '@/lib/viewTransition';
import { EASE_OUT } from '@/lib/constants';
import type { SiteIndex } from '@/lib/siteIndex';

/** Dispatch on window to open the palette from anywhere (e.g. a hint button). */
export const OPEN_PALETTE_EVENT = 'palette:open';

const EMAIL = 'shreyas.deb@research.iiit.ac.in';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

type Group = 'SECTIONS' | 'PAGES' | 'PROJECTS' | 'POSTS' | 'ACTIONS';
interface Item {
  id: string;
  group: Group;
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
}

const GROUP_ORDER: Group[] = ['SECTIONS', 'PAGES', 'PROJECTS', 'POSTS', 'ACTIONS'];
const noopSubscribe = () => () => {};

/**
 * ⌘K / Ctrl+K (or "/") command palette: jump to any section, page, project
 * or post, or run a quick action. Fuzzy search, full keyboard control.
 */
export default function CommandPalette({ index }: { index: Pick<SiteIndex, 'projects' | 'posts'> }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const lenis = useLenis();
  const { goToSection } = useSectionNav();
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const close = () => {
    setOpen(false);
    setQuery('');
    setActive(0);
  };

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => router.push(href);
    const ext = (href: string) => () => window.open(href, '_blank', 'noopener,noreferrer');
    return [
      ...(['about', 'experience', 'skills', 'projects', 'contact'] as const).map((id) => ({
        id: `s:${id}`,
        group: 'SECTIONS' as const,
        label: id === 'projects' ? 'Featured projects' : id[0].toUpperCase() + id.slice(1),
        hint: `#${id}`,
        run: () => goToSection(id),
      })),
      { id: 'p:home', group: 'PAGES', label: 'Home', hint: '/', run: go('/') },
      { id: 'p:projects', group: 'PAGES', label: 'All projects', hint: '/projects', run: go('/projects') },
      { id: 'p:blog', group: 'PAGES', label: 'Blog', hint: '/blog', keywords: 'posts writing notes', run: go('/blog') },
      ...index.projects.map((p) => ({
        id: `pr:${p.slug}`,
        group: 'PROJECTS' as const,
        label: p.title,
        hint: p.year,
        run: () => navigateWithTransition(router, `/projects/${p.slug}`),
      })),
      ...index.posts.map((p) => ({
        id: `po:${p.slug}`,
        group: 'POSTS' as const,
        label: p.title,
        hint: new Date(p.date).getUTCFullYear().toString(),
        run: go(`/blog/${p.slug}`),
      })),
      {
        id: 'a:email',
        group: 'ACTIONS',
        label: 'Copy email address',
        hint: EMAIL,
        keywords: 'contact mail',
        run: async () => {
          try {
            await navigator.clipboard.writeText(EMAIL);
            setToast('Email copied');
          } catch {
            window.location.href = `mailto:${EMAIL}`;
          }
        },
      },
      { id: 'a:github', group: 'ACTIONS', label: 'Open GitHub', hint: 'github.com/shrey715', run: ext('https://github.com/shrey715') },
      { id: 'a:linkedin', group: 'ACTIONS', label: 'Open LinkedIn', run: ext('https://www.linkedin.com/in/shreyasdeb/') },
      { id: 'a:resume', group: 'ACTIONS', label: 'Open résumé', hint: 'PDF', keywords: 'cv resume', run: ext(`${basePath}/assets/shreyas_deb_resume.pdf`) },
      { id: 'a:rss', group: 'ACTIONS', label: 'RSS feed', hint: '/rss.xml', run: ext(`${basePath}/rss.xml`) },
    ];
  }, [index, router, goToSection]);

  const fuse = useMemo(
    () => new Fuse(items, { keys: ['label', 'hint', 'keywords', 'group'], threshold: 0.38, ignoreLocation: true }),
    [items],
  );
  const results = useMemo(() => {
    const list = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : items;
    // Keep results grouped, in a stable group order.
    return GROUP_ORDER.flatMap((g) => list.filter((i) => i.group === g));
  }, [query, fuse, items]);

  // Global shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest('input, textarea, [contenteditable="true"]');
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      lenis?.start();
    };
  }, [open, lenis]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  // Keep the active row scrolled into view.
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const runAt = (i: number) => {
    const item = results[i];
    if (!item) return;
    close();
    // Let the palette unmount (and Lenis restart) before navigating/scrolling.
    requestAnimationFrame(() => item.run());
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(active);
    } else if (e.key === 'Escape') {
      close();
    }
  };

  if (!isClient) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="palette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100003] bg-ink/60 backdrop-blur-[2px] flex items-start justify-center pt-[12vh] px-4"
            onMouseDown={(e) => e.target === e.currentTarget && close()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="w-full max-w-xl bg-paper text-ink hard-border hard-shadow-accent"
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b-2 border-ink">
                <Search size={17} className="text-ink/45 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKey}
                  placeholder="Jump to a section, project, post…"
                  aria-label="Search the site"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  aria-activedescendant={results[active] ? `pal-${results[active].id}` : undefined}
                  className="w-full bg-transparent outline-none text-base placeholder:text-ink/35"
                />
                <kbd className="shrink-0 font-mono-label text-[9px] px-1.5 py-0.5 border border-ink/25 text-ink/50">ESC</kbd>
              </div>

              <div ref={listRef} id="palette-list" role="listbox" className="max-h-[52vh] overflow-y-auto py-2">
                {results.length === 0 && (
                  <p className="px-4 py-8 text-center font-mono-label text-[10px] text-ink/50">NOTHING MATCHES “{query}”</p>
                )}
                {results.map((item, i) => {
                  const header = i === 0 || results[i - 1].group !== item.group;
                  const isActive = i === active;
                  return (
                    <div key={item.id}>
                      {header && <div className="px-4 pt-3 pb-1 font-mono-label text-[9px] text-ink/40">{item.group}</div>}
                      <button
                        type="button"
                        id={`pal-${item.id}`}
                        role="option"
                        aria-selected={isActive}
                        data-index={i}
                        onMouseMove={() => setActive(i)}
                        onClick={() => runAt(i)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isActive ? 'bg-ink text-paper' : ''
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 shrink-0 ${isActive ? 'bg-accent' : 'bg-ink/20'}`} />
                        <span className="flex-1 truncate text-[15px]">{item.label}</span>
                        {item.hint && (
                          <span className={`shrink-0 font-mono-label text-[9px] truncate max-w-[40%] ${isActive ? 'text-paper/55' : 'text-ink/40'}`}>
                            {item.hint}
                          </span>
                        )}
                        {isActive && <CornerDownLeft size={13} className="shrink-0 text-accent" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 border-t-2 border-ink font-mono-label text-[9px] text-ink/45">
                <span>↑↓ NAVIGATE · ↵ OPEN</span>
                <span className="flex items-center gap-1">
                  ⌘K <ArrowRight size={10} /> TOGGLE
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100003] px-4 py-2.5 bg-ink text-paper hard-border font-mono-label text-[10px]"
            role="status"
          >
            <span className="text-accent">✓</span> {toast.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
