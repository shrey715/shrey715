"use client";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaGamepad } from "react-icons/fa";
import { HiOutlineNewspaper } from "react-icons/hi";
import { SiLinux, SiCodeforces } from "react-icons/si";
import { MdOutlineSportsBasketball } from "react-icons/md";
import { PiTelevisionSimpleBold } from "react-icons/pi";
import SectionHeader from "@/components/ui/SectionHeader";
import Section, { Container } from "@/components/ui/Section";
import type { SocialLink, HobbyItem } from "@/types";

const socialLinks: SocialLink[] = [
  { icon: FaGithub, href: "https://github.com/shrey715", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/shreyasdeb/", label: "LinkedIn" },
  { icon: SiCodeforces, href: "https://codeforces.com/profile/shrey715", label: "Codeforces" },
  { icon: HiOutlineNewspaper, href: "/blog", label: "Blog" },
];

const hobbies: HobbyItem[] = [
  { icon: FaGamepad, label: "Gaming", color: "" },
  { icon: PiTelevisionSimpleBold, label: "Anime", color: "" },
  { icon: MdOutlineSportsBasketball, label: "Basketball", color: "" },
  { icon: SiLinux, label: "Distro-hopping", color: "" },
];

interface AboutBlock {
  num: string;
  title: string;
  content: React.ReactNode;
}

const blocks: AboutBlock[] = [
  {
    num: "01",
    title: "The Academic",
    content: (
      <>
        An <Mark>MS Dual Degree</Mark> student in{" "}
        <Ink>Computational Natural Sciences</Ink> at IIIT Hyderabad, where my world
        revolves around the beautiful chaos of computing. I work as an{" "}
        <Mark>Undergraduate Researcher</Mark> under Professor Vinod P K, exploring
        the intersection of <Ink>systems biology</Ink> and <Ink>deep learning</Ink>.
      </>
    ),
  },
  {
    num: "02",
    title: "The Engineer",
    content: (
      <>
        A builder at heart. <Mark>Physics &amp; mathematics</Mark> are my playground.
        My interests span the whole computing spectrum — from the low-level logic of{" "}
        <Ink>kernels &amp; operating systems</Ink> to the high-dimensional latent
        spaces of <Ink>deep learning</Ink>.
      </>
    ),
  },
  {
    num: "03",
    title: "The Human",
    content: (
      <>
        When I&apos;m not debugging a segfault or training a model, you&apos;ll find me
        gaming, watching anime, on the basketball court, or — inevitably —
        hopping to yet another Linux distro.
      </>
    ),
  },
];

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="bg-accent text-paper px-1">{children}</span>;
}
function Ink({ children }: { children: React.ReactNode }) {
  return <span className="text-paper font-semibold underline decoration-accent decoration-2 underline-offset-4">{children}</span>;
}

export default function AboutSection() {
  return (
    <Section id="about" dark>
      <Container>
        <SectionHeader dark index="01" kicker="WHOAMI" title="ABOUT" className="mb-16" />

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left: intro + socials */}
          <div className="lg:col-span-4">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-xl font-medium leading-snug mb-8"
            >
              Always open to learning new stuff. If it&apos;s complex, I&apos;m interested.
            </motion.p>

            <div className="grid grid-cols-2 gap-0 hard-border">
              {socialLinks.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 p-4 transition-colors hover:bg-accent hover:text-paper
                    ${i % 2 === 0 ? "border-r-2" : ""} ${i < 2 ? "border-b-2" : ""} border-paper/30`}
                >
                  <link.icon size={20} />
                  <span className="font-mono-label text-[11px]">{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Right: numbered blocks */}
          <div className="lg:col-span-8">
            {blocks.map((block, i) => (
              <motion.div
                key={block.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="grid sm:grid-cols-12 gap-2 sm:gap-6 py-8 border-t-2 border-paper/15 last:border-b-2"
              >
                <div className="sm:col-span-4">
                  <span className="font-display text-4xl text-accent mr-3">{block.num}</span>
                  <span className="font-mono-label text-xs text-paper/60 align-middle">
                    {block.title}
                  </span>
                </div>
                <p className="sm:col-span-8 text-lg text-paper/75 leading-relaxed">
                  {block.content}
                </p>
              </motion.div>
            ))}

            {/* Draggable hobby chips */}
            <div className="mt-10 flex flex-wrap gap-3">
              <span className="font-mono-label text-[11px] text-paper/40 w-full mb-1">
                OFF THE CLOCK — DRAG ME ↓
              </span>
              {hobbies.map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  drag
                  dragConstraints={{ left: -40, right: 40, top: -40, bottom: 40 }}
                  dragElastic={0.4}
                  whileHover={{ y: -3 }}
                  whileDrag={{ scale: 1.1, rotate: i % 2 ? 4 : -4 }}
                  data-cursor="DRAG"
                  className="flex items-center gap-2 px-4 py-2.5 bg-paper text-ink hard-border cursor-grab active:cursor-grabbing select-none"
                >
                  <Icon size={18} />
                  <span className="font-mono-label text-[11px]">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
