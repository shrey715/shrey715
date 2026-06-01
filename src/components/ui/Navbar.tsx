'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Sparkles, FolderOpen } from 'lucide-react';
import Magnetic from '@/components/ui/Magnetic';

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
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center bg-paper hard-border hard-shadow-sm">
            {navLinks.map((link, idx) => {
              const Icon = link.icon;
              const isActive = activeSection === link.href.replace('#', '');

              return (
                <Magnetic key={link.label} strength={0.3}>
                  <motion.button
                    onClick={() => scrollToSection(link.href)}
                    whileTap={{ scale: 0.96 }}
                    className={`
                      px-3 py-3 sm:px-5 font-mono-label text-[11px] transition-colors duration-200
                      ${idx !== 0 ? 'border-l-2 border-ink' : ''}
                      ${isActive
                        ? 'bg-accent text-paper'
                        : 'text-ink hover:bg-ink hover:text-paper'
                      }
                    `}
                    title={link.label}
                  >
                    <Icon className="sm:hidden" size={18} />
                    <span className="hidden sm:inline">{link.label}</span>
                  </motion.button>
                </Magnetic>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
