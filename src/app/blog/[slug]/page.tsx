import { getPostBySlug, getAllPostSlugs } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '../../../../mdx-components';

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
    <main className="min-h-screen bg-[#f1efe7]">
      {/* Hero Header with Cover Image */}
      <header className="relative">
        {/* Cover Image */}
        {post.image && (
          <div className="relative h-72 md:h-[28rem] w-full overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#f1efe7]" />
          </div>
        )}
        
        {/* Navigation */}
        <div className={`${post.image ? 'absolute top-0 left-0 right-0' : 'relative'} pt-6 md:pt-8 px-4 md:px-6`}>
          <div className="max-w-3xl mx-auto">
            <Link 
              href="/blog" 
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                post.image 
                  ? 'bg-white/95 backdrop-blur-sm text-[#1a1a1a] hover:bg-white shadow-sm' 
                  : 'text-[#808080] hover:text-[#1a1a1a]'
              } transition-all`}
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
        </div>
      </header>

      {/* Article Header */}
      <div className={`max-w-3xl mx-auto px-4 md:px-6 ${post.image ? '-mt-20 md:-mt-24 relative z-10' : 'pt-24'}`}>
        <div className="bg-[#f1efe7] rounded-t-3xl pt-16 md:pt-20 pb-2 px-6 md:px-8">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#1a1a1a] text-[#f1efe7]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-6 leading-[1.1]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {post.title}
          </h1>
          
          <p className="text-lg md:text-xl text-[#6b6b6b] mb-10 leading-relaxed">{post.description}</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5 border-y border-[#e0e0e0]">
            <div className="flex items-center gap-5 text-sm text-[#808080]">
              <span className="flex items-center gap-2">
                <Calendar size={15} />
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={15} />
                {post.readingTime}
              </span>
            </div>
            
            <button 
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#f0f0f0] rounded-full transition-colors w-fit"
              title="Share"
            >
              <Share2 size={15} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="prose prose-lg max-w-none px-2 md:px-0">
          <MDXRemote source={post.content} components={components} />
        </div>
      </article>

      {/* Footer Navigation */}
      <footer className="max-w-3xl mx-auto px-4 md:px-6 pb-20">
        <div className="pt-10 border-t border-[#e0e0e0]">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#1a1a1a] text-[#f1efe7] hover:bg-[#2a2a2a] transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Back to all posts
          </Link>
        </div>
      </footer>
    </main>
  );
}
