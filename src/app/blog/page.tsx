import { getAllPosts, BlogPost } from '@/lib/blog';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Blogs | Shreyas Deb',
  description: 'Thoughts on systems, AI, gaming, distro-hopping, and everything in between.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <main className="min-h-screen bg-paper text-ink grid-lines">
      {/* Header */}
      <header className="relative px-4 sm:px-6 pt-16 pb-12 border-b-2 border-ink">
        <div className="max-w-[1500px] mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-10 font-mono-label text-[11px] text-ink/60 hover:text-accent transition-colors"
          >
            <ArrowLeft size={14} /> BACK TO HOME
          </Link>

          <div className="font-mono-label text-[11px] text-ink/60 mb-3 flex items-center gap-3">
            <span className="text-accent">(00)</span> WRITING
            <span className="flex-1 h-px bg-ink/20" />
          </div>

          <h1 className="font-display text-ink" style={{ fontSize: 'clamp(3rem, 13vw, 11rem)' }}>
            THE BLOG
          </h1>

          <p className="text-lg md:text-xl text-ink/70 max-w-xl leading-relaxed mt-6">
            Systems deep-dives, AI explorations, gaming adventures, distro-hopping
            chronicles, and everything in between.
          </p>
        </div>
      </header>

      {/* Featured */}
      {featuredPost && (
        <section className="max-w-[1500px] mx-auto px-4 sm:px-6 py-16">
          <div className="font-mono-label text-[11px] text-ink/50 mb-5">// LATEST</div>
          <FeaturedPostCard post={featuredPost} />
        </section>
      )}

      {/* Grid */}
      {otherPosts.length > 0 && (
        <section className="max-w-[1500px] mx-auto px-4 sm:px-6 pb-24">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-mono-label text-[11px] text-ink/60">ALL POSTS</h2>
            <span className="flex-1 h-0.5 bg-ink" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {posts.length === 0 && (
        <section className="max-w-[1500px] mx-auto px-4 sm:px-6 pb-24">
          <div className="text-center py-20 hard-border">
            <p className="text-ink/70 text-lg mb-2 font-mono-label">NO POSTS YET</p>
            <p className="text-ink/40 text-sm">Check back soon.</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-10 text-center border-t-2 border-ink font-mono-label text-[10px] text-ink/50">
        <Link href="/" className="hover:text-accent transition-colors">
          SHREYAS DEB © {new Date().getFullYear()}
        </Link>
      </footer>
    </main>
  );
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="hard-border bg-paper hard-shadow transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[10px_10px_0_0_#ff3d00] grid md:grid-cols-2">
        {/* Image */}
        <div className="relative h-64 md:h-full min-h-[18rem] bg-ink border-b-2 md:border-b-0 md:border-r-2 border-ink overflow-hidden">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-8xl text-paper/20">B</span>
            </div>
          )}
          <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-paper font-mono-label text-[10px]">
            NEW
          </span>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-4 font-mono-label text-[10px] text-ink/50 mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {post.readingTime}
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-3">{post.title}</h2>
          <p className="text-ink/70 leading-relaxed mb-6 line-clamp-3">{post.description}</p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 font-mono-label text-[10px] border border-ink/40">
                  {tag}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-2 font-mono-label text-[11px] group-hover:gap-3 group-hover:text-accent transition-all">
              READ <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group h-full">
      <article className="h-full flex flex-col hard-border bg-paper hard-shadow-sm transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0_0_#ff3d00]">
        <div className="relative h-44 bg-ink border-b-2 border-ink overflow-hidden">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-6xl text-paper/20">✦</span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-3 font-mono-label text-[10px] text-ink/50 mb-3">
            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>

          <h3 className="text-lg font-bold leading-tight mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-ink/70 leading-relaxed line-clamp-2 mb-4">{post.description}</p>

          <div className="flex flex-wrap gap-1.5 mt-auto">
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 font-mono-label text-[10px] border border-ink/30">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
