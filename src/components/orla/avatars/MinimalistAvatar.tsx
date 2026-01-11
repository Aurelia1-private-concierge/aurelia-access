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

interface MinimalistAvatarProps {
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

const GeometricHead: React.FC<{
  isSpeaking: boolean;
  faceData?: FaceData | null;
  colors: { primary: string; secondary: string; accent: string; glow: string };
}> = ({ isSpeaking, faceData, colors }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const innerShapesRef = useRef<THREE.Group>(null);

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
          0.08
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          faceData.headRotationY * 0.4,
          0.08
        );
      } else {
        groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
        groupRef.current.rotation.x = Math.cos(time * 0.15) * 0.05;
      }
    }

    // Orbiting elements
    if (orbitRef.current) {
      orbitRef.current.rotation.y = time * 0.2;
      orbitRef.current.rotation.x = time * 0.1;
    }

    // Inner shapes subtle rotation
    if (innerShapesRef.current) {
      innerShapesRef.current.rotation.y = time * 0.1;
      innerShapesRef.current.rotation.z = time * 0.05;
    }

    // Eye animations
    if (leftEyeRef.current && rightEyeRef.current) {
      const leftScale = faceData?.faceDetected ? faceData.leftEyeOpenness : 1;
      const rightScale = faceData?.faceDetected ? faceData.rightEyeOpenness : 1;
      
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, leftScale, 0.15);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, rightScale, 0.15);
    }

    // Mouth animation
    if (mouthRef.current) {
      let targetScale = 0.3;
      if (faceData?.faceDetected) {
        targetScale = 0.3 + faceData.mouthOpenness * 0.5;
      } else if (isSpeaking) {
        targetScale = 0.4 + Math.sin(time * 12) * 0.2;
      }
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, targetScale, 0.2);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main geometric head - icosahedron for low-poly look */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={primaryColor}
          flatShading
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Inner wireframe */}
      <mesh position={[0, 0, 0]} scale={0.85}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color={accentColor}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Inner geometric shapes */}
      <group ref={innerShapesRef} scale={0.5}>
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={secondaryColor}
            transparent
            opacity={0.6}
            flatShading
          />
        </mesh>
      </group>

      {/* Minimalist eyes - simple triangles */}
      <mesh
        ref={leftEyeRef}
        position={[-0.3, 0.15, 0.85]}
        rotation={[0, 0, Math.PI]}
      >
        <coneGeometry args={[0.12, 0.15, 3]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.6}
          flatShading
        />
      </mesh>
      <mesh
        ref={rightEyeRef}
        position={[0.3, 0.15, 0.85]}
        rotation={[0, 0, Math.PI]}
      >
        <coneGeometry args={[0.12, 0.15, 3]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.6}
          flatShading
        />
      </mesh>

      {/* Minimalist mouth - simple line */}
      <group ref={mouthRef} position={[0, -0.3, 0.85]} scale={[1, 0.3, 1]}>
        <mesh>
          <boxGeometry args={[0.4, 0.08, 0.05]} />
          <meshStandardMaterial
            color={secondaryColor}
            emissive={glowColor}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Orbiting geometric elements */}
      <group ref={orbitRef}>
        {/* Orbiting triangles */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={`tri-${i}`}
            position={[
              Math.sin((i / 3) * Math.PI * 2) * 1.6,
              Math.cos((i / 3) * Math.PI * 2) * 0.3,
              Math.cos((i / 3) * Math.PI * 2) * 1.6,
            ]}
            rotation={[0, (i / 3) * Math.PI * 2, Math.PI / 4]}
          >
            <tetrahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={0.4}
              flatShading
            />
          </mesh>
        ))}

        {/* Orbiting dots */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={`dot-${i}`}
            position={[
              Math.sin((i / 6) * Math.PI * 2) * 1.8,
              Math.sin(i * 0.5) * 0.5,
              Math.cos((i / 6) * Math.PI * 2) * 1.8,
            ]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Connecting lines */}
      <group>
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <mesh
              key={`line-${i}`}
              position={[
                Math.sin(angle) * 0.9,
                0,
                Math.cos(angle) * 0.9,
              ]}
              rotation={[0, angle + Math.PI / 2, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
              <meshStandardMaterial
                color={secondaryColor}
                transparent
                opacity={0.5}
              />
            </mesh>
          );
        })}
      </group>

      {/* Subtle outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[1.4, 0.02, 8, 32]} />
        <meshStandardMaterial
          color={secondaryColor}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Second ring perpendicular */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[1.5, 0.015, 8, 32]} />
        <meshStandardMaterial
          color={accentColor}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Ambient glow sphere */}
      <mesh scale={1.1}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

const MinimalistAvatar: React.FC<MinimalistAvatarProps> = ({
  isSpeaking = false,
  faceData = null,
  colors = {
    primary: "#f5f5f5",
    secondary: "#9e9e9e",
    accent: "#000000",
    glow: "#616161",
  },
}) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.6} />
        <pointLight position={[-5, 3, 5]} intensity={0.4} />
        <directionalLight position={[0, 5, 5]} intensity={0.5} />
        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.15}>
          <GeometricHead isSpeaking={isSpeaking} faceData={faceData} colors={colors} />
        </Float>
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default MinimalistAvatar;
