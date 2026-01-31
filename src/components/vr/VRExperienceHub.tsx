import { Suspense, useRef, useState, useCallback, useMemo, forwardRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Float, 
  MeshDistortMaterial,
  Sparkles,
  Stars
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, RotateCcw, Plane, Anchor, Building2, Gem, Sparkles as SparklesIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";

// Performance-optimized floating orb with reduced animation complexity
const LuxuryOrb = forwardRef<THREE.Mesh, { position: [number, number, number]; color: string; scale?: number }>((
  { position, color, scale = 1 }, 
  _ref
) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      // Simplified rotation for better performance
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.2}
          speed={1.5}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>
    </Float>
  );
});

LuxuryOrb.displayName = "LuxuryOrb";

// Experience portal - optimized with forwardRef for React 19 compatibility
const ExperiencePortal = forwardRef<THREE.Group, { 
  position: [number, number, number]; 
  label: string; 
  onClick: () => void;
  active: boolean;
}>((
  { position, label, onClick, active },
  _ref
) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z += active ? 0.015 : 0.003;
    }
  });

  const emissiveIntensity = active ? 0.4 : 0.08;
  const ringColor = active ? "#d4af37" : "#555555";

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.08, 12, 48]} />
        <meshStandardMaterial 
          color={ringColor} 
          emissive={ringColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>
      <mesh>
        <circleGeometry args={[1.4, 32]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          transparent 
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Reduced sparkle count for performance */}
      <Sparkles count={10} scale={2.5} size={1.5} speed={0.3} color="#d4af37" />
    </group>
  );
});

ExperiencePortal.displayName = "ExperiencePortal";

// Main scene component
const VRScene = forwardRef<THREE.Group, { 
  activeExperience: string | null;
  setActiveExperience: (exp: string | null) => void;
}>(({ activeExperience, setActiveExperience }, _ref) => {
  const handleAviationClick = useCallback(() => setActiveExperience("aviation"), [setActiveExperience]);
  const handleYachtsClick = useCallback(() => setActiveExperience("yachts"), [setActiveExperience]);
  const handlePropertiesClick = useCallback(() => setActiveExperience("properties"), [setActiveExperience]);
  const handleCollectiblesClick = useCallback(() => setActiveExperience("collectibles"), [setActiveExperience]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={55} />
      <OrbitControls 
        enableZoom={true} 
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
      />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#d4af37" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4169e1" />
      
      {/* Background - reduced star count */}
      <Stars radius={80} depth={40} count={2500} factor={3} saturation={0} fade speed={0.8} />
      
      {/* Central luxury orb */}
      <LuxuryOrb position={[0, 0, 0]} color="#d4af37" scale={1.5} />
      
      {/* Experience portals */}
      <ExperiencePortal 
        position={[-4, 2, 0]} 
        label="Aviation"
        onClick={handleAviationClick}
        active={activeExperience === "aviation"}
      />
      <ExperiencePortal 
        position={[4, 2, 0]} 
        label="Yachts"
        onClick={handleYachtsClick}
        active={activeExperience === "yachts"}
      />
      <ExperiencePortal 
        position={[-4, -2, 0]} 
        label="Properties"
        onClick={handlePropertiesClick}
        active={activeExperience === "properties"}
      />
      <ExperiencePortal 
        position={[4, -2, 0]} 
        label="Collectibles"
        onClick={handleCollectiblesClick}
        active={activeExperience === "collectibles"}
      />
      
      {/* Floating accent orbs */}
      <LuxuryOrb position={[-6, 0, -3]} color="#4169e1" scale={0.4} />
      <LuxuryOrb position={[6, 0, -3]} color="#9932cc" scale={0.4} />
      <LuxuryOrb position={[0, 4, -3]} color="#20b2aa" scale={0.4} />
      
      {/* Simple fog instead of Environment to avoid ref issues */}
      <fog attach="fog" args={['#0a0a0a', 15, 40]} />
    </>
  );
});

VRScene.displayName = "VRScene";

// Loading fallback for Canvas - visible loading state
const CanvasLoader = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--secondary) / 0.3) 50%, hsl(var(--background)) 100%)' }}>
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
        <SparklesIcon className="w-8 h-8 text-primary" />
      </div>
      <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-3" />
      <p className="text-sm text-foreground font-medium">Initializing Metaverse</p>
      <p className="text-xs text-muted-foreground mt-1">Loading immersive 3D experience...</p>
    </div>
  </div>
));

CanvasLoader.displayName = "CanvasLoader";

interface VRExperienceHubProps {
  isOpen: boolean;
  onClose: () => void;
}

const experiences = [
  { id: "aviation", label: "Private Aviation", icon: Plane, description: "Tour our fleet of jets and helicopters in immersive 3D" },
  { id: "yachts", label: "Superyachts", icon: Anchor, description: "Step aboard the world's most exclusive vessels" },
  { id: "properties", label: "Luxury Properties", icon: Building2, description: "Virtual walkthroughs of extraordinary estates" },
  { id: "collectibles", label: "Rare Collectibles", icon: Gem, description: "Examine fine art and timepieces up close" },
];

const VRExperienceHub = ({ isOpen, onClose }: VRExperienceHubProps) => {
  const [activeExperience, setActiveExperience] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const resetView = useCallback(() => setActiveExperience(null), []);

  // Memoize experience data
  const activeExp = useMemo(() => 
    experiences.find(e => e.id === activeExperience), 
    [activeExperience]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100]"
          style={{ background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--secondary) / 0.2) 50%, hsl(var(--background)) 100%)' }}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between bg-gradient-to-b from-background via-background/80 to-transparent">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary flex items-center justify-center"
              >
                <SparklesIcon className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <h2 className="text-xl font-serif text-foreground">Metaverse Experience Hub</h2>
                <p className="text-xs text-muted-foreground">Immersive luxury previews • Click portals to explore</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetView}
                className="p-2 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Reset view"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Toggle fullscreen"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 3D Canvas with performance optimizations */}
          <Suspense fallback={<CanvasLoader />}>
            <Canvas 
              className="w-full h-full"
              dpr={[1, 1.5]} // Limit DPR for performance
              performance={{ min: 0.5 }}
              gl={{ 
                antialias: true, 
                alpha: false,
                powerPreference: "high-performance"
              }}
            >
              <VRScene activeExperience={activeExperience} setActiveExperience={setActiveExperience} />
            </Canvas>
          </Suspense>

          {/* Experience selector */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-background via-background/80 to-transparent">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {experiences.map((exp) => (
                  <motion.button
                    key={exp.id}
                    onClick={() => setActiveExperience(exp.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      activeExperience === exp.id
                        ? "bg-primary/20 border-primary/50 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                        : "bg-secondary/30 border-border/30 hover:border-primary/30"
                    }`}
                  >
                    <exp.icon className={`w-5 h-5 mb-2 ${activeExperience === exp.id ? "text-primary" : "text-muted-foreground"}`} />
                    <p className={`text-sm font-medium ${activeExperience === exp.id ? "text-primary" : "text-foreground"}`}>
                      {exp.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{exp.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Active experience details */}
          <AnimatePresence>
            {activeExperience && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute top-24 left-6 w-72 p-4 rounded-xl bg-card/90 backdrop-blur-xl border border-primary/30"
              >
                <h3 className="text-lg font-serif text-foreground mb-2">
                  {activeExp?.label}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {activeExp?.description}
                </p>
                <button 
                  onClick={() => {
                    toast.success("VR Experience launching...", {
                      description: "Please ensure your VR headset is connected or continue in browser mode."
                    });
                  }}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Enter VR Experience
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VRExperienceHub;
