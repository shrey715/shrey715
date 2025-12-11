'use client';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaGamepad } from 'react-icons/fa';
import { HiOutlineNewspaper, HiOutlineDocumentText } from 'react-icons/hi';
import { SiLinux } from 'react-icons/si';
import { MdOutlineSportsBasketball } from 'react-icons/md';
import { PiTelevisionSimpleBold } from 'react-icons/pi';

const socialLinks = [
  { icon: FaGithub, href: "https://github.com/shrey715", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/shreyasdeb/", label: "LinkedIn" },
  { icon: HiOutlineDocumentText, href: "/assets/shreyas_deb_resume.pdf", label: "Resume" },
  { icon: HiOutlineNewspaper, href: "/blog", label: "Blog" },
];

export default function AboutSection() {
  return (
    <section 
      id="about" 
      className="py-32 px-6 bg-[#1a1a1a] text-[#f1efe7] grain-overlay relative"
    >
      {/* Floating glow orbs */}
      <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-10%] w-[350px] h-[350px] rounded-full bg-blue-500/8 blur-[80px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* Left Column: Heading & Socials */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              About<br />
              <span className="text-[#808080]">Me.</span>
            </motion.h2>
            <motion.div 
              initial={{ scaleX: 0 }} 
              whileInView={{ scaleX: 1 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-16 h-1 bg-[#f1efe7] origin-left mb-8"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-[#a0a0a0] group-hover:text-[#1a1a1a] group-hover:bg-[#f1efe7] group-hover:border-transparent transition-all">
                  <link.icon size={18} />
                </div>
                <span className="text-sm uppercase tracking-widest text-[#808080] group-hover:text-[#f1efe7] transition-colors">
                  {link.label}
                </span>
              </a>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 space-y-8 text-lg text-[#b0b0b0] leading-relaxed font-light"
        >
          <div>
            <h3 className="text-[#f1efe7] text-xl font-medium mb-3 flex items-center gap-3">
              <span className="w-1 h-6 bg-purple-500/50 rounded-full"></span>
              The Academic
            </h3>
            <p>
              I'm a third-year Junior Undergraduate at <span className="text-[#f1efe7]">IIIT Hyderabad</span>, 
              where my world revolves around the beautiful chaos of Computer Science. Currently, I work as an 
              <span className="text-[#f1efe7]"> Undergraduate Researcher</span> under 
              <span className="text-[#f1efe7]"> Professor Vinod P K</span>, exploring the fascinating intersection of 
              <span className="text-purple-300/80"> Systems Biology</span> and <span className="text-purple-300/80">Deep Learning</span>.
            </p>
          </div>
          
          <div>
            <h3 className="text-[#f1efe7] text-xl font-medium mb-3 flex items-center gap-3">
              <span className="w-1 h-6 bg-blue-500/50 rounded-full"></span>
              The Engineer
            </h3>
            <p>
              Beyond the theory, I am a builder at heart. <span className="text-[#f1efe7]">Physics and Mathematics</span> are my playground, 
              and I find joy in understanding complex machinery from first principles. My interests span the entire computing spectrum: 
              from the low-level logic of <span className="text-[#f1efe7]">Kernels and Operating Systems</span> to the high-dimensional 
              latent spaces of <span className="text-[#f1efe7]">Deep Learning and AI</span>.
            </p>
          </div>

          <div>
            <h3 className="text-[#f1efe7] text-xl font-medium mb-3 flex items-center gap-3">
              <span className="w-1 h-6 bg-emerald-500/50 rounded-full"></span>
              The Human
            </h3>
            <p className="mb-4">
              When I'm not debugging a segfault or training a model, you'll find me:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <FaGamepad className="text-emerald-400" size={20} />
                <span className="text-sm">Gaming</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <PiTelevisionSimpleBold className="text-pink-400" size={20} />
                <span className="text-sm">Anime</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <MdOutlineSportsBasketball className="text-orange-400" size={20} />
                <span className="text-sm">Basketball</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <SiLinux className="text-yellow-400" size={20} />
                <span className="text-sm">Distro-hopping</span>
              </div>
            </div>
          </div>
          
          <p className="text-[#808080] text-sm pt-4 border-t border-white/10 italic">
            "Always open to learning new stuff. If it's complex, I'm interested."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
