import { promises as fs } from 'fs';
import path from 'path';
import Hero from '@/components/sections/Hero';
import AboutSection from '@/components/sections/AboutSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ProjectsCarousel from '@/components/sections/ProjectsCarousel';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/ui/Navbar';
import ParallaxBackground from '@/components/effects/ParallaxBackground';
import WaveDivider from '@/components/effects/WaveDivider';

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
  image?: string;
  featured?: boolean;
  year?: string;
  status?: string;
}

interface Skill {
  name: string;
  icon: string;
  color: string;
}

interface SkillCategory {
  title: string;
  skills: Skill[];
}

interface SkillsData {
  categories: SkillCategory[];
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

export default async function Home() {
  const projects = await getProjects();
  const skillCategories = await getSkills();

  return (
    <main className="relative overflow-x-hidden">
      {/* Parallax Glass Background */}
      <div className="absolute inset-0 h-screen">
        <ParallaxBackground />
      </div>

      <Navbar />

      {/* Hero - sticky so content scrolls over */}
      <div className="sticky top-0 z-0">
        <Hero />
      </div>
      
      {/* Wave OVERLAYS the hero image */}
      <div className="relative z-20 -mt-24">
        <WaveDivider fromColor="transparent" toColor="#1a1a1a" />
      </div>
      
      {/* Content */}
      <div className="relative z-20 bg-[#1a1a1a]">
        <AboutSection />
        <SkillsSection categories={skillCategories} />
        <WaveDivider fromColor="#1a1a1a" toColor="#f1efe7" />
        <section id="projects" className="bg-[#f1efe7]">
          <ProjectsCarousel projects={projects} />
        </section>
        <WaveDivider fromColor="#f1efe7" toColor="#1a1a1a" />
        <Footer />
      </div>
    </main>
  );
}
