import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { getProjects, getProjectBySlug } from '@/lib/projects';
import { DOMAINS, previewImage, primaryDomain, projectDomains, getRepoInfo } from '@/lib/projectMeta';
import { projectTitleVT } from '@/lib/vtNames';
import Section, { Container } from '@/components/ui/Section';
import Footer from '@/components/sections/Footer';
import TransitionLink from '@/components/ui/TransitionLink';
import DotPlot, { activityCaption } from '@/components/projects/DotPlot';
import ProjectSceneSlot from '@/components/projects/ProjectSceneSlot';

/** Long titles step down so they stay at two or three clean lines. */
function titleSize(title: string) {
  if (title.length <= 12) return 'clamp(3rem, 7.5vw, 7.5rem)';
  if (title.length <= 22) return 'clamp(2.6rem, 5.6vw, 5.6rem)';
  return 'clamp(2.3rem, 4.4vw, 4.4rem)';
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) return { title: 'Project Not Found' };
  const { project } = found;
  const cover = previewImage(project);
  return {
    title: `${project.title} | Shreyas Deb`,
    description: project.description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { title: project.title, description: project.description, images: [{ url: cover, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: project.title, description: project.description, images: [cover] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) notFound();
  const { project, index, total, prev, next } = found;

  const domains = [...projectDomains(project)];
  const domainLabels = domains.map((d) => DOMAINS.find((x) => x.id === d)?.label).filter(Boolean);
  const repo = getRepoInfo(project.link);
  const caption = activityCaption(project);
  const num = String(index + 1).padStart(2, '0');

  const rows: { k: string; v: React.ReactNode }[] = [
    { k: 'YEAR', v: <span className="tabular-nums">{project.year ?? '—'}</span> },
    { k: 'DOMAIN', v: domainLabels.length ? domainLabels.join(' / ') : '—' },
    {
      k: 'STACK',
      v: (
        <span className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span key={t} className="px-2 py-0.5 border border-ink/25 text-ink/70 text-[10px]">
              {t}
            </span>
          ))}
        </span>
      ),
    },
    ...(project.activity
      ? [
          {
            k: 'ACTIVITY',
            v: (
              <span className="block max-w-xl">
                <DotPlot project={project} />
                <span className="block mt-2 text-ink/50 text-[10px]">{caption}</span>
              </span>
            ),
          },
        ]
      : []),
    ...(repo
      ? [
          {
            k: 'SOURCE',
            v: (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 underline decoration-accent decoration-2 underline-offset-4 hover:text-accent transition-colors normal-case tracking-normal font-sans text-sm"
              >
                github.com/{repo.user}/{repo.repo} <ArrowUpRight size={13} />
              </a>
            ),
          },
        ]
      : []),
  ];

  return (
    <main id="main" className="relative overflow-x-clip bg-paper">
      <Section className="justify-start min-h-0 pt-28 sm:pt-36 pb-20 sm:pb-28">
        <Container>
          <div className="flex items-center justify-between gap-4 font-mono-label text-[11px] text-ink/60 mb-12">
            <TransitionLink href="/projects" className="inline-flex items-center gap-2 hover:text-accent transition-colors">
              <ArrowLeft size={14} /> ALL PROJECTS
            </TransitionLink>
            <span className="tabular-nums mr-16 sm:mr-20">
              <span className="text-accent">{num}</span> / {String(total).padStart(2, '0')}
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono-label text-[10px] text-ink/55 mb-6">
                <span className="text-ink tabular-nums">{project.year}</span>
                {domainLabels.length > 0 && <span>·</span>}
                <span>{domainLabels.join(' / ')}</span>
                {project.deployment_link && <span className="px-1.5 py-0.5 bg-accent text-paper">LIVE</span>}
              </div>

              <h1
                className="font-display text-ink leading-[0.86] text-balance"
                style={{ fontSize: titleSize(project.title), viewTransitionName: projectTitleVT(project.slug) }}
              >
                {project.title}
              </h1>

              <p className="mt-8 text-lg sm:text-xl text-ink/75 leading-relaxed max-w-[62ch] text-pretty">{project.description}</p>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="SOURCE"
                  className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-ink text-paper hard-border font-mono-label text-[11px] hover:bg-accent hover:border-accent active:scale-[0.97] transition-[background-color,border-color,transform]"
                >
                  <FaGithub size={16} /> VIEW SOURCE <ArrowUpRight size={14} />
                </a>
                {project.deployment_link && (
                  <a
                    href={project.deployment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="LIVE"
                    className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-paper text-ink hard-border font-mono-label text-[11px] hover:bg-ink hover:text-paper active:scale-[0.97] transition-[background-color,color,transform]"
                  >
                    <ExternalLink size={15} /> LIVE DEMO
                  </a>
                )}
              </div>
            </div>

            <div className="order-first lg:order-none lg:col-span-5 relative aspect-square max-w-[280px] sm:max-w-[400px] lg:max-w-[560px] w-full mx-auto -mt-6 lg:mt-0" data-cursor="DISTURB">
              <ProjectSceneSlot slug={project.slug} domain={primaryDomain(project)} className="absolute inset-0" />
            </div>
          </div>

          {/* Spec sheet */}
          <dl className="mt-20 sm:mt-24 border-t-2 border-ink">
            {rows.map((r) => (
              <div key={r.k} className="grid grid-cols-[7rem_1fr] sm:grid-cols-[10rem_1fr] gap-6 py-5 border-b border-ink/15 items-start">
                <dt className="font-mono-label text-[10px] text-ink/45 pt-1">{r.k}</dt>
                <dd className="font-mono-label text-[11px] text-ink min-w-0">{r.v}</dd>
              </div>
            ))}
          </dl>

          {/* Prev / next */}
          <nav aria-label="More projects" className="mt-20 grid sm:grid-cols-2 border-2 border-ink">
            {[
              { p: prev, dir: 'PREVIOUS', align: 'items-start text-left', Icon: ArrowLeft },
              { p: next, dir: 'NEXT', align: 'items-end text-right sm:border-l-2 border-t-2 sm:border-t-0 border-ink', Icon: ArrowRight },
            ].map(({ p, dir, align, Icon }) => (
              <TransitionLink
                key={dir}
                href={`/projects/${p.slug}`}
                data-cursor={dir}
                className={`group relative overflow-hidden flex flex-col gap-4 p-6 sm:p-8 ${align}`}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-ink origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
                <span className="relative flex items-center gap-2 font-mono-label text-[10px] text-ink/50 group-hover:text-paper/60 transition-colors">
                  {dir === 'PREVIOUS' && <Icon size={13} />}
                  {dir}
                  {dir === 'NEXT' && <Icon size={13} />}
                </span>
                <span
                  className="relative font-display leading-[0.88] group-hover:text-paper transition-colors"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.6rem)', viewTransitionName: projectTitleVT(p.slug) }}
                >
                  {p.title}
                </span>
              </TransitionLink>
            ))}
          </nav>
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
