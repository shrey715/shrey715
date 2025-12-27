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
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999]"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-[90%] max-w-[340px] bg-white rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-[#f0f0f0]">
              <h4 className="text-lg font-bold text-[#1a1a1a] line-clamp-1">{project.title}</h4>
              <p className="text-sm text-[#808080] mt-1">Choose where to view this project</p>
            </div>
            
            <div className="p-6 space-y-3">
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors"
                onClick={onClose}
              >
                <FaGithub size={20} />
                <span>View on GitHub</span>
              </a>
              <a 
                href={project.deployment_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
                onClick={onClose}
              >
                <ExternalLink size={20} />
                <span>Open Live Demo</span>
              </a>
            </div>
            
            <div className="px-6 pb-6">
              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm text-[#808080] hover:text-[#4a4a4a] transition-colors rounded-lg hover:bg-[#f5f5f5]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
