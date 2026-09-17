"use client";

import React, { useRef, useState, useEffect } from "react";
import CharacterModel from "./CharacterModel";

interface HeroSectionProps {
  scrollProgress?: number;
}

export default function HeroSection({ scrollProgress = 0 }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const targetPos = useRef({ x: -1000, y: -1000 });
  const currentPos = useRef({ x: -1000, y: -1000 });
  const isHoveredRef = useRef(false);
  const animFrameId = useRef<number | null>(null);

  // Track cursor position relative to hero container
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    targetPos.current = { x, y };

    if (!isHoveredRef.current) {
      isHoveredRef.current = true;
      setIsHovered(true);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    targetPos.current = { x, y };
    currentPos.current = { x, y };
    setPos({ x, y });
    isHoveredRef.current = true;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    setIsHovered(false);
  };

  // Smooth cursor-following movement with slight easing (lerp)
  useEffect(() => {
    let running = true;

    const animate = () => {
      if (!running) return;

      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;

      currentPos.current.x += dx * 0.14;
      currentPos.current.y += dy * 0.14;

      setPos({
        x: Math.round(currentPos.current.x * 10) / 10,
        y: Math.round(currentPos.current.y * 10) / 10,
      });

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  const tickerItems = [
    "FRONT-END: REACT & NEXT.JS",
    "BACK-END: NODE.JS & EXPRESS",
    "TYPESCRIPT & TAILWIND CSS",
    "POSTGRESQL & REST APIS",
    "FULL-STACK ARCHITECTURE",
    "THREE.JS & WEBGL",
    "GAME DEV: UNITY 3D & C#",
    "VR & IMMERSIVE TECH",
    "GAMEPLAY PROGRAMMING",
    "INTERACTIVE UI/UX",
  ];

  const tickerList = [...tickerItems, ...tickerItems];

  // Derived scroll animations for camera zoom into eye
  const uiOpacity = Math.max(0, 1 - scrollProgress * 3.0);
  const uiBlur = scrollProgress * 14;
  const uiScale = 1 + scrollProgress * 0.08;
  const uiPointerEvents = scrollProgress > 0.06 ? "none" : "auto";

  // Background dimming and subtle zoom for cinematic focus
  const bgScale = 1 + scrollProgress * 0.25;
  const bgDim = Math.max(0.08, 1 - scrollProgress * 1.3);

  // Ocular Iris Portal effect (as camera enters the eye: 0.55 -> 1.0)
  const portalActive = scrollProgress > 0.52;
  const portalT = Math.min(1, Math.max(0, (scrollProgress - 0.52) / 0.44));
  // Deep pupil void opacity (0.88 -> 1.0)
  const voidOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.88) / 0.12));

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen md:h-screen bg-[#0b0907] text-[#f3eae0] flex flex-col justify-between overflow-hidden selection:bg-[#d97706]/35 selection:text-[#fef3c7]"
    >
      {/* 1. BASE LAYER (highHonor - Stag in Forest with A Plague Tale / RDR2 Atmospheric Tone) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none transition-transform duration-75"
        style={{
          transform: `scale(${bgScale})`,
          opacity: bgDim,
        }}
      >
        <img
          src="/images/highHonor.jpg"
          alt="High Honor Base"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark Charcoal & Torchlight Ember Vignette */}
        <div className="absolute inset-0 bg-[#0b0907]/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0907]/95 via-[#0b0907]/30 to-[#0b0907]/75 pointer-events-none" />
        <div className="absolute inset-0 studio-shadow-overlay pointer-events-none opacity-50 md:opacity-65" />
      </div>

      {/* 2. REVEAL LAYER (lowHonor - Wolf in Lightning Storm) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none"
        style={{
          opacity: isHovered ? Math.max(0, 1 - scrollProgress * 2.5) : 0,
          transform: `scale(${bgScale})`,
          transition: "opacity 0.25s ease-out",
          maskImage: isHovered
            ? `radial-gradient(circle 185px at ${pos.x}px ${pos.y}px, black 0%, black 85px, rgba(0,0,0,0.85) 115px, rgba(0,0,0,0.5) 145px, rgba(0,0,0,0.18) 168px, transparent 185px)`
            : "radial-gradient(circle 0px at 0px 0px, transparent 0%, transparent 100%)",
          WebkitMaskImage: isHovered
            ? `radial-gradient(circle 185px at ${pos.x}px ${pos.y}px, black 0%, black 85px, rgba(0,0,0,0.85) 115px, rgba(0,0,0,0.5) 145px, rgba(0,0,0,0.18) 168px, transparent 185px)`
            : "radial-gradient(circle 0px at 0px 0px, transparent 0%, transparent 100%)",
        }}
      >
        <img
          src="/images/lowHonor.png"
          alt="Low Honor Reveal"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* 3. 3D CHARACTER MODEL (A Plague Tale - Head & Eyes Track Cursor, Zooms Into Eye) */}
      <CharacterModel scrollProgress={scrollProgress} />

      {/* 4. TOP NEWS TICKER (Fades and lifts on scroll) */}
      <header
        className="relative z-30 w-full overflow-hidden bg-[#120e0b]/75 backdrop-blur-md py-2.5 sm:py-3 transition-transform duration-75"
        style={{
          opacity: uiOpacity,
          transform: `translateY(-${scrollProgress * 60}px)`,
          pointerEvents: (uiPointerEvents as any),
        }}
      >
        {/* Edge Gradient Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#0b0907] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#0b0907] to-transparent z-10 pointer-events-none" />

        {/* Continuous Left-to-Right Ticker */}
        <div className="animate-marquee-ltr items-center gap-8 sm:gap-10 whitespace-nowrap text-[11px] sm:text-xs tracking-[0.22em] text-[#e5c9a7] uppercase font-medium">
          {/* Set 1 */}
          {tickerList.map((item, index) => (
            <span key={`t1-${index}`} className="flex items-center gap-8 sm:gap-10">
              <span className="text-[#e5c9a7] transition-colors duration-300 hover:text-[#38bdf8] cursor-default">
                {item}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ea580c] shadow-[0_0_6px_#ea580c]" />
            </span>
          ))}
          {/* Set 2 for seamless loop */}
          {tickerList.map((item, index) => (
            <span key={`t2-${index}`} className="flex items-center gap-8 sm:gap-10">
              <span className="text-[#e5c9a7] transition-colors duration-300 hover:text-[#38bdf8] cursor-default">
                {item}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ea580c] shadow-[0_0_6px_#ea580c]" />
            </span>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER (Fades out, blurs, and rises as camera zooms into eye) */}
      <div
        className="relative z-30 flex-1 flex flex-col justify-between p-5 sm:p-7 md:p-9 lg:p-10 transition-transform duration-75"
        style={{
          opacity: uiOpacity,
          transform: `scale(${uiScale}) translateY(-${scrollProgress * 35}px)`,
          filter: uiBlur > 0.5 ? `blur(${uiBlur}px)` : "none",
          pointerEvents: (uiPointerEvents as any),
        }}
      >
        {/* 5. UPPER HEADER: Balanced Top Bar */}
        <section className="relative z-30 flex flex-row items-center justify-between w-full pointer-events-auto">
          {/* Top Left: Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#140f0b]/80 border border-[#523e2c]/70 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ea580c] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ea580c]" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-[family-name:var(--font-serif)] font-medium tracking-[0.2em] uppercase text-[#d8c8b4] transition-colors duration-300 hover:text-[#38bdf8] cursor-default">
              Available for Projects & Roles
            </span>
          </div>

          {/* Top Right: Tagline */}
          <div className="text-right">
            <p className="text-xs sm:text-sm md:text-[15px] font-[family-name:var(--font-manuscript)] italic tracking-wide text-[#a89b89] leading-snug transition-colors duration-300 hover:text-[#bae6fd] cursor-default inline-block">
              Code that speaks.
            </p>
            <br />
            <p className="text-xs sm:text-sm md:text-[15px] font-[family-name:var(--font-serif)] font-medium tracking-[0.18em] uppercase text-[#e2b069] leading-snug transition-colors duration-300 hover:text-[#38bdf8] cursor-default inline-block">
              Worlds that immerse.
            </p>
          </div>
        </section>

        {/* 6. CENTER HERO CLUSTER: NAME, SUBTITLE & SOCIAL BADGES (Harmoniously Centered) */}
        <section className="relative z-30 w-full flex-1 flex flex-col items-center justify-center select-none pointer-events-none px-2 sm:px-4 -translate-y-2 sm:-translate-y-3 md:-translate-y-4">
          <h2 className="text-center whitespace-nowrap text-[6vw] sm:text-[5.3vw] md:text-[4.7vw] lg:text-[4.2vw] xl:text-[3.8vw] font-bold uppercase tracking-[0.08em] sm:tracking-[0.1em] leading-none font-[family-name:var(--font-decorative)]">
            {/* TRAFEH (Isolated Hover Area) */}
            <span className="relative inline-block group/trafeh pointer-events-auto cursor-default">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#fffdfa] via-[#edd5b5] to-[#c59553] transition-opacity duration-300 group-hover/trafeh:opacity-0 inline-block">
                TRAFEH
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#bae6fd] to-[#38bdf8] opacity-0 transition-opacity duration-300 group-hover/trafeh:opacity-100 inline-block pointer-events-none"
              >
                TRAFEH
              </span>
            </span>

            <span className="inline-block w-[0.28em]" />

            {/* ZOUHAIR (Isolated Hover Area) */}
            <span className="relative inline-block group/zouhair pointer-events-auto cursor-default">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#fffdfa] via-[#edd5b5] to-[#c59553] transition-opacity duration-300 group-hover/zouhair:opacity-0 inline-block">
                ZOUHAIR
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#bae6fd] to-[#38bdf8] opacity-0 transition-opacity duration-300 group-hover/zouhair:opacity-100 inline-block pointer-events-none"
              >
                ZOUHAIR
              </span>
            </span>
          </h2>

          {/* Subtitle */}
          <div className="mt-3.5 sm:mt-4 md:mt-5 flex items-center gap-3 sm:gap-4 pointer-events-auto">
            <span className="inline-block w-8 sm:w-16 h-[1px] bg-gradient-to-r from-transparent via-[#e2b069]/40 to-[#e2b069]" />
            <p className="text-xs sm:text-sm md:text-[14px] tracking-[0.32em] sm:tracking-[0.38em] uppercase font-[family-name:var(--font-serif)] font-semibold text-[#e2b069] transition-colors duration-300 hover:text-[#38bdf8] cursor-default">
              Full-Stack & Game Developer
            </p>
            <span className="inline-block w-8 sm:w-16 h-[1px] bg-gradient-to-l from-transparent via-[#e2b069]/40 to-[#e2b069]" />
          </div>

        </section>

        {/* 7. LINKS UNDER THE 3D MODEL */}
        <section className="relative z-30 w-full flex items-center justify-center pb-2.5 sm:pb-3 md:pb-4 pointer-events-auto select-none">
          <div className="flex items-center justify-center gap-5 sm:gap-7 md:gap-9">
            {/* GITHUB */}
            <a
              href="https://github.com/b0tjake"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group/link flex items-center gap-2 sm:gap-2.5 py-1 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              {/* Coin Medallion */}
              <span className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#120e0b]/70 border border-[#6b4e33]/70 group-hover/link:border-[#38bdf8] flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover/link:shadow-[0_0_12px_rgba(56,189,248,0.4)]">
                <span className="absolute inset-0.5 rounded-full border border-[#423223]/50 group-hover/link:border-[#38bdf8]/40 transition-colors duration-300" />
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e2b069] group-hover/link:text-[#38bdf8] transition-colors duration-300 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </span>
              {/* Label */}
              <span className="text-[11px] sm:text-xs font-[family-name:var(--font-serif)] font-medium tracking-[0.24em] uppercase text-[#d8c8b4] group-hover/link:text-[#ffffff] transition-colors duration-300">
                GitHub
              </span>
              {/* Luminous underline sweep */}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent group-hover/link:w-full transition-all duration-300" />
            </a>

            {/* Diamond Rune Separator */}
            <span className="text-[#6b4e33]/70 text-[9px] select-none">◈</span>

            {/* LINKEDIN */}
            <a
              href="https://www.linkedin.com/in/trafehzouhair/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group/link flex items-center gap-2 sm:gap-2.5 py-1 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              {/* Coin Medallion */}
              <span className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#120e0b]/70 border border-[#6b4e33]/70 group-hover/link:border-[#38bdf8] flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover/link:shadow-[0_0_12px_rgba(56,189,248,0.4)]">
                <span className="absolute inset-0.5 rounded-full border border-[#423223]/50 group-hover/link:border-[#38bdf8]/40 transition-colors duration-300" />
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e2b069] group-hover/link:text-[#38bdf8] transition-colors duration-300 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </span>
              {/* Label */}
              <span className="text-[11px] sm:text-xs font-[family-name:var(--font-serif)] font-medium tracking-[0.24em] uppercase text-[#d8c8b4] group-hover/link:text-[#ffffff] transition-colors duration-300">
                LinkedIn
              </span>
              {/* Luminous underline sweep */}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent group-hover/link:w-full transition-all duration-300" />
            </a>

            {/* Diamond Rune Separator */}
            <span className="text-[#6b4e33]/70 text-[9px] select-none">◈</span>

            {/* ITCH.IO */}
            <a
              href="https://b0tjake.itch.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group/link flex items-center gap-2 sm:gap-2.5 py-1 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              {/* Coin Medallion */}
              <span className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#120e0b]/70 border border-[#6b4e33]/70 group-hover/link:border-[#38bdf8] flex items-center justify-center transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover/link:shadow-[0_0_12px_rgba(56,189,248,0.4)]">
                <span className="absolute inset-0.5 rounded-full border border-[#423223]/50 group-hover/link:border-[#38bdf8]/40 transition-colors duration-300" />
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e2b069] group-hover/link:text-[#38bdf8] transition-colors duration-300 fill-current" viewBox="0 0 24 24">
                  <path d="M2.4 4C1.08 4 0 5.08 0 6.4v11.2C0 18.92 1.08 20 2.4 20h19.2c1.32 0 2.4-1.08 2.4-2.4V6.4C24 5.08 22.92 4 21.6 4H2.4zm4.1 3.5h2v2h2v2h-2v2h-2v-2h-2v-2h2v-2zm10 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
                </svg>
              </span>
              {/* Label */}
              <span className="text-[11px] sm:text-xs font-[family-name:var(--font-serif)] font-medium tracking-[0.24em] uppercase text-[#d8c8b4] group-hover/link:text-[#ffffff] transition-colors duration-300">
                Itch.io
              </span>
              {/* Luminous underline sweep */}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent group-hover/link:w-full transition-all duration-300" />
            </a>
          </div>
        </section>

        {/* 7. REFINED BOTTOM ANCHOR BAR */}
        <footer className="relative z-30 w-full flex items-center justify-between text-[11px] sm:text-xs text-[#8c7b6b] tracking-[0.22em] uppercase font-[family-name:var(--font-serif)] pointer-events-auto pt-2 border-t border-[#382a1d]/40">
          <div className="flex items-center gap-2 transition-colors duration-300 hover:text-[#d8c8b4] cursor-default">
            <span>Portfolio // 2025</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#736353] tracking-[0.25em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]/60" />
            <span>Move Cursor To Reveal The Wolf</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]/60" />
          </div>

          <div className="flex items-center gap-2 transition-colors duration-300 hover:text-[#d8c8b4] cursor-default">
            <span>Morocco • Remote</span>
          </div>
        </footer>
      </div>

      {/* 8. SCROLL INVITATION INDICATOR (Gently pulses when at hero top) */}
      <div
        className="absolute bottom-12 sm:bottom-14 left-1/2 -translate-x-1/2 z-35 flex flex-col items-center gap-1.5 pointer-events-none transition-opacity duration-300 select-none"
        style={{ opacity: Math.max(0, 1 - scrollProgress * 6.5) }}
      >
        {/* <span className="text-[9px] sm:text-[10px] tracking-[0.32em] uppercase font-[family-name:var(--font-serif)] text-[#e2b069]/90 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Scroll to descend into the eye
        </span> */}
        <div className="w-5 h-8 rounded-full border border-[#6b4e33]/90 flex items-start justify-center p-1 bg-[#140f0b]/80 backdrop-blur-xs shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
          <span className="w-1 h-2 rounded-full bg-[#ea580c] animate-bounce shadow-[0_0_8px_#ea580c]" />
        </div>
      </div>

      {/* 9. OCULAR IRIS PORTAL (Dramatic eye penetration as camera enters pupil: 0.52 -> 1.0) */}
      {portalActive && (
        <div
          className="absolute inset-0 z-38 pointer-events-none flex items-center justify-center overflow-hidden"
          style={{ opacity: portalT }}
        >
          {/* Expanding Eye Aperture Ring */}
          <div
            className="absolute rounded-full border border-[#e2b069]/70 shadow-[0_0_100px_rgba(234,88,12,0.85),inset_0_0_100px_rgba(56,189,248,0.5)] transition-all pointer-events-none"
            style={{
              width: `${portalT * 260}vmax`,
              height: `${portalT * 260}vmax`,
              transform: `rotate(${scrollProgress * 220}deg)`,
            }}
          />

          {/* Radial Iris Filaments & Energy Burst */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(8,6,5,${Math.min(
                1,
                portalT * 1.6
              )}) 0%, rgba(18,14,11,${Math.min(
                0.92,
                portalT * 1.3
              )}) 38%, rgba(217,119,6,${Math.max(
                0,
                (1 - portalT) * 0.45
              )}) 58%, transparent 78%)`,
            }}
          />

          {/* Cinematic Glyph Message as you pierce the pupil */}
          {scrollProgress > 0.58 && scrollProgress < 0.99 && (
            <div
              className="relative z-40 flex flex-col items-center gap-3 sm:gap-4 text-center select-none px-4 max-w-2xl"
              style={{
                opacity:
                  scrollProgress < 0.70
                    ? (scrollProgress - 0.58) / 0.12
                    : scrollProgress <= 0.92
                    ? 1
                    : Math.max(0, 1 - (scrollProgress - 0.92) / 0.07),
                transform: `scale(${1 + (scrollProgress - 0.58) * 0.12})`,
              }}
            >
              <span className="text-xs sm:text-sm md:text-base tracking-[0.42em] uppercase font-[family-name:var(--font-serif)] text-[#e2b069] drop-shadow-[0_0_20px_rgba(226,176,105,0.95)] font-semibold">
                Curious what's going on inside?
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-[0.16em] uppercase font-[family-name:var(--font-decorative)] font-bold text-[#ffffff] drop-shadow-[0_0_30px_rgba(56,189,248,0.95)]">
                Take a look around.
              </span>
            </div>
          )}
        </div>
      )}

      {/* 10. COMPLETE VOID OVERLAY (Seamless dissolve to portfolio realm background) */}
      <div
        className="absolute inset-0 z-40 pointer-events-none bg-[#080605]"
        style={{ opacity: voidOpacity }}
      />
    </main>
  );
}
