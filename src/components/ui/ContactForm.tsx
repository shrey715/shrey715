'use client';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';

export default function ContactForm() {
  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="p-8 rounded-2xl bg-[#252525] border border-white/10 shadow-2xl text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center text-[#f1efe7]">
          <Mail size={32} />
        </div>
        
        <h3 className="text-2xl font-bold mb-3 text-[#f1efe7]">
          Get in Touch
        </h3>
        
        <p className="text-[#808080] mb-8 leading-relaxed">
          Whether you have a question, a project idea, or just want to discuss systems biology - my inbox is always open!
        </p>

        <motion.a
          href="mailto:shreyas.deb@research.iiit.ac.in"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl font-semibold text-lg tracking-wide flex items-center justify-center gap-3 bg-[#f1efe7] text-[#1a1a1a] hover:bg-white hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
        >
          <span>Say Hello</span>
          <ArrowRight size={20} />
        </motion.a>
      </div>
    </div>
  );
}
