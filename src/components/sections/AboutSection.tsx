"use client";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaGamepad } from "react-icons/fa";
import { HiOutlineNewspaper, HiOutlineDocumentText } from "react-icons/hi";
import { SiLinux } from "react-icons/si";
import { MdOutlineSportsBasketball } from "react-icons/md";
import { PiTelevisionSimpleBold } from "react-icons/pi";
import SectionHeader from "@/components/ui/SectionHeader";
import Section, { Container } from "@/components/ui/Section";
import Portrait from "@/components/ui/Portrait";
import ScrollFillText from "@/components/ui/ScrollFillText";
import type { SocialLink, HobbyItem } from "@/types";

const socialLinks: SocialLink[] = [
  { icon: FaGithub, href: "https://github.com/shrey715", label: "GitHub", external: true },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/shreyasdeb/", label: "LinkedIn", external: true },
  { icon: HiOutlineNewspaper, href: "/blog", label: "Blog", external: false },
  {
    icon: HiOutlineDocumentText,
    href: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/shreyas_deb_resume.pdf`,
    label: "Resume",
    external: true,
  },
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
        <SectionHeader dark index="01" kicker="WHOAMI" title="ABOUT" className="mb-14" />

        <div className="grid lg:grid-cols-12 gap-14 lg:gap-16">
          {/* Left: tall portrait + socials */}
          <div className="lg:col-span-5 xl:col-span-4">
            {/* The observed wrapper stays unclipped — IntersectionObserver
                ignores fully clipped targets, so the wipe lives on the child. */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="max-w-[420px] lg:max-w-none mx-auto lg:mx-0 mb-12 px-3"
            >
              <motion.div
                variants={{
                  hidden: { y: 40, clipPath: "inset(100% 0% 0% 0%)" },
                  show: { y: 0, clipPath: "inset(-10% -10% -10% -10%)" },
                }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <Portrait aspect="aspect-[3/4] lg:aspect-[2/3]" />
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-2 gap-0 hard-border border-paper/40">
              {socialLinks.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className={`group relative overflow-hidden flex items-center gap-3 p-4 active:scale-[0.97] transition-transform
                    ${i % 2 === 0 ? "border-r-2" : ""} ${i < 2 ? "border-b-2" : ""} border-paper/30`}
                >
                  {/* Accent wipe from the left on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                  <link.icon size={20} className="relative" />
                  <span className="relative font-mono-label text-[11px]">{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Right: statement + numbered blocks, indented beside the portrait */}
          <div className="lg:col-span-7 xl:col-span-8 lg:pt-2">
            <ScrollFillText
              text="Always open to learning new stuff. If it's complex, I'm interested."
              accentWords={["complex,", "interested."]}
              className="text-[clamp(2rem,4.2vw,4rem)] font-medium tracking-tight leading-[1.05] max-w-[17ch] mb-14 sm:mb-16 text-balance"
            />

            {blocks.map((block, i) => (
              <motion.div
                key={block.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="py-7 border-t-2 border-paper/15 last:border-b-2"
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-display text-4xl text-accent">{block.num}</span>
                  <span className="font-mono-label text-xs text-paper/60">{block.title}</span>
                </div>
                <p className="text-lg text-paper/75 leading-relaxed max-w-[62ch] text-pretty">{block.content}</p>
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
