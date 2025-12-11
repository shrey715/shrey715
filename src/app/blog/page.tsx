import { getAllPosts, BlogPost } from '@/lib/blog';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Blog | Shreyas Deb',
  description: 'Thoughts on systems, AI, gaming, distro-hopping, and everything in between.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <main className="min-h-screen bg-[#f1efe7]">
      {/* Hero Header */}
      <header className="relative py-24 px-6 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-rose-50/30 pointer-events-none" />
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 mb-10 text-sm uppercase tracking-widest text-[#808080] hover:text-[#1a1a1a] transition-colors"
          >
            ← Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <Sparkles size={18} className="text-[#f1efe7]" />
            </div>
            <span className="text-sm uppercase tracking-widest text-[#808080] font-medium">The Blog</span>
          </div>
          
          <h1 
            className="text-5xl md:text-7xl font-bold text-gradient-dark mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Thoughts &<br />
            <span className="text-[#808080]">Experiments</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#6b6b6b] max-w-xl leading-relaxed">
            A blend of systems deep-dives, AI explorations, gaming adventures, distro-hopping chronicles, and everything in between.
          </p>
        </div>
      </header>

      {/* Featured Post */}
      {featuredPost && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <FeaturedPostCard post={featuredPost} />
        </section>
      )}

      {/* Other Posts Grid */}
      {otherPosts.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-sm uppercase tracking-widest text-[#808080] font-semibold">All Posts</h2>
            <div className="flex-1 h-px bg-[#e8e8e8]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="text-center py-20 rounded-2xl bg-white/50 border border-[#e8e8e8]">
            <p className="text-[#808080] text-lg mb-2">No posts yet.</p>
            <p className="text-[#a0a0a0] text-sm">Check back soon!</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 text-center border-t border-[#e8e8e8]">
        <Link href="/" className="text-sm text-[#808080] hover:text-[#1a1a1a] transition-colors">
          shreyas.deb © {new Date().getFullYear()}
        </Link>
      </footer>
    </main>
  );
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="relative rounded-3xl overflow-hidden bg-white border border-[#e8e8e8] shadow-sm hover:shadow-2xl transition-all duration-500">
        {/* Image */}
        <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] overflow-hidden">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl opacity-20">✨</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Featured Badge */}
          <span className="absolute top-6 left-6 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-white/90 text-[#1a1a1a] backdrop-blur-sm">
            New
          </span>
        </div>
        
        {/* Content */}
        <div className="p-8">
          <div className="flex items-center gap-4 text-xs text-[#808080] mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {post.readingTime}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-3 group-hover:text-[#4a4a4a] transition-colors" style={{ fontFamily: 'var(--font-playfair)' }}>
            {post.title}
          </h2>
          
          <p className="text-[#6b6b6b] leading-relaxed mb-6 line-clamp-2">
            {post.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs rounded-full bg-[#f5f5f5] text-[#6b6b6b] border border-[#e8e8e8]">
                  {tag}
                </span>
              ))}
            </div>
            
            <span className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a] group-hover:gap-3 transition-all">
              Read Article <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="h-full rounded-2xl overflow-hidden bg-white border border-[#e8e8e8] shadow-sm hover:shadow-lg hover:border-[#d0d0d0] transition-all duration-300">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-[#f0f0f0] to-[#e8e8e8] overflow-hidden">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#3a3a3a]">
              <span className="text-5xl opacity-30">📝</span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-3 text-xs text-[#808080] mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
          
          <h3 className="text-lg font-bold text-[#1a1a1a] mb-2 group-hover:text-[#4a4a4a] transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-sm text-[#6b6b6b] leading-relaxed line-clamp-2 mb-4">
            {post.description}
          </p>
          
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[#f5f5f5] text-[#808080]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
