"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

export interface SpaceMediaItem {
  name: string;
  title: string;
  path: string;
  isVideo?: boolean;
  noImage?: boolean;
  link?: string;
  description?: string;
}

export interface SpaceRealmInfo {
  id: string;
  title: string;
  subtitle: string;
  explanation: string;
  description: string;
  cover: string;
  media: SpaceMediaItem[];
}

export interface OriginRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface MilkyWaySpaceProps {
  realm: SpaceRealmInfo;
  originRect?: OriginRect | null;
  onExit: () => void;
}

interface Waypoint {
  x: number;
  y: number;
  side: "left" | "right";
  mediaIndex: number;
}

export default function MilkyWaySpace({ realm, originRect, onExit }: MilkyWaySpaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);

  // States
  const [diveCompleted, setDiveCompleted] = useState(false);
  const [isDiving, setIsDiving] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [openedVideo, setOpenedVideo] = useState<SpaceMediaItem | null>(null);

  // Speed & Travel Controls for Three.js Stars
  const targetTravelSpeedRef = useRef(175); // Initial warp speed (surpassing stars at high velocity!)
  const currentTravelSpeedRef = useRef(140);
  const prevDistRef = useRef(0);

  // Friend Star Intro & Writing States:
  // 'waiting' -> 'jumping' -> 'writing' -> 'centering' -> 'journey'
  const [introPhase, setIntroPhase] = useState<"waiting" | "jumping" | "writing" | "centering" | "journey">("waiting");
  const [jumpProgress, setJumpProgress] = useState(0); // 0 to 1 for jump bounce
  const [revealedLettersCount, setRevealedLettersCount] = useState(0);

  // Star & Constellation Coordinates
  const [starPos, setStarPos] = useState({ x: 55, y: 75 });
  const [cameraY, setCameraY] = useState(0);
  const [drawnLength, setDrawnLength] = useState(0);
  const [totalPathLength, setTotalPathLength] = useState(1);
  const [activeWaypointIndices, setActiveWaypointIndices] = useState<Set<number>>(new Set());

  // Window Dimensions
  const [dimensions, setDimensions] = useState({
    screenW: typeof window !== "undefined" ? window.innerWidth : 1920,
    screenH: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  const titleLetters = realm.title.toUpperCase().split("");

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        screenW: window.innerWidth,
        screenH: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cardRect: OriginRect = originRect || {
    top: dimensions.screenH / 2 - 220,
    left: dimensions.screenW / 2 - 125,
    width: 250,
    height: 440,
  };

  const cardCenterX = cardRect.left + cardRect.width / 2;
  const cardCenterY = cardRect.top + cardRect.height / 2;
  const screenCenterX = dimensions.screenW / 2;
  const screenCenterY = dimensions.screenH / 2;
  const deltaX = screenCenterX - cardCenterX;
  const deltaY = screenCenterY - cardCenterY;

  // 1. Initial Dive -> Hyperspace Travel (Surpassing Stars at Warp Speed!) -> Settle into Deep Space
  useEffect(() => {
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        setIsDiving(true);
      });
      return () => cancelAnimationFrame(frame2);
    });

    // At 280ms: Plunge punches through into Hyperspace Travel!
    const warpTimer = setTimeout(() => {
      setDiveCompleted(true);
      targetTravelSpeedRef.current = 175; // Accelerate into warp speed!
    }, 280);

    // At 1250ms: Decelerate smoothly out of warp into deep space
    const decelerateTimer = setTimeout(() => {
      targetTravelSpeedRef.current = 0.03; // Calm drift speed
    }, 1250);

    // At 1750ms: Space settles -> Friend Star awakens, jumps, and starts writing!
    const jumpTimer = setTimeout(() => {
      setIntroPhase("jumping");
    }, 1750);

    return () => {
      cancelAnimationFrame(frame1);
      clearTimeout(warpTimer);
      clearTimeout(decelerateTimer);
      clearTimeout(jumpTimer);
    };
  }, []);

  // 2. Friend Star Jump Animation in Top-Left (1750ms -> 2250ms)
  useEffect(() => {
    if (introPhase !== "jumping") return;

    let startTime = performance.now();
    const duration = 500;
    let animId: number;

    const animateJump = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setJumpProgress(progress);

      if (progress < 1) {
        animId = requestAnimationFrame(animateJump);
      } else {
        setIntroPhase("writing");
      }
    };

    animId = requestAnimationFrame(animateJump);
    return () => cancelAnimationFrame(animId);
  }, [introPhase]);

  // 3. Friend Star Writes the Title in Top-Left Letter-by-Letter
  useEffect(() => {
    if (introPhase !== "writing") return;

    let currentLetter = 0;
    const letterInterval = setInterval(() => {
      currentLetter += 1;
      setRevealedLettersCount(currentLetter);

      // Star coordinates during letter writing in top-left
      const startX = 55;
      const startY = 75;
      const letterWidth = dimensions.screenW < 640 ? 18 : 28;
      const currentX = startX + currentLetter * letterWidth;
      const currentY = startY + Math.sin((currentLetter * Math.PI) / 2) * 6;

      setStarPos({ x: currentX, y: currentY });

      if (currentLetter >= titleLetters.length) {
        clearInterval(letterInterval);
        // Star finishes writing: pause briefly, then animate to center as title disappears!
        setTimeout(() => {
          setIntroPhase("centering");
        }, 450);
      }
    }, 85);

    return () => clearInterval(letterInterval);
  }, [introPhase, titleLetters.length, dimensions.screenW]);

  // 4. "after study disappear, animate it to the center of the page the whole page"
  useEffect(() => {
    if (introPhase !== "centering") return;

    const startX = starPos.x;
    const startY = starPos.y;
    const targetX = dimensions.screenW / 2;
    const targetY = 160;

    let startTime = performance.now();
    const duration = 750;
    let animId: number;

    const animateCentering = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth celestial ease-out
      const ease = 1 - Math.pow(1 - progress, 3);

      const curX = startX + (targetX - startX) * ease;
      const curY = startY + (targetY - startY) * ease;
      setStarPos({ x: curX, y: curY });

      if (progress < 1) {
        animId = requestAnimationFrame(animateCentering);
      } else {
        setStarPos({ x: targetX, y: targetY });
        setIntroPhase("journey");
      }
    };

    animId = requestAnimationFrame(animateCentering);
    return () => cancelAnimationFrame(animId);
  }, [introPhase, dimensions.screenW]);

  // 5. Waypoints & S-Curve Trajectory (CENTERED ON THE PAGE!)
  const isCompact = dimensions.screenW < 960;

  // Star and Trajectory Start in the Center of the Page!
  const startWaypoint = {
    x: dimensions.screenW / 2,
    y: 160,
  };

  // Determine if this realm has extensive detailed content (like Web Projects or long descriptions)
  const hasLongContent =
    realm.id === "web-projects" ||
    realm.media.some((m) => (m.description?.length || 0) > 280);

  // Dynamic responsive spacing between milestones to guarantee cards never overlap or penetrate each other
  // Web Projects has long technical descriptions + live website link buttons, requiring proper breathing room
  const cardSpacing = isCompact
    ? hasLongContent
      ? 900
      : 800
    : hasLongContent
    ? 820
    : 720;

  const titleOffset = 180;
  const centerLine = dimensions.screenW / 2;
  const desktopAmplitude = Math.min(160, Math.max(70, (dimensions.screenW - 960) * 0.18 + 70));

  // Alternating milestones down the center axis: Right -> Left -> Right -> Left
  const waypoints: Waypoint[] = realm.media.map((_, idx) => {
    const isEven = idx % 2 === 0;
    const side: "left" | "right" = isEven ? "right" : "left";
    const x = isCompact
      ? isEven
        ? centerLine + 25
        : centerLine - 25
      : isEven
      ? centerLine + desktopAmplitude
      : centerLine - desktopAmplitude;
    const y = titleOffset + idx * cardSpacing + 300;

    return { x, y, side, mediaIndex: idx };
  });

  const endWaypoint = {
    x: dimensions.screenW / 2,
    y: titleOffset + realm.media.length * cardSpacing + 260,
  };

  // Build smooth cubic Bezier S-curve string starting from Center -> Right -> Left -> Center
  let trajectoryPathD = `M ${startWaypoint.x} ${startWaypoint.y}`;
  const allPoints = [startWaypoint, ...waypoints, endWaypoint];
  for (let i = 1; i < allPoints.length; i++) {
    const prev = allPoints[i - 1];
    const curr = allPoints[i];
    const midY = (prev.y + curr.y) / 2;
    trajectoryPathD += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }

  // Measure path length
  useEffect(() => {
    if (svgPathRef.current) {
      try {
        const length = svgPathRef.current.getTotalLength();
        if (length > 0) {
          setTotalPathLength(length);
        }
      } catch {}
    }
  }, [trajectoryPathD, dimensions]);

  // Handle Exit with smooth fade back to vaults
  const handleExit = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      onExit();
    }, 450);
  }, [exiting, onExit]);

  // 6. SCROLL WHEEL & TOUCH DIRECTLY CONTROL THE STAR & LINE
  const targetDistanceRef = useRef(0);
  const currentDistanceRef = useRef(0);
  const currentCameraYRef = useRef(0);
  const touchStartYRef = useRef(0);
  const pullDownAccumulatorRef = useRef(0);

  useEffect(() => {
    let initialTouchY = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // If still in intro phase:
      if (introPhase !== "journey") {
        if (e.deltaY < -20) {
          handleExit();
        } else if (e.deltaY > 20) {
          setIntroPhase("journey");
        }
        return;
      }

      // Scrolling up at the top of space journey -> exit back to previous page!
      if ((currentDistanceRef.current <= 40 || targetDistanceRef.current <= 15) && e.deltaY < -20) {
        handleExit();
        return;
      }
      const step = e.deltaY * 0.85;
      targetDistanceRef.current = Math.min(
        totalPathLength,
        Math.max(0, targetDistanceRef.current + step)
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      initialTouchY = e.touches[0].clientY;
      pullDownAccumulatorRef.current = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const delta = touchStartYRef.current - e.touches[0].clientY;
      touchStartYRef.current = e.touches[0].clientY;

      if (introPhase !== "journey") {
        // Pulling down during intro exits back
        if (delta < -12) {
          pullDownAccumulatorRef.current += Math.abs(delta);
          if (pullDownAccumulatorRef.current > 35) {
            handleExit();
          }
        }
        return;
      }

      // When at or near the beginning (delta < 0 is pulling downwards / scrolling up)
      if ((targetDistanceRef.current <= 30 || currentDistanceRef.current <= 60) && delta < -6) {
        pullDownAccumulatorRef.current += Math.abs(delta);
        if (pullDownAccumulatorRef.current > 35) {
          handleExit();
          return;
        }
      } else if (delta > 0) {
        pullDownAccumulatorRef.current = 0;
      }

      targetDistanceRef.current = Math.min(
        totalPathLength,
        Math.max(0, targetDistanceRef.current + delta * 2.2)
      );
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const totalDelta = initialTouchY - e.changedTouches[0].clientY;

      if (introPhase !== "journey") {
        if (totalDelta < -35) {
          handleExit();
        }
        return;
      }

      // Swiping down (scrolling up) at or near the top of space journey -> exit back to previous page!
      if (totalDelta < -35) {
        if (targetDistanceRef.current <= 50 || currentDistanceRef.current <= 80) {
          handleExit();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        targetDistanceRef.current = Math.min(totalPathLength, targetDistanceRef.current + 150);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (targetDistanceRef.current <= 35 || currentDistanceRef.current <= 50) {
          handleExit();
        } else {
          targetDistanceRef.current = Math.max(0, targetDistanceRef.current - 150);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [introPhase, totalPathLength, handleExit]);

  // Animation frame loop: Lock star to exact tip of line & smoothly track camera + travel speed
  useEffect(() => {
    let animId: number;

    const animateStarAndCamera = () => {
      if (introPhase === "journey" && svgPathRef.current && totalPathLength > 1) {
        const dx = targetDistanceRef.current - currentDistanceRef.current;
        currentDistanceRef.current += dx * 0.12;

        const dist = Math.min(totalPathLength, Math.max(0, currentDistanceRef.current));
        setDrawnLength(dist);

        // Surpassing stars while scrolling: calculate scroll delta velocity!
        const scrollDelta = Math.abs(currentDistanceRef.current - prevDistRef.current);
        prevDistRef.current = currentDistanceRef.current;

        if (scrollDelta > 0.08) {
          // Accelerate stars so you surpass them as you scroll down the constellation!
          targetTravelSpeedRef.current = Math.min(22, 0.03 + scrollDelta * 0.45);
        } else {
          targetTravelSpeedRef.current = 0.03; // Gentle drift when idle
        }

        try {
          // The star is ALWAYS at the exact tip of the line
          const pt = svgPathRef.current.getPointAtLength(dist);
          setStarPos({ x: pt.x, y: pt.y });

          // Smooth Camera tracking down the center of the page
          const targetCamY = Math.max(0, pt.y - dimensions.screenH * 0.42);
          currentCameraYRef.current += (targetCamY - currentCameraYRef.current) * 0.09;
          setCameraY(currentCameraYRef.current);

          // Activate waypoints as star reaches/passes them
          const activeSet = new Set<number>();
          waypoints.forEach((wp, idx) => {
            if (pt.y >= wp.y - 60) {
              activeSet.add(idx);
            }
          });
          setActiveWaypointIndices(activeSet);
        } catch {}
      }

      animId = requestAnimationFrame(animateStarAndCamera);
    };

    animId = requestAnimationFrame(animateStarAndCamera);
    return () => cancelAnimationFrame(animId);
  }, [introPhase, totalPathLength, waypoints, dimensions.screenH]);

  // Keyboard shortcut (Escape) to return to vaults or close video
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openedVideo) {
          setOpenedVideo(null);
        } else {
          handleExit();
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [openedVideo]);

  // 7. Three.js Background Canvas (Stars that you SURPASS at Warp Speed & While Scrolling!)
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020104, 0.0016);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 2500);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // 600 Stars: in front, around, and passing behind the camera
    const STAR_COUNT = 600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starColors = new Float32Array(STAR_COUNT * 3);
    const starVelocities = new Float32Array(STAR_COUNT);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xfff8ee),
      new THREE.Color(0xfde047),
      new THREE.Color(0xfef08a),
      new THREE.Color(0xf59e0b),
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      const radius = THREE.MathUtils.randFloat(3, 170);
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);

      starPositions[i * 3] = Math.cos(angle) * radius;
      starPositions[i * 3 + 1] = Math.sin(angle) * radius;
      starPositions[i * 3 + 2] = THREE.MathUtils.randFloat(-1300, 100);
      starVelocities[i] = THREE.MathUtils.randFloat(0.5, 1.2);

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const createStarTexture = () => {
      const cvs = document.createElement("canvas");
      cvs.width = 32;
      cvs.height = 32;
      const ctx = cvs.getContext("2d")!;
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.25, "rgba(255, 248, 230, 0.85)");
      grad.addColorStop(0.5, "rgba(230, 200, 150, 0.15)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
      return new THREE.CanvasTexture(cvs);
    };

    const starMaterial = new THREE.PointsMaterial({
      size: 1.0,
      map: createStarTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Subtle Amber Nebulae Dust Cloud
    const CLOUD_COUNT = 60;
    const cloudGeo = new THREE.BufferGeometry();
    const cloudPos = new Float32Array(CLOUD_COUNT * 3);
    const cloudCol = new Float32Array(CLOUD_COUNT * 3);
    const dustColors = [new THREE.Color(0xd97706), new THREE.Color(0xb45309), new THREE.Color(0x92400e)];

    for (let i = 0; i < CLOUD_COUNT; i++) {
      const t = THREE.MathUtils.randFloatSpread(650);
      cloudPos[i * 3] = t + THREE.MathUtils.randFloatSpread(130);
      cloudPos[i * 3 + 1] = t * 0.42 + THREE.MathUtils.randFloatSpread(150);
      cloudPos[i * 3 + 2] = THREE.MathUtils.randFloat(-900, 50);

      const col = dustColors[Math.floor(Math.random() * dustColors.length)];
      cloudCol[i * 3] = col.r;
      cloudCol[i * 3 + 1] = col.g;
      cloudCol[i * 3 + 2] = col.b;
    }

    cloudGeo.setAttribute("position", new THREE.BufferAttribute(cloudPos, 3));
    cloudGeo.setAttribute("color", new THREE.BufferAttribute(cloudCol, 3));

    const cloudMaterial = new THREE.PointsMaterial({
      size: 10,
      map: createStarTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dustCloud = new THREE.Points(cloudGeo, cloudMaterial);
    scene.add(dustCloud);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    window.addEventListener("resize", handleResize);

    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Smooth travel speed interpolation
      const targetSpeed = targetTravelSpeedRef.current;
      currentTravelSpeedRef.current += (targetSpeed - currentTravelSpeedRef.current) * 0.055;
      const speed = currentTravelSpeedRef.current;

      const positions = starGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < STAR_COUNT; i++) {
        const idx = i * 3 + 2;
        // Move star forward along Z axis toward and PAST the camera lens!
        positions[idx] += speed * starVelocities[i];

        // When a star passes z = 120 (behind camera at z=100), you have SURPASSED IT!
        if (positions[idx] > 120) {
          positions[idx] = -1250; // Wrap around to far deep space ahead
          const radius = THREE.MathUtils.randFloat(3, 170);
          const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = Math.sin(angle) * radius;
        }
      }
      starGeometry.attributes.position.needsUpdate = true;

      // Dynamic FOV and particle size during Warp Travel & Scrolling
      if (speed > 8) {
        starMaterial.size = Math.min(2.0, 1.0 + speed * 0.005);
        camera.fov = Math.min(84, 65 + speed * 0.1);
      } else {
        starMaterial.size = 1.0;
        camera.fov = 65;
      }
      camera.updateProjectionMatrix();

      // Parallax scroll depth tracking
      camera.position.y = currentCameraYRef.current * 0.035;

      starField.rotation.z += 0.00006;
      dustCloud.rotation.z += 0.00004;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      cloudGeo.dispose();
      cloudMaterial.dispose();
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-[#020104] transition-opacity duration-500 select-none ${
        exiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* 3D WebGL Canvas in Background (Stars flying past you as you travel!) */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* 1. DIRECT DIVE INTO THE IMAGE (0ms -> 280ms)                              */}
      {/* ========================================================================= */}
      {!diveCompleted && (
        <div
          className="pointer-events-none fixed z-50 overflow-hidden"
          style={{
            top: `${cardRect.top}px`,
            left: `${cardRect.left}px`,
            width: `${cardRect.width}px`,
            height: `${cardRect.height}px`,
            transformOrigin: "center center",
            transform: isDiving
              ? `translate3d(${deltaX}px, ${deltaY}px, 0) scale(48)`
              : "translate3d(0, 0, 0) scale(1)",
            borderRadius: isDiving ? "0px" : "1rem",
            opacity: isDiving ? 0 : 1,
            transition: isDiving
              ? "transform 0.28s cubic-bezier(0.55, 0.05, 0.67, 0.19), border-radius 0.12s ease, opacity 0.14s ease 0.18s"
              : "none",
          }}
        >
          <img
            src={realm.cover}
            alt={realm.title}
            className="w-full h-full object-cover object-center"
            style={{
              transform: isDiving ? "scale(5.0)" : "scale(1)",
              filter: isDiving ? "brightness(1.6) contrast(1.15)" : "brightness(1)",
              transition: isDiving
                ? "transform 0.28s cubic-bezier(0.55, 0.05, 0.67, 0.19), filter 0.28s ease"
                : "none",
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* FIXED TOP HEADER (Return Button & Status)                                 */}
      {/* ========================================================================= */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-10 py-3 sm:py-5 pointer-events-none">
        <div className="pointer-events-auto">
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#120e0b]/90 hover:bg-[#1a1410] border border-[#e2b069]/40 hover:border-[#e2b069] text-[#e2b069] hover:text-[#f4efe8] transition-all duration-300 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-[10px] sm:text-xs font-[family-name:var(--font-serif)] tracking-[0.2em] uppercase cursor-pointer active:scale-95"
          >
            <span>↶</span>
            <span>
              {realm.id === "gaming-projects" || realm.id === "web-projects"
                ? "Return To Projects"
                : "Return To Me Page"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#140f0b]/85 border border-[#423223]/60 backdrop-blur-md">
          <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#e2b069] shadow-[0_0_8px_#e2b069] animate-pulse" />
          <span className="text-[9px] sm:text-[10px] font-[family-name:var(--font-serif)] tracking-[0.2em] uppercase text-[#d8c8b4]">
            {introPhase === "journey" ? "Swipe Down to Exit • Up to Travel" : "Light-Speed Space Travel"}
          </span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CINEMATIC CONSTELLATION STAGE (Panned smoothly by Camera Y)            */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 w-full pointer-events-none z-20"
        style={{
          transform: `translate3d(0, ${-cameraY}px, 0)`,
          willChange: "transform",
        }}
      >
        {/* ===================================================================== */}
        {/* TOP-LEFT -> DISSOLVES TO CENTER: TITLE WRITTEN BY FRIEND STAR        */}
        {/* ===================================================================== */}
        {introPhase !== "journey" && (
          <div
            className="absolute z-30 max-w-xl pointer-events-auto"
            style={{
              top: "48px",
              left: "48px",
              opacity: introPhase === "centering" ? 0 : 1,
              transform:
                introPhase === "centering"
                  ? `translate3d(${(dimensions.screenW / 2 - 120) * 0.4}px, -15px, 0) scale(0.95)`
                  : "translate3d(0, 0, 0) scale(1)",
              filter: introPhase === "centering" ? "blur(10px)" : "blur(0px)",
              transition: "opacity 0.65s ease, transform 0.65s ease, filter 0.65s ease",
            }}
          >
            <span className="text-[10px] sm:text-xs font-[family-name:var(--font-serif)] tracking-[0.35em] uppercase text-[#e2b069]/80 block mb-1">
              {realm.subtitle}
            </span>

            {/* Title written letter-by-letter */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-[family-name:var(--font-decorative)] tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#fef08a] to-[#e2b069] flex flex-wrap gap-x-1 drop-shadow-[0_0_25px_rgba(226,176,105,0.4)] uppercase">
              {titleLetters.map((letter, idx) => {
                const isRevealed = idx < revealedLettersCount;
                return (
                  <span
                    key={idx}
                    className={`inline-block transition-all duration-200 ${
                      isRevealed
                        ? "opacity-100 translate-y-0 text-white"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                );
              })}
            </h1>
          </div>
        )}

        {/* ===================================================================== */}
        {/* CENTERED STARTING BEACON: "STUDY" DISSOLVED -> CENTER OF THE PAGE!    */}
        {/* ===================================================================== */}
        {introPhase === "journey" && (
          <div
            className="absolute z-30 flex flex-col items-center justify-center text-center pointer-events-auto"
            style={{
              top: "160px",
              left: `${dimensions.screenW / 2}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Glowing Start Beacon */}
            <div className="w-9 h-9 rounded-full bg-[#120e0b] border-2 border-[#e2b069] flex items-center justify-center shadow-[0_0_22px_#e2b069] mb-3">
              <span className="text-xs text-[#fef08a]">✦</span>
            </div>
            <span className="text-[11px] font-[family-name:var(--font-serif)] tracking-[0.3em] uppercase text-[#e2b069] font-semibold">
              {realm.title} // Cosmic Trajectory
            </span>
            <div className="mt-1 flex flex-col items-center gap-0.5 text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-[#d8c8b4]/75">
              <span className="text-[#e2b069] font-medium">↶ Scroll up or swipe down to exit</span>
              <span className="flex items-center gap-1 animate-pulse text-[#d8c8b4]/60">
                <span>Scroll down to travel through stars</span>
                <span>↓</span>
              </span>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SVG CONSTELLATION TRAJECTORY (Centered S-Curve Down the Page!)         */}
        {/* ===================================================================== */}
        <svg
          className="absolute inset-0 w-full pointer-events-none z-10 overflow-visible"
          style={{ height: `${endWaypoint.y + 350}px` }}
        >
          <defs>
            <linearGradient id="trajectoryGlow" x1="0" y1="0" x2="0" y2="100%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#e2b069" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#e2b069" floodOpacity="0.85" />
            </filter>
          </defs>

          {/* Active Starlight Line: SCROLL DOWN IS THE LINE! Drawn behind the star */}
          <path
            ref={svgPathRef}
            d={trajectoryPathD}
            fill="none"
            stroke="url(#trajectoryGlow)"
            strokeWidth="3.5"
            strokeDasharray={totalPathLength}
            strokeDashoffset={Math.max(0, totalPathLength - drawnLength)}
            strokeLinecap="round"
            filter="url(#lineGlow)"
          />
        </svg>

        {/* ===================================================================== */}
        {/* THE FRIEND MAIN STAR COMPANION (Locked to the head of the line!)      */}
        {/* ===================================================================== */}
        {introPhase !== "waiting" && (
          <div
            className="pointer-events-none absolute z-40"
            style={{
              left: `${starPos.x}px`,
              top: `${
                introPhase === "jumping"
                  ? starPos.y - Math.sin(jumpProgress * Math.PI) * 38
                  : starPos.y
              }px`,
              transform: `translate(-50%, -50%) scale(${
                introPhase === "jumping"
                  ? 1 + Math.sin(jumpProgress * Math.PI) * 0.3
                  : 1
              })`,
              transition: introPhase === "centering" ? "none" : "transform 0.05s ease-out",
            }}
          >
            {/* Pulsing Starlight Bloom */}
            <div className="absolute -inset-4 rounded-full bg-gradient-radial from-[#ffffff] via-[#e2b069]/70 to-transparent blur-md animate-pulse" />

            {/* Star Character SVG */}
            <svg
              width="44"
              height="44"
              viewBox="0 0 38 38"
              fill="none"
              className="relative drop-shadow-[0_0_15px_rgba(226,176,105,1)]"
            >
              {/* 4-point Main Twinkle Star */}
              <path
                d="M19 2 C19 11, 23 15, 36 19 C23 23, 19 27, 19 36 C19 27, 15 23, 2 19 C15 15, 19 11, 19 2 Z"
                fill="url(#starGradient)"
              />
              {/* Diagonal secondary rays */}
              <path
                d="M19 7 C19 13, 22 16, 31 19 C22 22, 19 25, 19 31 C19 25, 16 22, 7 19 C16 16, 19 13, 19 7 Z"
                fill="#ffffff"
                opacity="0.9"
              />
              {/* Glowing Center Core */}
              <circle cx="19" cy="19" r="4" fill="#ffffff" />
              <circle cx="19" cy="19" r="7" fill="#fde047" opacity="0.5" />

              <defs>
                <linearGradient id="starGradient" x1="2" y1="2" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" />
                  <stop offset="0.35" stopColor="#fef08a" />
                  <stop offset="0.75" stopColor="#e2b069" />
                  <stop offset="1" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>

            {/* Tiny Orbiting Stardust Sparks */}
            <div className="absolute -top-1 -right-1 text-[9px] text-[#fef08a] animate-ping">✦</div>
            <div className="absolute -bottom-1 -left-1 text-[7px] text-[#ffffff] animate-pulse">✦</div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* MILESTONES: CHECKPOINT POINTS & ADJACENT FOLDER CARDS (Right -> Left) */}
        {/* ===================================================================== */}
        {waypoints.map((wp, idx) => {
          const item = realm.media[wp.mediaIndex];
          const isReached = activeWaypointIndices.has(idx);
          const isRightSide = wp.side === "right";

          return (
            <div
              key={idx}
              className="absolute w-full pointer-events-none"
              style={{ top: `${wp.y}px` }}
            >
              {/* 1. Constellation Checkpoint Node Point */}
              <div
                className={`absolute z-30 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                  isReached ? "scale-100 opacity-100" : "scale-70 opacity-30"
                }`}
                style={{ left: `${wp.x}px` }}
              >
                {/* Ping Ring */}
                {isReached && (
                  <div className="absolute -inset-3 rounded-full border border-[#e2b069] animate-ping opacity-80" />
                )}
                {/* Glowing Checkpoint Star Node */}
                <div className="w-8 h-8 rounded-full bg-[#120e0b] border-2 border-[#e2b069] flex items-center justify-center shadow-[0_0_22px_#e2b069]">
                  <span className="text-xs text-[#fef08a]">✦</span>
                </div>
              </div>

              {/* 2. Milestone Artifact Card Next to the Point */}
              <div
                className={`absolute z-20 pointer-events-auto transition-all duration-700 ${
                  isReached
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-6 scale-95 pointer-events-none"
                }`}
                style={{
                  top: "0px",
                  left: isCompact
                    ? "50%"
                    : isRightSide
                    ? `${wp.x + 36}px`
                    : "auto",
                  right: isCompact
                    ? "auto"
                    : !isRightSide
                    ? `${dimensions.screenW - wp.x + 36}px`
                    : "auto",
                  transform: isCompact ? "translate(-50%, 28px)" : "translateY(-50%)",
                  width: isCompact ? "90%" : "auto",
                  maxWidth: isCompact
                    ? "480px"
                    : `${Math.min(
                        dimensions.screenW >= 1200 ? 460 : 380,
                        isRightSide
                          ? dimensions.screenW - wp.x - 36 - 24
                          : wp.x - 36 - 24
                      )}px`,
                }}
              >
                {/* Horizontal Connector Beam on Desktop */}
                {!isCompact && (
                  <div
                    className={`absolute top-1/2 w-8 h-[2px] bg-gradient-to-r from-[#e2b069] to-transparent shadow-[0_0_8px_#e2b069] ${
                      isRightSide
                        ? "-left-8 rotate-180"
                        : "-right-8"
                    }`}
                  />
                )}

                <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0b08]/92 border border-[#423223]/80 hover:border-[#e2b069] backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.9)] transition-all duration-300 group hover:shadow-[0_0_35px_rgba(226,176,105,0.35)] cursor-default select-none">
                  {/* Milestone Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-[family-name:var(--font-serif)] tracking-[0.25em] uppercase text-[#e2b069] font-semibold flex items-center gap-1.5">
                      <span>✦</span>
                      <span>Milestone 0{idx + 1}</span>
                    </span>
                    <span className="text-[9px] font-[family-name:var(--font-serif)] tracking-wider text-[#8c7b6b] uppercase">
                      Sector {wp.side.toUpperCase()}
                    </span>
                  </div>

                  {/* Image / Video Preview from Folder (Videos can be opened) */}
                  <div
                    onClick={item.isVideo ? () => setOpenedVideo(item) : undefined}
                    className={`relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-[#3b2c1f] group-hover:border-[#e2b069] transition-all duration-300 mb-3 bg-black/60 select-none ${
                      item.isVideo ? "cursor-pointer pointer-events-auto group/video" : "pointer-events-none"
                    }`}
                  >
                    {item.isVideo ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-[#150f0c]">
                        <video
                          src={item.path}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover opacity-85 group-hover/video:opacity-100 group-hover/video:scale-105 transition-all duration-500"
                        />
                        {/* Play button indicator */}
                        <div className="absolute inset-0 bg-black/25 group-hover/video:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#120e0b]/80 border-2 border-[#e2b069] flex items-center justify-center text-[#e2b069] text-xl shadow-[0_0_20px_rgba(226,176,105,0.45)] group-hover/video:scale-110 group-hover/video:bg-[#e2b069] group-hover/video:text-black transition-all duration-300">
                            ▶
                          </div>
                        </div>

                        {/* Hover hint */}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity">
                          <span className="text-[11px] font-[family-name:var(--font-serif)] text-[#e2b069] tracking-wider font-semibold">
                            ✦ Click to open video
                          </span>
                        </div>
                      </div>
                    ) : item.noImage || !item.path ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-5 bg-gradient-to-br from-[#19130d] via-[#0d0a08] to-[#140e0b] relative overflow-hidden group/noimg">
                        {/* Starfield grid backdrop */}
                        <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#e2b069_1px,transparent_1px)] [background-size:18px_18px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                          {/* Modern placeholder icon */}
                          <div className="w-12 h-12 rounded-xl bg-[#1a130d]/90 border border-[#e2b069]/40 flex items-center justify-center mb-2.5 shadow-[0_0_20px_rgba(226,176,105,0.15)] group-hover:border-[#e2b069] group-hover:shadow-[0_0_25px_rgba(226,176,105,0.3)] transition-all duration-300">
                            <svg className="w-6 h-6 text-[#e2b069]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              <line x1="3" y1="3" x2="21" y2="21" stroke="#e2b069" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                            </svg>
                          </div>
                          <span className="text-xs font-[family-name:var(--font-serif)] uppercase tracking-[0.22em] text-[#e2b069] font-bold">
                            No Image Provided
                          </span>
                          <span className="text-[10px] text-[#8e8174] font-sans tracking-wide mt-1">
                            Gameplay screenshot &amp; media archive pending
                          </span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.path}
                        alt={item.title}
                        style={
                          item.name.toLowerCase().includes("football") ||
                          item.path.toLowerCase().includes("football")
                            ? { objectPosition: "center 30.5%" }
                            : item.name.toLowerCase().includes("techpal") ||
                              item.path.toLowerCase().includes("techpal")
                            ? { objectPosition: "center 35%" }
                            : undefined
                        }
                        className="w-full h-full object-cover object-center transition-transform duration-700 select-none"
                      />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-decorative)] text-[#f4efe8] tracking-[0.08em] group-hover:text-[#e2b069] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* Place of Description */}
                  <p className="mt-2 text-[12.5px] sm:text-sm text-[#e8ded1] font-sans font-normal leading-[1.6] tracking-[0.01em]">
                    {item.description || realm.description}
                  </p>

                  {/* Optional Live Website Link */}
                  {item.link && (
                    <div className="mt-3.5 pt-3 border-t border-[#3b2c1f]/60 flex items-center justify-between">
                      <span className="text-[10px] font-[family-name:var(--font-serif)] tracking-wider text-[#8c7b6b] uppercase">
                        Live Production URL
                      </span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e2b069]/15 hover:bg-[#e2b069] border border-[#e2b069]/50 text-[#e2b069] hover:text-black transition-all text-xs font-[family-name:var(--font-serif)] tracking-wider font-semibold cursor-pointer shadow-[0_0_15px_rgba(226,176,105,0.2)] hover:shadow-[0_0_20px_rgba(226,176,105,0.5)]"
                      >
                        <span>Visit Website</span>
                        <span className="text-[10px]">↗</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* ===================================================================== */}
        {/* FINAL ENDING BEACON (Return to Vaults)                                */}
        {/* ===================================================================== */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center text-center pointer-events-auto pb-24"
          style={{ top: `${endWaypoint.y}px` }}
        >
          <div className="w-10 h-10 rounded-full bg-[#120e0b] border-2 border-[#e2b069] flex items-center justify-center shadow-[0_0_25px_#e2b069] mb-3">
            <span className="text-sm text-[#fef08a] animate-spin">✦</span>
          </div>

          <span className="text-xs font-[family-name:var(--font-serif)] tracking-[0.3em] uppercase text-[#e2b069] mb-2 font-semibold">
            Constellation Complete
          </span>

          <button
            onClick={handleExit}
            className="mt-2 px-6 py-2.5 text-[#f4efe8] hover:text-[#e2b069] text-xs font-[family-name:var(--font-serif)] tracking-[0.25em] uppercase transition-all duration-300 bg-[#140f0b] rounded-md shadow-[0_0_25px_rgba(226,176,105,0.2)] cursor-pointer"
          >
            ✦ Return To Vaults
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EXPANDED VIDEO PLAYER MODAL                                            */}
      {/* ========================================================================= */}
      {openedVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl animate-fadeIn pointer-events-auto"
          onClick={() => setOpenedVideo(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-[#0e0b09] border border-[#523e2c] rounded-2xl p-4 sm:p-6 shadow-[0_0_80px_rgba(226,176,105,0.35)] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setOpenedVideo(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#18120e] border border-[#523e2c] hover:border-[#e2b069] text-[#e2b069] flex items-center justify-center cursor-pointer transition-colors shadow-lg"
              title="Close Video"
            >
              ✕
            </button>

            {/* Video Player */}
            <div className="w-full max-h-[64vh] flex items-center justify-center overflow-hidden rounded-xl bg-black shadow-2xl">
              <video
                src={openedVideo.path}
                controls
                autoPlay
                playsInline
                className="max-h-[64vh] w-auto rounded-xl"
              />
            </div>

            {/* Video Info */}
            <div className="mt-4 text-center max-w-2xl">
              <span className="text-base sm:text-lg font-[family-name:var(--font-serif)] tracking-[0.15em] uppercase text-[#e2b069] font-semibold block">
                {openedVideo.title}
              </span>
              {openedVideo.description && (
                <p className="mt-2.5 text-xs sm:text-sm text-[#e8ded1] font-sans font-normal leading-relaxed max-w-xl mx-auto">
                  {openedVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
