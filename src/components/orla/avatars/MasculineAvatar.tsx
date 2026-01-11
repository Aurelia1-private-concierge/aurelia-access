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

interface MasculineAvatarProps {
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

const MasculineHead: React.FC<{
  isSpeaking: boolean;
  faceData?: FaceData | null;
  colors: { primary: string; secondary: string; accent: string; glow: string };
}> = ({ isSpeaking, faceData, colors }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftBrowRef = useRef<THREE.Mesh>(null);
  const rightBrowRef = useRef<THREE.Mesh>(null);

  const primaryColor = useMemo(() => new THREE.Color(colors.primary), [colors.primary]);
  const secondaryColor = useMemo(() => new THREE.Color(colors.secondary), [colors.secondary]);
  const accentColor = useMemo(() => new THREE.Color(colors.accent), [colors.accent]);
  const glowColor = useMemo(() => new THREE.Color(colors.glow), [colors.glow]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      if (faceData?.faceDetected) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          faceData.headRotationX * 0.4,
          0.1
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          faceData.headRotationY * 0.4,
          0.1
        );
      } else {
        groupRef.current.rotation.y = Math.sin(time * 0.25) * 0.08;
        groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.03;
      }
    }

    // Eye animations
    if (leftEyeRef.current && rightEyeRef.current) {
      const leftScale = faceData?.faceDetected ? faceData.leftEyeOpenness : 1;
      const rightScale = faceData?.faceDetected ? faceData.rightEyeOpenness : 1;
      
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, leftScale, 0.2);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, rightScale, 0.2);
    }

    // Eyebrow animations
    if (leftBrowRef.current && rightBrowRef.current) {
      const browRaise = faceData?.faceDetected ? faceData.leftEyebrowRaise * 0.1 : 0;
      leftBrowRef.current.position.y = 0.55 + browRaise;
      rightBrowRef.current.position.y = 0.55 + browRaise;
    }

    // Mouth animation
    if (mouthRef.current) {
      let targetOpen = 0.08;
      if (faceData?.faceDetected) {
        targetOpen = 0.08 + faceData.mouthOpenness * 0.25;
      } else if (isSpeaking) {
        targetOpen = 0.12 + Math.sin(time * 14) * 0.08;
      }
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, targetOpen, 0.25);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main head - more angular/squared shape */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 1.9, 1.5]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.15}
          roughness={0.6}
        />
      </mesh>

      {/* Rounded edges overlay */}
      <mesh position={[0, 0, 0]} scale={[0.95, 0.95, 0.95]}>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.1}
          roughness={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Strong jawline */}
      <mesh position={[0, -0.7, 0.3]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.8]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.1}
          roughness={0.5}
        />
      </mesh>

      {/* Prominent brow ridge */}
      <mesh position={[0, 0.45, 0.75]}>
        <boxGeometry args={[1.1, 0.15, 0.3]} />
        <meshStandardMaterial
          color={secondaryColor}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>

      {/* Eyes - deeper set, more angular */}
      <group position={[-0.32, 0.25, 0.85]}>
        <mesh scale={[1.1, 0.7, 0.4]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
        <mesh ref={leftEyeRef} position={[0, 0, 0.06]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        {/* Pupil */}
        <mesh position={[0, 0, 0.1]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      <group position={[0.32, 0.25, 0.85]}>
        <mesh scale={[1.1, 0.7, 0.4]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
        <mesh ref={rightEyeRef} position={[0, 0, 0.06]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* Thick eyebrows */}
      <mesh ref={leftBrowRef} position={[-0.32, 0.55, 0.8]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.28, 0.06, 0.08]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
      <mesh ref={rightBrowRef} position={[0.32, 0.55, 0.8]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.28, 0.06, 0.08]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>

      {/* Angular nose */}
      <group position={[0, 0.05, 0.95]}>
        <mesh rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.12, 0.35, 0.15]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        {/* Nose bridge */}
        <mesh position={[0, 0.15, -0.05]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.08, 0.2, 0.1]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
      </group>

      {/* Firm mouth */}
      <mesh ref={mouthRef} position={[0, -0.35, 0.85]} scale={[1, 0.08, 1]}>
        <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
        <meshStandardMaterial
          color="#8b6b61"
          emissive={glowColor}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Chin definition */}
      <mesh position={[0, -0.65, 0.6]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>

      {/* Cheekbones */}
      <mesh position={[-0.6, 0, 0.5]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.25, 0.2]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>
      <mesh position={[0.6, 0, 0.5]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.3, 0.25, 0.2]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>

      {/* Short styled hair */}
      <group position={[0, 0.85, 0]}>
        {/* Top hair */}
        <mesh position={[0, 0.1, 0.1]}>
          <boxGeometry args={[1.2, 0.25, 1.1]} />
          <meshStandardMaterial color={secondaryColor} />
        </mesh>
        {/* Side hair */}
        <mesh position={[-0.7, -0.2, 0]}>
          <boxGeometry args={[0.15, 0.4, 0.9]} />
          <meshStandardMaterial color={secondaryColor} />
        </mesh>
        <mesh position={[0.7, -0.2, 0]}>
          <boxGeometry args={[0.15, 0.4, 0.9]} />
          <meshStandardMaterial color={secondaryColor} />
        </mesh>
      </group>

      {/* Subtle glow aura */}
      <mesh scale={1.15}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

const MasculineAvatar: React.FC<MasculineAvatarProps> = ({
  isSpeaking = false,
  faceData = null,
  colors = {
    primary: "#c9a66b",
    secondary: "#4a3728",
    accent: "#5d8aa8",
    glow: "#d4af37",
  },
}) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.7} />
        <pointLight position={[-5, 3, 5]} intensity={0.4} color="#ffd700" />
        <spotLight
          position={[0, 5, 3]}
          intensity={0.5}
          angle={0.5}
        />
        <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.15}>
          <MasculineHead isSpeaking={isSpeaking} faceData={faceData} colors={colors} />
        </Float>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default MasculineAvatar;
