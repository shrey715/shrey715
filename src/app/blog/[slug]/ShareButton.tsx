'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  slug: string;
}

export default function ShareButton({ slug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${slug}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 font-mono-label text-[11px] border-2 transition-colors w-fit ${
        copied
          ? 'border-accent text-accent'
          : 'border-ink text-ink hover:bg-ink hover:text-paper'
      }`}
      title={copied ? 'Link copied!' : 'Copy link to share'}
    >
      {copied ? (
        <>
          <Check size={14} />
          COPIED!
        </>
      ) : (
        <>
          <Share2 size={14} />
          SHARE
        </>
      )}
    </button>
  );
}
