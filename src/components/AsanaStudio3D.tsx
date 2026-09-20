import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pose } from '../types';
import { RotateCw, ZoomIn, ZoomOut, Info, ShieldAlert } from 'lucide-react';

interface AsanaStudio3DProps {
  pose: Pose;
}

export const AsanaStudio3D: React.FC<AsanaStudio3DProps> = ({ pose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const figureGroupRef = useRef<THREE.Group | null>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = 300;

    // 1. Scene with natural warm studio atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF4EFEA); // warm earthen linen
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 4.8);
    camera.lookAt(0, 0.8, 0);
    cameraRef.current = camera;

    // 3. Renderer with clean soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Studio Lighting (soft directional warm sun + ambient sage bounce)
    const ambientLight = new THREE.AmbientLight(0xFDFBF7, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFF8EE, 1.2);
    dirLight.position.set(3, 6, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xCCE0D2, 0.4);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    // 5. Studio Floor & Yoga Mat
    const matGeo = new THREE.BoxGeometry(1.4, 0.02, 3.2);
    const matMat = new THREE.MeshStandardMaterial({ 
      color: 0x4B6E58, // deep sage yoga mat
      roughness: 0.85 
    });
    const mat = new THREE.Mesh(matGeo, matMat);
    mat.position.y = 0.01;
    mat.receiveShadow = true;
    scene.add(mat);

    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0xEFEAE2, // warm studio timber/limestone
      roughness: 0.95 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // 6. Anatomical Mannequin Model
    const figureGroup = new THREE.Group();
    figureGroupRef.current = figureGroup;
    scene.add(figureGroup);

    // Materials
    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0xE6DDD0, // warm bone porcelain
      roughness: 0.4,
      metalness: 0.1
    });

    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x8C5638, // terracotta joint articulation point
      roughness: 0.5
    });

    const spineMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A4E38, // deep forest green spinal alignment cue
      roughness: 0.4
    });

    // Helper to create limb segment
    const createSegment = (radius: number, length: number) => {
      const geo = new THREE.CylinderGeometry(radius, radius * 0.9, length, 16);
      const mesh = new THREE.Mesh(geo, boneMaterial);
      mesh.castShadow = true;
      return mesh;
    };

    const createJoint = (radius: number) => {
      const geo = new THREE.SphereGeometry(radius, 16, 16);
      const mesh = new THREE.Mesh(geo, jointMaterial);
      mesh.castShadow = true;
      return mesh;
    };

    // Construct pose-specific geometry based on pose.id
    const poseId = pose.id;

    if (poseId === 'childs-pose' || poseId.includes('child')) {
      // Balasana (resting folded on heels)
      const hips = createJoint(0.18);
      hips.position.set(0, 0.35, -0.6);
      figureGroup.add(hips);

      // Spine angled down toward mat
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.7, 16), spineMaterial);
      spine.position.set(0, 0.3, -0.2);
      spine.rotation.x = Math.PI / 2.3;
      spine.castShadow = true;
      figureGroup.add(spine);

      // Head resting forward on mat
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), boneMaterial);
      head.position.set(0, 0.22, 0.35);
      head.castShadow = true;
      figureGroup.add(head);

      // Arms reaching forward
      const armL = createSegment(0.06, 0.65);
      armL.position.set(-0.24, 0.12, 0.6);
      armL.rotation.x = Math.PI / 2.2;
      figureGroup.add(armL);

      const armR = createSegment(0.06, 0.65);
      armR.position.set(0.24, 0.12, 0.6);
      armR.rotation.x = Math.PI / 2.2;
      figureGroup.add(armR);

      // Folded legs
      const thighL = createSegment(0.09, 0.55);
      thighL.position.set(-0.22, 0.2, -0.5);
      thighL.rotation.x = Math.PI / 2.5;
      figureGroup.add(thighL);

      const thighR = createSegment(0.09, 0.55);
      thighR.position.set(0.22, 0.2, -0.5);
      thighR.rotation.x = Math.PI / 2.5;
      figureGroup.add(thighR);

    } else if (poseId === 'cat-cow') {
      // Tabletop quadruped
      const hips = createJoint(0.17);
      hips.position.set(0, 0.8, -0.5);
      figureGroup.add(hips);

      const shoulders = createJoint(0.16);
      shoulders.position.set(0, 0.8, 0.4);
      figureGroup.add(shoulders);

      // Spine gentle hammock curve
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.9, 16), spineMaterial);
      spine.position.set(0, 0.76, -0.05);
      spine.rotation.x = Math.PI / 2;
      spine.castShadow = true;
      figureGroup.add(spine);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), boneMaterial);
      head.position.set(0, 0.9, 0.7);
      figureGroup.add(head);

      // 4 vertical posts (arms and thighs)
      [-0.24, 0.24].forEach((x) => {
        const arm = createSegment(0.06, 0.76);
        arm.position.set(x, 0.4, 0.4);
        figureGroup.add(arm);

        const leg = createSegment(0.08, 0.76);
        leg.position.set(x, 0.4, -0.5);
        figureGroup.add(leg);
      });

    } else if (poseId.includes('downward') || poseId === 'downward-facing-dog') {
      // Inverted V shape
      const apex = createJoint(0.18);
      apex.position.set(0, 1.4, 0); // hips high in air
      figureGroup.add(apex);

      // Spine lengthening from hips to shoulders
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.85, 16), spineMaterial);
      torso.position.set(0, 1.0, 0.35);
      torso.rotation.x = -Math.PI / 4;
      figureGroup.add(torso);

      // Arms grounding forward
      [-0.25, 0.25].forEach((x) => {
        const arm = createSegment(0.06, 0.95);
        arm.position.set(x, 0.5, 0.75);
        arm.rotation.x = -Math.PI / 4;
        figureGroup.add(arm);

        const leg = createSegment(0.08, 1.35);
        leg.position.set(x, 0.68, -0.45);
        leg.rotation.x = Math.PI / 5;
        figureGroup.add(leg);
      });

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 20), boneMaterial);
      head.position.set(0, 0.75, 0.6);
      figureGroup.add(head);

    } else {
      // Generic serene standing/seated alignment (Tadasana / Sukhasana foundation)
      const pelvis = createJoint(0.18);
      pelvis.position.set(0, 0.95, 0);
      figureGroup.add(pelvis);

      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.7, 16), spineMaterial);
      spine.position.set(0, 1.35, 0);
      figureGroup.add(spine);

      const chest = createJoint(0.16);
      chest.position.set(0, 1.7, 0);
      figureGroup.add(chest);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), boneMaterial);
      head.position.set(0, 2.05, 0);
      figureGroup.add(head);

      // Arms at sides or soft posture
      const armL = createSegment(0.05, 0.65);
      armL.position.set(-0.35, 1.35, 0);
      figureGroup.add(armL);

      const armR = createSegment(0.05, 0.65);
      armR.position.set(0.35, 1.35, 0);
      figureGroup.add(armR);

      // Legs
      const legL = createSegment(0.08, 0.88);
      legL.position.set(-0.16, 0.45, 0);
      figureGroup.add(legL);

      const legR = createSegment(0.08, 0.88);
      legR.position.set(0.16, 0.45, 0);
      figureGroup.add(legR);
    }

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (figureGroupRef.current && isRotating) {
        figureGroupRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 400;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [pose, isRotating]);

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    cam.position.z = Math.max(2.5, Math.min(7.0, cam.position.z + delta));
  };

  const handleRotateManual = () => {
    if (figureGroupRef.current) {
      figureGroupRef.current.rotation.y += Math.PI / 4;
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#DCE4DD] bg-[#FAF6F0] shadow-xs">
      {/* 3D Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-[300px] cursor-grab active:cursor-grabbing"
      />

      {/* Floating Studio Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#FAF8F5]/90 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-[#D9E2DA] shadow-xs">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1 rounded-md text-xs font-medium transition-colors ${
            isRotating ? 'text-[#1F3D29] bg-[#E3EFE6]' : 'text-[#647568] hover:text-[#1F3D29]'
          }`}
          title={isRotating ? 'Pause rotation' : 'Auto rotate'}
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleRotateManual}
          className="p-1 rounded-md text-[#647568] hover:text-[#1F3D29] transition-colors"
          title="Turn 45°"
        >
          <span className="text-[10px] font-mono font-bold">45°</span>
        </button>

        <span className="w-px h-3.5 bg-[#DCE4DD]" />

        <button
          onClick={() => handleZoom(-0.5)}
          className="p-1 rounded-md text-[#647568] hover:text-[#1F3D29] transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom(0.5)}
          className="p-1 rounded-md text-[#647568] hover:text-[#1F3D29] transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Anatomical Key legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-[#FAF8F5]/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#D9E2DA] text-[10px] text-[#4F6054]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2A4E38]" />
          <span>Spinal Neutral Arc</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#8C5638]" />
          <span>Joint Articulation</span>
        </div>
      </div>
    </div>
  );
};
