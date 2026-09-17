"use client";

import React, { useEffect, useRef, useState } from "react";
import HeroSection from "@/components/HeroSection";
import PortfolioContent from "@/components/PortfolioContent";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Home() {
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const track = heroTrackRef.current;
    if (!track) return;

    // Use GSAP ScrollTrigger to scrub progress smoothly across the track
    const st = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.35, // Buttery smooth scrubbing with natural momentum
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div className="relative w-full bg-[#080605] text-[#f3eae0]">
      {/* 1. CINEMATIC EYE ZOOM TRACK
          260vh gives ~160vh of scroll travel, the ideal pacing for a dramatic zoom into the eye */}
      <div ref={heroTrackRef} className="relative w-full h-[260vh]">
        {/* Sticky Hero Viewport */}
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
          <HeroSection scrollProgress={scrollProgress} />
        </div>
      </div>

      {/* 2. THE 4 IMAGES ONLY (Revealed through the eye) */}
      <div id="inner-realm" className="relative z-30 w-full bg-[#080605]">
        <PortfolioContent />
      </div>
    </div>
  );
}
