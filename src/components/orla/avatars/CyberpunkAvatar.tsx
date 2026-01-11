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

interface CyberpunkAvatarProps {
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

const CyberpunkHead: React.FC<{
  isSpeaking: boolean;
  faceData?: FaceData | null;
  colors: { primary: string; secondary: string; accent: string; glow: string };
}> = ({ isSpeaking, faceData, colors }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Group>(null);
  const circuitLinesRef = useRef<THREE.Group>(null);
  const holoDisplayRef = useRef<THREE.Group>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const glitchRef = useRef<THREE.Group>(null);

  const primaryColor = useMemo(() => new THREE.Color(colors.primary), [colors.primary]);
  const secondaryColor = useMemo(() => new THREE.Color(colors.secondary), [colors.secondary]);
  const accentColor = useMemo(() => new THREE.Color(colors.accent), [colors.accent]);
  const glowColor = useMemo(() => new THREE.Color(colors.glow), [colors.glow]);
  const neonPink = useMemo(() => new THREE.Color("#ff0080"), []);
  const neonCyan = useMemo(() => new THREE.Color("#00ffff"), []);
  const neonPurple = useMemo(() => new THREE.Color("#bf00ff"), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const speakIntensity = isSpeaking ? 1.5 : 1;

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
        groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
        groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.03;
      }
    }

    // Circuit lines pulse
    if (circuitLinesRef.current) {
      circuitLinesRef.current.children.forEach((line, i) => {
        const mesh = line as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissiveIntensity = 0.5 + Math.sin(time * 3 + i * 0.5) * 0.4 * speakIntensity;
        }
      });
    }

    // Holographic display rotation
    if (holoDisplayRef.current) {
      holoDisplayRef.current.rotation.y = time * 0.5;
      holoDisplayRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.opacity = 0.3 + Math.sin(time * 2 + i) * 0.15;
        }
      });
    }

    // Scan line effect
    if (scanLineRef.current) {
      const scanY = ((time * 0.5) % 2) - 1;
      scanLineRef.current.position.y = scanY;
      if (scanLineRef.current.material instanceof THREE.MeshStandardMaterial) {
        scanLineRef.current.material.opacity = 0.4 + Math.sin(time * 10) * 0.2;
      }
    }

    // Glitch effect
    if (glitchRef.current) {
      const shouldGlitch = Math.random() > 0.98;
      glitchRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        if (shouldGlitch) {
          mesh.position.x = (Math.random() - 0.5) * 0.1;
          mesh.position.y = (Math.random() - 0.5) * 0.1;
        } else {
          mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, 0, 0.2);
          mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, 0, 0.2);
        }
      });
    }

    // Eye animations
    if (leftEyeRef.current && rightEyeRef.current) {
      const leftScale = faceData?.faceDetected ? faceData.leftEyeOpenness : 1;
      const rightScale = faceData?.faceDetected ? faceData.rightEyeOpenness : 1;
      
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, leftScale, 0.2);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, rightScale, 0.2);

      // Neon eye glow pulse
      [leftEyeRef.current, rightEyeRef.current].forEach((eye) => {
        if (eye.material instanceof THREE.MeshStandardMaterial) {
          eye.material.emissiveIntensity = 1 + Math.sin(time * 4) * 0.3 * speakIntensity;
        }
      });
    }

    // Mouth animation
    if (mouthRef.current) {
      let targetScale = 0.15;
      if (faceData?.faceDetected) {
        targetScale = 0.15 + faceData.mouthOpenness * 0.3;
      } else if (isSpeaking) {
        targetScale = 0.2 + Math.sin(time * 15) * 0.1;
      }
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, targetScale, 0.25);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main head - angular cyberpunk shape */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 1.8, 1.4]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Rounded blend layer */}
      <mesh position={[0, 0, 0]} scale={0.92}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#16213e"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Cyber implant panels */}
      <mesh position={[-0.7, 0.2, 0.3]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.4]} />
        <meshStandardMaterial
          color="#0f0f23"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0.7, 0.2, 0.3]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.4]} />
        <meshStandardMaterial
          color="#0f0f23"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Circuit lines */}
      <group ref={circuitLinesRef}>
        {/* Left side circuits */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`left-${i}`} position={[-0.65, 0.4 - i * 0.25, 0.5]}>
            <boxGeometry args={[0.3, 0.02, 0.02]} />
            <meshStandardMaterial
              color={neonCyan}
              emissive={neonCyan}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
        {/* Right side circuits */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`right-${i}`} position={[0.65, 0.4 - i * 0.25, 0.5]}>
            <boxGeometry args={[0.3, 0.02, 0.02]} />
            <meshStandardMaterial
              color={neonPink}
              emissive={neonPink}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
        {/* Vertical connectors */}
        <mesh position={[-0.5, 0, 0.55]}>
          <boxGeometry args={[0.02, 1, 0.02]} />
          <meshStandardMaterial
            color={neonCyan}
            emissive={neonCyan}
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh position={[0.5, 0, 0.55]}>
          <boxGeometry args={[0.02, 1, 0.02]} />
          <meshStandardMaterial
            color={neonPink}
            emissive={neonPink}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* Neon Eyes */}
      <group position={[-0.3, 0.2, 0.75]}>
        {/* Eye socket */}
        <mesh>
          <boxGeometry args={[0.25, 0.12, 0.1]} />
          <meshStandardMaterial color="#0a0a15" />
        </mesh>
        {/* Neon eye */}
        <mesh ref={leftEyeRef} position={[0, 0, 0.06]}>
          <boxGeometry args={[0.2, 0.08, 0.02]} />
          <meshStandardMaterial
            color={neonCyan}
            emissive={neonCyan}
            emissiveIntensity={1.2}
          />
        </mesh>
        {/* Eye border glow */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.24, 0.11, 0.01]} />
          <meshStandardMaterial
            color={neonCyan}
            emissive={neonCyan}
            emissiveIntensity={0.5}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      <group position={[0.3, 0.2, 0.75]}>
        <mesh>
          <boxGeometry args={[0.25, 0.12, 0.1]} />
          <meshStandardMaterial color="#0a0a15" />
        </mesh>
        <mesh ref={rightEyeRef} position={[0, 0, 0.06]}>
          <boxGeometry args={[0.2, 0.08, 0.02]} />
          <meshStandardMaterial
            color={neonPink}
            emissive={neonPink}
            emissiveIntensity={1.2}
          />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.24, 0.11, 0.01]} />
          <meshStandardMaterial
            color={neonPink}
            emissive={neonPink}
            emissiveIntensity={0.5}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      {/* LED Mouth display */}
      <group ref={mouthRef} position={[0, -0.35, 0.75]} scale={[1, 0.15, 1]}>
        <mesh>
          <boxGeometry args={[0.5, 0.3, 0.05]} />
          <meshStandardMaterial color="#0a0a15" />
        </mesh>
        {/* Horizontal LED bars */}
        {[-0.15, 0, 0.15].map((y, i) => (
          <mesh key={i} position={[0, y * 0.8, 0.03]}>
            <boxGeometry args={[0.4, 0.04, 0.02]} />
            <meshStandardMaterial
              color={neonPurple}
              emissive={neonPurple}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Holographic display elements */}
      <group ref={holoDisplayRef} position={[0, 0.9, 0]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.4, 0.01, 4, 4]} />
          <meshStandardMaterial
            color={neonCyan}
            emissive={neonCyan}
            emissiveIntensity={0.6}
            transparent
            opacity={0.4}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[0.5, 0.01, 4, 4]} />
          <meshStandardMaterial
            color={neonPink}
            emissive={neonPink}
            emissiveIntensity={0.6}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* Scan line */}
      <mesh ref={scanLineRef} position={[0, 0, 0.8]}>
        <planeGeometry args={[1.2, 0.02]} />
        <meshStandardMaterial
          color={neonCyan}
          emissive={neonCyan}
          emissiveIntensity={0.8}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glitch overlay group */}
      <group ref={glitchRef}>
        <mesh position={[0, 0, 0.01]} scale={[1.01, 1.01, 1.01]}>
          <boxGeometry args={[1.5, 1.8, 1.4]} />
          <meshStandardMaterial
            color={neonPink}
            transparent
            opacity={0.02}
            side={THREE.FrontSide}
          />
        </mesh>
      </group>

      {/* Cyber mohawk/antenna */}
      <group position={[0, 1, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, i * 0.1, -0.2 + i * 0.05]}>
            <boxGeometry args={[0.08, 0.15, 0.02]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? neonCyan : neonPink}
              emissive={i % 2 === 0 ? neonCyan : neonPink}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Side LED strips */}
      {[-0.78, 0.78].map((x, xi) => (
        <group key={xi} position={[x, 0, 0]}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} position={[0, 0.5 - i * 0.2, 0.3]}>
              <boxGeometry args={[0.04, 0.08, 0.04]} />
              <meshStandardMaterial
                color={xi === 0 ? neonCyan : neonPink}
                emissive={xi === 0 ? neonCyan : neonPink}
                emissiveIntensity={0.6}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Ambient neon glow */}
      <mesh scale={1.3}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={neonPurple}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

const CyberpunkAvatar: React.FC<CyberpunkAvatarProps> = ({
  isSpeaking = false,
  faceData = null,
  colors = {
    primary: "#1a1a2e",
    secondary: "#16213e",
    accent: "#00ffff",
    glow: "#ff0080",
  },
}) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#00ffff" />
        <pointLight position={[-5, 3, 5]} intensity={0.5} color="#ff0080" />
        <pointLight position={[0, -3, 5]} intensity={0.3} color="#bf00ff" />
        <spotLight
          position={[0, 5, 3]}
          intensity={0.4}
          color="#ffffff"
          angle={0.5}
        />
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.15}>
          <CyberpunkHead isSpeaking={isSpeaking} faceData={faceData} colors={colors} />
        </Float>
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default CyberpunkAvatar;
