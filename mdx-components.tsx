import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Use Next.js Image for optimized images
    img: (props) => (
      <Image
        {...props}
        src={props.src || ''}
        alt={props.alt || ''}
        width={800}
        height={450}
        className="rounded-lg my-6"
        style={{ width: '100%', height: 'auto' }}
      />
    ),
    // Styled headings
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mt-8 mb-4 text-[#1a1a1a]" style={{ fontFamily: 'var(--font-playfair)' }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-8 mb-3 text-[#1a1a1a]" style={{ fontFamily: 'var(--font-playfair)' }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-6 mb-2 text-[#2a2a2a]">
        {children}
      </h3>
    ),
    // Paragraphs
    p: ({ children }) => (
      <p className="text-[#4a4a4a] leading-relaxed mb-4">{children}</p>
    ),
    // Links
    a: ({ children, href }) => (
      <a 
        href={href} 
        className="text-[#1a1a1a] underline underline-offset-2 hover:text-[#6b6b6b] transition-colors"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    // Code blocks
    pre: ({ children }) => (
      <pre className="bg-[#1a1a1a] text-[#f1efe7] rounded-lg p-4 overflow-x-auto my-6 text-sm">
        {children}
      </pre>
    ),
    code: ({ children }) => (
      <code className="font-mono text-sm">
        {children}
      </code>
    ),
    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside my-4 space-y-2 text-[#4a4a4a]">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside my-4 space-y-2 text-[#4a4a4a]">{children}</ol>
    ),
    // Blockquote
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#1a1a1a] pl-4 my-6 italic text-[#6b6b6b]">
        {children}
      </blockquote>
    ),
    // Horizontal rule
    hr: () => <hr className="my-8 border-[#e8e8e8]" />,
    ...components,
  };
}
