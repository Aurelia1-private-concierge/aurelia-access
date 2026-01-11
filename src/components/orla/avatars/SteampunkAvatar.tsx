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

interface SteampunkAvatarProps {
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

const SteampunkHead: React.FC<{
  isSpeaking: boolean;
  faceData?: FaceData | null;
  colors: { primary: string; secondary: string; accent: string; glow: string };
}> = ({ isSpeaking, faceData, colors }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftGearRef = useRef<THREE.Mesh>(null);
  const rightGearRef = useRef<THREE.Mesh>(null);
  const mouthGearRef = useRef<THREE.Mesh>(null);
  const monocleRef = useRef<THREE.Group>(null);
  const pipesRef = useRef<THREE.Group>(null);
  const steamRef = useRef<THREE.Group>(null);

  const primaryColor = useMemo(() => new THREE.Color(colors.primary), [colors.primary]);
  const secondaryColor = useMemo(() => new THREE.Color(colors.secondary), [colors.secondary]);
  const accentColor = useMemo(() => new THREE.Color(colors.accent), [colors.accent]);
  const glowColor = useMemo(() => new THREE.Color(colors.glow), [colors.glow]);
  const brassColor = useMemo(() => new THREE.Color("#b8860b"), []);
  const copperColor = useMemo(() => new THREE.Color("#b87333"), []);

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
        groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.15;
      }
    }

    // Gear rotations
    if (leftGearRef.current) {
      leftGearRef.current.rotation.z = time * 0.5;
    }
    if (rightGearRef.current) {
      rightGearRef.current.rotation.z = -time * 0.3;
    }
    if (mouthGearRef.current) {
      const speed = isSpeaking ? 3 : 0.5;
      mouthGearRef.current.rotation.z = time * speed;
    }

    // Monocle lens glow
    if (monocleRef.current) {
      monocleRef.current.rotation.z = Math.sin(time) * 0.05;
    }

    // Steam particles
    if (steamRef.current) {
      steamRef.current.children.forEach((particle, i) => {
        const mesh = particle as THREE.Mesh;
        mesh.position.y = ((time * 0.5 + i * 0.3) % 1.5) + 0.5;
        mesh.scale.setScalar(0.05 + Math.sin(time + i) * 0.02);
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.opacity = 0.6 - (mesh.position.y - 0.5) * 0.4;
        }
      });
    }
  });

  const GearShape: React.FC<{ 
    radius: number; 
    teeth: number; 
    color: THREE.Color;
    emissive?: THREE.Color;
  }> = ({ radius, teeth, color, emissive }) => (
    <group>
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.05, teeth]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.3}
          emissive={emissive}
          emissiveIntensity={emissive ? 0.3 : 0}
        />
      </mesh>
      {Array.from({ length: teeth }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / teeth) * Math.PI * 2) * radius * 1.1,
            0,
            Math.sin((i / teeth) * Math.PI * 2) * radius * 1.1,
          ]}
          rotation={[Math.PI / 2, 0, (i / teeth) * Math.PI * 2]}
        >
          <boxGeometry args={[0.06, 0.05, 0.08]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );

  return (
    <group ref={groupRef}>
      {/* Main head - brass/copper mechanical */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>

      {/* Riveted panels */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin((i / 4) * Math.PI * 2) * 0.95,
            0,
            Math.cos((i / 4) * Math.PI * 2) * 0.95,
          ]}
          rotation={[0, (i / 4) * Math.PI * 2, 0]}
        >
          <boxGeometry args={[0.4, 0.6, 0.1]} />
          <meshStandardMaterial color={copperColor} metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Rivets */}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((i / 16) * Math.PI * 2) * 1.02,
            0.3,
            Math.cos((i / 16) * Math.PI * 2) * 1.02,
          ]}
        >
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={brassColor} metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Left eye - gear mechanism */}
      <group position={[-0.35, 0.2, 0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh ref={leftGearRef}>
          <GearShape radius={0.15} teeth={12} color={brassColor} emissive={accentColor} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Right eye - monocle with lens */}
      <group ref={monocleRef} position={[0.35, 0.2, 0.85]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.03, 8, 32]} />
          <meshStandardMaterial color={brassColor} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh ref={rightGearRef} position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <GearShape radius={0.1} teeth={8} color={copperColor} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial
            color={glowColor}
            transparent
            opacity={0.4}
            emissive={glowColor}
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Monocle chain */}
        <mesh position={[0.2, -0.1, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
          <meshStandardMaterial color={brassColor} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Mechanical mouth */}
      <group position={[0, -0.35, 0.8]}>
        <mesh ref={mouthGearRef} rotation={[Math.PI / 2, 0, 0]}>
          <GearShape radius={0.12} teeth={10} color={copperColor} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.3, 0.1, 0.05]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Mouth grille */}
        {[-0.1, 0, 0.1].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.08]}>
            <boxGeometry args={[0.02, 0.08, 0.02]} />
            <meshStandardMaterial color={brassColor} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Top hat with gears */}
      <group position={[0, 1.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial color="#2d2d2d" metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.35, 0.38, 0.6, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Hat gear decoration */}
        <mesh position={[0.3, 0.35, 0.2]} rotation={[0.3, 0, 0.5]}>
          <GearShape radius={0.12} teeth={8} color={brassColor} />
        </mesh>
        {/* Goggles on hat */}
        <mesh position={[0, 0.1, 0.38]}>
          <torusGeometry args={[0.08, 0.02, 8, 32]} />
          <meshStandardMaterial color={brassColor} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.15, 0.1, 0.36]}>
          <torusGeometry args={[0.08, 0.02, 8, 32]} />
          <meshStandardMaterial color={brassColor} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Steam pipes */}
      <group ref={pipesRef}>
        <mesh position={[-0.9, 0.5, 0]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          <meshStandardMaterial color={copperColor} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.9, 0.5, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          <meshStandardMaterial color={copperColor} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Steam particles */}
      <group ref={steamRef} position={[-0.9, 0.8, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, i * 0.3, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* Pressure gauge */}
      <group position={[0, 0, -0.95]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[0.15, 0.18, 32]} />
          <meshStandardMaterial color={brassColor} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

const SteampunkAvatar: React.FC<SteampunkAvatarProps> = ({
  isSpeaking = false,
  faceData = null,
  colors = {
    primary: "#8b7355",
    secondary: "#b87333",
    accent: "#ffd700",
    glow: "#ff6b35",
  },
}) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#ffd700" />
        <pointLight position={[-5, 3, 5]} intensity={0.5} color="#ff6b35" />
        <spotLight
          position={[0, 5, 0]}
          intensity={0.6}
          color="#ffcc80"
          angle={0.5}
        />
        <Float speed={1} rotationIntensity={0.15} floatIntensity={0.2}>
          <SteampunkHead isSpeaking={isSpeaking} faceData={faceData} colors={colors} />
        </Float>
        <Environment preset="warehouse" />
      </Canvas>
    </div>
  );
};

export default SteampunkAvatar;
