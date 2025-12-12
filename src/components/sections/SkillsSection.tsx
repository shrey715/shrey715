'use client';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  SiTypescript, SiPython, SiRust, SiCplusplus, SiC, SiR,
  SiReact, SiNextdotjs, SiTailwindcss, SiNodedotjs,
  SiGit, SiDocker, SiLinux, SiFigma,
  SiPytorch, SiTensorflow, SiPostgresql, SiMongodb,
  SiGo, SiJavascript, SiHtml5, SiCss3,
  SiAmazon, SiKubernetes, SiRedis,
  SiHuggingface, SiLangchain
} from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';
import { useRef } from 'react';
import { IconType } from 'react-icons';
import FadeIn from '@/components/ui/FadeIn';
import type { Skill, SkillCategory } from '@/types';

// Icon mapping for JSON data
const iconMap: Record<string, IconType> = {
  SiTypescript, SiPython, SiRust, SiCplusplus, SiC, SiR,
  SiReact, SiNextdotjs, SiTailwindcss, SiNodedotjs,
  SiGit, SiDocker, SiLinux, SiFigma,
  SiPytorch, SiTensorflow, SiPostgresql, SiMongodb,
  SiGo, SiJavascript, SiHtml5, SiCss3,
  SiAmazon, SiMicrosoftazure: VscAzure, SiKubernetes, SiRedis,
  SiHuggingface, SiLangchain
};

const advancedConcepts = [
  "Transformers", "CNNs", "RNN/LSTM", "Diffusion Models", "Decision Trees", 
  "Distributed Systems", "Networking", "System Design", "Graph Theory", 
  "Systems Biology", "Physics", "Linear Algebra"
];

interface SkillsSectionProps {
  categories: SkillCategory[];
}

export default function SkillsSection({ categories }: SkillsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const y = useTransform(smoothProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section 
      ref={sectionRef}
      id="skills" 
      className="py-28 px-4 bg-[#1a1a1a] text-[#f1efe7] grain-overlay relative"
    >
      {/* Floating glow orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-blue-600/8 blur-[80px] pointer-events-none" />

      <motion.div 
        style={{ y, opacity }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <FadeIn duration={0.8} className="text-center mb-20">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-b from-[#f1efe7] to-[#808080] bg-clip-text text-transparent"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Technical Arsenal
          </h2>
          <p className="text-[#808080] text-lg max-w-lg mx-auto font-light">
            Tools I use to bridge the gap between abstract algorithms and robust systems
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, catIndex) => (
            <SkillCategoryCard 
              key={category.title} 
              category={category} 
              catIndex={catIndex}
              iconMap={iconMap}
            />
          ))}
        </div>
        
        {/* Advanced Concepts */}
        <FadeIn delay={0.6} className="mt-16 text-center">
          <p className="text-[#808080] text-xs uppercase tracking-widest mb-6">Advanced Concepts</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {advancedConcepts.map((topic) => (
              <span 
                key={topic}
                className="px-4 py-1.5 rounded-full border border-white/10 text-sm text-[#a0a0a0] bg-white/5 hover:border-white/20 hover:text-[#f1efe7] transition-colors cursor-default"
              >
                {topic}
              </span>
            ))}
          </div>
        </FadeIn>
      </motion.div>
    </section>
  );
}

// Extracted sub-component for skill categories
interface SkillCategoryCardProps {
  category: SkillCategory;
  catIndex: number;
  iconMap: Record<string, IconType>;
}

function SkillCategoryCard({ category, catIndex, iconMap }: SkillCategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: catIndex * 0.15 }}
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl border border-white/10 group h-full flex flex-col"
    >
      <h3 className="text-xs font-semibold text-[#808080] uppercase tracking-widest mb-6 text-center border-b border-white/10 pb-4">
        {category.title}
      </h3>
      <div className="flex flex-wrap gap-3 justify-center">
        {category.skills.map((skill, skillIndex) => (
          <SkillItem 
            key={skill.name} 
            skill={skill} 
            catIndex={catIndex}
            skillIndex={skillIndex}
            iconMap={iconMap}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Extracted sub-component for individual skills
interface SkillItemProps {
  skill: Skill;
  catIndex: number;
  skillIndex: number;
  iconMap: Record<string, IconType>;
}

function SkillItem({ skill, catIndex, skillIndex, iconMap }: SkillItemProps) {
  const IconComponent = iconMap[skill.icon];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: catIndex * 0.1 + skillIndex * 0.05 }}
      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 transition-all cursor-default w-full"
    >
      <div className="p-1.5 rounded-md bg-[#1a1a1a]/50">
        {IconComponent && <IconComponent size={16} style={{ color: skill.color }} />}
      </div>
      <span className="text-sm font-medium text-[#c0c0c0]">{skill.name}</span>
    </motion.div>
  );
}
