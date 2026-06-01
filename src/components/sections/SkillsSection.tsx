"use client";
import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import Section, { Container } from "@/components/ui/Section";
import type { SkillCategory } from "@/types";

interface SkillsSectionProps {
  categories: SkillCategory[];
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

export default function SkillsSection({ categories }: SkillsSectionProps) {
  const total = categories.reduce((n, c) => n + c.skills.length, 0);

  return (
    <Section id="skills" dark>
      <Container>
        <SectionHeader dark index="03" kicker="THE STACK" title="ARSENAL" className="mb-6" />

        <p className="font-mono-label text-[11px] text-paper/50 mb-10 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>FROM KERNELS TO MODELS — THE WHOLE STACK</span>
          <span className="text-accent">
            {String(categories.length).padStart(2, "0")} DOMAINS / {total}+ TOOLS
          </span>
        </p>

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className={`relative overflow-hidden p-5 sm:p-6 min-h-[190px] flex flex-col ${span} ${
        accent
          ? "bg-accent text-paper border-2 border-accent"
          : "bg-ink text-paper border-2 border-paper/35 hover:border-accent transition-colors"
      }`}
    >
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

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-baseline gap-3 mb-5">
          <span className={`font-mono-label text-[11px] ${accent ? "text-paper/80" : "text-accent"}`}>
            {num}
          </span>
          <h3 className="font-display text-2xl sm:text-3xl leading-none">{category.title}</h3>
          <span className={`font-mono-label text-[10px] ml-auto ${accent ? "text-paper/70" : "text-paper/40"}`}>
            [{String(category.skills.length).padStart(2, "0")}]
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto">
          {category.skills.map((skill) => (
            <span
              key={skill}
              className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                accent
                  ? "border border-paper/50 text-paper hover:bg-paper hover:text-accent"
                  : "border border-paper/25 text-paper/85 hover:bg-accent hover:border-accent hover:text-paper"
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
