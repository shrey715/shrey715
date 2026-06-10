'use client';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ACCENT } from '@/lib/constants';

export default function ContactForm() {
  return (
    <div className="w-full hard-border border-paper/40 bg-paper text-ink">
      <div className="border-b-2 border-ink px-5 py-3 font-mono-label text-[11px] flex items-center justify-between">
        <span>DIRECT LINE</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> INBOX OPEN
        </span>
      </div>

      <div className="p-6 sm:p-8">
        <h3 className="text-2xl font-bold mb-3">Get in touch.</h3>
        <p className="text-ink/70 mb-8 leading-relaxed">
          Got a question, a project idea, or just want to discuss something
          interesting? My inbox is always open.
        </p>

        <motion.a
          href="mailto:shreyas.deb@research.iiit.ac.in"
          whileHover={{ x: -3, y: -3, boxShadow: `6px 6px 0 0 ${ACCENT}` }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 px-5 font-mono-label text-sm flex items-center justify-between gap-3 bg-ink text-paper hard-border"
        >
          <span>Contact me!</span>
          <ArrowRight size={18} />
        </motion.a>
      </div>
    </div>
  );
}
