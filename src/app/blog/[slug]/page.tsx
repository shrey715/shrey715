import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import { inkTheme } from '@/lib/shikiTheme';
import { getPostBySlug, getAllPostSlugs, getAllPosts, getHeadings } from '@/lib/blog';
import { mdxComponents } from '../../../../mdx-components';
import Section, { Container } from '@/components/ui/Section';
import RevealText from '@/components/ui/RevealText';
import Footer from '@/components/sections/Footer';
import SheetBreak from '@/components/plot/SheetBreak';
import ReadingProgress from '@/components/blog/ReadingProgress';
import Toc from '@/components/blog/Toc';
import PostLedger from '@/components/blog/PostLedger';
import { formatDate } from '@/components/blog/format';
import ShareButton from './ShareButton';
import SheetHeader from '@/components/sections/SheetHeader';
import ZoomImage from '@/components/blog/ZoomImage';

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

  const headings = getHeadings(post.content);
  const others = (await getAllPosts()).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <main id="main" className="relative overflow-x-clip bg-paper">
      <ReadingProgress targetId="article-body" />

      <Section sheet={`NOTE — ${post.title}`} className="justify-start min-h-0 pt-28 sm:pt-36 pb-20 sm:pb-28">
        <Container>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono-label text-[11px] text-ink/60 hover:text-accent transition-colors mb-12"
          >
            <ArrowLeft size={14} /> ALL POSTS
          </Link>

          {/* Header — aligned to the article column */}
          <header className="grid lg:grid-cols-12 gap-x-10">
            <div className="lg:col-start-4 lg:col-span-8">
              <div className="font-mono-label text-[11px] text-ink/60 mb-5 flex items-center gap-3">
                <span className="text-accent">(NOTE)</span> FIELD NOTES
                <span className="flex-1 h-px bg-ink/20" />
              </div>
              <h1 className="text-[clamp(2.3rem,5vw,4.4rem)] font-bold tracking-tight leading-[1.02] text-ink max-w-[20ch] text-balance">
                <RevealText text={post.title} stagger={0.03} />
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-ink/70 leading-relaxed max-w-[58ch] text-pretty">
                {post.description}
              </p>

              {/* The note's spec block — same sheet header as the rest of the set */}
              <SheetHeader
                className="mt-10"
                fields={[
                  { k: 'FILED', v: <time dateTime={post.date}>{formatDate(post.date, 'long')}</time> },
                  { k: 'READ', v: post.readingTime },
                  { k: 'SECTIONS', v: String(headings.length).padStart(2, '0') },
                  { k: 'TAGS', v: post.tags.slice(0, 3).join(' · ') || '—', sub: post.tags.length > 3 ? `+${post.tags.length - 3} MORE` : undefined },
                ]}
              />
            </div>
          </header>

          {post.image && (
            <figure className="grid lg:grid-cols-12 gap-x-10 mt-14">
              <div className="lg:col-start-4 lg:col-span-9 relative aspect-[16/9] hard-border bg-ink overflow-hidden">
                <ZoomImage src={post.image} alt={post.title} className="absolute inset-0">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    className="object-cover"
                  />
                </ZoomImage>
              </div>
            </figure>
          )}

          {/* Body: pinned contents rail + reading column */}
          <div className="grid lg:grid-cols-12 gap-x-10 mt-16">
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-28 space-y-10">
                <Toc headings={headings} />
                <ShareButton slug={slug} />
              </div>
            </aside>

            <article id="article-body" className="article-body lg:col-span-7 min-w-0 max-w-[70ch]">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    rehypePlugins: [[rehypePrettyCode, { theme: inkTheme, keepBackground: false, bypassInlineCode: true }]],
                  },
                }}
              />

              <div className="mt-16 pt-6 border-t-2 border-ink flex flex-wrap items-center justify-between gap-4">
                <span className="font-mono-label text-[10px] text-ink/50">END OF POST ✶</span>
                <ShareButton slug={slug} />
              </div>
            </article>
          </div>

          {others.length > 0 && (
            <div className="grid lg:grid-cols-12 gap-x-10 mt-24">
              <div className="lg:col-start-4 lg:col-span-9">
                <p className="font-mono-label text-xs text-ink/60 mb-2">KEEP READING</p>
                <PostLedger posts={others} />
              </div>
            </div>
          )}
        </Container>
      </Section>

      <SheetBreak from="paper" to="ink" sheet="02" title="CONTACT" />
      <Footer />
    </main>
  );
}
