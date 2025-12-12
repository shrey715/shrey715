'use client';
import { motion } from 'framer-motion';
import { Briefcase, Users, MapPin, Calendar } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  organization: string;
  location?: string;
  duration: string;
  type?: string;
  highlights: string[];
}

interface ExperienceSectionProps {
  workExperience: Experience[];
  leadership: Experience[];
}

export default function ExperienceSection({ workExperience, leadership }: ExperienceSectionProps) {
  return (
    <section 
      id="experience" 
      className="py-28 px-6 bg-[#f1efe7] dot-grid relative overflow-hidden"
    >
      {/* Subtle ambient glow */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-amber-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-rose-200/20 blur-[100px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 text-gradient-dark"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Experience
          </h2>
          <p className="text-[#6b6b6b] text-lg max-w-lg mx-auto">
            From research labs to fast-paced startups
          </p>
        </motion.div>

        {/* Work Experience */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#f1efe7]">
              <Briefcase size={18} />
            </div>
            <h3 className="text-xl font-semibold text-[#1a1a1a] uppercase tracking-widest">
              Work
            </h3>
            <div className="flex-1 h-px bg-[#1a1a1a]/10" />
          </motion.div>

          <div className="space-y-6">
            {workExperience.map((exp, index) => (
              <ExperienceCard key={exp.id} experience={exp} index={index} />
            ))}
          </div>
        </div>

        {/* Leadership */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#f1efe7]">
              <Users size={18} />
            </div>
            <h3 className="text-xl font-semibold text-[#1a1a1a] uppercase tracking-widest">
              Leadership
            </h3>
            <div className="flex-1 h-px bg-[#1a1a1a]/10" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leadership.map((exp, index) => (
              <LeadershipCard key={exp.id} experience={exp} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceCard({ experience, index }: { experience: Experience; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="p-6 rounded-2xl bg-white border border-[#e8e8e8] shadow-sm hover:shadow-lg hover:border-[#d0d0d0] transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div>
            <h4 className="text-lg font-bold text-[#1a1a1a] mb-1 group-hover:text-[#2a2a2a] transition-colors">
              {experience.title}
            </h4>
            <p className="text-[#4a4a4a] font-medium">{experience.organization}</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1 text-sm text-[#6b6b6b]">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {experience.duration}
            </span>
            {experience.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {experience.location}
              </span>
            )}
          </div>
        </div>
        
        <ul className="space-y-2">
          {experience.highlights.map((highlight, i) => (
            <li key={i} className="text-sm text-[#6b6b6b] leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#1a1a1a]/20">
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function LeadershipCard({ experience, index }: { experience: Experience; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="p-5 rounded-xl bg-white/80 border border-[#e8e8e8] hover:bg-white hover:shadow-md transition-all duration-300 h-full">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="text-base font-bold text-[#1a1a1a] mb-0.5">{experience.title}</h4>
            <p className="text-sm text-[#4a4a4a]">{experience.organization}</p>
          </div>
          <span className="text-xs text-[#808080] bg-[#f5f5f5] px-2.5 py-1 rounded-full whitespace-nowrap">
            {experience.duration}
          </span>
        </div>
        
        <ul className="space-y-1.5">
          {experience.highlights.slice(0, 2).map((highlight, i) => (
            <li key={i} className="text-xs text-[#6b6b6b] leading-relaxed">
              • {highlight}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
