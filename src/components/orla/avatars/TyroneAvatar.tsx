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

interface TyroneAvatarProps {
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

const TyroneHead: React.FC<{
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

  // Aurelia brand-aligned skin tone - rich mahogany warmth
  const skinColor = useMemo(() => new THREE.Color("#5a3d2b"), []);
  const skinHighlight = useMemo(() => new THREE.Color("#6d4d3a"), []);
  // Deep luxurious hair with subtle warmth
  const hairColor = useMemo(() => new THREE.Color("#0f0e0d"), []);
  // Refined lip color with champagne undertones
  const lipColor = useMemo(() => new THREE.Color("#7a5252"), []);

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
        // Elegant, confident subtle movement
        groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.06;
        groupRef.current.rotation.x = Math.sin(time * 0.15) * 0.02;
      }
    }

    // Eye animations with natural blink
    if (leftEyeRef.current && rightEyeRef.current) {
      const blinkCycle = Math.sin(time * 3) > 0.97 ? 0.1 : 1;
      const leftScale = faceData?.faceDetected ? faceData.leftEyeOpenness : blinkCycle;
      const rightScale = faceData?.faceDetected ? faceData.rightEyeOpenness : blinkCycle;
      
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, leftScale, 0.25);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, rightScale, 0.25);
    }

    // Expressive eyebrow animations
    if (leftBrowRef.current && rightBrowRef.current) {
      const browRaise = faceData?.faceDetected ? faceData.leftEyebrowRaise * 0.08 : Math.sin(time * 0.5) * 0.01;
      leftBrowRef.current.position.y = 0.52 + browRaise;
      rightBrowRef.current.position.y = 0.52 + browRaise;
    }

    // Mouth animation - smooth and refined
    if (mouthRef.current) {
      let targetOpen = 0.06;
      if (faceData?.faceDetected) {
        targetOpen = 0.06 + faceData.mouthOpenness * 0.22;
      } else if (isSpeaking) {
        targetOpen = 0.1 + Math.sin(time * 12) * 0.06 + Math.sin(time * 8) * 0.03;
      }
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, targetOpen, 0.2);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main head - elegant oval shape */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.05, 48, 48]} />
        <meshPhysicalMaterial
          color={skinColor}
          metalness={0.05}
          roughness={0.55}
          clearcoat={0.15}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Refined face structure overlay */}
      <mesh position={[0, -0.05, 0.15]} scale={[0.92, 1, 0.85]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={skinHighlight}
          metalness={0.02}
          roughness={0.5}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Strong, defined jawline */}
      <mesh position={[0, -0.65, 0.25]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[1.1, 0.45, 0.7]} />
        <meshPhysicalMaterial
          color={skinColor}
          metalness={0.03}
          roughness={0.5}
          clearcoat={0.1}
        />
      </mesh>

      {/* Elegant brow ridge */}
      <mesh position={[0, 0.42, 0.78]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.08, 0.9, 4, 16]} />
        <meshPhysicalMaterial
          color={skinColor}
          metalness={0.02}
          roughness={0.5}
        />
      </mesh>

      {/* Eyes - deep, expressive, almond-shaped */}
      <group position={[-0.3, 0.22, 0.88]}>
        {/* Eye socket shadow */}
        <mesh scale={[1.15, 0.65, 0.35]} position={[0, 0, -0.05]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#2a1f1a" />
        </mesh>
        {/* Sclera */}
        <mesh scale={[1.1, 0.6, 0.35]}>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial color="#faf8f5" />
        </mesh>
        {/* Iris */}
        <mesh ref={leftEyeRef} position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.075, 20, 20]} />
          <meshPhysicalMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.3}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
        {/* Pupil */}
        <mesh position={[0, 0, 0.09]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.02, 0.02, 0.1]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
      </group>

      <group position={[0.3, 0.22, 0.88]}>
        <mesh scale={[1.15, 0.65, 0.35]} position={[0, 0, -0.05]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#2a1f1a" />
        </mesh>
        <mesh scale={[1.1, 0.6, 0.35]}>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial color="#faf8f5" />
        </mesh>
        <mesh ref={rightEyeRef} position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.075, 20, 20]} />
          <meshPhysicalMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.3}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0.02, 0.02, 0.1]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Refined arched eyebrows */}
      <mesh ref={leftBrowRef} position={[-0.3, 0.52, 0.82]} rotation={[0.1, 0, 0.12]}>
        <capsuleGeometry args={[0.025, 0.22, 4, 8]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      <mesh ref={rightBrowRef} position={[0.3, 0.52, 0.82]} rotation={[0.1, 0, -0.12]}>
        <capsuleGeometry args={[0.025, 0.22, 4, 8]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>

      {/* Refined nose - elegant bridge */}
      <group position={[0, 0.02, 0.95]}>
        {/* Nose bridge */}
        <mesh rotation={[0.15, 0, 0]} position={[0, 0.12, -0.08]}>
          <boxGeometry args={[0.1, 0.32, 0.12]} />
          <meshPhysicalMaterial color={skinColor} roughness={0.45} />
        </mesh>
        {/* Nose tip */}
        <mesh position={[0, -0.08, 0.05]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshPhysicalMaterial color={skinHighlight} roughness={0.4} clearcoat={0.2} />
        </mesh>
        {/* Nostrils */}
        <mesh position={[-0.06, -0.12, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#2a1f1a" />
        </mesh>
        <mesh position={[0.06, -0.12, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#2a1f1a" />
        </mesh>
      </group>

      {/* Full, elegant lips */}
      <group position={[0, -0.38, 0.88]}>
        {/* Upper lip */}
        <mesh position={[0, 0.03, 0]} scale={[1, 0.7, 1]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.045, 0.22, 4, 12]} />
          <meshPhysicalMaterial
            color={lipColor}
            roughness={0.35}
            clearcoat={0.3}
          />
        </mesh>
        {/* Cupid's bow detail */}
        <mesh position={[0, 0.06, 0.02]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshPhysicalMaterial color={lipColor} roughness={0.3} />
        </mesh>
        {/* Lower lip - fuller */}
        <mesh ref={mouthRef} position={[0, -0.03, 0.01]} scale={[1, 0.06, 1]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.06, 0.2, 4, 12]} />
          <meshPhysicalMaterial
            color={lipColor}
            emissive={glowColor}
            emissiveIntensity={0.05}
            roughness={0.3}
            clearcoat={0.35}
          />
        </mesh>
      </group>

      {/* Defined chin */}
      <mesh position={[0, -0.72, 0.55]}>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshPhysicalMaterial color={skinColor} roughness={0.5} />
      </mesh>

      {/* High cheekbones */}
      <mesh position={[-0.52, 0.05, 0.6]} rotation={[0, 0.25, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshPhysicalMaterial color={skinHighlight} roughness={0.45} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.52, 0.05, 0.6]} rotation={[0, -0.25, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshPhysicalMaterial color={skinHighlight} roughness={0.45} transparent opacity={0.7} />
      </mesh>

      {/* Elegant short textured hair - low fade style */}
      <group position={[0, 0.75, 0]}>
        {/* Main hair volume - tight curls texture */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.95, 32, 32]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
        {/* Hair texture detail - small bumps for curl effect */}
        {Array.from({ length: 60 }).map((_, i) => {
          const theta = (i / 60) * Math.PI * 2;
          const phi = Math.random() * Math.PI * 0.4 + 0.2;
          const r = 0.92 + Math.random() * 0.08;
          return (
            <mesh
              key={i}
              position={[
                Math.sin(phi) * Math.cos(theta) * r,
                Math.cos(phi) * r * 0.5 + 0.1,
                Math.sin(phi) * Math.sin(theta) * r * 0.9,
              ]}
            >
              <sphereGeometry args={[0.04 + Math.random() * 0.02, 6, 6]} />
              <meshStandardMaterial color={hairColor} roughness={0.95} />
            </mesh>
          );
        })}
        {/* Side fade - gradual */}
        <mesh position={[-0.72, -0.3, 0]} scale={[0.12, 0.5, 0.8]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={hairColor} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.72, -0.3, 0]} scale={[0.12, 0.5, 0.8]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={hairColor} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Subtle facial hair - well-groomed goatee */}
      <mesh position={[0, -0.55, 0.62]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.08, 0.15, 16]} />
        <meshStandardMaterial color={hairColor} roughness={0.95} transparent opacity={0.7} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.85, 0.1, 0]} rotation={[0, -0.3, 0]}>
        <capsuleGeometry args={[0.1, 0.2, 4, 8]} />
        <meshPhysicalMaterial color={skinColor} roughness={0.5} />
      </mesh>
      <mesh position={[0.85, 0.1, 0]} rotation={[0, 0.3, 0]}>
        <capsuleGeometry args={[0.1, 0.2, 4, 8]} />
        <meshPhysicalMaterial color={skinColor} roughness={0.5} />
      </mesh>

      {/* Elegant gold accent - small ear stud */}
      <mesh position={[-0.9, 0.15, 0.1]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshPhysicalMaterial
          color={glowColor}
          metalness={0.9}
          roughness={0.1}
          emissive={glowColor}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Sophisticated aura glow */}
      <mesh scale={1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Inner rim light */}
      <mesh scale={1.08}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={primaryColor}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

const TyroneAvatar: React.FC<TyroneAvatarProps> = ({
  isSpeaking = false,
  faceData = null,
  colors = {
    primary: "#c9a55c",      // Aurelia champagne gold
    secondary: "#050810",    // Deep navy-black
    accent: "#6b4a3a",       // Warm amber eyes
    glow: "#d4b76a",         // Elegant gold glow
  },
}) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        {/* Aurelia-branded lighting - warm champagne golds */}
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.9} color="#f5efe6" />
        <pointLight position={[-5, 3, 5]} intensity={0.6} color="#d4b76a" />
        <pointLight position={[0, -3, 3]} intensity={0.25} color="#a08050" />
        <spotLight
          position={[0, 5, 3]}
          intensity={0.7}
          angle={0.5}
          color="#fff8f0"
        />
        {/* Subtle rim light for luxury feel */}
        <pointLight position={[0, 0, -3]} intensity={0.15} color="#c9a55c" />
        <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.1}>
          <TyroneHead isSpeaking={isSpeaking} faceData={faceData} colors={colors} />
        </Float>
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default TyroneAvatar;
