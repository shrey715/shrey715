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
      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all w-fit ${
        copied 
          ? 'text-green-600 bg-green-50' 
          : 'text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#f0f0f0]'
      }`}
      title={copied ? 'Link copied!' : 'Copy link to share'}
    >
      {copied ? (
        <>
          <Check size={15} />
          Copied!
        </>
      ) : (
        <>
          <Share2 size={15} />
          Share
        </>
      )}
    </button>
  );
}
