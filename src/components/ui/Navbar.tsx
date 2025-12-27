'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Sparkles, FolderOpen } from 'lucide-react';

const navLinks = [
  { label: 'About', href: '#about', icon: User },
  { label: 'Experience', href: '#experience', icon: Briefcase },
  { label: 'Skills', href: '#skills', icon: Sparkles },
  { label: 'Projects', href: '#projects', icon: FolderOpen },
];

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 100);
          
          const sections = ['projects', 'skills', 'experience', 'about'];
          let maxVisibleHeight = 0;
          let currentBestSection = activeSection;
          const viewportHeight = window.innerHeight;

          for (const section of sections) {
            const el = document.getElementById(section);
            if (!el) continue;

            const rect = el.getBoundingClientRect();
            const overlapStart = Math.max(rect.top, 0);
            const overlapEnd = Math.min(rect.bottom, viewportHeight);
            const visibleHeight = Math.max(0, overlapEnd - overlapStart);

            if (visibleHeight > maxVisibleHeight) {
              maxVisibleHeight = visibleHeight;
              currentBestSection = section;
            }
          }
          
          if (currentBestSection) setActiveSection(currentBestSection);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const el = document.getElementById(href.replace('#', ''));
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-white/90 backdrop-blur-xl border border-[#e0e0e0] shadow-lg shadow-black/5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeSection === link.href.replace('#', '');
              
              return (
                <motion.button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    px-3 py-2.5 sm:px-5 rounded-full text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-[#1a1a1a] text-[#f1efe7] shadow-md' 
                      : 'text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-[#f5f5f5]'
                    }
                  `}
                  title={link.label}
                >
                  <Icon className="sm:hidden" size={18} />
                  <span className="hidden sm:inline">{link.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
