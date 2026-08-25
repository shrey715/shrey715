'use client';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { HiOutlineNewspaper } from 'react-icons/hi';
import { ArrowUp } from 'lucide-react';
import { useLenis } from 'lenis/react';
import ContactForm from '@/components/ui/ContactForm';
import DisplayTitle from '@/components/ui/DisplayTitle';
import ScrambleText from '@/components/ui/ScrambleText';
import { Container } from '@/components/ui/Section';
import RegistrationMarks from '@/components/ui/RegistrationMarks';
import { ACCENT } from '@/lib/constants';
import type { SocialLink } from '@/types';

const socialLinks: SocialLink[] = [
  { icon: FaGithub, href: "https://github.com/shrey715", label: "GitHub", external: true },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/shreyasdeb/", label: "LinkedIn", external: true },
  { icon: HiOutlineNewspaper, href: "/blog", label: "Blog", external: false },
  { icon: FaEnvelope, href: "mailto:shreyas.deb@research.iiit.ac.in", label: "Email", external: true },
];

export default function Footer() {
  const lenis = useLenis();
  const scrollTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.6 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="relative bg-ink text-paper grid-lines-dark pt-24 border-t-2 border-ink overflow-hidden">
      <RegistrationMarks dark />
      <Container>
        <div className="font-mono-label text-[11px] text-paper/50 mb-4 flex items-center gap-3">
          <span className="text-accent">(05)</span>
          <ScrambleText text="[ CONTACT ]" duration={700} />
          <span className="flex-1 h-px bg-paper/20" />
        </div>

        <h2 className="font-display leading-[0.82]" style={{ fontSize: 'clamp(3rem, 12vw, 10rem)' }}>
          <DisplayTitle text="SAY" dark />
          <span className="text-accent"><DisplayTitle text="HELLO!" dark delay={0.12} /></span>
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mt-14 items-start">
          {/* Left: blurb + socials */}
          <div>
            <p className="text-lg text-paper/75 leading-relaxed max-w-md mb-8">
              Always open to new projects, research collaborations, or just
              talking shop about kernels, models and everything in between.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 hard-border border-paper/40">
              {socialLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  whileHover={{ backgroundColor: ACCENT }}
                  whileTap={{ scale: 0.96 }}
                  className={`flex flex-col items-center justify-center gap-2 py-5 transition-colors
                    ${i < socialLinks.length - 1 ? 'border-r-2 border-paper/40' : ''}`}
                  aria-label={link.label}
                >
                  <link.icon size={22} />
                  <span className="font-mono-label text-[10px]">{link.label}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right: contact card */}
          <ContactForm />
        </div>

        {/* Bottom bar */}
        <div className="mt-20 border-t-2 border-paper/20 py-6 flex flex-wrap items-center justify-between gap-4 font-mono-label text-[10px] text-paper/50">
          <span>© {new Date().getFullYear()} SHREYAS DEB</span>
          <span className="flex items-center gap-3 tabular-nums" aria-hidden="true">
            <span className="barcode-strip" />
            REV {new Date().getFullYear()}.{String(new Date().getMonth() + 1).padStart(2, '0')} / UNIT SD-01
          </span>
          <button
            onClick={scrollTop}
            className="flex items-center gap-2 hover:text-accent active:scale-95 transition-[color,transform] print:hidden"
            aria-label="Back to top"
          >
            BACK TO TOP <ArrowUp size={14} />
          </button>
        </div>
      </Container>
    </footer>
  );
}
