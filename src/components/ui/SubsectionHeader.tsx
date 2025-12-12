'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SubsectionHeaderProps {
  icon: LucideIcon;
  title: string;
}

export default function SubsectionHeader({ icon: Icon, title }: SubsectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 mb-8"
    >
      <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#f1efe7]">
        <Icon size={18} />
      </div>
      <h3 className="text-xl font-semibold text-[#1a1a1a] uppercase tracking-widest">
        {title}
      </h3>
      <div className="flex-1 h-px bg-[#1a1a1a]/10" />
    </motion.div>
  );
}
