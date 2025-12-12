'use client';
import { Briefcase, Users, MapPin, Calendar, Award } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import SubsectionHeader from '@/components/ui/SubsectionHeader';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { Experience, Achievement } from '@/types';

interface ExperienceSectionProps {
  workExperience: Experience[];
  leadership: Experience[];
  achievements: Achievement[];
}

export default function ExperienceSection({ workExperience, leadership, achievements }: ExperienceSectionProps) {
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
        <FadeIn duration={0.6} className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 text-gradient-dark"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Experience
          </h2>
          <p className="text-[#6b6b6b] text-lg max-w-lg mx-auto">
            From research labs to fast-paced startups
          </p>
        </FadeIn>

        {/* Work Experience */}
        <div className="mb-16">
          <SubsectionHeader icon={Briefcase} title="Work" />
          <div className="space-y-6">
            {workExperience.map((exp, index) => (
              <ExperienceCard key={exp.id} experience={exp} index={index} />
            ))}
          </div>
        </div>

        {/* Leadership */}
        <div className="mb-16">
          <SubsectionHeader icon={Users} title="Leadership" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leadership.map((exp, index) => (
              <FadeIn key={exp.id} delay={index * 0.1} className="h-full">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <div>
                      <h4 className="text-lg font-bold text-[#1a1a1a] mb-1">{exp.title}</h4>
                      <p className="text-[#4a4a4a] font-medium">{exp.organization}</p>
                    </div>
                    <Badge>{exp.duration}</Badge>
                  </CardHeader>
                  <CardContent>
                    <HighlightList highlights={exp.highlights} />
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <SubsectionHeader icon={Award} title="Achievements" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <FadeIn key={achievement.id} delay={index * 0.1} className="h-full">
                <Card className="h-full flex flex-col">
                  <CardHeader className="mb-3">
                    <h4 className="text-lg font-bold text-[#1a1a1a]">{achievement.title}</h4>
                    <Badge>{achievement.year}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#4a4a4a] font-medium mb-2">{achievement.organization}</p>
                    <p className="text-sm text-[#6b6b6b] leading-relaxed">{achievement.description}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Sub-components
function ExperienceCard({ experience, index }: { experience: Experience; index: number }) {
  return (
    <FadeIn delay={index * 0.1} className="group">
      <Card>
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
        <HighlightList highlights={experience.highlights} />
      </Card>
    </FadeIn>
  );
}

function HighlightList({ highlights }: { highlights: string[] }) {
  return (
    <ul className="space-y-2">
      {highlights.map((highlight, i) => (
        <li 
          key={i} 
          className="text-sm text-[#6b6b6b] leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#1a1a1a]/20"
        >
          {highlight}
        </li>
      ))}
    </ul>
  );
}
