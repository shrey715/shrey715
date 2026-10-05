'use client';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Rss } from 'lucide-react';
import { EASE_OUT } from '@/lib/constants';
import type { BlogPost } from '@/lib/blog';
import FeaturedPost from './FeaturedPost';
import PostLedger from './PostLedger';

/**
 * Index body: tag filter chips over either the default layout (latest post
 * featured + archive ledger) or, with a tag picked, a ledger of every match.
 */
export default function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [posts]);

  if (posts.length === 0) {
    return (
      <div className="mt-20 py-20 text-center hard-border bg-paper">
        <p className="font-mono-label text-sm text-ink/60">NO POSTS YET — CHECK BACK SOON.</p>
      </div>
    );
  }

  const [latest, ...archive] = posts;
  const filtered = tag ? posts.filter((p) => p.tags.includes(tag)) : [];
  const chip = (active: boolean) =>
    `shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono-label text-[10px] border-2 transition-colors active:scale-[0.97] ${
      active ? 'bg-ink text-paper border-ink' : 'border-ink/20 hover:border-ink'
    }`;

  return (
    <>
      <div className="mt-14 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tag">
        <button type="button" onClick={() => setTag(null)} aria-pressed={tag === null} className={chip(tag === null)}>
          ALL <span className="opacity-50 tabular-nums">{posts.length}</span>
        </button>
        {tags.map(([t, n]) => (
          <button key={t} type="button" onClick={() => setTag(t === tag ? null : t)} aria-pressed={tag === t} className={chip(tag === t)}>
            {t} <span className="opacity-50 tabular-nums">{n}</span>
          </button>
        ))}
        <a
          href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/rss.xml`}
          className="ml-auto inline-flex items-center gap-1.5 font-mono-label text-[10px] text-ink/50 hover:text-accent transition-colors"
          data-cursor="RSS"
        >
          <Rss size={13} /> RSS
        </a>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tag ? (
          <motion.div
            key={tag}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="mt-12"
          >
            <div className="flex items-center gap-4 mb-2 font-mono-label text-xs text-ink/60">
              TAGGED <span className="text-accent">{tag}</span>
              <span className="tabular-nums">[{String(filtered.length).padStart(2, '0')}]</span>
            </div>
            <PostLedger posts={filtered} />
          </motion.div>
        ) : (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <div className="mt-14 sm:mt-16">
              <FeaturedPost post={latest} />
            </div>
            {archive.length > 0 && (
              <div className="mt-24 sm:mt-32">
                <div className="flex items-center gap-4 mb-2 font-mono-label text-xs text-ink/60">
                  ARCHIVE
                  <span className="text-accent tabular-nums">[{String(archive.length).padStart(2, '0')}]</span>
                </div>
                <PostLedger posts={archive} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
