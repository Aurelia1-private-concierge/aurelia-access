import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Float, 
  MeshDistortMaterial,
  Sparkles,
  Stars
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, RotateCcw, Plane, Anchor, Building2, Gem, Sparkles as SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
// Floating luxury orb
const LuxuryOrb = ({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
};

// Experience portal
const ExperiencePortal = ({ 
  position, 
  label, 
  onClick,
  active 
}: { 
  position: [number, number, number]; 
  label: string; 
  onClick: () => void;
  active: boolean;
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += active ? 0.02 : 0.005;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshStandardMaterial 
          color={active ? "#d4af37" : "#666666"} 
          emissive={active ? "#d4af37" : "#333333"}
          emissiveIntensity={active ? 0.5 : 0.1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh>
        <circleGeometry args={[1.4, 64]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Sparkles count={20} scale={3} size={2} speed={0.5} color="#d4af37" />
    </group>
  );
};

// Main scene
const VRScene = ({ activeExperience, setActiveExperience }: { 
  activeExperience: string | null;
  setActiveExperience: (exp: string | null) => void;
}) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
      <OrbitControls 
        enableZoom={true} 
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#d4af37" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4169e1" />
      
      {/* Background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Central luxury orb */}
      <LuxuryOrb position={[0, 0, 0]} color="#d4af37" scale={1.5} />
      
      {/* Experience portals */}
      <ExperiencePortal 
        position={[-4, 2, 0]} 
        label="Aviation"
        onClick={() => setActiveExperience("aviation")}
        active={activeExperience === "aviation"}
      />
      <ExperiencePortal 
        position={[4, 2, 0]} 
        label="Yachts"
        onClick={() => setActiveExperience("yachts")}
        active={activeExperience === "yachts"}
      />
      <ExperiencePortal 
        position={[-4, -2, 0]} 
        label="Properties"
        onClick={() => setActiveExperience("properties")}
        active={activeExperience === "properties"}
      />
      <ExperiencePortal 
        position={[4, -2, 0]} 
        label="Collectibles"
        onClick={() => setActiveExperience("collectibles")}
        active={activeExperience === "collectibles"}
      />
      
      {/* Floating accent orbs */}
      <LuxuryOrb position={[-6, 0, -3]} color="#4169e1" scale={0.5} />
      <LuxuryOrb position={[6, 0, -3]} color="#9932cc" scale={0.5} />
      <LuxuryOrb position={[0, 4, -3]} color="#20b2aa" scale={0.5} />
      
      <Environment preset="night" />
    </>
  );
};

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background"
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
                onClick={() => setActiveExperience(null)}
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

          {/* 3D Canvas */}
          <Canvas className="w-full h-full">
            <Suspense fallback={null}>
              <VRScene activeExperience={activeExperience} setActiveExperience={setActiveExperience} />
            </Suspense>
          </Canvas>

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
                  {experiences.find(e => e.id === activeExperience)?.label}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {experiences.find(e => e.id === activeExperience)?.description}
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
