"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

interface CharacterModelProps {
  scrollProgress?: number;
}

export default function CharacterModel({ scrollProgress = 0 }: CharacterModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const scrollProgressRef = useRef(scrollProgress);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    // Near plane set to 0.005 so camera never clips cornea or pupil geometry during close zoom
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.005, 1000);
    camera.position.set(0, 0, 3.8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 2. Cinematic A Plague Tale Torchlight & Amber Rim Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.3);
    scene.add(ambientLight);

    // Warm torch key light (from front-top-right)
    const keyLight = new THREE.DirectionalLight(0xffedd5, 3.8);
    keyLight.position.set(3, 4, 3.5);
    scene.add(keyLight);

    // Ignifer amber rim light (from back-left to highlight silhouette edges)
    const rimLight = new THREE.DirectionalLight(0xd97706, 4.2);
    rimLight.position.set(-4, 2.5, -2.5);
    scene.add(rimLight);

    // Soft storm-sky fill light from lower left
    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 1.4);
    fillLight.position.set(-2, -2, 2.5);
    scene.add(fillLight);

    // 3. Model Hierarchy & Auto-Centering
    // headGroup rotates to make eyes & head follow cursor
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    let isDisposed = false;

    // Load 3D Game FBX Model
    const loader = new FBXLoader();
    loader.load(
      "/3D/3d_game.fbx",
      (fbxGroup) => {
        if (isDisposed) return;

        // Base rotation: authoring faces +X, rotate -90 deg (-PI/2) to face front (+Z)
        fbxGroup.rotation.y = -Math.PI * 0.5;

        // Force matrix update so bounds are computed with proper hierarchy transforms
        fbxGroup.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(fbxGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center model and set pivot at head / neck height (~0.12 above center)
        fbxGroup.position.x = -center.x;
        fbxGroup.position.y = -center.y - size.y * 0.12;
        fbxGroup.position.z = -center.z;

        // Scale to fit viewport height comfortably
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetVisualSize = 2.3;
        const scale = targetVisualSize / maxDim;
        fbxGroup.scale.setScalar(scale);

        // Enhance material textures and colors
        fbxGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const oldMat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshPhongMaterial;
              const texture = oldMat.map || null;
              if (texture) {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.needsUpdate = true;
              }
              const pbrMat = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.45,
                metalness: 0.25,
              });
              mesh.material = pbrMat;
            }
          }
        });

        headGroup.add(fbxGroup);
        setLoaded(true);
      },
      undefined,
      (error) => {
        console.error("Error loading 3D FBX game model:", error);
      }
    );

    // 4. Real-Time Cursor Tracking: Head & Eyes Follow Cursor
    let targetRotY = 0;
    let targetRotX = 0;
    let targetRotZ = 0;
    let currentRotY = 0;
    let currentRotX = 0;
    let currentRotZ = 0;
    let lastMouseMoveTime = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseMoveTime = Date.now();

      // Determine model's head position in screen coordinates (centered)
      let originX = window.innerWidth * 0.5;
      let originY = window.innerHeight * 0.5;

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        originX = rect.left + rect.width * 0.5;
        originY = rect.top + rect.height * 0.42;
      }

      // Delta vector from head to cursor normalized relative to half-screen
      const deltaX = (e.clientX - originX) / (window.innerWidth * 0.5);
      const deltaY = (e.clientY - originY) / (window.innerHeight * 0.5);

      // Clamp angles to natural human head rotation limits
      const clampedDeltaX = Math.max(-1.3, Math.min(1.4, deltaX));
      const clampedDeltaY = Math.max(-1.1, Math.min(1.1, deltaY));

      // Calculate look angles: head and eyes look directly towards cursor
      targetRotY = clampedDeltaX * 0.54;
      targetRotX = -clampedDeltaY * 0.32;
      targetRotZ = -clampedDeltaX * 0.07;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    window.addEventListener("resize", handleResize);

    // 5. Render Loop with Organic Easing & Cinematic Scroll Zoom into Eye
    let animationFrameId: number;
    const startTime = performance.now();

    // Camera Vectors for Scroll Zoom Journey into Eye
    let currentZoom = 0;
    const startCamPos = new THREE.Vector3(0, 0, 3.8);
    // Upper face pupil/eye region (Y raised from mouth level ~0.46 up to eye level 0.695)
    const eyeTargetPos = new THREE.Vector3(0.075, 0.695, 0.450);
    const eyeThroughPos = new THREE.Vector3(0.075, 0.695, 0.350);

    const startLookAt = new THREE.Vector3(0, 0.30, 0);
    const eyeLookAt = new THREE.Vector3(0.075, 0.695, 0.250);

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      const time = (performance.now() - startTime) * 0.001;
      const targetP = scrollProgressRef.current;

      // Smooth lerp for scroll zoom (damped inertia)
      currentZoom += (targetP - currentZoom) * 0.12;
      const sp = Math.min(1, Math.max(0, currentZoom));

      // Smooth cubic curve for camera motion
      const t = sp < 0.5 ? 4 * sp * sp * sp : 1 - Math.pow(-2 * sp + 2, 3) / 2;

      // Idle behavior: if mouse is inactive and at hero, gently look around
      if (Date.now() - lastMouseMoveTime > 2800 && sp < 0.1) {
        targetRotY = Math.sin(time * 0.6) * 0.12;
        targetRotX = Math.cos(time * 0.8) * 0.05;
        targetRotZ = 0;
      }

      // Smooth organic lerp for head rotation
      const lerpSpeed = 0.09;
      currentRotY += (targetRotY - currentRotY) * lerpSpeed;
      currentRotX += (targetRotX - currentRotX) * lerpSpeed;
      currentRotZ += (targetRotZ - currentRotZ) * lerpSpeed;

      // Diminish mouse tracking as we scroll so head aligns forward into camera
      const trackWeight = Math.max(0, 1 - sp * 2.2);
      headGroup.rotation.y = currentRotY * trackWeight;
      headGroup.rotation.x = currentRotX * trackWeight;
      headGroup.rotation.z = currentRotZ * trackWeight;

      // Diminish breathing as camera enters eye
      const breathWeight = Math.max(0, 1 - sp * 1.8);
      headGroup.position.y = Math.sin(time * 1.5) * 0.025 * breathWeight;
      headGroup.position.x = currentRotY * 0.14 * trackWeight;

      // Camera Trajectory: Glides from wide hero view directly into pupil
      if (t <= 0.85) {
        const localT = t / 0.85;
        camera.position.lerpVectors(startCamPos, eyeTargetPos, localT);
        const curLook = startLookAt.clone().lerp(eyeLookAt, localT);
        camera.lookAt(curLook);
      } else {
        const localT = (t - 0.85) / 0.15;
        camera.position.lerpVectors(eyeTargetPos, eyeThroughPos, localT);
        camera.lookAt(eyeLookAt);
      }

      // Cinematic FOV tightening (dolly zoom effect)
      camera.fov = 38 - t * 14;
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
    };

    renderLoop();

    // 6. Cleanup
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-20 overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Soft atmospheric amber firelight aura behind character */}
        <div
          className="absolute inset-0 bg-gradient-radial from-[#d97706]/20 via-[#b45309]/10 to-transparent rounded-full blur-[120px] pointer-events-none transition-opacity duration-500 scale-95"
          style={{ opacity: Math.max(0, 1 - (scrollProgress || 0) * 2) }}
        />

        {/* 3D WebGL Canvas (Full-screen for boundless edge-to-edge zoom) */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full pointer-events-none transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
