import React from 'react'

interface ProjectsProps {
    id : string
}

const Projects = ({ id } : ProjectsProps) => {
  return (
    <section id={id} className="h-screen bg-transparent snap-start">
        <div className="flex justify-center items-center h-full">
            <div className="text-3xl font-bold text-gray-200">Projects</div>
            <p>
              Updating soon...
            </p>
        </div>
    </section>
  )
}

export default Projects