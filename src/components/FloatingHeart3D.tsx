import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Heart, Sparkles as SparklesIcon, Eye } from 'lucide-react';

interface HeartMeshProps {
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
  isDark?: boolean;
}

const MainHeart: React.FC<HeartMeshProps> = ({ isHovered, setIsHovered, isDark = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Generate 3D Extruded Heart Shape
  const { geometry, extrudeSettings } = useMemo(() => {
    const shape = new THREE.Shape();
    // Centered romantic heart curve (scaled for 3D viewport)
    const scale = 0.9;
    shape.moveTo(0, 0.35 * scale);
    shape.bezierCurveTo(0.4 * scale, 0.85 * scale, 1.05 * scale, 0.65 * scale, 1.05 * scale, 0.15 * scale);
    shape.bezierCurveTo(1.05 * scale, -0.35 * scale, 0.5 * scale, -0.75 * scale, 0, -1.2 * scale);
    shape.bezierCurveTo(-0.5 * scale, -0.75 * scale, -1.05 * scale, -0.35 * scale, -1.05 * scale, 0.15 * scale);
    shape.bezierCurveTo(-1.05 * scale, 0.65 * scale, -0.4 * scale, 0.85 * scale, 0, 0.35 * scale);

    const settings: THREE.ExtrudeGeometryOptions = {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 16,
      steps: 2,
      bevelSize: 0.18,
      bevelThickness: 0.18,
    };

    const geom = new THREE.ExtrudeGeometry(shape, settings);
    geom.center(); // Center geometry for proper rotation axis
    return { geometry: geom, extrudeSettings: settings };
  }, []);

  // Animation Loop for Floating & Heartbeat Pulsing
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Natural heartbeat pulse rhythm (two-beat lub-dub pattern)
    const heartbeat = Math.sin(t * 3.5) > 0.7 ? Math.sin(t * 7) * 0.08 : 0;
    const hoverScale = isHovered ? 1.15 : 1.0;
    const currentScale = (1 + heartbeat) * hoverScale;

    meshRef.current.scale.set(currentScale, currentScale, currentScale);

    // Gentle 3D floating and rotation
    meshRef.current.rotation.y = Math.sin(t * 0.8) * 0.35 + (state.pointer.x * 0.4);
    meshRef.current.rotation.x = Math.cos(t * 0.6) * 0.15 - (state.pointer.y * 0.3);
    meshRef.current.rotation.z = Math.sin(t * 0.5) * 0.08;

    meshRef.current.position.y = Math.sin(t * 1.5) * 0.12;

    // Pulse the point light glow with heartbeat
    if (glowRef.current) {
      glowRef.current.intensity = isHovered ? 4.5 : 2.5 + heartbeat * 2.0;
    }
  });

  return (
    <group>
      {/* Dynamic Inner Glow */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 1.2]}
        color={isDark ? '#fb7185' : '#f43f5e'}
        intensity={2.8}
        distance={4}
      />

      {/* Main Luxury 3D Heart Mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={isDark ? '#e11d48' : '#e11d53'}
          emissive="#881337"
          emissiveIntensity={0.25}
          roughness={0.18}
          metalness={0.12}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          reflectivity={0.85}
        />
      </mesh>
    </group>
  );
};

// Orbiting Satellites (Tiny floating heart charms)
const OrbitingCharms = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.3;
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
  });

  return (
    <group ref={groupRef}>
      {/* Champagne Gold Jewel Orbit 1 */}
      <mesh position={[1.8, 0.6, 0.4]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#e2c58e" metalness={0.8} roughness={0.2} emissive="#cfb27e" emissiveIntensity={0.4} />
      </mesh>

      {/* Rose Pearl Orbit 2 */}
      <mesh position={[-1.7, -0.5, -0.3]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#fecdd6" metalness={0.3} roughness={0.1} />
      </mesh>

      {/* Mini Gold Jewel Orbit 3 */}
      <mesh position={[0.4, 1.7, -0.8]}>
        <dodecahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial color="#e6cb95" metalness={0.8} roughness={0.15} />
      </mesh>
    </group>
  );
};

export interface FloatingHeart3DProps {
  isDark?: boolean;
}

export const FloatingHeart3D: React.FC<FloatingHeart3DProps> = ({ isDark = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-square mx-auto flex items-center justify-center"
    >
      {/* Background Soft Aura */}
      <div className="absolute inset-0 bg-gradient-to-tr from-romantic-400/20 via-champagne-300/20 to-romantic-300/10 dark:from-romantic-600/30 dark:via-champagne-600/15 dark:to-transparent rounded-full blur-2xl pointer-events-none transform -translate-y-2" />

      {/* 3D WebGL Canvas */}
      <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Lighting Environment */}
          <ambientLight intensity={0.9} />
          <directionalLight position={[3, 4, 3]} intensity={1.8} color="#fff1f2" />
          <directionalLight position={[-3, -2, -2]} intensity={0.6} color="#ffe4e8" />
          <pointLight position={[0, 2, 2]} intensity={1.5} color="#ede2cc" />

          {/* Floating 3D Heart */}
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
            <MainHeart isHovered={isHovered} setIsHovered={setIsHovered} isDark={isDark} />
            <OrbitingCharms />
          </Float>

          {/* Luxury Champagne Dust Sparkles */}
          <Sparkles
            count={32}
            scale={3.6}
            size={2.2}
            speed={0.4}
            opacity={0.7}
            color={isDark ? '#e2c58e' : '#cfb27e'}
          />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.6}
            minPolarAngle={Math.PI / 2.4}
            rotateSpeed={0.6}
          />
        </Canvas>
      </div>

      {/* Floating Interactive Badge */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/80 dark:bg-velvet-900/85 backdrop-blur-md border border-romantic-200/80 dark:border-velvet-700 text-[11px] font-semibold text-romantic-800 dark:text-romantic-300 shadow-romantic-sm flex items-center gap-1.5 pointer-events-none whitespace-nowrap"
      >
        <SparklesIcon className="w-3 h-3 text-champagne-500 animate-pulse" />
        <span>Interactive 3D Heart • Drag to rotate</span>
      </motion.div>
    </motion.div>
  );
};

export default FloatingHeart3D;
