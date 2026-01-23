import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, Float, PerspectiveCamera } from "@react-three/drei";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RotateCw, Maximize2, Grid3X3, Box, Sparkles } from "lucide-react";
import * as THREE from "three";

interface Quantum3DViewerProps {
  className?: string;
  showGrid?: boolean;
  showWireframe?: boolean;
  autoRotate?: boolean;
  height?: number;
  object?: "cube" | "sphere" | "torus" | "octahedron" | "custom";
  children?: React.ReactNode;
}

// Holographic material effect
const HolographicMaterial = ({ wireframe = false }: { wireframe?: boolean }) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.5 + Math.sin(clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <meshStandardMaterial
      ref={materialRef}
      color="#0891b2"
      emissive="#22d3ee"
      emissiveIntensity={0.5}
      metalness={0.8}
      roughness={0.2}
      wireframe={wireframe}
      transparent
      opacity={wireframe ? 1 : 0.9}
    />
  );
};

// Rotating object with particle effect
const QuantumObject = ({
  type,
  wireframe,
}: {
  type: string;
  wireframe: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.2;
    }
  });

  const getGeometry = () => {
    switch (type) {
      case "sphere":
        return <sphereGeometry args={[1.2, 32, 32]} />;
      case "torus":
        return <torusGeometry args={[1, 0.4, 16, 100]} />;
      case "octahedron":
        return <octahedronGeometry args={[1.2]} />;
      default:
        return <boxGeometry args={[1.5, 1.5, 1.5]} />;
    }
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        {getGeometry()}
        <HolographicMaterial wireframe={wireframe} />
      </mesh>

      {/* Particle outline effect */}
      <points>
        {type === "cube" && <boxGeometry args={[1.6, 1.6, 1.6, 8, 8, 8]} />}
        {type === "sphere" && <sphereGeometry args={[1.3, 16, 16]} />}
        {type === "torus" && <torusGeometry args={[1.1, 0.5, 8, 50]} />}
        {type === "octahedron" && <octahedronGeometry args={[1.3, 0]} />}
        <pointsMaterial
          size={0.03}
          color="#22d3ee"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </Float>
  );
};

// Holographic grid base
const HolographicGrid = () => {
  return (
    <Grid
      position={[0, -2, 0]}
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#22d3ee"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#0891b2"
      fadeDistance={15}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid
    />
  );
};

// Loading component
const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial color="#22d3ee" wireframe />
  </mesh>
);

export const Quantum3DViewer = ({
  className,
  showGrid = true,
  showWireframe: initialWireframe = false,
  autoRotate: initialAutoRotate = true,
  height = 400,
  object = "cube",
  children,
}: Quantum3DViewerProps) => {
  const [wireframe, setWireframe] = useState(initialWireframe);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const controls = [
    {
      icon: RotateCw,
      label: "Auto Rotate",
      active: autoRotate,
      onClick: () => setAutoRotate(!autoRotate),
    },
    {
      icon: Grid3X3,
      label: "Wireframe",
      active: wireframe,
      onClick: () => setWireframe(!wireframe),
    },
    {
      icon: Maximize2,
      label: "Fullscreen",
      active: isFullscreen,
      onClick: () => setIsFullscreen(!isFullscreen),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "relative rounded-lg border border-cyan-500/20 bg-slate-950/80 overflow-hidden",
        isFullscreen && "fixed inset-4 z-50",
        className
      )}
      style={{ height: isFullscreen ? "auto" : height }}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {controls.map((control) => (
          <motion.button
            key={control.label}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={control.onClick}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              control.active
                ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-400"
                : "bg-slate-800/80 border-cyan-500/20 text-slate-400 hover:text-cyan-400"
            )}
            title={control.label}
          >
            <control.icon className="w-4 h-4" />
          </motion.button>
        ))}
      </div>

      {/* Object type indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/20">
        <Box className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono text-cyan-400 uppercase">
          {object}
        </span>
      </div>

      {/* AR indicator */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/20">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono text-slate-400">
          AR Ready
        </span>
      </div>

      {/* 3D Canvas */}
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[3, 3, 3]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0891b2" />

        <Suspense fallback={<LoadingFallback />}>
          {children || <QuantumObject type={object} wireframe={wireframe} />}
          {showGrid && <HolographicGrid />}
          <Environment preset="night" />
        </Suspense>

        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={1}
          enableZoom
          enablePan
          minDistance={2}
          maxDistance={10}
        />

        {/* Ambient particles */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={200}
              array={new Float32Array(
                Array.from({ length: 600 }, () => (Math.random() - 0.5) * 10)
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.02}
            color="#22d3ee"
            transparent
            opacity={0.4}
            sizeAttenuation
          />
        </points>
      </Canvas>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/50 pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400/50 pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400/50 pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400/50 pointer-events-none z-10" />

      {/* Scanning line effect */}
      <motion.div
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none z-10"
      />
    </motion.div>
  );
};

export default Quantum3DViewer;
