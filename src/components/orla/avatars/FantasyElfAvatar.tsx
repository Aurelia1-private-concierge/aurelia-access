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

interface FantasyElfAvatarProps {
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

const ElfAvatar: React.FC<{
  isSpeaking: boolean;
  faceData?: FaceData | null;
  colors: { primary: string; secondary: string; accent: string; glow: string };
}> = ({ isSpeaking, faceData, colors }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEarRef = useRef<THREE.Mesh>(null);
  const rightEarRef = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Group>(null);
  const runesRef = useRef<THREE.Group>(null);

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
          faceData.headRotationX * 0.5,
          0.1
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          faceData.headRotationY * 0.5,
          0.1
        );
      } else {
        groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
        groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.05;
      }
    }

    // Ears gentle movement
    if (leftEarRef.current && rightEarRef.current) {
      const earTwitch = Math.sin(time * 2) * 0.05;
      leftEarRef.current.rotation.z = 0.3 + earTwitch;
      rightEarRef.current.rotation.z = -0.3 - earTwitch;
    }

    // Crown glow pulse
    if (crownRef.current) {
      crownRef.current.rotation.y = time * 0.1;
    }

    // Runes glow animation
    if (runesRef.current) {
      runesRef.current.children.forEach((rune, i) => {
        const mesh = rune as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissiveIntensity = 0.5 + Math.sin(time * 2 + i) * 0.3;
        }
      });
    }

    // Eye animations
    if (leftEyeRef.current && rightEyeRef.current) {
      const leftScale = faceData?.faceDetected ? faceData.leftEyeOpenness : 1;
      const rightScale = faceData?.faceDetected ? faceData.rightEyeOpenness : 1;
      
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, leftScale, 0.2);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, rightScale, 0.2);
    }

    // Mouth animation
    if (mouthRef.current) {
      let targetOpen = 0.1;
      if (faceData?.faceDetected) {
        targetOpen = 0.1 + faceData.mouthOpenness * 0.3;
      } else if (isSpeaking) {
        targetOpen = 0.15 + Math.sin(time * 15) * 0.1;
      }
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, targetOpen, 0.3);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ethereal face base - more angular for elf */}
      <mesh position={[0, 0, 0]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.2}
          roughness={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner glow */}
      <mesh position={[0, 0, 0]} scale={0.95}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={glowColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Pointed Ears */}
      <mesh ref={leftEarRef} position={[-0.9, 0.3, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.15, 0.8, 4]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={accentColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh ref={rightEarRef} position={[0.9, 0.3, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.15, 0.8, 4]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={accentColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Almond-shaped elven eyes */}
      <group position={[-0.3, 0.2, 0.85]}>
        <mesh scale={[1.3, 0.6, 0.3]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh ref={leftEyeRef} position={[0, 0, 0.08]} scale={[0.8, 1, 1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Eye sparkle */}
        <mesh position={[0.02, 0.02, 0.12]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1}
          />
        </mesh>
      </group>

      <group position={[0.3, 0.2, 0.85]}>
        <mesh scale={[1.3, 0.6, 0.3]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh ref={rightEyeRef} position={[0, 0, 0.08]} scale={[0.8, 1, 1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[-0.02, 0.02, 0.12]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1}
          />
        </mesh>
      </group>

      {/* Elegant elven eyebrows */}
      <mesh position={[-0.3, 0.45, 0.8]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.25, 0.03, 0.05]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
      <mesh position={[0.3, 0.45, 0.8]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.25, 0.03, 0.05]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>

      {/* Delicate nose */}
      <mesh position={[0, 0, 0.95]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.06, 0.2, 4]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>

      {/* Elegant mouth */}
      <mesh ref={mouthRef} position={[0, -0.3, 0.85]} scale={[1, 0.1, 1]}>
        <capsuleGeometry args={[0.08, 0.15, 4, 8]} />
        <meshStandardMaterial
          color="#cc6677"
          emissive={accentColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Crown/Circlet */}
      <group ref={crownRef} position={[0, 0.8, 0]}>
        <mesh>
          <torusGeometry args={[0.5, 0.03, 8, 32]} />
          <meshStandardMaterial
            color={accentColor}
            metalness={0.8}
            roughness={0.2}
            emissive={accentColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Crown gems */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[
              Math.sin((i / 5) * Math.PI * 2) * 0.5,
              0.1,
              Math.cos((i / 5) * Math.PI * 2) * 0.5,
            ]}
          >
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? accentColor : glowColor}
              emissive={i % 2 === 0 ? accentColor : glowColor}
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>

      {/* Magical runes floating around */}
      <group ref={runesRef}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[
              Math.sin((i / 6) * Math.PI * 2) * 1.5,
              Math.sin(i) * 0.3,
              Math.cos((i / 6) * Math.PI * 2) * 1.5,
            ]}
            rotation={[0, (i / 6) * Math.PI * 2, 0]}
          >
            <planeGeometry args={[0.15, 0.15]} />
            <meshStandardMaterial
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Ethereal aura */}
      <mesh position={[0, 0, 0]} scale={1.3}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

const FantasyElfAvatar: React.FC<FantasyElfAvatarProps> = ({
  isSpeaking = false,
  faceData = null,
  colors = {
    primary: "#e8dcc8",
    secondary: "#c4a77d",
    accent: "#7cb342",
    glow: "#81d4fa",
  },
}) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#fffde7" />
        <pointLight position={[-5, 3, 5]} intensity={0.4} color="#81d4fa" />
        <spotLight
          position={[0, 5, 0]}
          intensity={0.5}
          color="#c5e1a5"
          angle={0.5}
        />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <ElfAvatar isSpeaking={isSpeaking} faceData={faceData} colors={colors} />
        </Float>
        <Environment preset="forest" />
      </Canvas>
    </div>
  );
};

export default FantasyElfAvatar;
