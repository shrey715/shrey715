'use client';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { HiOutlineNewspaper, HiOutlineDocumentText } from 'react-icons/hi';
import ContactForm from '@/components/ui/ContactForm';

const socialLinks = [
  { icon: FaGithub, href: "https://github.com/shrey715", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/shreyasdeb/", label: "LinkedIn" },
  { icon: HiOutlineDocumentText, href: "/assets/shreyas_deb_resume.pdf", label: "Resume" },
  { icon: HiOutlineNewspaper, href: "/blog", label: "Blog" },
  { icon: FaEnvelope, href: "mailto:shreyas.deb@research.iiit.ac.in", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="py-24 px-4 bg-[#1a1a1a] text-[#f1efe7] grain-overlay relative z-0">
      {/* Floating glow orbs */}
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-violet-500/8 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[250px] h-[250px] rounded-full bg-indigo-500/6 blur-[60px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-left"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-br from-[#f1efe7] to-[#808080] bg-clip-text text-transparent">
              Let's Build Something<br />Amazing Together.
            </h3>
            <p className="text-[#808080] mb-10 text-lg leading-relaxed max-w-sm">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
            </p>

            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -3 }}
                  className="p-3.5 rounded-full bg-white/5 border border-white/10 text-[#c0c0c0] hover:text-[#f1efe7] hover:bg-white/10 transition-colors"
                  aria-label={link.label}
                >
                  <link.icon size={20} />
                </motion.a>
              ))}
            </div>

            <div className="mt-16 text-sm text-[#606060]">
               {new Date().getFullYear()} Shreyas Deb ·
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <ContactForm />
          </motion.div>

        </div>
      </div>
    </footer>
  );
}
