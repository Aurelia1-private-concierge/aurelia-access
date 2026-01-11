import React, { useRef, useState, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import orlaAvatar from "@/assets/orla-avatar.png";
import { useAvatarPreferences } from "@/hooks/useAvatarPreferences";

interface OrlaMiniAvatarProps {
  size?: number;
  isActive?: boolean;
  showSparkles?: boolean;
  forceStatic?: boolean;
}

// Simple error boundary wrapper - defined first so it can be used below
class ErrorBoundaryWrapper extends React.Component<{
  children: React.ReactNode;
  onError: () => void;
}> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch() {
    this.props.onError();
  }
  
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Lightweight 3D orb for mini displays
const MiniOrb = memo(({ isActive, reducedMotion }: { isActive: boolean; reducedMotion: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const speed = reducedMotion ? 0.3 : 1;
    
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(time * 1.5 * speed) * 0.03);
      meshRef.current.rotation.y = Math.sin(time * 0.3 * speed) * 0.1;
      meshRef.current.rotation.x = Math.sin(time * 0.2 * speed) * 0.05;
    }
    
    if (glowRef.current) {
      const pulse = Math.sin(time * 2 * speed) * 0.15 + 0.85;
      glowRef.current.scale.setScalar(1.15 + (isActive ? 0.1 : 0) + Math.sin(time * 1.5 * speed) * 0.05);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * (isActive ? 0.5 : 0.3);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, reducedMotion ? 16 : 32, reducedMotion ? 16 : 32]} />
        <meshStandardMaterial
          color="#f5ebe0"
          roughness={0.3}
          metalness={0.1}
          emissive="#D4AF37"
          emissiveIntensity={isActive ? 0.15 : 0.05}
        />
      </mesh>
      
      <mesh ref={glowRef} scale={1.15}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>
      
      <mesh scale={0.25} position={[0.25, 0.3, 0.65]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      
      <mesh position={[-0.22, 0.12, 0.72]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.22, 0.12, 0.72]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      
      <mesh position={[-0.19, 0.14, 0.78]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.25, 0.14, 0.78]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      <mesh position={[0, -0.18, 0.78]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI * 0.8]} />
        <meshBasicMaterial color="#c47a7a" />
      </mesh>
    </group>
  );
});

MiniOrb.displayName = "MiniOrb";

// Static avatar fallback with animated glow
const StaticAvatar = memo(({ size, isActive }: { size: number; isActive: boolean }) => (
  <motion.div
    className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center"
    style={{ width: size, height: size }}
    animate={isActive ? { 
      boxShadow: [
        "0 0 10px rgba(212,175,55,0.3)",
        "0 0 20px rgba(212,175,55,0.5)",
        "0 0 10px rgba(212,175,55,0.3)"
      ]
    } : {}}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    <img 
      src={orlaAvatar} 
      alt="Orla" 
      className="w-full h-full object-cover rounded-full"
      style={{ width: size, height: size }}
    />
    {isActive && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-full"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    )}
  </motion.div>
));

StaticAvatar.displayName = "StaticAvatar";

// 3D Avatar component with performance optimizations
const ThreeDAvatar = memo(({ 
  isActive, 
  showSparkles,
  reducedMotion 
}: { 
  isActive: boolean; 
  showSparkles: boolean;
  reducedMotion: boolean;
}) => (
  <Canvas
    camera={{ position: [0, 0, 2.5], fov: 45 }}
    dpr={reducedMotion ? 1 : [1, 2]}
    gl={{ 
      antialias: !reducedMotion,
      alpha: true,
      powerPreference: reducedMotion ? "low-power" : "default",
    }}
    style={{ background: "transparent" }}
  >
    <ambientLight intensity={0.5} />
    <directionalLight position={[2, 2, 3]} intensity={0.8} color="#fff5e6" />
    <pointLight position={[0, -1, 2]} intensity={0.2} color="#D4AF37" />
    
    <Float
      speed={reducedMotion ? 1 : 2}
      rotationIntensity={reducedMotion ? 0.05 : 0.1}
      floatIntensity={reducedMotion ? 0.08 : 0.15}
      floatingRange={[-0.03, 0.03]}
    >
      <MiniOrb isActive={isActive} reducedMotion={reducedMotion} />
    </Float>
    
    {showSparkles && isActive && !reducedMotion && (
      <Sparkles count={6} scale={2} size={1.5} speed={0.3} opacity={0.5} color="#D4AF37" />
    )}
    
    <Environment preset="city" />
  </Canvas>
));

ThreeDAvatar.displayName = "ThreeDAvatar";

// Main component
const OrlaMiniAvatar = ({ 
  size = 56, 
  isActive = false,
  showSparkles = true,
  forceStatic = false,
}: OrlaMiniAvatarProps) => {
  const { shouldUse3D, reducedMotion } = useAvatarPreferences();
  const [hasError, setHasError] = useState(false);
  
  const use3D = !forceStatic && !hasError && shouldUse3D();
  
  return (
    <div 
      className="relative rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5"
      style={{ width: size, height: size }}
    >
      {use3D ? (
        <ErrorBoundaryWrapper onError={() => setHasError(true)}>
          <ThreeDAvatar 
            isActive={isActive} 
            showSparkles={showSparkles}
            reducedMotion={reducedMotion}
          />
        </ErrorBoundaryWrapper>
      ) : (
        <StaticAvatar size={size} isActive={isActive} />
      )}
      
      <div 
        className={`absolute inset-0 rounded-full border-2 pointer-events-none transition-all duration-500 ${
          isActive 
            ? "border-primary/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
            : "border-transparent"
        }`}
      />
    </div>
  );
};

export default OrlaMiniAvatar;
