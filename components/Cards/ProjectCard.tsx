"use client";
import { motion } from "framer-motion";
import Image from "next/image";

interface CardProps {
    name: string;
    url: string;
    deployment?: string;
    description: string;
    languages: string[];
}

const ProjectCard = ({ name, url, deployment, description, languages }: CardProps) => {
    return (
        <motion.div
            className="flex flex-col justify-center items-center bg-zinc-900 p-6 gap-3 rounded-xl shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl lg:w-[450px] md:w-[400px] w-[300px]" 
            whileHover={{ scale: 1.05 }}
        >
            <Image
                src={`https://opengraph.githubassets.com/1/${url.split('github.com/')[1]}`}
                alt={name}
                height={200}
                width={400}
                layout="responsive"
                className="rounded-lg"   
                onClick={() => window.open(url, '_blank')}             
            />
            <h1 className="flex flex-row justify-start w-full">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-xl md:text-2xl font-bold text-gray-200 hover:text-gray-300">
                    {name}
                </a>
            </h1>
            <p className="text-gray-300 text-base md:text-lg">{description}</p>
            <div className="flex flex-row flex-wrap justify-start w-full gap-2">
                {languages.map((language, index) => (
                    <div key={index} className="text-xs font-bold text-gray-200 bg-gray-800 p-1 rounded-md">{language}</div>
                ))}
            </div>
        </motion.div>
    );
};

export default ProjectCard;