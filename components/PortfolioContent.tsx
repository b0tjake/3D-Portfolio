"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import MilkyWaySpace, { SpaceRealmInfo, OriginRect } from "./MilkyWaySpace";
import gsap from "gsap";

export default function PortfolioContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Page state: 1 = Realms & Lyrics, 2 = Projects & Quotes, 3 = Get In Touch With Me
  const [page, setPage] = useState<1 | 2 | 3>(1);
  const [flipProgress1, setFlipProgress1] = useState(0); // 0 to 1 (Page 1 flip)
  const [flipProgress2, setFlipProgress2] = useState(0); // 0 to 1 (Page 2 flip)
  const isFlippingRef = useRef(false);
  const animProgress1 = useRef({ value: 0 });
  const animProgress2 = useRef({ value: 0 });
  const pageRef = useRef<1 | 2 | 3>(1);
  pageRef.current = page;

  // 1-Click Copy Email state
  const [copiedEmail, setCopiedEmail] = useState(false);
  const handleCopyEmail = () => {
    navigator.clipboard.writeText("mouadtrafeh14@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  // Hover states
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredProjectIndex, setHoveredProjectIndex] = useState<number | null>(null);

  // Space Journey Realm Transition (Page 1 Realms + Page 2 Projects)
  const [activeSpaceRealm, setActiveSpaceRealm] = useState<{
    realm: SpaceRealmInfo;
    originRect: OriginRect;
  } | null>(null);
  const [isDiving, setIsDiving] = useState(false);

  // Parallax cursor offset tracking
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const targetOffset = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });

  // 1. Realms data for Page 1
  const realms: SpaceRealmInfo[] = [
    {
      id: "about-me",
      title: "About Me",
      subtitle: "Identity & Physical Discipline",
      explanation: "Mindset, athletic conditioning, football & boxing discipline",
      description: "The core mindset, relentless physical conditioning, and team-building values that forge my character.",
      cover: "/about%20me/about%20me%20cover.png",
      media: [
        {
          name: "boxing.jpg",
          title: "Discipline & Focus — Boxing Conditioning",
          path: "/about%20me/boxing.jpg",
          description: "Two years of kickboxing taught me discipline, focus, and the strength to push beyond my limits—both in and out of the ring.",
        },
        {
          name: "football.jpg",
          title: "Team Dynamics & Strategic Play — Football",
          path: "/about%20me/football.jpg",
          description: "Football taught me that not every game is a win, and not every loss is a defeat. What matters is getting back on the pitch and playing the next one better.",
        },
        {
          name: "team building.jpg",
          title: "Collaborative Synergies — Team Building",
          path: "/about%20me/team%20building.jpg",
          description: "Teamwork taught me to build stronger connections, understand different perspectives, and grow together.",
        },
      ],
    },
    {
      id: "experiences",
      title: "Experiences",
      subtitle: "Professional & Engineering Milestones",
      explanation: "Techpal game development & Safa Inox metallic construction",
      description: "Hands-on engineering across interactive safety game development at Techpal and heavy industrial metallic construction with Safa Inox.",
      cover: "/experiences/Experiences%20cover.png",
      media: [
        {
          name: "Techpal.jpeg",
          title: "Techpal — Game Developer",
          path: "/experiences/Techpal.jpeg",
          description: "Worked on an interactive educational game for factory safety awareness. Designed and developed simulation modules covering Personal Protective Equipment (PPE) compliance, working at heights, fire prevention systems, and industrial hazard protocols.",
        },
        {
          name: "construction.jpg",
          title: "Safa Inox — Metallic Construction",
          path: "/experiences/construction.jpg",
          description: "Executed industrial metallic construction and structural fabrication with Safa Inox on-site at major manufacturing facilities, including CMCP and Procter & Gamble (P&G). Performed precision welding, structural steel assembly, industrial piping installations, and on-site factory safety compliance.",
        },
      ],
    },
    {
      id: "social-life",
      title: "Social Life",
      subtitle: "Summits & Community Triumphs",
      explanation: "Geeks hackathons, GITEX summit, community & gaming expo",
      description: "International tech summits, competitive hackathon wins, gaming expos, and community leadership.",
      cover: "/Social%20life/Social%20life%20Cover.png",
      media: [
        {
          name: "keep connection.jpg",
          title: "meet new friends, Networking",
          path: "/Social%20life/keep%20connection.jpg",
          description: "making memories with an unforgetable team in geeks institute's hackathon.",
        },
        {
          name: "geeks hackathonOption.JPG",
          title: "pitching 'the mirage of us' game",
          path: "/Social%20life/geeks%20hackathon%20presentaion.JPG",
          description: "Pitching our high-speed architectural prototype to industry judges, which was a great moment.",
        },
        {
          name: "geeks hackathon.JPG",
          title: "Geeks Hackathon Team Celebration",
          path: "/Social%20life/geeks%20hackathon.JPG",
          description: "Celebrating a triumphant 48-hour competitive coding marathon after delivering the required demo game.",
        },
        {
          name: "gitex.jpg",
          title: "GITEX Africa Tech Exhibition 2025",
          path: "/Social%20life/gitex.jpg",
          description: "Representing next-generation software solutions and connecting with global tech pioneers, founders, and venture capitalists at GITEX Africa.",
        },
        {
          name: "gitexIdeas.jpg",
          title: "GITEX Innovation Brainstorming",
          path: "/Social%20life/gitexIdeas.jpg",
          description: "Participating in high-level innovation sessions exploring distributed cloud architectures, AI automation workflows, and emerging digital frontiers.",
        },
        {
          name: "meInMge.jpeg",
          title: "Morocco Gaming Expo (MGE) Presence",
          path: "/Social%20life/meInMge.jpeg",
          description: "attending morocco's biggest gaming expo 'MGE 2025' and presenting our games infront of croud and get inspired by other teams.",
        },
        {
          name: "geeksStand.jpeg",
          title: "Tech Community Exhibition Booth",
          path: "/Social%20life/geeksStand.jpeg",
          description: "Presenting our stand in Morrocan gaming expo 2026 'MGE 2026' that had an arcade machine for the 2d games and a gaming pc for the AA games",
        },
        {
          name: "the mirage of us.mp4",
          title: "The Mirage of Us — Interactive Showcase",
          path: "/Social%20life/the%20mirage%20of%20us.mp4",
          isVideo: true,
          description: "presenting the game 'mirage of us' in gaming hackathon infront of the jury.",
        },
        {
          name: "MGE.mp4",
          title: "Morocco Gaming Expo Experience",
          path: "/Social%20life/MGE.mp4",
          isVideo: true,
          description: "Asking foreigners in MGE which game they liked the most 'spawn: hell's path' or 'flip that can'.",
        },
      ],
    },
    {
      id: "study",
      title: "Study",
      subtitle: "Academic Mastery & Foundations",
      explanation: "Computer science degree, algorithms, data structures & capstone PFE",
      description: "Rigorous computer science education, software engineering curricula, and capstone excellence.",
      cover: "/study/study%20cover.png",
      media: [
        {
          name: "ofppt.jpg",
          title: "Web development specialized diploma",
          path: "/study/ofppt.jpg",
          description: "2 years diploma in web development specialized in CMFP LALLA AICHA in the domain of fullstack development had the chance to meet the best developpers in Morocco with who i learned and had great moments.",
        },
        {
          name: "geeks.jpg",
          title: "Game developpement Certificate",
          path: "/study/geeks.jpg",
          description: "with geeks institute I had the chance to learn something new and take a new adventure in Game development.",
        },
      ],
    },
  ];

  // 2. Projects data for Page 2 (Now Full Space Realms with fast travel and starlight trajectory!)
  const projects: SpaceRealmInfo[] = [
    {
      id: "gaming-projects",
      title: "Video Games",
      subtitle: "Interactive Worlds & Engine Architecture",
      explanation: "Unity, C#, VR, 2D & 3D gameplay systems, combat mechanics & physics prototypes",
      description: "VR immersive training simulations, 3D exploration games, 2D metroidvanias, and physics-based arcade platformers developed with Unity and C#.",
      cover: "/projects/gamingCover.png",
      media: [
        {
          name: "VrSafetyTrainning.PNG",
          title: "SIMULATION PPE VR (IN PROGRESS)",
          path: "/projects/VrSafetyTrainning.PNG",
          description: "Development of an immersive virtual reality simulation with Unity and C#. Implementation of VR interactions (movement, collisions, exploration of the environment). OpenXR integration for compatibility with VR headsets. Design of an interactive and optimized industrial environment. Technologies: Unity, C#, OpenXR, Blender.",
        },
        {
          name: "prisma",
          title: "PRISMA (VONTASONA) — 3D DISCOVERY GAME",
          path: "",
          noImage: true,
          description: "Worked on a 3D exploration game as part of a team of 2 developers. Responsibilities: Gameplay programming and system implementation, third-person player movement mechanics, camera systems using Cinemachine, enemy encounter and combat transitions, and development of a rhythm-based combat system. Technologies : Unity, C#, Blender.",
        },
        {
          name: "spawn hell's path.png",
          title: "SPAWN HELL’S PATH PROJECT - 2D METROIDVANIA (TEAM PROJECT)",
          path: "/projects/spawn%20hell's%20path.png",
          description: "Participated in the development of a 2D Metroidvania game as part of a team of 4 people. I implemented the player movement mechanics, developed the attack systems (including special attacks), implemented the damage and health management system, designed the boss combat systems, and worked with the Unity physics engine and gameplay logic. Technical stack: Unity, C#.",
        },
        {
          name: "flappy penguin.png",
          title: "FLAPPY PENGUIN — 2D ARCADE GAME (SOLO PROJECT)",
          path: "/projects/flappy%20penguin.png",
          description: "A Flappy Bird–style arcade game developed independently. Responsibilities: Implemented physics-based movement mechanics - Designed obstacle generation system - Implemented scoring and high-score tracking system - Created original penguin character sprite. Technologies : Unity, C#, Aseprite.",
        },
        {
          name: "bouncing penguin.png",
          title: "BOUNCING PENGUIN — 2D PLATFORM GAME (SOLO PROJECT)",
          path: "/projects/bouncing%20penguin.png",
          description: "A challenging 2D platform game, developed independently. Design and implementation of bounce movement mechanics - Creation of original sprites for the penguin and the seal - Implementation of coin collection and obstacle systems - Game progression design. Technical stack: C#, Unity, Aseprite, Audacity.",
        },
      ],
    },
    {
      id: "web-projects",
      title: "Web Projects",
      subtitle: "Full-Stack Platforms & Creative Systems",
      explanation: "Next.js, React, Node.js, MongoDB, PHP, Tailwind CSS & SaaS platforms",
      description: "High-performance full-stack web applications, SaaS platforms, multi-store e-commerce, and geolocated social travel platforms.",
      cover: "/projects/WebCover.png",
      media: [
        {
          name: "novaflow-labs",
          title: "NOVAFLOW LABS — SAAS PLATFORM",
          path: "/projects/Novaflow.png",
          link: "https://www.novaflow-labs.com/",
          description: "Engineered a responsive SaaS landing page using Next.js, React, and modern UI tooling. Collaborated with a team to design and structure the product architecture, contributing to debugging, UI improvements, and performance optimization. Backend development (Node.js / Laravel) planned and in progress. Technical stack: Next.js, React, TypeScript, Tailwind CSS, Framer Motion, i18n (internationalization), Vercel Analytics.",
        },
        {
          name: "jotishop",
          title: "JOTISHOP — MULTI-STORE E-COMMERCE PLATFORM",
          path: "/projects/jotishop.png",
          description: "Multi-store e-commerce platform for managing multi-category product catalogs with an animated, interactive user interface. Implemented core features including shopping cart mechanics, real-time search, multi-criteria filters, and user account management. Technical stack: React.js, PHP, SQL, GSAP, Framer Motion.",
        },
        {
          name: "jouala",
          title: "JOUALA — SOCIAL TRAVEL PLATFORM",
          path: "/projects/Jouala.png",
          description: "Social travel-sharing web platform featuring geolocated publications. Full-stack development with React on the front-end and Node.js + MongoDB on the back-end. Integrated user and post management systems (creation, modification, deletion, comments) and built a modern, interactive interface with Tailwind CSS, GSAP, and Framer Motion. Implemented secure authentication, location-based search, dynamic feed displays, and interactive maps powered by Google Maps API. Technical stack: React.js, Node.js, MongoDB, Tailwind CSS, GSAP, Framer Motion, Google Maps API.",
        },
        {
          name: "paintings-ecommerce",
          title: "ARTISTIC PAINTINGS E-COMMERCE PLATFORM",
          path: "",
          noImage: true,
          description: "Responsible for the user management module: user registration, secure authentication, role-based access control (RBAC), and session security. Designed and integrated the responsive homepage in HTML/CSS with server-side business logic in PHP. Technical stack: HTML, CSS, PHP, SQL.",
        },
      ],
    },
  ];

  // Organic cursor parallax tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      targetOffset.current = {
        x: normX * 20,
        y: normY * 15,
      };
    };

    let animId: number;
    const animate = () => {
      const dx = targetOffset.current.x - currentOffset.current.x;
      const dy = targetOffset.current.y - currentOffset.current.y;
      currentOffset.current.x += dx * 0.08;
      currentOffset.current.y += dy * 0.08;

      setOffset({
        x: Math.round(currentOffset.current.x * 100) / 100,
        y: Math.round(currentOffset.current.y * 100) / 100,
      });

      animId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // UNSTOPPABLE FULL-PAGE FLIP ANIMATIONS (Once it begins, it completes 100%)
  const flipToPage1 = useCallback(() => {
    if (isFlippingRef.current || pageRef.current === 1) return;
    isFlippingRef.current = true;
    setPage(1);

    const innerRealm = document.getElementById("inner-realm");
    if (innerRealm) {
      const top = innerRealm.offsetTop;
      if (Math.abs(window.scrollY - top) > 15) {
        window.scrollTo({ top, behavior: "smooth" });
      }
    }

    gsap.killTweensOf([animProgress1.current, animProgress2.current]);
    gsap.to(animProgress2.current, {
      value: 0,
      duration: 0.7,
      ease: "power2.inOut",
      onUpdate: () => setFlipProgress2(animProgress2.current.value),
    });
    gsap.to(animProgress1.current, {
      value: 0,
      duration: 1.15,
      ease: "power2.inOut",
      onUpdate: () => setFlipProgress1(animProgress1.current.value),
      onComplete: () => {
        setFlipProgress1(0);
        setFlipProgress2(0);
        setTimeout(() => {
          isFlippingRef.current = false;
        }, 250);
      },
    });
  }, []);

  const flipToPage2 = useCallback(() => {
    if (isFlippingRef.current || pageRef.current === 2) return;
    isFlippingRef.current = true;
    const prevPage = pageRef.current;
    setPage(2);

    const innerRealm = document.getElementById("inner-realm");
    if (innerRealm) {
      const top = innerRealm.offsetTop;
      if (Math.abs(window.scrollY - top) > 15) {
        window.scrollTo({ top, behavior: "smooth" });
      }
    }

    gsap.killTweensOf([animProgress1.current, animProgress2.current]);

    if (prevPage === 1) {
      gsap.to(animProgress1.current, {
        value: 1,
        duration: 1.15,
        ease: "power2.inOut",
        onUpdate: () => setFlipProgress1(animProgress1.current.value),
        onComplete: () => {
          setFlipProgress1(1);
          setTimeout(() => {
            isFlippingRef.current = false;
          }, 250);
        },
      });
    } else if (prevPage === 3) {
      gsap.to(animProgress2.current, {
        value: 0,
        duration: 1.15,
        ease: "power2.inOut",
        onUpdate: () => setFlipProgress2(animProgress2.current.value),
        onComplete: () => {
          setFlipProgress2(0);
          setTimeout(() => {
            isFlippingRef.current = false;
          }, 250);
        },
      });
    }
  }, []);

  const flipToPage3 = useCallback(() => {
    if (isFlippingRef.current || pageRef.current === 3) return;
    isFlippingRef.current = true;
    setPage(3);

    const innerRealm = document.getElementById("inner-realm");
    if (innerRealm) {
      const top = innerRealm.offsetTop;
      if (Math.abs(window.scrollY - top) > 15) {
        window.scrollTo({ top, behavior: "smooth" });
      }
    }

    gsap.killTweensOf([animProgress1.current, animProgress2.current]);
    animProgress1.current.value = 1;
    setFlipProgress1(1);

    gsap.to(animProgress2.current, {
      value: 1,
      duration: 1.15,
      ease: "power2.inOut",
      onUpdate: () => setFlipProgress2(animProgress2.current.value),
      onComplete: () => {
        setFlipProgress2(1);
        setTimeout(() => {
          isFlippingRef.current = false;
        }, 250);
      },
    });
  }, []);

  // SCROLL WHEEL LISTENER (Starts and locks until completion)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (activeSpaceRealm) return;

      if (isFlippingRef.current) {
        e.preventDefault();
        return;
      }

      const innerRealm = document.getElementById("inner-realm");
      if (innerRealm) {
        const rect = innerRealm.getBoundingClientRect();
        if (rect.top > 120) return;
      }

      if (pageRef.current === 1) {
        if (e.deltaY > 20) {
          e.preventDefault();
          flipToPage2();
        }
      } else if (pageRef.current === 2) {
        if (e.deltaY < -20) {
          e.preventDefault();
          flipToPage1();
        } else if (e.deltaY > 20) {
          e.preventDefault();
          flipToPage3();
        }
      } else if (pageRef.current === 3) {
        if (e.deltaY < -20) {
          e.preventDefault();
          flipToPage2();
        } else if (e.deltaY > 0) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeSpaceRealm, flipToPage1, flipToPage2, flipToPage3]);

  // TOUCH SWIPE GESTURES FOR MOBILE / TABLETS
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (activeSpaceRealm) return;
      if (isFlippingRef.current) {
        e.preventDefault();
        return;
      }

      const innerRealm = document.getElementById("inner-realm");
      if (innerRealm) {
        const rect = innerRealm.getBoundingClientRect();
        if (rect.top > 120) return;
      }

      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      if (pageRef.current === 1 && deltaY > 35) {
        e.preventDefault();
        flipToPage2();
      } else if (pageRef.current === 2) {
        if (deltaY < -35) {
          e.preventDefault();
          flipToPage1();
        } else if (deltaY > 35) {
          e.preventDefault();
          flipToPage3();
        }
      } else if (pageRef.current === 3 && deltaY < -35) {
        e.preventDefault();
        flipToPage2();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [activeSpaceRealm, flipToPage1, flipToPage2, flipToPage3]);

  // KEYBOARD ARROW NAVIGATION
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeSpaceRealm) return;
      if (isFlippingRef.current) return;

      const innerRealm = document.getElementById("inner-realm");
      if (innerRealm) {
        const rect = innerRealm.getBoundingClientRect();
        if (rect.top > 120) return;
      }

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (pageRef.current === 1) {
          e.preventDefault();
          flipToPage2();
        } else if (pageRef.current === 2) {
          e.preventDefault();
          flipToPage3();
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (pageRef.current === 3) {
          e.preventDefault();
          flipToPage2();
        } else if (pageRef.current === 2) {
          e.preventDefault();
          flipToPage1();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSpaceRealm, flipToPage1, flipToPage2, flipToPage3]);

  // Derived 3D rotation angles & visibility
  const flipAngle1 = flipProgress1 * 180; // 0 to 180 degrees
  const flipAngle2 = flipProgress2 * 180; // 0 to 180 degrees
  const isPage1Active = flipProgress1 < 0.5;
  const isPage2Active = flipProgress1 >= 0.5 && flipProgress2 < 0.5;
  const isPage3Active = flipProgress2 >= 0.5;

  // Handle physical camera dive into clicked card (Page 1 Realms or Page 2 Projects!)
  const handleCardClick = (realm: SpaceRealmInfo, e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlippingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setIsDiving(true);
    setActiveSpaceRealm({
      realm,
      originRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    });
  };

  const handleExitSpace = () => {
    setActiveSpaceRealm(null);
    setIsDiving(false);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#080605] overflow-hidden select-none"
    >
      {/* 3D BOOK STAGE WITH PERSPECTIVE */}
      <div
        style={{
          perspective: "2200px",
          perspectiveOrigin: "center 50%",
        }}
        className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#080605]"
      >
        {/* ========================================================================= */}
        {/* PAGE 3: GET IN TOUCH WITH ME (Deepest Layer, Revealed when Page 2 Flips) */}
        {/* ========================================================================= */}
        <div
          style={{
            transform: isDiving
              ? `translate3d(${offset.x}px, ${offset.y}px, 0) scale(0.92)`
              : `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1)`,
            filter: isDiving ? "blur(12px)" : "blur(0px)",
            opacity: isDiving ? 0.2 : 1,
            transition: isDiving
              ? "transform 0.32s cubic-bezier(0.55, 0.05, 0.67, 0.19), filter 0.25s ease, opacity 0.25s ease"
              : "transform 0.45s ease, filter 0.45s ease, opacity 0.45s ease",
            transformStyle: "preserve-3d",
            zIndex: 10,
          }}
          className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center px-4 sm:px-10 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 ${
            isPage3Active ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* Shading overlay that lightens as Page 2 flips up */}
          <div
            style={{
              opacity: Math.max(0, 1 - flipProgress2 * 1.5),
            }}
            className="absolute inset-0 bg-black/85 pointer-events-none z-10 transition-opacity"
          />

          {/* PAGE 3 - CORNER 1: TOP-LEFT HIGHLIGHT (Philosophy) */}
          <div className="absolute top-5 sm:top-8 md:top-10 left-5 sm:left-8 md:left-12 max-w-[260px] sm:max-w-[290px] md:max-w-[320px] p-3.5 sm:p-4 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 group transform rotate-[3.5deg] hover:rotate-[1deg]">
            <p className="text-xs sm:text-sm md:text-[15px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed">
              &ldquo;Crafting interactive worlds, robust web architectures &amp; immersive game simulations with precision.&rdquo;
            </p>
            <span className="block mt-2 text-[10px] sm:text-xs font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
              Zouhair Trafeh • Vision
            </span>
          </div>

          {/* PAGE 3 - CORNER 2: TOP-RIGHT HIGHLIGHT (Core Stack) */}
          <div className="absolute top-5 sm:top-8 md:top-10 right-5 sm:right-8 md:right-12 max-w-[260px] sm:max-w-[290px] md:max-w-[320px] p-3.5 sm:p-4 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 text-right group transform -rotate-[3.5deg] hover:-rotate-[1deg]">
            <p className="text-xs sm:text-sm md:text-[15px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed">
              &ldquo;Unity • C# • React.js • Next.js • Node.js • TypeScript • Tailwind CSS • GSAP&rdquo;
            </p>
            <span className="block mt-2 text-[10px] sm:text-xs font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
              Core Technical Stack
            </span>
          </div>

          {/* PAGE 3 - CORNER 3: BOTTOM-LEFT HIGHLIGHT (Formation & Bootcamps) */}
          <div className="absolute bottom-5 sm:bottom-8 md:bottom-10 left-5 sm:left-8 md:left-12 max-w-[260px] sm:max-w-[290px] md:max-w-[320px] p-3.5 sm:p-4 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 group transform -rotate-[3.5deg] hover:-rotate-[1deg]">
            <p className="text-xs sm:text-sm md:text-[15px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed">
              &ldquo;Game Development &amp; Design (Geeks Institute) • Digital Development Diploma (CMFP)&rdquo;
            </p>
            <span className="block mt-2 text-[10px] sm:text-xs font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
              Education &amp; Credentials
            </span>
          </div>

          {/* PAGE 3 - CORNER 4: BOTTOM-RIGHT HIGHLIGHT (Location & Readiness) */}
          <div className="absolute bottom-5 sm:bottom-8 md:bottom-10 right-5 sm:right-8 md:right-12 max-w-[260px] sm:max-w-[290px] md:max-w-[320px] p-3.5 sm:p-4 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 text-right group transform rotate-[3.5deg] hover:rotate-[1deg]">
            <p className="text-xs sm:text-sm md:text-[15px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed">
              &ldquo;Based in Casablanca, Morocco. Ready for innovative game studios and full-stack teams.&rdquo;
            </p>
            <span className="block mt-2 text-[10px] sm:text-xs font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
              Worldwide Availability
            </span>
          </div>

          {/* Return button to Page 2 (Projects) */}
          <button
            onClick={flipToPage2}
            className={`absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-full bg-[#120e0b]/90 border border-[#e2b069]/40 hover:border-[#e2b069] text-[#e2b069] hover:text-[#f4efe8] text-[10px] sm:text-xs font-[family-name:var(--font-serif)] tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_25px_rgba(226,176,105,0.35)] cursor-pointer flex items-center gap-2 ${
              isPage3Active ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <span className="text-xs">↶</span>
            <span>✦ Scroll Up or Click to Return to Projects</span>
          </button>

          {/* MAIN GET IN TOUCH CENTER STAGE */}
          <div className="relative z-20 max-w-4xl w-full flex flex-col items-center text-center p-6 sm:p-8 md:p-10 rounded-3xl bg-[#0e0a07]/90 border border-[#423223]/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1e1710]/90 border border-[#e2b069]/40 mb-3 shadow-[0_0_15px_rgba(226,176,105,0.2)]">
              <span className="text-[10px] sm:text-xs text-[#e2b069] font-[family-name:var(--font-serif)] tracking-[0.25em] uppercase font-bold">
                ✦ Let&apos;s Build Something Extraordinary ✦
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-[family-name:var(--font-decorative)] font-bold text-[#f4efe8] tracking-[0.08em] uppercase mb-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              Get In Touch With Me
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-[#e8ded1] font-sans max-w-xl mb-6 sm:mb-8 font-normal leading-relaxed">
              <span className="text-[#e2b069] font-medium">Zouhair Trafeh</span> — Développeur FullStack &amp; Game Developer. Open for game development projects, modern web platform engineering, and creative technical collaborations.
            </p>

            {/* 4 Responsive Contact Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full text-left">
              {/* Card 1: Direct Email */}
              <div className="p-4 rounded-2xl bg-[#150f0b]/90 border border-[#3b2a1a] hover:border-[#e2b069] transition-all duration-300 group shadow-lg flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#1f1710] border border-[#e2b069]/40 flex items-center justify-center text-[#e2b069] group-hover:scale-105 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-[family-name:var(--font-serif)] tracking-[0.2em] uppercase text-[#8c7b6b] block">
                      Email Address
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#f4efe8] group-hover:text-[#e2b069] transition-colors truncate block">
                      mouadtrafeh14@gmail.com
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#3b2a1a]/60">
                  <button
                    onClick={handleCopyEmail}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#1f1710] hover:bg-[#e2b069] text-[#e2b069] hover:text-black border border-[#e2b069]/30 text-[11px] font-[family-name:var(--font-serif)] tracking-wider uppercase font-semibold transition-all cursor-pointer text-center"
                  >
                    {copiedEmail ? "Copied! ✓" : "Copy Email"}
                  </button>
                  <a
                    href="mailto:mouadtrafeh14@gmail.com?subject=Project%20Inquiry%20-%20Zouhair%20Trafeh"
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#e2b069]/15 hover:bg-[#e2b069] text-[#e2b069] hover:text-black border border-[#e2b069]/40 text-[11px] font-[family-name:var(--font-serif)] tracking-wider uppercase font-semibold transition-all cursor-pointer text-center"
                  >
                    Send Mail ↗
                  </a>
                </div>
              </div>

              {/* Card 2: Phone & WhatsApp */}
              <div className="p-4 rounded-2xl bg-[#150f0b]/90 border border-[#3b2a1a] hover:border-[#e2b069] transition-all duration-300 group shadow-lg flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#1f1710] border border-[#e2b069]/40 flex items-center justify-center text-[#e2b069] group-hover:scale-105 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-[family-name:var(--font-serif)] tracking-[0.2em] uppercase text-[#8c7b6b] block">
                      Phone &amp; WhatsApp
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#f4efe8] group-hover:text-[#e2b069] transition-colors">
                      +212 6 08 83 60 80
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#3b2a1a]/60">
                  <a
                    href="https://wa.me/212608836080"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 text-[11px] font-[family-name:var(--font-serif)] tracking-wider uppercase font-semibold transition-all cursor-pointer text-center"
                  >
                    WhatsApp ↗
                  </a>
                  <a
                    href="tel:+212608836080"
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#1f1710] hover:bg-[#e2b069] text-[#e2b069] hover:text-black border border-[#e2b069]/30 text-[11px] font-[family-name:var(--font-serif)] tracking-wider uppercase font-semibold transition-all cursor-pointer text-center"
                  >
                    Call Directly
                  </a>
                </div>
              </div>

              {/* Card 3: Location */}
              <div className="p-4 rounded-2xl bg-[#150f0b]/90 border border-[#3b2a1a] hover:border-[#e2b069] transition-all duration-300 group shadow-lg flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1f1710] border border-[#e2b069]/40 flex items-center justify-center text-[#e2b069] group-hover:scale-105 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-[family-name:var(--font-serif)] tracking-[0.2em] uppercase text-[#8c7b6b] block">
                      Base Location
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#f4efe8] group-hover:text-[#e2b069] transition-colors">
                      Casablanca, Morocco
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-[#3b2a1a]/60 flex items-center justify-between text-[11px] text-[#cf8e32]">
                  <span>🟢 Available for Remote &amp; Hybrid Worldwide</span>
                </div>
              </div>

              {/* Card 4: Languages & Profiles */}
              <div className="p-4 rounded-2xl bg-[#150f0b]/90 border border-[#3b2a1a] hover:border-[#e2b069] transition-all duration-300 group shadow-lg flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-[family-name:var(--font-serif)] tracking-[0.2em] uppercase text-[#8c7b6b] block mb-2">
                    Languages &amp; Profiles
                  </span>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#1f1710] border border-[#e2b069]/30 text-[10px] font-[family-name:var(--font-serif)] text-[#e2b069]">
                      Arabic (Native)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#1f1710] border border-[#e2b069]/30 text-[10px] font-[family-name:var(--font-serif)] text-[#e2b069]">
                      French (Fluent)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#1f1710] border border-[#e2b069]/30 text-[10px] font-[family-name:var(--font-serif)] text-[#e2b069]">
                      English (Fluent)
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#3b2a1a]/60 flex items-center justify-between">
                  <a
                    href="https://github.com/b0tjake"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#e2b069] hover:underline flex items-center gap-1 font-[family-name:var(--font-serif)] tracking-wider"
                  >
                    <span>GitHub Profile</span>
                    <span>↗</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/trafehzouhair/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#e2b069] hover:underline flex items-center gap-1 font-[family-name:var(--font-serif)] tracking-wider"
                  >
                    <span>LinkedIn Profile</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Big Action CTA */}
            <a
              href="mailto:mouadtrafeh14@gmail.com?subject=Project%20Collaboration%20with%20Zouhair%20Trafeh"
              className="mt-6 sm:mt-7 px-8 py-3 rounded-full bg-gradient-to-r from-[#cf9232] via-[#e2b069] to-[#d97706] text-[#0a0705] text-xs sm:text-sm font-[family-name:var(--font-serif)] tracking-[0.25em] uppercase font-bold hover:shadow-[0_0_35px_rgba(226,176,105,0.7)] transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <span>✦ Send a Direct Message ✦</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 2: PROJECTS & PHILOSOPHY QUOTES (Middle Layer, Flips bottom-to-up)   */}
        {/* ========================================================================= */}
        <div
          style={{
            transformOrigin: "top center",
            transform: `rotateX(${flipAngle2}deg)`,
            transformStyle: "preserve-3d",
            willChange: "transform",
            zIndex: flipProgress2 < 0.5 ? 30 : 15,
          }}
          className={`absolute inset-0 w-full h-full ${
            isPage2Active ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* FRONT FACE OF PAGE 2 */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: isDiving
                ? `translate3d(${offset.x}px, ${offset.y}px, 0) scale(0.92)`
                : `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1)`,
              filter: isDiving ? "blur(12px)" : "blur(0px)",
              opacity: isDiving ? 0.2 : 1,
              transition: isDiving
                ? "transform 0.32s cubic-bezier(0.55, 0.05, 0.67, 0.19), filter 0.25s ease, opacity 0.25s ease"
                : "transform 0.45s ease, filter 0.45s ease, opacity 0.45s ease",
            }}
            className="absolute inset-0 w-full h-full bg-[#080605] flex items-center justify-center px-4 sm:px-12 md:px-20 lg:px-28 py-16 sm:py-20 md:py-24 border-b border-[#e2b069]/20"
          >
            {/* Casting Shadow from Page 1 over Page 2 that lightens as page 1 turns up */}
            <div
              style={{
                opacity: Math.max(0, 1 - flipProgress1 * 1.5),
              }}
              className="absolute inset-0 bg-black/80 pointer-events-none z-10 transition-opacity"
            />

            {/* Shading overlay that darkens Page 2 as it lifts up towards Page 3 */}
            <div
              style={{
                opacity: Math.min(0.85, flipProgress2 * 1.3),
              }}
              className="absolute inset-0 bg-black/60 pointer-events-none z-10 transition-opacity"
            />

            {/* PAGE 2 - CORNER 1: TOP-LEFT QUOTE (Pandora – God of War III) */}
            <div className="absolute top-5 sm:top-8 md:top-10 left-5 sm:left-8 md:left-12 max-w-[260px] sm:max-w-[300px] md:max-w-[340px] p-3.5 sm:p-4 md:p-5 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 group transform rotate-[4.5deg] hover:rotate-[1.5deg]">
              <p className="text-sm sm:text-base md:text-[20px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed">
                &ldquo;Hope is what makes us strong. It is why we are here. It is what we fight with when all else is lost.&rdquo;
              </p>
              <span className="block mt-2.5 sm:mt-3 text-xs sm:text-[13px] font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
                Pandora • God of War III
              </span>
            </div>

            {/* PAGE 2 - CORNER 2: TOP-RIGHT QUOTE (Arthur Morgan -- Red Dead Redemption 2) */}
            <div className="absolute top-5 sm:top-8 md:top-10 right-5 sm:right-8 md:right-12 max-w-[260px] sm:max-w-[300px] md:max-w-[340px] p-3.5 sm:p-4 md:p-5 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 text-right group transform -rotate-[4.5deg] hover:-rotate-[1.5deg]">
              <p className="text-sm sm:text-base md:text-[20px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed">
                &ldquo;Some trees flourish, others die. Ain&apos;t nothing fair, you know that.&rdquo;
              </p>
              <span className="block mt-2.5 sm:mt-3 text-xs sm:text-[13px] font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
                Arthur Morgan • Red Dead Redemption 2
              </span>
            </div>

            {/* PAGE 2 - CORNER 3: BOTTOM-LEFT QUOTE (Expedition 33) */}
            <div className="absolute bottom-5 sm:bottom-8 md:bottom-10 left-5 sm:left-8 md:left-12 max-w-[260px] sm:max-w-[300px] md:max-w-[340px] p-3.5 sm:p-4 md:p-5 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 group transform -rotate-[4.5deg] hover:-rotate-[1.5deg]">
              <p className="text-sm sm:text-base md:text-[20px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed whitespace-pre-line">
                &ldquo;Not all of us can change the world. Some of us can only change ourselves.&rdquo;
              </p>
              <span className="block mt-2.5 sm:mt-3 text-xs sm:text-[13px] font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
                Expedition 33
              </span>
            </div>

            {/* PAGE 2 - CORNER 4: BOTTOM-RIGHT QUOTE (Les Misérables - Victor Hugo) */}
            <div className="absolute bottom-5 sm:bottom-8 md:bottom-10 right-5 sm:right-8 md:right-12 max-w-[260px] sm:max-w-[300px] md:max-w-[340px] p-3.5 sm:p-4 md:p-5 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 text-right group transform rotate-[4.5deg] hover:rotate-[1.5deg]">
              <p className="text-sm sm:text-base md:text-[20px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed whitespace-pre-line">
                &ldquo;To love or have loved, that is enough. Ask nothing further. There is no other pearl to be found in the dark folds of life.&rdquo;
              </p>
              <span className="block mt-2.5 sm:mt-3 text-xs sm:text-[13px] font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
                Victor Hugo • Les Misérables
              </span>
            </div>

            {/* PAGE 2 - 2 IMAGES IN CENTER: 9:16 DEFAULT -> 10:16 ON HOVER (CLICK TO DIVE INTO SPACE!) */}
            <div className="relative z-20 flex flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12 w-full max-w-4xl mx-auto h-[44vh] sm:h-[50vh] md:h-[56vh] max-h-[540px] overflow-x-auto sm:overflow-visible">
              {projects.map((project, index) => {
                const isHovered = hoveredProjectIndex === index;
                return (
                  <div
                    key={project.id}
                    onMouseEnter={() => setHoveredProjectIndex(index)}
                    onMouseLeave={() => setHoveredProjectIndex(null)}
                    onClick={(e) => handleCardClick(project, e)}
                    style={{
                      aspectRatio: isHovered ? "10 / 16" : "9 / 16",
                      transition:
                        "aspect-ratio 0.45s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease, box-shadow 0.3s ease",
                    }}
                    className={`relative group/card h-full w-auto max-w-full rounded-2xl overflow-hidden cursor-pointer border shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex-shrink-0 ${
                      isHovered
                        ? "border-[#e2b069] shadow-[0_0_35px_rgba(226,176,105,0.45)] z-30"
                        : "border-[#382a1d]/80 z-20"
                    }`}
                  >
                    {/* 9:16 Project Image */}
                    <img
                      src={project.cover}
                      alt={project.title}
                      className="w-full h-full object-cover object-center pointer-events-none"
                    />

                    {/* HOVER EXPLANATORY TEXT OVERLAY (Just the same way as Page 1) */}
                    <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 md:p-5 flex flex-col justify-end bg-gradient-to-t from-[#080605] via-[#080605]/85 to-transparent z-10 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/card:translate-y-0 select-none">
                      <span className="text-[11px] sm:text-xs font-[family-name:var(--font-serif)] font-bold tracking-[0.2em] uppercase text-[#e2b069] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {project.id === "gaming-projects" ? "Video Games Projects" : "Web Projects"}
                      </span>
                      <p className="mt-1 text-xs sm:text-[13px] text-[#f4efe8] font-sans font-normal leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        {project.explanation}
                      </p>
                      <span className="mt-2 text-[9px] font-[family-name:var(--font-serif)] tracking-[0.15em] uppercase text-[#e2b069] flex items-center gap-1 font-semibold drop-shadow-[0_0_6px_rgba(226,176,105,0.6)]">
                        <span>✦ Click to dive inside</span>
                        <span>↗</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Return button indicator to return to Page 1 */}
            <button
              onClick={flipToPage1}
              className={`absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-full bg-[#120e0b]/90 border border-[#e2b069]/40 hover:border-[#e2b069] text-[#e2b069] hover:text-[#f4efe8] text-[10px] sm:text-xs font-[family-name:var(--font-serif)] tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_25px_rgba(226,176,105,0.35)] cursor-pointer flex items-center gap-2 ${
                isPage2Active ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <span className="text-xs">↶</span>
              <span>✦ Scroll Up or Click to Return to Realms</span>
            </button>

            {/* Forward button to Page 3 (Get in touch) */}
            <button
              onClick={flipToPage3}
              className={`absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-full bg-[#120e0b]/90 border border-[#e2b069]/40 hover:border-[#e2b069] text-[#e2b069] hover:text-[#f4efe8] text-[10px] sm:text-xs font-[family-name:var(--font-serif)] tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_25px_rgba(226,176,105,0.35)] cursor-pointer flex items-center gap-2 ${
                isPage2Active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              <span>✦ Scroll Down or Click to Get in Touch</span>
              <span className="text-xs animate-bounce">↷</span>
            </button>
          </div>

          {/* BACK FACE OF PAGE 2 */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateX(180deg)",
            }}
            className="absolute inset-0 w-full h-full bg-[#0a0705] border-t border-[#3b2a1a] shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col items-center justify-center p-8 select-none"
          >
            <div className="w-24 h-24 rounded-full border border-[#e2b069]/25 flex items-center justify-center shadow-[0_0_30px_rgba(226,176,105,0.1)]">
              <span className="text-2xl text-[#e2b069]/40">✦</span>
            </div>
            <span className="mt-4 text-xs font-[family-name:var(--font-serif)] tracking-[0.3em] uppercase text-[#e2b069]/40 font-semibold">
              Antigravity Archives • Projects
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 1: 4 REALMS & LYRICS (Hinged at top, flips upward: rotateX 0 -> 180)  */}
        {/* ========================================================================= */}
        <div
          style={{
            transformOrigin: "top center",
            transform: `rotateX(${flipAngle1}deg)`,
            transformStyle: "preserve-3d",
            willChange: "transform",
            zIndex: flipProgress1 < 0.5 ? 40 : 20,
          }}
          className={`absolute inset-0 w-full h-full ${
            isPage1Active ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* FRONT FACE OF PAGE 1 */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: isDiving
                ? `translate3d(${offset.x}px, ${offset.y}px, 0) scale(0.92)`
                : `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1)`,
              filter: isDiving ? "blur(12px)" : "blur(0px)",
              opacity: isDiving ? 0.2 : 1,
              transition: isDiving
                ? "transform 0.32s cubic-bezier(0.55, 0.05, 0.67, 0.19), filter 0.25s ease, opacity 0.25s ease"
                : "transform 0.45s ease, filter 0.45s ease, opacity 0.45s ease",
            }}
            className="absolute inset-0 w-full h-full bg-[#080605] flex items-center justify-center px-4 sm:px-12 md:px-20 lg:px-28 py-16 sm:py-20 md:py-24 border-b border-[#e2b069]/20"
          >
            {/* Shading overlay that darkens Page 1 as it lifts up */}
            <div
              style={{
                opacity: Math.min(0.85, flipProgress1 * 1.3),
              }}
              className="absolute inset-0 bg-black/60 pointer-events-none z-10 transition-opacity"
            />

            {/* PAGE 1 - CORNER 1: TOP-LEFT QUOTE (Stromae) */}
            <div className="absolute top-5 sm:top-8 md:top-10 left-5 sm:left-8 md:left-12 max-w-[260px] sm:max-w-[300px] md:max-w-[340px] p-3.5 sm:p-4 md:p-5 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 group transform rotate-[4.5deg] hover:rotate-[1.5deg]">
              <p className="text-sm sm:text-base md:text-[20px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed">
                &ldquo;Plutôt qu&apos;être seul, mieux vaut être mal accompagné&rdquo;
              </p>
              <span className="block mt-2.5 sm:mt-3 text-xs sm:text-[13px] font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
                Stromae • Ma Meilleure Ennemie
              </span>
            </div>

            {/* PAGE 1 - CORNER 2: TOP-RIGHT QUOTE (Linkin Park) */}
            <div className="absolute top-5 sm:top-8 md:top-10 right-5 sm:right-8 md:right-12 max-w-[260px] sm:max-w-[300px] md:max-w-[340px] p-3.5 sm:p-4 md:p-5 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 text-right group transform -rotate-[4.5deg] hover:-rotate-[1.5deg]">
              <p className="text-sm sm:text-base md:text-[20px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed">
                &ldquo;Breakin&apos; our backs for a pile of sand, just to have it all fallin&apos; out of our hands. Maybe it all gets lost in the end.&rdquo;
              </p>
              <span className="block mt-2.5 sm:mt-3 text-xs sm:text-[13px] font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
                Linkin Park • Let You Fade
              </span>
            </div>

            {/* PAGE 1 - CORNER 3: BOTTOM-LEFT QUOTE (System of a Down) */}
            <div className="absolute bottom-5 sm:bottom-8 md:bottom-10 left-5 sm:left-8 md:left-12 max-w-[260px] sm:max-w-[300px] md:max-w-[340px] p-3.5 sm:p-4 md:p-5 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 group transform -rotate-[4.5deg] hover:-rotate-[1.5deg]">
              <p className="text-sm sm:text-base md:text-[20px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed whitespace-pre-line">
                &ldquo;And if you go, I wanna go with you&#10;And if you die, I wanna die with you&#10;Take your hand and walk away&rdquo;
              </p>
              <span className="block mt-2.5 sm:mt-3 text-xs sm:text-[13px] font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
                System of a Down • Lonely Day
              </span>
            </div>

            {/* PAGE 1 - CORNER 4: BOTTOM-RIGHT QUOTE (Stormy) */}
            <div className="absolute bottom-5 sm:bottom-8 md:bottom-10 right-5 sm:right-8 md:right-12 max-w-[260px] sm:max-w-[300px] md:max-w-[340px] p-3.5 sm:p-4 md:p-5 rounded-2xl bg-[#120e0b]/90 border border-[#423223]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:border-[#cf9232]/80 transition-all duration-300 z-0 text-right group transform rotate-[4.5deg] hover:rotate-[1.5deg]">
              <p className="text-sm sm:text-base md:text-[20px] text-[#f4efe8] font-[family-name:var(--font-manuscript)] italic leading-relaxed whitespace-pre-line">
                &ldquo;Ma3lich la mchiti f chouk&#10;Ghdwa tri9 iwelli zine&#10;Tanta tfere7 wjeh l mima l7zine&rdquo;
              </p>
              <span className="block mt-2.5 sm:mt-3 text-xs sm:text-[13px] font-[family-name:var(--font-serif)] font-bold tracking-[0.16em] uppercase text-[#cf7232]">
                Stormy • Si Tu Savais
              </span>
            </div>

            {/* PAGE 1 - 4 IMAGES IN CENTER: 9:16 DEFAULT -> 10:16 ON HOVER */}
            <div className="relative z-20 flex flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5 w-full max-w-5xl mx-auto h-[44vh] sm:h-[50vh] md:h-[56vh] max-h-[540px] overflow-x-auto sm:overflow-visible">
              {realms.map((realm, index) => {
                const isHovered = hoveredIndex === index;
                return (
                  <div
                    key={realm.id}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={(e) => handleCardClick(realm, e)}
                    style={{
                      aspectRatio: isHovered ? "10 / 16" : "9 / 16",
                      transition:
                        "aspect-ratio 0.45s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease, box-shadow 0.3s ease",
                    }}
                    className={`relative group/card h-full w-auto max-w-full rounded-2xl overflow-hidden cursor-pointer border shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex-shrink-0 ${
                      isHovered
                        ? "border-[#e2b069] shadow-[0_0_35px_rgba(226,176,105,0.45)] z-30"
                        : "border-[#382a1d]/80 z-20"
                    }`}
                  >
                    {/* 9:16 Image */}
                    <img
                      src={realm.cover}
                      alt={realm.title}
                      className="w-full h-full object-cover object-center pointer-events-none"
                    />

                    {/* HOVER EXPLANATORY TEXT OVERLAY */}
                    <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 md:p-5 flex flex-col justify-end bg-gradient-to-t from-[#080605] via-[#080605]/85 to-transparent z-10 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/card:translate-y-0 select-none">
                      <span className="text-[11px] sm:text-xs font-[family-name:var(--font-serif)] font-bold tracking-[0.2em] uppercase text-[#e2b069] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {realm.title}
                      </span>
                      <p className="mt-1 text-xs sm:text-[13px] text-[#f4efe8] font-sans font-normal leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        {realm.explanation}
                      </p>
                      <span className="mt-2 text-[9px] font-[family-name:var(--font-serif)] tracking-[0.15em] uppercase text-[#e2b069] flex items-center gap-1 font-semibold drop-shadow-[0_0_6px_rgba(226,176,105,0.6)]">
                        <span>✦ Click to dive inside</span>
                        <span>↗</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Turn Page Button Indicator */}
            <button
              onClick={flipToPage2}
              className={`absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-full bg-[#120e0b]/90 border border-[#e2b069]/40 hover:border-[#e2b069] text-[#e2b069] hover:text-[#f4efe8] text-[10px] sm:text-xs font-[family-name:var(--font-serif)] tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_25px_rgba(226,176,105,0.35)] cursor-pointer flex items-center gap-2 ${
                isPage1Active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              <span>✦ Scroll Down or Click to Flip Page</span>
              <span className="text-xs animate-bounce">↷</span>
            </button>
          </div>

          {/* BACK FACE OF PAGE 1 (Luxury Parchment Backside visible as it folds upward over top) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateX(180deg)",
            }}
            className="absolute inset-0 w-full h-full bg-[#0a0705] border-t border-[#3b2a1a] shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col items-center justify-center p-8 select-none"
          >
            <div className="w-24 h-24 rounded-full border border-[#e2b069]/25 flex items-center justify-center shadow-[0_0_30px_rgba(226,176,105,0.1)]">
              <span className="text-2xl text-[#e2b069]/40">✦</span>
            </div>
            <span className="mt-4 text-xs font-[family-name:var(--font-serif)] tracking-[0.3em] uppercase text-[#e2b069]/40 font-semibold">
              Antigravity Archives
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CAMERA DIVE PLUNGE -> LIGHT-SPEED WARP TRAVEL -> MILKY WAY DEEP SPACE  */}
      {/*    (Works seamlessly for both Page 1 Realms and Page 2 Projects!)        */}
      {/* ========================================================================= */}
      {activeSpaceRealm && (
        <MilkyWaySpace
          realm={activeSpaceRealm.realm}
          originRect={activeSpaceRealm.originRect}
          onExit={handleExitSpace}
        />
      )}
    </section>
  );
}
