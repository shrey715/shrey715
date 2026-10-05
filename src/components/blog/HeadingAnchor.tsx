'use client';
import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

/** Hover-revealed "#" beside a heading; click copies a deep link to the section. */
export default function HeadingAnchor({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    history.replaceState(null, '', `#${id}`);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked — the URL hash is still updated.
    }
  };
  return (
    <a
      href={`#${id}`}
      onClick={copy}
      aria-label={copied ? 'Link copied' : 'Copy link to this section'}
      className={`ml-3 inline-flex align-middle items-center gap-1 font-mono-label text-[10px] transition-opacity ${
        copied ? 'opacity-100 text-accent' : 'opacity-0 group-hover/h:opacity-60 hover:!opacity-100 focus-visible:opacity-100 text-ink'
      }`}
    >
      {copied ? <Check size={14} /> : <Link2 size={14} />}
      {copied && 'COPIED'}
    </a>
  );
}
