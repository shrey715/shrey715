import React from 'react'

interface AboutProps {
    id : string
}

const About = ({ id } : AboutProps) => {    
  return (
    <section id={id} className="h-screen bg-transparent snap-start">
        <div className="flex justify-center items-center h-full">
            <div className="text-3xl font-bold text-gray-200">About</div>
        </div>
    </section>
  )
}

export default About;