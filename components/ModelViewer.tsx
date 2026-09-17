"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

export default function ModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    let width = canvas.clientWidth || 600;
    let height = canvas.clientHeight || 600;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.2);

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
    renderer.toneMappingExposure = 1.3;

    // 2. Cinematic Lighting for Medieval / A Plague Tale / RDR2 Atmosphere
    const ambientLight = new THREE.AmbientLight(0xffeedd, 1.4);
    scene.add(ambientLight);

    // Warm key light from top right
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.8);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // Warm torch ember rim light from back/left
    const rimLight = new THREE.DirectionalLight(0xd97706, 2.2);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    // Soft fill light from front bottom
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.0);
    fillLight.position.set(0, -3, 3);
    scene.add(fillLight);

    // 3. Pivot Group & Model Loading
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    const loader = new FBXLoader();
    let modelMesh: THREE.Group | null = null;

    loader.load(
      "/3D/tripo_texture_6fb0ee34-f5b4-4c06-afbc-69e3f4c4ef7f.fbx",
      (fbx) => {
        modelMesh = fbx;

        // Auto-center the model geometry around the pivot point
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center on pivot
        fbx.position.sub(center);

        // Normalize scale to fit viewport comfortably
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        const desiredSize = 2.7; // Target visual scale in camera view
        const scaleFactor = desiredSize / maxDimension;
        fbx.scale.setScalar(scaleFactor);

        // Enhance materials if available
        fbx.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.65;
              mat.metalness = 0.25;
              mat.needsUpdate = true;
            }
          }
        });

        pivotGroup.add(fbx);
        setLoaded(true);
      },
      undefined,
      (error) => {
        console.error("Error loading FBX model:", error);
      }
    );

    // 4. Mouse Rotation Tracking
    let targetRotY = 0;
    let targetRotX = 0;
    let isMouseActive = false;

    const handleWindowMouseMove = (e: MouseEvent) => {
      isMouseActive = true;
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1; // -1 to +1
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1; // -1 to +1

      // Rotate Y based on horizontal mouse movement, Rotate X based on vertical
      targetRotY = normalizedX * (Math.PI * 0.7); // ~126 deg horizontal rotation
      targetRotX = normalizedY * (Math.PI * 0.25); // ~45 deg vertical tilt
    };

    window.addEventListener("mousemove", handleWindowMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.clientWidth || 600;
      height = canvasRef.current.clientHeight || 600;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    window.addEventListener("resize", handleResize);

    // 5. Render Loop with Smooth Easing (Lerp) & Gentle Floating
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      const elapsedTime = clock.getElapsedTime();

      // Smooth easing (Lerp) towards target rotation
      pivotGroup.rotation.y += (targetRotY - pivotGroup.rotation.y) * 0.07;
      pivotGroup.rotation.x += (targetRotX - pivotGroup.rotation.x) * 0.07;

      // Subtle atmospheric breathing / floating bob
      pivotGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.06;

      // When mouse is idle, add a very subtle gentle drift
      if (!isMouseActive) {
        targetRotY = Math.sin(elapsedTime * 0.6) * 0.35;
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // 6. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none flex items-center justify-center select-none"
      style={{ zIndex: 1000 }}
      aria-hidden="true"
    >
      <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] md:w-[600px] md:h-[600px] lg:w-[680px] lg:h-[680px] flex items-center justify-center">
        {/* Soft atmospheric ambient glow behind the 3D model */}
        <div className="absolute inset-0 bg-[#d97706]/10 rounded-full blur-[80px] pointer-events-none scale-75" />

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
