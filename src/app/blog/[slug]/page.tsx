import { getPostBySlug, getAllPostSlugs } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowLeft } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '../../../../mdx-components';
import ShareButton from './ShareButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${post.title} | Shreyas Deb`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const components = useMDXComponents({});

  return (
    <main className="min-h-screen bg-paper text-ink grid-lines">
      {/* Top nav bar */}
      <div className="px-4 sm:px-6 py-4 border-b-2 border-ink">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono-label text-[11px] text-ink/60 hover:text-accent transition-colors"
          >
            <ArrowLeft size={14} /> BACK TO BLOG
          </Link>
        </div>
      </div>

      {/* Article header — headline first, editorial style */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 md:pt-20">
        <div className="font-mono-label text-[11px] text-ink/50 mb-6 flex items-center gap-3">
          <span className="text-accent">(ARTICLE)</span>
          <span>
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="flex-1 h-px bg-ink/20" />
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 font-mono-label text-[10px] bg-ink text-paper">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1
          className="font-bold text-ink mb-6 leading-[1.05]"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 7vw, 4.5rem)' }}
        >
          {post.title}
        </h1>

        <p className="text-lg md:text-xl text-ink/70 mb-8 leading-relaxed">{post.description}</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-y-2 border-ink">
          <span className="flex items-center gap-2 font-mono-label text-[11px] text-ink/60">
            <Clock size={14} />
            {post.readingTime}
          </span>
          <ShareButton slug={slug} />
        </div>
      </header>

      {/* Framed cover figure */}
      {post.image && (
        <figure className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
          <div className="hard-border bg-ink relative aspect-[16/9] overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <figcaption className="absolute bottom-0 inset-x-0 bg-ink/90 text-paper px-3 py-2 font-mono-label text-[10px] flex justify-between backdrop-blur-sm">
              <span>FIG.01</span>
              <span>COVER</span>
            </figcaption>
          </div>
        </figure>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="prose prose-lg max-w-none">
          <MDXRemote source={post.content} components={components} />
        </div>
      </article>

      {/* Footer nav */}
      <footer className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <div className="pt-10 border-t-2 border-ink">
          <Link
            href="/blog"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-ink text-paper hard-border font-mono-label text-xs hover:bg-paper hover:text-ink transition-colors"
          >
            <ArrowLeft size={16} />
            BACK TO ALL POSTS
          </Link>
        </div>
      </footer>
    </main>
  );
}
