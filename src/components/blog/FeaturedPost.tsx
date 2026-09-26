'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { EASE_OUT } from '@/lib/constants';
import type { BlogPost } from '@/lib/blog';
import { formatDate } from './format';

/** Latest post, given room: cover on one side, the pitch on the other. */
export default function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} data-cursor="READ" className="group grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Observed wrapper stays unclipped; the wipe lives on the child. */}
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="lg:col-span-7">
        <motion.div
          variants={{ hidden: { clipPath: 'inset(0% 100% 0% 0%)' }, show: { clipPath: 'inset(0% 0% 0% 0%)' } }}
          transition={{ duration: 1, ease: EASE_OUT }}
          className="relative aspect-[16/10] hard-border bg-ink overflow-hidden"
        >
          {post.image ? (
            <Image
              src={post.image}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-[1.03] transition-[filter,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              priority
            />
          ) : (
            <div className="absolute inset-0 grid-lines-dark" />
          )}
          <div className="absolute inset-0 bg-accent/10 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-700" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT }}
        className="lg:col-span-5"
      >
        <div className="flex items-center gap-3 font-mono-label text-[10px] text-ink/50 mb-5">
          <span className="px-1.5 py-0.5 bg-accent text-paper">LATEST</span>
          <time dateTime={post.date}>{formatDate(post.date, 'long').toUpperCase()}</time>
          <span>·</span>
          <span>{post.readingTime.toUpperCase()}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight leading-[1.05] text-balance group-hover:text-accent transition-colors duration-300">
          {post.title}
        </h2>
        <p className="mt-5 text-lg text-ink/70 leading-relaxed text-pretty">{post.description}</p>
        <div className="mt-6 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((t) => (
            <span key={t} className="px-2 py-0.5 font-mono-label text-[9px] border border-ink/25 text-ink/60">
              {t}
            </span>
          ))}
        </div>
        <span className="mt-8 inline-flex items-center gap-2 font-mono-label text-[11px] border-b-2 border-ink pb-1 group-hover:border-accent group-hover:text-accent transition-colors">
          READ THE POST
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </motion.div>
    </Link>
  );
}
