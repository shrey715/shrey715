'use client';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Section, { Container } from '@/components/ui/Section';
import type { Experience, Achievement } from '@/types';

interface ExperienceSectionProps {
  workExperience: Experience[];
  leadership: Experience[];
  achievements: Achievement[];
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-2 mt-16 first:mt-0">
      <span className="font-mono-label text-xs text-ink/60">{children}</span>
      <span className="flex-1 h-0.5 bg-ink" />
    </div>
  );
}

function HighlightList({ highlights, invertOnHover = false }: { highlights: string[]; invertOnHover?: boolean }) {
  return (
    <ul className="space-y-1.5 mt-3">
      {highlights.map((h, i) => (
        <li
          key={i}
          className={`text-sm leading-relaxed pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-accent ${
            invertOnHover ? 'text-ink/70 group-hover:text-paper/80' : 'text-ink/70'
          }`}
        >
          {h}
        </li>
      ))}
    </ul>
  );
}

export default function ExperienceSection({ workExperience, leadership, achievements }: ExperienceSectionProps) {
  return (
    <Section id="experience">
      <Container>
        <SectionHeader index="02" kicker="TIMELINE" title="EXPERIENCE" className="mb-16" />

        {/* Work — sticky stacking deck: each row pins and the next slides over it */}
        <SubLabel>WORK</SubLabel>
        <div className="space-y-4 pb-4">
          {workExperience.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ top: `${96 + i * 16}px`, zIndex: i + 1 }}
              className="group sticky grid md:grid-cols-12 gap-2 md:gap-6 py-8 px-4 sm:px-6 bg-paper hard-border hard-shadow-sm hover:bg-ink hover:text-paper transition-colors duration-200"
            >
              <div className="md:col-span-1 font-display text-4xl text-accent leading-none tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="md:col-span-7">
                <h4 className="text-2xl sm:text-3xl font-bold leading-tight">{exp.title}</h4>
                <p className="font-mono-label text-[11px] text-ink/60 group-hover:text-paper/60 mt-1">
                  {exp.organization}
                </p>
                <HighlightList highlights={exp.highlights} invertOnHover />
              </div>
              <div className="md:col-span-4 md:text-right font-mono-label text-[11px] text-ink/60 group-hover:text-paper/60">
                <data className="block tabular-nums">{exp.duration}</data>
                {exp.location && <div className="mt-1">{exp.location}</div>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Leadership */}
        <SubLabel>LEADERSHIP</SubLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 hard-border">
          {leadership.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`p-6 ${i % 2 === 0 && i !== leadership.length - 1 ? 'md:border-r-2 border-ink' : ''} ${
                i < leadership.length - (leadership.length % 2 === 0 ? 2 : 1) ? 'border-b-2 border-ink' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <h4 className="text-xl font-bold">{exp.title}</h4>
                <data className="font-mono-label text-[10px] text-ink/50 whitespace-nowrap mt-1 tabular-nums">
                  {exp.duration}
                </data>
              </div>
              <p className="font-mono-label text-[11px] text-accent mb-2">{exp.organization}</p>
              <HighlightList highlights={exp.highlights} />
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <SubLabel>ACHIEVEMENTS</SubLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ x: -3, y: -3 }}
              className="p-6 hard-border bg-paper transition-shadow hover:shadow-[6px_6px_0_0_var(--color-accent)]"
            >
              <div className="flex items-center justify-between mb-3">
                <Award size={26} className="text-accent" strokeWidth={2} />
                <data className="font-mono-label text-[10px] text-ink/50 tabular-nums">{a.year}</data>
              </div>
              <h4 className="text-lg font-bold leading-tight mb-1">{a.title}</h4>
              <p className="font-mono-label text-[10px] text-ink/60 mb-2">{a.organization}</p>
              <p className="text-sm text-ink/70 leading-relaxed">{a.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
