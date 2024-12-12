import React from 'react';
import projects from '@/data/projects.json';
import ProjectCard from '../Cards/ProjectCard';

const Projects = ({ id }: { id: string }) => {
  return (
    <section id={id} className="pt-9 bg-transparent snap-start">
      <div className="flex flex-col justify-start items-center h-full">
        <div className="text-3xl font-bold text-gray-200 mb-8">Projects</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              name={project.name}
              url={project.url}
              deployment={project.deployment}
              description={project.description}
              languages={project.languages}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;