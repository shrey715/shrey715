"use client";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useLenis } from "lenis/react";
import { EASE_OUT as EASE } from "@/lib/constants";
import RegistrationMarks from "@/components/ui/RegistrationMarks";
import ScrambleText from "@/components/ui/ScrambleText";
import Magnetic from "@/components/ui/Magnetic";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIntroReady } from "@/hooks/useIntroReady";
import { FORMATIONS } from "@/components/three/formations";

// three.js stays out of the server bundle and off the critical path.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

const CYCLE_MS = 7000;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const prefersReducedMotion = useReducedMotion();
  const introReady = useIntroReady();

  const [specimen, setSpecimen] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const scatter = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const contentY = useTransform(smoothProgress, [0, 1], [0, -90]);
  const contentOpacity = useTransform(smoothProgress, [0, 0.75], [1, 0]);

  // 0 → 1 as the hero scrolls away; drives the letters' scatter.
  const scatterMV = useTransform(smoothProgress, [0.04, 0.7], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scatter.current = Math.pow(Math.min(v * 1.3, 1), 1.4);
  });

  const next = useCallback(() => {
    setSpecimen((i) => (i + 1) % FORMATIONS.length);
    setCycleKey((k) => k + 1); // restart the auto-advance timer on manual mutate
  }, []);

  // Auto-cycle the specimen once the intro has played.
  useEffect(() => {
    if (prefersReducedMotion || !introReady) return;
    const t = setTimeout(next, CYCLE_MS);
    return () => clearTimeout(t);
  }, [prefersReducedMotion, introReady, cycleKey, next]);

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.6 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-dvh relative bg-paper text-ink grid-lines overflow-hidden flex flex-col"
    >
      <RegistrationMarks />

      <HeroScene
        index={specimen}
        started={introReady}
        still={prefersReducedMotion}
        scatter={scatter}
        className="absolute inset-0 z-0"
      />

      {/* Click target over the sculpture — morphs it to the next shape */}
      <button
        type="button"
        onClick={next}
        aria-label="Morph the figure into its next shape"
        className="absolute z-10 left-0 right-0 top-12 h-[34vh] lg:h-auto lg:left-auto lg:top-12 lg:bottom-28 lg:w-[40%] focus-visible:outline-offset-[-6px]"
      />

      {/* Top metadata bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={introReady ? { opacity: 1 } : undefined}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-20 w-full border-b-2 border-ink flex items-stretch justify-between font-mono-label text-[10px] sm:text-[11px] bg-paper/70 backdrop-blur-[2px]"
      >
        <span className="px-4 py-2.5 border-r-2 border-ink hidden sm:block">
          IIIT&nbsp;HYDERABAD
        </span>
        <data className="px-4 py-2.5 flex-1 hidden md:flex items-center tabular-nums mr-16 sm:mr-20">
          17.45°N&nbsp;/&nbsp;78.35°E
        </data>
      </motion.div>

      {/* Main composition */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-20 flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 items-end lg:items-center gap-8 pt-[34vh] pb-6 lg:py-10 pointer-events-none"
      >
        <div className="lg:col-span-7 pointer-events-auto">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={introReady ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="font-mono-label text-xs text-ink/60 mb-4 flex items-center gap-3"
          >
            <span className="text-accent">
              {"// "}
              <ScrambleText key={String(introReady)} text="HELLO_WORLD" duration={1100} delay={700} />
            </span>
            <span className="hidden sm:inline">I&apos;M</span>
          </motion.p>

          {/* Name: letters rise in on the intro, then scatter as you scroll out —
              flying apart alongside the particle figure. */}
          <h1 className="font-display leading-[0.82] text-ink text-[24vw] sm:text-[17vw] lg:text-[clamp(3.4rem,12vw,11.5rem)]">
            <span className="sr-only">Shreyas Deb</span>
            <span aria-hidden="true" className="block whitespace-nowrap pr-[0.12em]">
              <ScatterLetters text="SHREYAS" progress={scatterMV} show={introReady} delay={0.3} still={prefersReducedMotion} />
            </span>
            <span aria-hidden="true" className="flex items-baseline gap-[0.1em] pr-[0.12em]">
              <span className="text-accent whitespace-nowrap">
                <ScatterLetters text="DEB" progress={scatterMV} show={introReady} delay={0.5} seed={7} still={prefersReducedMotion} />
              </span>
              <Magnetic strength={0.45} className="shrink-0 self-center">
                <motion.button
                  type="button"
                  onClick={scrollToContact}
                  initial={{ opacity: 0, x: -10 }}
                  animate={introReady ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  whileHover={{ x: 5, y: -5, rotate: 8 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Get in touch"
                  data-cursor="SAY HI"
                  className="text-ink cursor-pointer"
                >
                  <Send className="w-9 h-9 sm:w-12 sm:h-12 lg:w-16 lg:h-16" strokeWidth={2} />
                </motion.button>
              </Magnetic>
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={introReady ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-8 max-w-md"
          >
            <p className="text-lg sm:text-xl font-medium leading-snug text-pretty">
              Undergraduate researcher &amp; developer working across{" "}
              <span className="bg-accent text-paper px-1.5">AI</span>,{" "}
              <span className="bg-ink text-paper px-1.5">systems biology</span> and the{" "}
              <span className="underline decoration-accent decoration-2 underline-offset-4">
                low-level guts
              </span>{" "}
              of computers.
            </p>
            <p className="font-mono-label text-[11px] text-ink/50 mt-5 leading-relaxed">
              MS&nbsp;DUAL&nbsp;DEGREE · COMPUTATIONAL&nbsp;NATURAL&nbsp;SCIENCES
              <br />
              FOURTH&nbsp;YEAR · IIIT&nbsp;HYDERABAD
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom rail: scroll cue */}
      <motion.div style={{ opacity: contentOpacity }} className="relative z-20 max-w-[1500px] w-full mx-auto px-4 sm:px-6 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={introReady ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, delay: 1 }}
        className="flex items-end justify-between gap-4"
      >
        <div className="hidden sm:flex items-center gap-3 font-mono-label text-[10px] text-ink/50">
          <span className="relative block w-px h-10 bg-ink/15 overflow-hidden" aria-hidden="true">
            <motion.span
              className="absolute left-0 top-0 w-px h-1/2 bg-accent"
              animate={prefersReducedMotion ? undefined : { y: ["-100%", "200%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          SCROLL
        </div>

      </motion.div>
      </motion.div>
    </section>
  );
}

/** Deterministic 0..1 noise so every visit scatters the same way. */
function noise(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function ScatterLetters({
  text,
  progress,
  show,
  delay,
  seed = 0,
  still,
}: {
  text: string;
  progress: MotionValue<number>;
  show: boolean;
  delay: number;
  seed?: number;
  still: boolean;
}) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <ScatterLetter key={i} ch={ch} i={i + seed} progress={progress} show={show} delay={delay + i * 0.045} still={still} />
      ))}
    </>
  );
}

function ScatterLetter({
  ch,
  i,
  progress,
  show,
  delay,
  still,
}: {
  ch: string;
  i: number;
  progress: MotionValue<number>;
  show: boolean;
  delay: number;
  still: boolean;
}) {
  const dx = (noise(i) - 0.5) * 340;
  const dy = -(70 + noise(i + 17) * 280);
  const rot = (noise(i + 31) - 0.5) * 70;
  const x = useTransform(progress, [0, 1], [0, still ? 0 : dx]);
  const y = useTransform(progress, [0, 1], [0, still ? 0 : dy]);
  const rotate = useTransform(progress, [0, 1], [0, still ? 0 : rot]);
  return (
    <motion.span
      className="inline-block"
      initial={{ y: "40%", opacity: 0 }}
      animate={show ? { y: "0%", opacity: 1 } : undefined}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      <motion.span className="inline-block" style={{ x, y, rotate }}>
        {ch}
      </motion.span>
    </motion.span>
  );
}
