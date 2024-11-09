import React, { useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Sections/Hero";
import About from "@/components/Sections/About";
import Projects from "@/components/Sections/Projects";
import Contact from "@/components/Sections/Contact";
import Footer from "@/components/Footer";
import CursorFollower from "@/components/CursorFollower";

export default function Home() {
  return (
    <main className="h-screen bg-primary overflow-y-scroll scroll-smooth">
      <CursorFollower />
      <Navbar />
      <Hero id="Hero" />
      {/* <About id="About" />
      <Projects id="Projects" /> */}
      <Contact id="Contact" />
      <Footer />
    </main>
  );
}
