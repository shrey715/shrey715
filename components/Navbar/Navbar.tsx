"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { FaHome, FaBars, FaTimes } from 'react-icons/fa';
import { SiAboutdotme } from "react-icons/si";
import { GrProjects, GrContactInfo } from 'react-icons/gr';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { useMediaQuery } from 'react-responsive';

const poppins = Poppins({
    subsets: ['latin'],
    style: ['normal'],
    weight: ['600','700'],
});

const NavItems = [
    {
        title: 'Home',
        icon: <FaHome />,
        link: '#Hero'
    },
    {
        title: 'About',
        icon: <SiAboutdotme />,
        link: '#About'
    },
    {
        title: 'Projects',
        icon: <GrProjects />,
        link: '#Projects'        
    },
    {
        title: 'Contact',
        icon: <GrContactInfo />,
        link: '#Contact'
    }
]

const BurgerMenu = ({ isOpen, setIsOpen } : { isOpen: boolean, setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    return (
        <motion.div 
            className="fixed top-0 left-0 w-full h-full bg-primary flex flex-col items-center justify-center space-y-4 py-4 gap-5 md:hidden z-50"
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? '0%' : '-100%' }}
            transition={{ duration: 0.3 }}
        >
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-100 focus:outline-none">
                <FaTimes size={30} />
            </button>
            {NavItems.map((item, index) => (
                <motion.a 
                    key={index} 
                    href={item.link} 
                    onClick={ () => setIsOpen(false) }
                    className="flex items-center text-3xl gap-5 text-gray-100 no-underline hover:text-cyan-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                </motion.a>
            ))}
        </motion.div>
    )
}

const MobileNav = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    return (
        isOpen ? 
        <BurgerMenu isOpen={isOpen} setIsOpen={setIsOpen} /> :
        <motion.nav 
            className="fixed top-0 left-0 w-full flex justify-between items-center h-16 bg-transparent text-gray-200 font-mono px-4 md:px-8 z-50 mix-blend-exclusion" 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
        >
            <div className={cn('font-bold text-3xl', poppins.className, 'no-underline p-0.5')}>
                <Link href="/" className="md:hidden no-underline">sd.</Link>
            </div>
            <div className="md:hidden flex items-center p-1">
                <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
                    <FaBars size={30} />
                </button>
            </div>
        </motion.nav>
    )
}
const Nav = () => {
    return (
        <motion.nav 
            className="fixed top-0 left-0 w-full flex justify-between items-center h-16 bg-transparent text-white font-mono px-4 md:px-8 z-50 md:mix-blend-exclusion" 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
        >
            <div className={cn('font-bold text-3xl', poppins.className, 'text-gray-100 no-underline')}>
                <Link href="/" className="hidden md:block text-gray-100 no-underline">Shreyas Deb.</Link>
            </div>
            <div className="hidden md:flex space-x-4 gap-2">
                {NavItems.map((item, index) => (
                    <motion.div 
                        key={index} 
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <a href={item.link} className="flex items-center text-lg text-gray-100 no-underline hover:text-cyan-300">
                            {item.icon}
                            <span className="ml-2">{item.title}</span>
                        </a>
                    </motion.div>
                ))}
            </div>
        </motion.nav>
    )
}

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 767 });

    return isMobile ? <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} /> : <Nav />;
}

export default Navbar;