import React, { useRef, useMemo, useEffect, useState, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { FaceData } from "@/hooks/useFaceTracking";

interface RoboticAvatarProps {
  isSpeaking: boolean;
  isConnected: boolean;
  isListening: boolean;
  getVolume?: () => number;
  emotion?: "neutral" | "happy" | "thinking" | "curious" | "warm" | "concerned" | "urgent";
  faceData?: FaceData;
  size?: number;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
}

// Robotic head component
const RoboticHead = memo(({
  isSpeaking,
  isConnected,
  isListening,
  getVolume,
  emotion,
  faceData,
  colors,
}: Omit<RoboticAvatarProps, "size">) => {
  const groupRef = useRef<THREE.Group>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const primaryColor = useMemo(() => new THREE.Color(colors?.primary || "#1a1a2e"), [colors]);
  const accentColor = useMemo(() => new THREE.Color(colors?.accent || "#00ffff"), [colors]);
  const glowColor = useMemo(() => new THREE.Color(colors?.glow || "#00ffff"), [colors]);

  // Audio tracking
  useEffect(() => {
    if (!isSpeaking || !getVolume) {
      setAudioLevel(0);
      return;
    }
    let animationId: number;
    const update = () => {
      setAudioLevel(prev => prev + (getVolume() - prev) * 0.3);
      animationId = requestAnimationFrame(update);
    };
    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [isSpeaking, getVolume]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      if (faceData?.faceDetected) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          (faceData.headRotationX * Math.PI) / 180,
          0.1
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          (-faceData.headRotationY * Math.PI) / 180,
          0.1
        );
      } else {
        // Precise mechanical movement
        groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.05;
        groupRef.current.rotation.x = Math.sin(time * 0.15) * 0.02;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main head shell */}
      <Float speed={0.5} rotationIntensity={0.02} floatIntensity={0.05}>
        {/* Outer shell */}
        <mesh>
          <dodecahedronGeometry args={[0.85, 1]} />
          <meshPhysicalMaterial
            color={primaryColor}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Inner glow core */}
        <mesh scale={0.75}>
          <icosahedronGeometry args={[0.85, 2]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.15 + (isSpeaking ? audioLevel * 0.2 : 0)}
            wireframe
          />
        </mesh>

        {/* Face plate */}
        <mesh position={[0, 0, 0.6]}>
          <planeGeometry args={[1.2, 0.8]} />
          <meshPhysicalMaterial
            color="#0a0a12"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Scanner line */}
        <ScannerLine isActive={isConnected} color={accentColor} />

        {/* LED eyes */}
        <RoboticEyes
          faceData={faceData}
          emotion={emotion}
          accentColor={accentColor}
          isConnected={isConnected}
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
        />

        {/* Audio visualizer mouth */}
        <RoboticMouth
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          accentColor={accentColor}
          faceData={faceData}
        />

        {/* Decorative panels */}
        <DecorativePanels isConnected={isConnected} accentColor={accentColor} />

        {/* Antenna */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
          <meshStandardMaterial color="#333" metalness={0.9} />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={isConnected ? accentColor : "#333"} />
        </mesh>
      </Float>

      {/* Holographic rings */}
      {isConnected && <HolographicRings accentColor={accentColor} isSpeaking={isSpeaking} />}

      {/* Data particles */}
      {isConnected && <DataParticles accentColor={accentColor} />}
    </group>
  );
});

RoboticHead.displayName = "RoboticHead";

// Scanner line effect
const ScannerLine = memo(({ isActive, color }: { isActive: boolean; color: THREE.Color }) => {
  const lineRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lineRef.current && isActive) {
      const y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
      lineRef.current.position.y = y;
    }
  });

  if (!isActive) return null;

  return (
    <mesh ref={lineRef} position={[0, 0, 0.65]}>
      <planeGeometry args={[1.1, 0.02]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
});

ScannerLine.displayName = "ScannerLine";

// LED-style robotic eyes
const RoboticEyes = memo(({
  faceData,
  emotion,
  accentColor,
  isConnected,
  isSpeaking,
  audioLevel,
}: {
  faceData?: FaceData;
  emotion?: string;
  accentColor: THREE.Color;
  isConnected: boolean;
  isSpeaking: boolean;
  audioLevel: number;
}) => {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const [pupilScale, setPupilScale] = useState(1);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Pupil dilation based on speaking
    const targetScale = 0.8 + (isSpeaking ? audioLevel * 0.4 : Math.sin(time) * 0.1);
    setPupilScale(prev => THREE.MathUtils.lerp(prev, targetScale, 0.1));

    // Eye tracking
    if (faceData?.faceDetected) {
      const gazeX = faceData.eyeGazeX * 0.05;
      const gazeY = faceData.eyeGazeY * 0.05;
      [leftRef, rightRef].forEach(ref => {
        if (ref.current) {
          ref.current.position.x += (gazeX - (ref.current.position.x - ref.current.userData.baseX)) * 0.1;
          ref.current.position.y += (gazeY - (ref.current.position.y - ref.current.userData.baseY)) * 0.1;
        }
      });
    }
  });

  const eyeShape = emotion === "happy" ? "arc" : emotion === "concerned" ? "angled" : "circle";

  return (
    <>
      {/* Left eye */}
      <group ref={leftRef} position={[-0.25, 0.1, 0.7]} userData={{ baseX: -0.25, baseY: 0.1 }}>
        {/* Eye socket */}
        <mesh>
          <ringGeometry args={[0.1, 0.13, 6]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
        {/* LED glow */}
        <mesh>
          <circleGeometry args={[0.09, 32]} />
          <meshBasicMaterial 
            color={isConnected ? accentColor : "#222"} 
            transparent 
            opacity={isConnected ? 0.9 : 0.3}
          />
        </mesh>
        {/* Pupil/iris */}
        <mesh position={[0, 0, 0.01]} scale={pupilScale}>
          <ringGeometry args={[0.02, 0.05, 32]} />
          <meshBasicMaterial color="#000" />
        </mesh>
        {/* Inner glow */}
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.02, 16]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Right eye */}
      <group ref={rightRef} position={[0.25, 0.1, 0.7]} userData={{ baseX: 0.25, baseY: 0.1 }}>
        <mesh>
          <ringGeometry args={[0.1, 0.13, 6]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
        <mesh>
          <circleGeometry args={[0.09, 32]} />
          <meshBasicMaterial 
            color={isConnected ? accentColor : "#222"} 
            transparent 
            opacity={isConnected ? 0.9 : 0.3}
          />
        </mesh>
        <mesh position={[0, 0, 0.01]} scale={pupilScale}>
          <ringGeometry args={[0.02, 0.05, 32]} />
          <meshBasicMaterial color="#000" />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.02, 16]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.8} />
        </mesh>
      </group>
    </>
  );
});

RoboticEyes.displayName = "RoboticEyes";

// Audio visualizer mouth
const RoboticMouth = memo(({
  isSpeaking,
  audioLevel,
  accentColor,
  faceData,
}: {
  isSpeaking: boolean;
  audioLevel: number;
  accentColor: THREE.Color;
  faceData?: FaceData;
}) => {
  const barsRef = useRef<THREE.Group>(null);
  const [levels, setLevels] = useState([0, 0, 0, 0, 0, 0, 0]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (isSpeaking) {
      // Audio reactive bars
      setLevels(prev => prev.map((_, i) => {
        const offset = i * 0.5;
        const target = Math.abs(Math.sin(time * 8 + offset)) * audioLevel;
        return THREE.MathUtils.lerp(prev[i], target, 0.3);
      }));
    } else if (faceData?.faceDetected && faceData.mouthOpenness > 0.1) {
      // Face tracking mouth
      const openness = faceData.mouthOpenness;
      setLevels(prev => prev.map((_, i) => {
        const center = 3;
        const dist = Math.abs(i - center) / center;
        return THREE.MathUtils.lerp(prev[i], openness * (1 - dist * 0.5), 0.2);
      }));
    } else {
      // Idle state
      setLevels(prev => prev.map(v => THREE.MathUtils.lerp(v, 0.1, 0.1)));
    }
  });

  return (
    <group ref={barsRef} position={[0, -0.2, 0.7]}>
      {levels.map((level, i) => (
        <mesh key={i} position={[(i - 3) * 0.06, 0, 0]}>
          <boxGeometry args={[0.04, 0.02 + level * 0.15, 0.01]} />
          <meshBasicMaterial 
            color={accentColor} 
            transparent 
            opacity={0.6 + level * 0.4}
          />
        </mesh>
      ))}
      {/* Mouth frame */}
      <mesh>
        <ringGeometry args={[0.18, 0.22, 4, 1, Math.PI * 0.75, Math.PI * 0.5]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
    </group>
  );
});

RoboticMouth.displayName = "RoboticMouth";

// Decorative panels
const DecorativePanels = memo(({ isConnected, accentColor }: { 
  isConnected: boolean;
  accentColor: THREE.Color;
}) => {
  return (
    <>
      {/* Side panels */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.65, 0, 0.3]} rotation={[0, side * 0.8, 0]}>
          <mesh>
            <planeGeometry args={[0.2, 0.4]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.9} />
          </mesh>
          {/* LED strips */}
          {[0.12, 0.04, -0.04, -0.12].map((y, i) => (
            <mesh key={i} position={[0, y, 0.01]}>
              <planeGeometry args={[0.15, 0.02]} />
              <meshBasicMaterial 
                color={accentColor} 
                transparent 
                opacity={isConnected ? 0.8 - i * 0.15 : 0.2}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Top panel */}
      <mesh position={[0, 0.6, 0.4]} rotation={[-0.5, 0, 0]}>
        <planeGeometry args={[0.6, 0.15]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} />
      </mesh>
    </>
  );
});

DecorativePanels.displayName = "DecorativePanels";

// Holographic rings
const HolographicRings = memo(({ accentColor, isSpeaking }: { 
  accentColor: THREE.Color;
  isSpeaking: boolean;
}) => {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      ringsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={ringsRef}>
      {[1.2, 1.4, 1.6].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.2, 0, 0]}>
          <torusGeometry args={[radius, 0.005, 8, 64]} />
          <meshBasicMaterial 
            color={accentColor} 
            transparent 
            opacity={0.3 - i * 0.08}
          />
        </mesh>
      ))}
    </group>
  );
});

HolographicRings.displayName = "HolographicRings";

// Data particles
const DataParticles = memo(({ accentColor }: { accentColor: THREE.Color }) => {
  const particlesRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 50;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = Math.random() * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.userData.velocities = velocities;
    return geo;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const velocities = particlesRef.current.geometry.userData.velocities as Float32Array;

      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        if (positions[i * 3 + 1] > 1.5) {
          positions[i * 3 + 1] = -1.5;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        color={accentColor}
        size={0.03}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
});

DataParticles.displayName = "DataParticles";

// Main component
const RoboticAvatar: React.FC<RoboticAvatarProps> = ({
  isSpeaking,
  isConnected,
  isListening,
  getVolume,
  emotion = "neutral",
  faceData,
  size = 200,
  colors,
}) => {
  return (
    <div className="relative rounded-full overflow-hidden" style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <pointLight position={[0, 0, 3]} intensity={0.8} color={colors?.glow || "#00ffff"} />
        <pointLight position={[-2, 2, 2]} intensity={0.4} color="#4040ff" />

        <RoboticHead
          isSpeaking={isSpeaking}
          isConnected={isConnected}
          isListening={isListening}
          getVolume={getVolume}
          emotion={emotion}
          faceData={faceData}
          colors={colors}
        />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default memo(RoboticAvatar);
