'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { EASE_OUT } from '@/lib/constants';
import CursorPreview, { type PreviewItem } from '@/components/ui/CursorPreview';
import type { BlogPost } from '@/lib/blog';
import { dateParts } from './format';

/** Archive: one dated row per post, with the cover trailing the cursor on hover. */
export default function PostLedger({ posts }: { posts: BlogPost[] }) {
  const [hovered, setHovered] = useState<PreviewItem | null>(null);

  return (
    <div onMouseLeave={() => setHovered(null)}>
      <ul className="border-t-2 border-ink">
        {posts.map((post, i) => {
          const { day, monthYear } = dateParts(post.date);
          return (
            <motion.li
              key={post.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT }}
              className="border-b border-ink/20"
            >
              <Link
                href={`/blog/${post.slug}`}
                data-cursor="READ"
                onMouseEnter={() =>
                  setHovered(post.image ? { id: post.slug, src: post.image, label: post.title, aspect: 'aspect-[16/10]' } : null)
                }
                className="group relative grid grid-cols-[4rem_1fr_auto] md:grid-cols-[6rem_minmax(0,1fr)_10rem_auto] items-start gap-x-6 py-7"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 bottom-[-1px] h-0.5 w-full bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
                <time dateTime={post.date} className="leading-none">
                  <span className="block font-display text-4xl md:text-5xl text-ink/25 group-hover:text-accent transition-colors tabular-nums">
                    {day}
                  </span>
                  <span className="block font-mono-label text-[9px] text-ink/45 mt-2">{monthYear}</span>
                </time>
                <span className="min-w-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                  <span className="block text-xl sm:text-2xl font-bold tracking-tight leading-tight text-balance">{post.title}</span>
                  <span className="block mt-2 text-ink/65 leading-relaxed line-clamp-2 max-w-[70ch]">{post.description}</span>
                </span>
                <span className="hidden md:block font-mono-label text-[10px] text-ink/45 pt-2">{post.readingTime.toUpperCase()}</span>
                <ArrowUpRight size={20} className="mt-1 text-ink/40 group-hover:text-accent transition-colors" />
              </Link>
            </motion.li>
          );
        })}
      </ul>
      <CursorPreview item={hovered} />
    </div>
  );
}
