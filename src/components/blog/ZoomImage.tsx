'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLenis } from 'lenis/react';

interface ZoomImageProps {
  src: string;
  alt: string;
  /** Rendered thumbnail (e.g. a next/image); clicking it opens the lightbox. */
  children: React.ReactNode;
  className?: string;
}

const noopSubscribe = () => () => {};

/** Click-to-zoom: opens the full image over a dimmed page; Esc / click / X closes. */
export default function ZoomImage({ src, alt, children, className = '' }: ZoomImageProps) {
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  // SSR-safe "are we in the browser" — the portal target only exists client-side.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      window.removeEventListener('keydown', onKey);
    };
  }, [open, lenis]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-cursor="ZOOM"
        aria-label={`Enlarge image${alt ? `: ${alt}` : ''}`}
        className={`block w-full cursor-zoom-in ${className}`}
      >
        {children}
      </button>
      {isClient &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={alt || 'Image'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-[100002] bg-ink/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
              >
                <motion.img
                  src={src}
                  alt={alt}
                  initial={{ scale: 0.92, y: 12 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  className="max-w-full max-h-full object-contain border-2 border-paper/30"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="absolute top-4 right-4 p-3 bg-paper text-ink hard-border"
                >
                  <X size={20} />
                </button>
                {alt && (
                  <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono-label text-[10px] text-paper/60 text-center max-w-[80vw]">
                    {alt}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
