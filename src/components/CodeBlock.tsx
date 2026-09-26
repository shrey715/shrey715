'use client';

import { isValidElement, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
}

/** Fenced code: an ink panel with a header bar naming the language and a copy button. */
export default function CodeBlock({ children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  // MDX hands us <code className="language-bash">…</code> as the only child.
  const className = isValidElement<{ className?: string }>(children) ? children.props.className ?? '' : '';
  const lang = className.match(/language-(\w+)/)?.[1];

  const copyToClipboard = async () => {
    const code = preRef.current?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="my-8 hard-border bg-ink text-paper">
      <div className="flex items-center justify-between border-b-2 border-paper/15 font-mono-label text-[10px]">
        <span className="px-4 py-2 text-paper/50 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent" aria-hidden="true" />
          {lang ?? 'CODE'}
        </span>
        <button
          type="button"
          onClick={copyToClipboard}
          aria-label={copied ? 'Copied' : 'Copy code'}
          className={`flex items-center gap-1.5 px-4 py-2 border-l-2 border-paper/15 transition-colors active:scale-95 ${
            copied ? 'text-accent' : 'text-paper/60 hover:text-paper hover:bg-paper/5'
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
      <pre ref={preRef} className="code-block p-4 sm:p-5 overflow-x-auto text-[13px] leading-relaxed whitespace-pre font-mono">
        {children}
      </pre>
    </div>
  );
}
