import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';
import SectionHeader from '@/components/ui/SectionHeader';
import Section, { Container } from '@/components/ui/Section';
import Footer from '@/components/sections/Footer';
import FeaturedPost from '@/components/blog/FeaturedPost';
import PostLedger from '@/components/blog/PostLedger';
import { dateParts } from '@/components/blog/format';

export const metadata = {
  title: 'Blogs | Shreyas Deb',
  description: 'Thoughts on systems, AI, gaming, distro-hopping, and everything in between.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const [latest, ...archive] = posts;
  const totalMinutes = posts.reduce((n, p) => n + (parseInt(p.readingTime, 10) || 0), 0);

  const stats = [
    { k: 'POSTS', v: String(posts.length).padStart(2, '0') },
    { k: 'LATEST', v: latest ? dateParts(latest.date).monthShortYear : '—' },
    { k: 'READING', v: `${totalMinutes}M` },
  ];

  return (
    <main id="main" className="relative overflow-x-clip bg-paper">
      <Section className="justify-start min-h-0 pt-28 sm:pt-36">
        <Container>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono-label text-[11px] text-ink/60 hover:text-accent transition-colors mb-10"
          >
            <ArrowLeft size={14} /> BACK TO HOME
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end gap-8">
            <SectionHeader index="LOG" kicker="FIELD NOTES" title="BLOG" className="flex-1 min-w-0" />
            <dl className="grid grid-cols-3 hard-border bg-paper lg:mb-4 shrink-0">
              {stats.map((s, i) => (
                <div key={s.k} className={`px-5 py-3 ${i > 0 ? 'border-l-2 border-ink' : ''}`}>
                  <dt className="font-mono-label text-[9px] text-ink/45">{s.k}</dt>
                  <dd className="font-display text-3xl leading-none mt-1 tabular-nums whitespace-nowrap">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-6 max-w-xl text-ink/70 leading-relaxed text-pretty">
            Write-ups from the workbench — broken bootloaders, home servers, systems deep-dives and whatever
            else I end up taking apart.
          </p>

          {latest ? (
            <div className="mt-20 sm:mt-24">
              <FeaturedPost post={latest} />
            </div>
          ) : (
            <div className="mt-20 py-20 text-center hard-border bg-paper">
              <p className="font-mono-label text-sm text-ink/60">NO POSTS YET — CHECK BACK SOON.</p>
            </div>
          )}

          {archive.length > 0 && (
            <div className="mt-24 sm:mt-32">
              <div className="flex items-center gap-4 mb-2 font-mono-label text-xs text-ink/60">
                ARCHIVE
                <span className="text-accent tabular-nums">[{String(archive.length).padStart(2, '0')}]</span>
              </div>
              <PostLedger posts={archive} />
            </div>
          )}
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
