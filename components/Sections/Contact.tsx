"use client"
import React from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Bebas_Neue } from 'next/font/google';
import { motion } from 'framer-motion';

const ab = Bebas_Neue({
    subsets: ['latin'],
    style: 'normal',
    weight: '400'
});

interface ContactProps {
    id : string
}

const links = [
  {
    icon: <FaGithub />,
    link: 'https://github.com/shrey715',
    title: 'Github',
    color: 'text-github'
  },
  {
    icon: <FaLinkedin />,
    link: 'https://www.linkedin.com/in/shreyas-deb-b6a144283/',
    title: 'LinkedIn',
    color: 'text-linkedin'
  },
]

const Contact = ({ id }: ContactProps) => {
  return (
    <section id={id} className="h-screen bg-primary flex flex-col justify-center items-center text-center p-4 md:p-10 snap-start">
      <div className="bg-gradient-to-tl from-gray-200 to-gray-100 rounded-3xl p-10 md:p-20">
        <div className={cn(ab.className,"text-4xl md:text-7xl font-bold text-gray-800 mb-5 md:mb-10")}>Check out my socials!</div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-5 md:gap-10 mb-5 md:mb-10">
          {links.map((link, index) => (
            <Link key={index} href={link.link}>
              <motion.div 
                className={cn('flex items-center text-xl md:text-2xl p-2 md:p-4 m-2 md:m-4 rounded-full gap-2 md:gap-3', link.color, 'bg-primary')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {link.icon} <span>{link.title}</span>
              </motion.div>
            </Link>
          ))}
        </div>
        <div className="text-gray-800 text-base md:text-2xl font-bold mb-2 md:mb-5">Or contact me at <span className="text-blue-500">+91 9XXXX XXXXX</span></div>
        <div className="text-gray-800 text-base md:text-2xl font-bold">Send me an email at <span className="text-email"><a href="mailto:shreyasdeb@gmail.com">shreyasdeb@gmail.com</a></span></div>
      </div>
    </section>
  )
}

export default Contact;