import { promises as fs } from 'fs';
import path from 'path';
import Hero from '@/components/sections/Hero';
import AboutSection from '@/components/sections/AboutSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ProjectsTeaser from '@/components/sections/ProjectsTeaser';
import Footer from '@/components/sections/Footer';
import SectionDivider from '@/components/ui/SectionDivider';
import VelocityMarquee from '@/components/ui/VelocityMarquee';
import { getProjects } from '@/lib/projects';

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
  const projects = await getProjects();
  const skillCategories = await getSkills();
  const experienceData = await getExperience();

  return (
    <main id="main" className="relative overflow-x-clip bg-paper">
      <Hero />

      <VelocityMarquee
        top={['RESEARCHER', 'DEVELOPER', 'SYSTEMS NERD', 'ML ENGINEER', 'DISTRO HOPPER']}
        bottom={['ATTACK ON TITAN', 'RE:ZERO', 'MINECRAFT', 'BASKETBALL']}
      />
      <AboutSection />

      <SectionDivider />
      <ExperienceSection
        workExperience={experienceData.workExperience}
        leadership={experienceData.leadership}
        achievements={experienceData.achievements}
      />

      <SectionDivider />
      <SkillsSection categories={skillCategories} />

      <SectionDivider />
      <ProjectsTeaser projects={projects} />

      <SectionDivider />
      <Footer />
    </main>
  );
}
