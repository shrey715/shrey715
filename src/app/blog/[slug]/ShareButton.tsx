'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

interface ShareButtonProps {
  slug: string;
}

/** Copies the post's URL. */
export default function ShareButton({ slug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API unavailable (older browsers / insecure context).
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-3.5 py-2 font-mono-label text-[10px] border-2 transition-colors active:scale-[0.97] ${
        copied ? 'border-accent text-accent' : 'border-ink text-ink hover:bg-ink hover:text-paper'
      }`}
    >
      {copied ? <Check size={13} /> : <Link2 size={13} />}
      {copied ? 'LINK COPIED' : 'COPY LINK'}
    </button>
  );
}
