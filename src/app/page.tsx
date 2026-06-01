import { promises as fs } from 'fs';
import path from 'path';
import Hero from '@/components/sections/Hero';
import AboutSection from '@/components/sections/AboutSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ProjectsCarousel from '@/components/sections/ProjectsCarousel';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/ui/Navbar';
import Marquee from '@/components/ui/Marquee';

import type { Project, SkillCategory, Experience, Achievement } from '@/types';

interface SkillsData {
  categories: SkillCategory[];
}

interface ExperienceData {
  workExperience: Experience[];
  leadership: Experience[];
  achievements: Achievement[];
}

async function getProjects(): Promise<Project[]> {
  const filePath = path.join(process.cwd(), 'src/data/projects.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(jsonData);
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

// Full-bleed accent strip used between sections
function AccentStrip({ items, reverse }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="bg-accent text-paper border-y-2 border-ink py-2.5 font-display text-xl sm:text-2xl">
      <Marquee items={items} reverse={reverse} durationSec={24} separator="/" />
    </div>
  );
}

export default async function Home() {
  const projects = await getProjects();
  const skillCategories = await getSkills();
  const experienceData = await getExperience();

  return (
    <main className="relative overflow-x-hidden bg-paper">
      <Navbar />

      <Hero />

      <AboutSection />

      <AccentStrip items={['SELECTED WORK', 'EXPERIENCE', 'RESEARCH', 'LEADERSHIP']} />

      <ExperienceSection
        workExperience={experienceData.workExperience}
        leadership={experienceData.leadership}
        achievements={experienceData.achievements}
      />

      <SkillsSection categories={skillCategories} />

      <AccentStrip items={['BUILT WITH', 'SHIPPED', 'CODE', 'CRAFT']} reverse />

      <ProjectsCarousel projects={projects} />

      <Footer />
    </main>
  );
}
