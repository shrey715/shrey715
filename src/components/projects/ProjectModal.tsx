'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import type { Project } from '@/types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [project]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-ink/70 z-[9999]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-[90%] max-w-[360px] bg-paper hard-border hard-shadow overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b-2 border-ink flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold text-ink line-clamp-1">{project.title}</h4>
                <p className="font-mono-label text-[10px] text-ink/50 mt-1">CHOOSE A DESTINATION</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-ink text-paper font-mono-label text-xs hard-border hover:bg-paper hover:text-ink transition-colors"
                onClick={onClose}
              >
                <FaGithub size={18} />
                <span>VIEW ON GITHUB</span>
              </a>
              <a
                href={project.deployment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-accent text-paper font-mono-label text-xs hard-border border-accent hover:bg-paper hover:text-ink transition-colors"
                onClick={onClose}
              >
                <ExternalLink size={18} />
                <span>OPEN LIVE DEMO</span>
              </a>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={onClose}
                className="w-full py-2.5 font-mono-label text-[11px] text-ink/50 hover:text-ink transition-colors"
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
