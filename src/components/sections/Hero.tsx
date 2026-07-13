"use client";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { Send } from "lucide-react";
import { EASE_OUT as EASE } from "@/lib/constants";
import RegistrationMarks from "@/components/ui/RegistrationMarks";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });
  const imageY = useTransform(smoothProgress, [0, 1], [0, 80]);
  const contentY = useTransform(smoothProgress, [0, 1], [0, -40]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen relative bg-paper text-ink grid-lines overflow-hidden flex flex-col"
    >
      <RegistrationMarks />
      {/* Top metadata bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full border-b-2 border-ink flex items-stretch justify-between font-mono-label text-[10px] sm:text-[11px]"
      >
        <span className="px-4 py-2.5 border-r-2 border-ink hidden sm:block">
          IIIT&nbsp;HYDERABAD
        </span>
        <span className="px-4 py-2.5 flex-1 hidden md:flex items-center">
          17.45°N&nbsp;/&nbsp;78.35°E
        </span>
        <span className="px-4 py-2.5 border-l-2 border-ink flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          CURRENTLY&nbsp;BUILDING
        </span>
      </motion.div>

      {/* Main composition */}
      <motion.div
        style={{ y: contentY }}
        className="flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 items-center gap-14 lg:gap-8 py-10"
      >
        {/* Name + role */}
        <div className="lg:col-span-7 relative z-20 order-2 lg:order-1">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="font-mono-label text-xs text-ink/60 mb-4 flex items-center gap-3"
          >
            <span className="text-accent">{"// HELLO_WORLD"}</span>
            <span className="hidden sm:inline">I&apos;M</span>
          </motion.p>

          <h1 className="font-display leading-[0.82] text-ink" style={{ fontSize: "clamp(3rem, 11.5vw, 11rem)" }}>
            <span className="block overflow-hidden pr-[0.18em]">
              <motion.span
                className="block pr-[0.12em]"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
              >
                SHREYAS
              </motion.span>
            </span>
            <span className="block overflow-hidden pr-[0.18em]">
              <motion.span
                className="flex items-baseline gap-[0.1em] pr-[0.12em]"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.42 }}
              >
                <span className="text-accent">DEB</span>
                <motion.button
                  type="button"
                  onClick={() =>
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                  }
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  whileHover={{ x: 5, y: -5, rotate: 8 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Get in touch"
                  data-cursor="SAY HI"
                  className="text-ink shrink-0 self-center cursor-pointer"
                >
                  <Send className="w-9 h-9 sm:w-12 sm:h-12 lg:w-16 lg:h-16" strokeWidth={2} />
                </motion.button>
              </motion.span>
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-8 max-w-md"
          >
            <p className="text-lg sm:text-xl font-medium leading-snug">
              Undergraduate researcher &amp; developer working across{" "}
              <span className="bg-accent text-paper px-1.5">AI</span>,{" "}
              <span className="bg-ink text-paper px-1.5">systems biology</span> and the{" "}
              <span className="underline decoration-accent decoration-2 underline-offset-4">
                low-level guts
              </span>{" "}
              of computers.
            </p>
            <p className="font-mono-label text-[11px] text-ink/50 mt-5 leading-relaxed">
              MS&nbsp;DUAL&nbsp;DEGREE&nbsp;·&nbsp;COMPUTATIONAL&nbsp;NATURAL&nbsp;SCIENCES
              <br />
              FOURTH&nbsp;YEAR&nbsp;·&nbsp;IIIT&nbsp;HYDERABAD
            </p>
          </motion.div>
        </div>

        {/* Portrait */}
        <div className="lg:col-span-5 relative order-1 lg:order-2 flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.55, ease: EASE }}
            className="relative"
          >
            {/* Accent block behind */}
            <div className="absolute -inset-3 sm:-inset-5 bg-accent translate-x-3 translate-y-3" />
            {/* Framed duotone portrait */}
            <motion.div
              style={{ y: imageY }}
              className="relative hard-border bg-paper-dim overflow-hidden w-[75vw] max-w-[460px] aspect-[4/5]"
            >
              <Image
                src={`${basePath}/shreyas_cropped.png`}
                alt="Shreyas Deb"
                fill
                className="object-cover object-top grayscale contrast-125"
                priority
                sizes="(max-width: 1024px) 75vw, 460px"
              />
              <div className="absolute inset-0 bg-accent/15 mix-blend-multiply pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-ink text-paper font-mono-label text-[10px] flex justify-between">
                <span>FIG.01</span>
                <span>THE&nbsp;ME</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

    </section>
  );
}

