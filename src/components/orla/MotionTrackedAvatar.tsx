import React, { useRef, useMemo, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { FaceData } from "@/hooks/useFaceTracking";

interface MotionTrackedAvatarProps {
  faceData: FaceData;
  isSpeaking?: boolean;
  isListening?: boolean;
  audioLevel?: number;
  size?: number;
  style?: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
}

// Stylized 3D Face Component
const StylizedFace = memo(({
  faceData,
  isSpeaking,
  isListening,
  audioLevel = 0,
  colors,
}: {
  faceData: FaceData;
  isSpeaking?: boolean;
  isListening?: boolean;
  audioLevel?: number;
  colors: { primary: THREE.Color; secondary: THREE.Color; accent: THREE.Color; glow: THREE.Color };
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Create particles
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 100;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 1;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      scales[i] = Math.random() * 0.5 + 0.5;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));
    return geometry;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Head movement based on face tracking
    if (groupRef.current && faceData.faceDetected) {
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
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        (-faceData.headRotationZ * Math.PI) / 180,
        0.1
      );
    } else if (groupRef.current) {
      // Idle animation when no face detected
      groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.05;
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
    }

    // Breathing animation on head
    if (headRef.current) {
      const breathe = Math.sin(time * 1.5) * 0.02 + 1;
      headRef.current.scale.set(breathe, breathe * 1.02, breathe);
    }

    // Eye blinking
    if (leftEyeRef.current && rightEyeRef.current) {
      const leftBlink = faceData.faceDetected ? faceData.leftEyeOpenness : (faceData.isBlinking ? 0.1 : 1);
      const rightBlink = faceData.faceDetected ? faceData.rightEyeOpenness : (faceData.isBlinking ? 0.1 : 1);
      
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, leftBlink, 0.3);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, rightBlink, 0.3);

      // Eye gaze
      if (faceData.faceDetected) {
        leftEyeRef.current.position.x = -0.25 + faceData.eyeGazeX * 0.02;
        rightEyeRef.current.position.x = 0.25 + faceData.eyeGazeX * 0.02;
        leftEyeRef.current.position.y = 0.15 + faceData.eyeGazeY * 0.02;
        rightEyeRef.current.position.y = 0.15 + faceData.eyeGazeY * 0.02;
      }
    }

    // Mouth animation
    if (mouthRef.current) {
      const targetOpenness = faceData.faceDetected 
        ? faceData.mouthOpenness 
        : (isSpeaking ? (audioLevel * 0.5 + Math.sin(time * 15) * 0.2) : 0.05);
      
      const targetWidth = faceData.faceDetected 
        ? faceData.mouthWidth 
        : (faceData.isSmiling ? 0.8 : 0.5);
      
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.5 + targetOpenness * 1.5, 0.2);
      mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 0.5 + targetWidth * 0.5, 0.1);
    }

    // Eyebrow animation
    if (leftEyebrowRef.current && rightEyebrowRef.current) {
      const leftRaise = faceData.faceDetected ? faceData.leftEyebrowRaise : 0.5;
      const rightRaise = faceData.faceDetected ? faceData.rightEyebrowRaise : 0.5;
      
      leftEyebrowRef.current.position.y = 0.45 + (leftRaise - 0.5) * 0.1;
      rightEyebrowRef.current.position.y = 0.45 + (rightRaise - 0.5) * 0.1;
      leftEyebrowRef.current.rotation.z = (leftRaise - 0.5) * 0.2;
      rightEyebrowRef.current.rotation.z = -(rightRaise - 0.5) * 0.2;
    }

    // Glow pulsing
    if (glowRef.current) {
      const glowIntensity = 1 + (isListening ? 0.3 : 0) + (isSpeaking ? audioLevel * 0.5 : 0);
      const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial;
      glowMaterial.opacity = 0.3 * glowIntensity + Math.sin(time * 2) * 0.1;
      glowRef.current.scale.setScalar(1.3 + Math.sin(time * 2) * 0.05 + audioLevel * 0.1);
    }

    // Particle animation
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.1;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time + i) * 0.002;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer glow */}
      <mesh ref={glowRef} position={[0, 0, -0.3]}>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial
          color={colors.glow}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Floating particles */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          color={colors.accent}
          size={0.03}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Main head - stylized sphere */}
        <mesh ref={headRef}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <meshPhysicalMaterial
            color={colors.primary}
            roughness={0.2}
            metalness={0.1}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
            envMapIntensity={0.5}
          />
        </mesh>

        {/* Inner glow core */}
        <mesh>
          <sphereGeometry args={[0.75, 32, 32]} />
          <meshBasicMaterial color={colors.secondary} transparent opacity={0.3} />
        </mesh>

        {/* Left eye group */}
        <group ref={leftEyeRef} position={[-0.25, 0.15, 0.65]}>
          {/* Eye white */}
          <mesh>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, 0, 0.08]}>
            <sphereGeometry args={[0.06, 32, 32]} />
            <meshStandardMaterial color={colors.accent} roughness={0.1} metalness={0.3} />
          </mesh>
          {/* Iris highlight */}
          <mesh position={[0.02, 0.02, 0.12]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Right eye group */}
        <group ref={rightEyeRef} position={[0.25, 0.15, 0.65]}>
          <mesh>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <sphereGeometry args={[0.06, 32, 32]} />
            <meshStandardMaterial color={colors.accent} roughness={0.1} metalness={0.3} />
          </mesh>
          <mesh position={[0.02, 0.02, 0.12]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Left eyebrow */}
        <mesh ref={leftEyebrowRef} position={[-0.25, 0.45, 0.6]}>
          <capsuleGeometry args={[0.02, 0.15, 8, 16]} />
          <meshStandardMaterial color={colors.accent} roughness={0.3} />
        </mesh>

        {/* Right eyebrow */}
        <mesh ref={rightEyebrowRef} position={[0.25, 0.45, 0.6]}>
          <capsuleGeometry args={[0.02, 0.15, 8, 16]} />
          <meshStandardMaterial color={colors.accent} roughness={0.3} />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.2, 0.7]}>
          <capsuleGeometry args={[0.08, 0.1, 8, 16]} />
          <meshStandardMaterial color={colors.accent} roughness={0.2} />
        </mesh>

        {/* Nose hint */}
        <mesh position={[0, 0, 0.75]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshPhysicalMaterial
            color={colors.primary}
            roughness={0.2}
            metalness={0.1}
            clearcoat={1}
          />
        </mesh>
      </Float>
    </group>
  );
});

StylizedFace.displayName = "StylizedFace";

// Status Ring Component
const StatusRing = memo(({ 
  isConnected, 
  isSpeaking, 
  isListening,
  audioLevel,
  colors,
}: {
  isConnected: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  audioLevel: number;
  colors: { primary: THREE.Color; glow: THREE.Color };
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.5;
      const scale = 1 + (isSpeaking ? audioLevel * 0.1 : 0) + Math.sin(time * 2) * 0.02;
      ringRef.current.scale.setScalar(scale);
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 0.3;
      const scale = 1.1 + (isListening ? 0.05 : 0) + Math.sin(time * 3) * 0.02;
      ring2Ref.current.scale.setScalar(scale);
    }
  });

  if (!isConnected) return null;

  return (
    <>
      <mesh ref={ringRef} position={[0, 0, -0.5]}>
        <torusGeometry args={[1.4, 0.015, 16, 64]} />
        <meshBasicMaterial color={colors.primary} transparent opacity={0.8} />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 0, -0.5]}>
        <torusGeometry args={[1.5, 0.01, 16, 64]} />
        <meshBasicMaterial color={colors.glow} transparent opacity={0.5} />
      </mesh>
    </>
  );
});

StatusRing.displayName = "StatusRing";

// Main Component
const MotionTrackedAvatar: React.FC<MotionTrackedAvatarProps> = ({
  faceData,
  isSpeaking = false,
  isListening = false,
  audioLevel = 0,
  size = 300,
  style,
}) => {
  const colors = useMemo(() => ({
    primary: new THREE.Color(style?.primary || "#C9A55C"),
    secondary: new THREE.Color(style?.secondary || "#1A1A2E"),
    accent: new THREE.Color(style?.accent || "#D4AF37"),
    glow: new THREE.Color(style?.glow || "#FFD700"),
  }), [style]);

  return (
    <div 
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Face detection indicator */}
      <div 
        className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-colors z-10 ${
          faceData.faceDetected 
            ? 'bg-green-500 shadow-lg shadow-green-500/50' 
            : 'bg-yellow-500 animate-pulse'
        }`}
        title={faceData.faceDetected ? "Face detected" : "No face detected"}
      />

      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, 2]} intensity={0.4} color="#8080ff" />
        <pointLight position={[0, 0, 3]} intensity={0.5} color={style?.glow || "#FFD700"} />

        <StylizedFace
          faceData={faceData}
          isSpeaking={isSpeaking}
          isListening={isListening}
          audioLevel={audioLevel}
          colors={colors}
        />

        <StatusRing
          isConnected={true}
          isSpeaking={isSpeaking}
          isListening={isListening}
          audioLevel={audioLevel}
          colors={colors}
        />

        <Environment preset="studio" />
      </Canvas>

      {/* Status overlay */}
      {(isSpeaking || isListening) && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span 
            className={`w-2 h-2 rounded-full ${
              isSpeaking ? 'bg-green-400 animate-pulse' : 
              isListening ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="text-xs text-white/80">
            {isSpeaking ? 'Speaking' : isListening ? 'Listening' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default memo(MotionTrackedAvatar);
