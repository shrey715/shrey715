import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import CodeBlock from '@/components/CodeBlock';
import { slugify, textOf } from '@/lib/slug';
import HeadingAnchor from '@/components/blog/HeadingAnchor';
import ZoomImage from '@/components/blog/ZoomImage';
import Sidenote from '@/components/blog/Sidenote';

// Article typography, in the site palette. h1/h2 carry ids (for the table of
// contents) and the `sec-heading` class, which globals.css auto-numbers with
// a CSS counter so the numbers always match the TOC.
export const mdxComponents: MDXComponents = {
  img: (props) => (
    <figure className="my-10">
      <ZoomImage src={props.src || ''} alt={props.alt || ''}>
        <Image
          {...props}
          src={props.src || ''}
          alt={props.alt || ''}
          width={1200}
          height={675}
          className="hard-border w-full h-auto"
        />
      </ZoomImage>
      {props.alt && (
        <figcaption className="mt-3 font-mono-label text-[10px] text-ink/50">{props.alt}</figcaption>
      )}
    </figure>
  ),
  h1: ({ children }) => (
    <h2
      id={slugify(textOf(children))}
      className="group/h sec-heading scroll-mt-28 text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-ink mt-16 mb-5 text-balance"
    >
      {children}
      <HeadingAnchor id={slugify(textOf(children))} />
    </h2>
  ),
  h2: ({ children }) => (
    <h2
      id={slugify(textOf(children))}
      className="group/h sec-heading scroll-mt-28 text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-ink mt-14 mb-4 text-balance"
    >
      {children}
      <HeadingAnchor id={slugify(textOf(children))} />
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      id={slugify(textOf(children))}
      className="group/h scroll-mt-28 text-xl font-bold tracking-tight text-ink mt-10 mb-3"
    >
      {children}
      <HeadingAnchor id={slugify(textOf(children))} />
    </h3>
  ),
  p: ({ children }) => <p className="text-[1.075rem] text-ink/75 leading-[1.8] mb-5 text-pretty">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-ink font-medium underline decoration-accent decoration-2 underline-offset-4 hover:text-accent transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  // rehype-pretty-code tags the <pre> with data-language; plain fences fall back to the code's className.
  pre: ({ children, ...props }) => (
    <CodeBlock lang={(props as Record<string, string | undefined>)['data-language']}>{children}</CodeBlock>
  ),
  ul: ({ children }) => <ul className="my-5 space-y-2.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-5 space-y-2.5 list-decimal pl-6 marker:font-mono marker:text-accent">{children}</ol>,
  li: ({ children }) => (
    <li className="text-[1.05rem] text-ink/75 leading-[1.7] pl-6 relative [ul>&]:before:content-['→'] [ul>&]:before:absolute [ul>&]:before:left-0 [ul>&]:before:text-accent [ol>&]:pl-1">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-8 border-l-[3px] border-accent bg-paper-dim/70 pl-5 pr-4 py-1 [&>p]:text-ink/80 [&>p]:my-3">
      {children}
    </blockquote>
  ),
  Sidenote,
  hr: () => (
    <div role="separator" className="my-12 flex justify-center gap-4 text-accent text-sm select-none" aria-hidden="true">
      <span>✶</span>
      <span>✶</span>
      <span>✶</span>
    </div>
  ),
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components };
}
