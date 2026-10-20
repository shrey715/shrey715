"use client";
import { motion, type Variants } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import Section, { Container } from "@/components/ui/Section";
import type { Project, SkillCategory } from "@/types";
import SkillGraph from "./SkillGraph";
import { plotIn } from '@/lib/motion';

interface SkillsSectionProps {
  categories: SkillCategory[];
  /** For the stack × projects graph. */
  projects: Project[];
}

// Column spans (lg, 12-col) tuned to the data order so the bento tiles cleanly:
// [7+5] [6+6] [5+7] [5+7]
const SPANS = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-6",
  "lg:col-span-6",
  "lg:col-span-5",
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-7",
];

// Set to a category index to make that panel an accent-inverted focal block.
// -1 = no permanent accent (accent only shows on index numbers + chip hover).
const ACCENT_INDEX = -1;

const chipList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.15 } },
};
const chip: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 420, damping: 26 } },
};

// Cursor position as CSS vars, consumed by the spotlight gradient below.
function trackSpotlight(e: React.MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export default function SkillsSection({ categories, projects }: SkillsSectionProps) {
  const total = categories.reduce((n, c) => n + c.skills.length, 0);

  return (
    <Section id="skills" dark sheet="SKILLS" specimen="network">
      <Container>
        <SectionHeader dark index="03" kicker="THE STACK" title="ARSENAL" className="mb-6" />

        <p className="font-mono-label text-[11px] text-paper/50 mb-10 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>FROM KERNELS TO MODELS — THE WHOLE STACK</span>
          <span className="text-accent tabular-nums">
            {String(categories.length).padStart(2, "0")} DOMAINS / {total}+ TOOLS
          </span>
        </p>

        {/* Graph of what the stack is actually used for (desktop) */}
        <div className="hidden lg:block mb-12">
          <SkillGraph projects={projects} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
          {categories.map((category, i) => (
            <SkillPanel
              key={category.title}
              category={category}
              index={i}
              span={SPANS[i] ?? "lg:col-span-6"}
              accent={i === ACCENT_INDEX}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function SkillPanel({
  category,
  index,
  span,
  accent,
}: {
  category: SkillCategory;
  index: number;
  span: string;
  accent: boolean;
}) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      {...plotIn(index * 0.06)}
      onMouseMove={trackSpotlight}
      className={`group relative overflow-hidden p-5 sm:p-6 flex flex-col ${span} ${
        accent
          ? "bg-accent text-paper border-2 border-accent"
          : "bg-ink text-paper border-2 border-paper/35 transition-colors"
      }`}
    >
      {/* Cursor spotlight: warm glow + lit border that follow the pointer */}
      {!accent && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), rgba(255,61,0,0.16), transparent 65%)",
            }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              padding: 2,
              background:
                "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), #ff3d00, transparent 70%)",
              mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
            }}
          />
        </>
      )}

      {/* Oversized faded watermark index, fully contained in the top-right */}
      <span
        className="font-display absolute top-2 right-3 leading-none select-none pointer-events-none"
        style={{
          fontSize: "clamp(3.5rem, 7vw, 6rem)",
          color: accent ? "rgba(255,255,255,0.18)" : "rgba(237,232,220,0.07)",
        }}
        aria-hidden="true"
      >
        {num}
      </span>

      <div className="weighted relative z-10 flex flex-col h-full">
        {/* Three header layouts in rotation, so eight panels don't read as one stamp repeated */}
        {index % 3 === 0 && (
          <div className="flex items-baseline gap-3 mb-5">
            <span className={`font-mono-label text-[11px] tabular-nums ${accent ? "text-paper/80" : "text-accent"}`}>{num}</span>
            <h3 className="font-display text-2xl sm:text-3xl leading-none">{category.title}</h3>
            <span className={`font-mono-label text-[10px] tabular-nums ml-auto ${accent ? "text-paper/70" : "text-paper/40"}`}>
              [{String(category.skills.length).padStart(2, "0")}]
            </span>
          </div>
        )}
        {index % 3 === 1 && (
          <div className="mb-5">
            <div className="flex items-center gap-3 font-mono-label text-[10px] text-paper/40 tabular-nums">
              <span className="text-accent">{num}</span>
              <span className="flex-1 h-px bg-paper/15" />
              <span>{String(category.skills.length).padStart(2, "0")} TOOLS</span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl leading-none mt-3">{category.title}</h3>
          </div>
        )}
        {index % 3 === 2 && (
          <div className="flex items-end justify-between gap-3 mb-5">
            <h3 className="font-display text-2xl sm:text-3xl leading-none">
              <span className="text-accent mr-2">/</span>
              {category.title}
            </h3>
            <span className="font-annot text-lg text-paper/50 leading-none">×{category.skills.length}</span>
          </div>
        )}

        <motion.div
          variants={chipList}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="flex flex-wrap gap-2"
        >
          {category.skills.map((skill) => (
            <motion.span
              key={skill}
              variants={chip}
              className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                accent
                  ? "border border-paper/50 text-paper hover:bg-paper hover:text-accent"
                  : "border border-paper/25 text-paper/85 hover:bg-accent hover:border-accent hover:text-paper"
              }`}
            >
              {skill}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
