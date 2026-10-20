import { promises as fs } from 'fs';
import path from 'path';
import Hero from '@/components/sections/Hero';
import AboutSection from '@/components/sections/AboutSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ProjectsTeaser from '@/components/sections/ProjectsTeaser';
import Footer from '@/components/sections/Footer';
import SheetBreak from '@/components/plot/SheetBreak';
import VelocityMarquee from '@/components/ui/VelocityMarquee';
import { getProjectsWithActivity } from '@/lib/projects';

import type { SkillCategory, Experience, Achievement } from '@/types';

interface SkillsData {
  categories: SkillCategory[];
}

interface ExperienceData {
  workExperience: Experience[];
  leadership: Experience[];
  achievements: Achievement[];
}

async function getSkills(): Promise<SkillCategory[]> {
  const filePath = path.join(process.cwd(), 'src/data/skills.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  const data: SkillsData = JSON.parse(jsonData);
  return data.categories;
}

async function getExperience(): Promise<ExperienceData> {
  const filePath = path.join(process.cwd(), 'src/data/experience.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(jsonData);
}

export default async function Home() {
  const projects = await getProjectsWithActivity();
  const skillCategories = await getSkills();
  const experienceData = await getExperience();

  return (
    <main id="main" className="relative overflow-x-clip bg-paper">
      <Hero />

      <VelocityMarquee
        top={['RESEARCHER', 'DEVELOPER', 'SYSTEMS NERD', 'ML ENGINEER', 'DISTRO HOPPER']}
        bottom={['ATTACK ON TITAN', 'RE:ZERO', 'MINECRAFT', 'BASKETBALL']}
      />
      <AboutSection
        stats={{
          projects: projects.length,
          tools: skillCategories.reduce((n, c) => n + c.skills.length, 0),
          domains: skillCategories.length,
        }}
      />

      <SheetBreak from="ink" to="paper" sheet="02" title="EXPERIENCE" />
      <ExperienceSection
        workExperience={experienceData.workExperience}
        leadership={experienceData.leadership}
        achievements={experienceData.achievements}
      />

      <SheetBreak from="paper" to="ink" sheet="03" title="SKILLS" />
      <SkillsSection categories={skillCategories} projects={projects} />

      <SheetBreak from="ink" to="paper" sheet="04" title="PROJECTS" />
      <ProjectsTeaser projects={projects} />

      <SheetBreak from="paper" to="ink" sheet="05" title="CONTACT" />
      <Footer index="05" />
    </main>
  );
}
