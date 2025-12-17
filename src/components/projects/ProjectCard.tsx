'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpenModal: () => void;
}

const getRepoInfo = (url: string) => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { user: parts[0], repo: parts[1] };
    }
  } catch {
    return null;
  }
  return null;
};

export default function ProjectCard({ project, index, onOpenModal }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), { stiffness: 300, damping: 30 });

  const repoInfo = getRepoInfo(project.link);
  const imageUrl = repoInfo 
    ? `https://opengraph.githubassets.com/1/${repoInfo.user}/${repoInfo.repo}`
    : project.image;

  const hasDeploymentLink = !!project.deployment_link;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleCardClick = () => {
    if (hasDeploymentLink) {
      onOpenModal();
    } else {
      window.open(project.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
      className="flex-shrink-0 w-[320px] md:w-[400px]"
      style={{ scrollSnapAlign: 'center' }}
    >
      <motion.div 
        ref={cardRef}
        onClick={handleCardClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 25 } }}
        className="h-full rounded-2xl bg-white border border-[#e8e8e8] shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-shadow duration-500 cursor-pointer group"
      >
        {/* Project Preview */}
        <div className="h-48 bg-gray-100 flex items-center justify-center border-b border-[#e8e8e8] relative overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={`${project.title} preview`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <motion.span 
              className="text-6xl select-none"
              initial={{ opacity: 0.3 }}
              whileHover={{ opacity: 0.5, scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              🚀
            </motion.span>
          )}
          
          {project.year && (
            <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/90 text-[#4a4a4a] border border-[#e0e0e0] shadow-sm backdrop-blur-sm z-10">
              {project.year}
            </span>
          )}

          {hasDeploymentLink && (
            <span className="absolute top-4 right-4 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm z-10">
              Live
            </span>
          )}
          
          {project.status && !hasDeploymentLink && (
            <span className="absolute top-4 right-4 px-3 py-1.5 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200 z-10">
              {project.status}
            </span>
          )}
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start gap-3 mb-3">
            <h3 className="text-xl font-bold text-[#1a1a1a] group-hover:text-black transition-colors line-clamp-1">
              {project.title}
            </h3>
            <motion.div 
              className="flex-shrink-0 p-2 rounded-full bg-[#f5f5f5] border border-[#e8e8e8] group-hover:bg-[#1a1a1a] group-hover:border-[#1a1a1a] transition-all"
              whileHover={{ scale: 1.1 }}
            >
              <ArrowUpRight className="w-4 h-4 text-[#4a4a4a] group-hover:text-white transition-colors" />
            </motion.div>
          </div>
          
          <p className="text-[#6b6b6b] text-sm leading-relaxed mb-5 line-clamp-2 min-h-[44px]">
            {project.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {project.tech.slice(0, 4).map((t) => (
              <span 
                key={t}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#f5f5f5] text-[#4a4a4a] border border-[#e8e8e8]"
              >
                {t}
              </span>
            ))}
            {project.tech.length > 4 && (
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#f0f0f0] text-[#808080]">
                +{project.tech.length - 4}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
