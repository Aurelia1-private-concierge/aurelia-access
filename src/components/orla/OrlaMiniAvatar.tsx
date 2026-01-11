import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

interface OrlaMiniAvatarProps {
  size?: number;
  isActive?: boolean;
  showSparkles?: boolean;
}

// Lightweight 3D orb for mini displays
function MiniOrb({ isActive }: { isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [breathe, setBreathe] = useState(0);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current) {
      // Gentle breathing
      meshRef.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.03);
      
      // Subtle rotation
      meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
      meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.05;
    }
    
    if (glowRef.current) {
      // Pulsing glow
      const pulse = Math.sin(time * 2) * 0.15 + 0.85;
      glowRef.current.scale.setScalar(1.15 + (isActive ? 0.1 : 0) + Math.sin(time * 1.5) * 0.05);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * (isActive ? 0.5 : 0.3);
    }
  });

  return (
    <group>
      {/* Main orb */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#f5ebe0"
          roughness={0.3}
          metalness={0.1}
          emissive="#D4AF37"
          emissiveIntensity={isActive ? 0.15 : 0.05}
        />
      </mesh>
      
      {/* Outer glow ring */}
      <mesh ref={glowRef} scale={1.15}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial
          color="#D4AF37"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Inner accent */}
      <mesh scale={0.4} position={[0.2, 0.2, 0.6]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      
      {/* Eye hints */}
      <mesh position={[-0.2, 0.1, 0.7]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.2, 0.1, 0.7]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      
      {/* Mouth hint */}
      <mesh position={[0, -0.2, 0.75]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#c47a7a" />
      </mesh>
    </group>
  );
}

const OrlaMiniAvatar = ({ 
  size = 56, 
  isActive = false,
  showSparkles = true 
}: OrlaMiniAvatarProps) => {
  return (
    <div 
      className="relative rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        }}
      >
        <color attach="background" args={["transparent"]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 3]} intensity={0.8} color="#fff5e6" />
        <pointLight position={[0, -1, 2]} intensity={0.2} color="#D4AF37" />
        
        <Float
          speed={2}
          rotationIntensity={0.1}
          floatIntensity={0.15}
          floatingRange={[-0.03, 0.03]}
        >
          <MiniOrb isActive={isActive} />
        </Float>
        
        {showSparkles && isActive && (
          <Sparkles
            count={8}
            scale={2}
            size={1.5}
            speed={0.3}
            opacity={0.5}
            color="#D4AF37"
          />
        )}
        
        <Environment preset="city" />
      </Canvas>
      
      {/* Active indicator ring */}
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
