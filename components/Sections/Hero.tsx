"use client";
import React from 'react';
import Profile from '../Cards/Profile';
import { Typewriter } from 'react-simple-typewriter';
import { FaGithub, FaLinkedin, FaAngleDoubleDown } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeroProps {
  id: string;
}

const words = ['Full Stack Developer.', 'ML Enthusiast.', 'Competitive Programmer.', 'Undergraduate Researcher.'];

const links = [
  {
    icon: <FaGithub />,
    link: 'https://github.com/shrey715',
    title: 'Github',
    color: 'text-primary'
  },
  {
    icon: <FaLinkedin />,
    link: 'https://www.linkedin.com/in/shreyas-deb-b6a144283/',
    title: 'LinkedIn',
    color: 'text-linkedin'
  },
]

const Hero = ({ id }: HeroProps) => {
  return (
    <section id={id} className="relative flex flex-col-reverse md:flex-row h-screen bg-white snap-start overflow-hidden">
      <div className="flex flex-col justify-center items-start h-3/5 md:h-full px-8 md:w-1/2 gap-4 md:gap-6 lg:gap-8 overflow-y-auto overflow-x-hidden">
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-800 leading-tight">
          Hello there!
        </h1>
        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
          I&apos;m a{' '}
          <span className="text-orange-600">
            <Typewriter
              words={words}
              loop={0}
              cursor
              cursorStyle='_'
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </span>
        </h2>
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight">
          I love to learn about new stuff and try to build (random) things as a hobby. Check out some of my work below!
        </h1>
      </div>
      <div className="flex flex-col justify-center items-center h-full md:w-1/2 bg-gray-200 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
        <Profile />
        <div className="flex mt-2 md:mt-8 space-x-4 gap-4 md:gap-5">
          {links.map((link, index) => (
            <motion.span
              key={index}
              className={`text-3xl md:text-4xl ${link.color}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={link.link} passHref>
                  {link.icon}
              </Link>
            </motion.span>
          ))}
        </div>
        <Link href="/shreyas_deb_resume.pdf" passHref>
          <motion.button
            className="mt-3 md:mt-8 px-6 py-2 md:px-8 md:py-2 text-lg md:text-xl font-bold text-white bg-primary rounded-2xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            View My Resume
          </motion.button>
        </Link>
      </div>
      <motion.div
        className="hidden md:absolute transform -translate-x-1/2 w-full bottom-8 text-center items-center justify-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <Link href="#About" passHref>
          <motion.button
            className="px-4 py-2 md:px-6 md:py-3 bg-primary text-white rounded-full hover:bg-gray-800 transition duration-300"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <FaAngleDoubleDown className="text-xl md:text-2xl" />
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
};

export default Hero;