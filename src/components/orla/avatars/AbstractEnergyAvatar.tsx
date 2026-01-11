import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

interface FaceData {
  headRotationX: number;
  headRotationY: number;
  headRotationZ: number;
  leftEyeOpenness: number;
  rightEyeOpenness: number;
  eyeGazeX: number;
  eyeGazeY: number;
  mouthOpenness: number;
  mouthWidth: number;
  leftEyebrowRaise: number;
  rightEyebrowRaise: number;
  isSmiling: boolean;
  isTalking: boolean;
  isBlinking: boolean;
  faceDetected: boolean;
  confidence: number;
}

interface AbstractEnergyAvatarProps {
  isSpeaking?: boolean;
  currentExpression?: string;
  faceData?: FaceData | null;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
}

const EnergyCore: React.FC<{
  isSpeaking: boolean;
  faceData?: FaceData | null;
  colors: { primary: string; secondary: string; accent: string; glow: string };
}> = ({ isSpeaking, faceData, colors }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRingsRef = useRef<THREE.Group>(null);
  const outerRingsRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const eyeOrbsRef = useRef<THREE.Group>(null);

  const primaryColor = useMemo(() => new THREE.Color(colors.primary), [colors.primary]);
  const secondaryColor = useMemo(() => new THREE.Color(colors.secondary), [colors.secondary]);
  const accentColor = useMemo(() => new THREE.Color(colors.accent), [colors.accent]);
  const glowColor = useMemo(() => new THREE.Color(colors.glow), [colors.glow]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const speakIntensity = isSpeaking ? 1.5 : 1;

    if (groupRef.current) {
      if (faceData?.faceDetected) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          faceData.headRotationX * 0.3,
          0.08
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          faceData.headRotationY * 0.3,
          0.08
        );
      } else {
        groupRef.current.rotation.y = time * 0.1;
      }
    }

    // Core pulsing
    if (coreRef.current) {
      const pulseScale = 1 + Math.sin(time * 3 * speakIntensity) * 0.1 * speakIntensity;
      coreRef.current.scale.setScalar(pulseScale);
      
      if (coreRef.current.material instanceof THREE.MeshStandardMaterial) {
        coreRef.current.material.emissiveIntensity = 0.8 + Math.sin(time * 4) * 0.3 * speakIntensity;
      }
    }

    // Pulse wave
    if (pulseRef.current) {
      const pulsePhase = (time * speakIntensity) % 2;
      pulseRef.current.scale.setScalar(1 + pulsePhase * 0.8);
      if (pulseRef.current.material instanceof THREE.MeshStandardMaterial) {
        pulseRef.current.material.opacity = Math.max(0, 0.4 - pulsePhase * 0.2);
      }
    }

    // Inner rings rotation
    if (innerRingsRef.current) {
      innerRingsRef.current.rotation.x = time * 0.5 * speakIntensity;
      innerRingsRef.current.rotation.z = time * 0.3;
    }

    // Outer rings rotation
    if (outerRingsRef.current) {
      outerRingsRef.current.rotation.y = -time * 0.2;
      outerRingsRef.current.rotation.x = time * 0.15;
    }

    // Floating particles
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const mesh = particle as THREE.Mesh;
        const angle = time * 0.5 + (i / 12) * Math.PI * 2;
        const radius = 1.3 + Math.sin(time + i) * 0.2;
        const height = Math.sin(time * 0.8 + i * 0.5) * 0.5;
        
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.z = Math.sin(angle) * radius;
        mesh.position.y = height;
        
        const particleScale = 0.04 + Math.sin(time * 2 + i) * 0.02;
        mesh.scale.setScalar(particleScale * speakIntensity);
        
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissiveIntensity = 0.5 + Math.sin(time * 3 + i) * 0.3;
        }
      });
    }

    // Eye orbs (abstract representation)
    if (eyeOrbsRef.current) {
      const gazeX = faceData?.faceDetected ? faceData.eyeGazeX * 0.1 : Math.sin(time * 0.5) * 0.05;
      const gazeY = faceData?.faceDetected ? faceData.eyeGazeY * 0.1 : Math.cos(time * 0.3) * 0.05;
      
      eyeOrbsRef.current.children.forEach((orb, i) => {
        const mesh = orb as THREE.Mesh;
        const baseX = i === 0 ? -0.25 : 0.25;
        mesh.position.x = baseX + gazeX;
        mesh.position.y = 0.15 + gazeY;
        
        // Blink animation
        const openness = faceData?.faceDetected 
          ? (i === 0 ? faceData.leftEyeOpenness : faceData.rightEyeOpenness)
          : 1;
        mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, openness, 0.15);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central energy core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={0.8}
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner core */}
      <mesh scale={0.35}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Pulse wave */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Eye orbs - abstract representation */}
      <group ref={eyeOrbsRef} position={[0, 0, 0.55]}>
        <mesh position={[-0.25, 0.15, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={accentColor}
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0.25, 0.15, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={accentColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Inner rotating rings */}
      <group ref={innerRingsRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.02, 8, 64]} />
          <meshStandardMaterial
            color={secondaryColor}
            emissive={secondaryColor}
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, Math.PI / 4]}>
          <torusGeometry args={[0.75, 0.015, 8, 64]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.4}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Outer rotating rings */}
      <group ref={outerRingsRef}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[1.1, 0.025, 8, 64]} />
          <meshStandardMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.15, 0.02, 8, 64]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
          />
        </mesh>
        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[1.2, 0.015, 8, 64]} />
          <meshStandardMaterial
            color={secondaryColor}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      {/* Floating energy particles */}
      <group ref={particlesRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 12) * Math.PI * 2) * 1.3,
              0,
              Math.sin((i / 12) * Math.PI * 2) * 1.3,
            ]}
          >
            <octahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? accentColor : glowColor}
              emissive={i % 2 === 0 ? accentColor : glowColor}
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Energy streams */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={`stream-${i}`}
            position={[
              Math.cos(angle) * 0.6,
              0,
              Math.sin(angle) * 0.6,
            ]}
            rotation={[0, angle, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.01, 0.03, 0.5, 8]} />
            <meshStandardMaterial
              color={secondaryColor}
              emissive={secondaryColor}
              emissiveIntensity={0.4}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Ambient glow sphere */}
      <mesh scale={1.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Secondary glow */}
      <mesh scale={1.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={primaryColor}
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

const AbstractEnergyAvatar: React.FC<AbstractEnergyAvatarProps> = ({
  isSpeaking = false,
  faceData = null,
  colors = {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#06b6d4",
    glow: "#f472b6",
  },
}) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
        <pointLight position={[-5, 3, 5]} intensity={0.4} color="#8b5cf6" />
        <pointLight position={[0, -3, 5]} intensity={0.3} color="#06b6d4" />
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
          <EnergyCore isSpeaking={isSpeaking} faceData={faceData} colors={colors} />
        </Float>
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default AbstractEnergyAvatar;
