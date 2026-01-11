import React, { useRef, useMemo, useEffect, useState, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { FaceData } from "@/hooks/useFaceTracking";

interface AnimeAvatarProps {
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

// Anime-style face
const AnimeFace = memo(({
  isSpeaking,
  isConnected,
  isListening,
  getVolume,
  emotion,
  faceData,
  colors,
}: Omit<AnimeAvatarProps, "size">) => {
  const groupRef = useRef<THREE.Group>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const primaryColor = useMemo(() => new THREE.Color(colors?.primary || "#ffe4d6"), [colors]);
  const accentColor = useMemo(() => new THREE.Color(colors?.accent || "#ff6b9d"), [colors]);
  const glowColor = useMemo(() => new THREE.Color(colors?.glow || "#ffd700"), [colors]);

  // Audio tracking
  useEffect(() => {
    if (!isSpeaking || !getVolume) {
      setAudioLevel(0);
      return;
    }
    let animationId: number;
    const update = () => {
      setAudioLevel(prev => prev + (getVolume() - prev) * 0.25);
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
          (faceData.headRotationX * Math.PI) / 180 * 1.2,
          0.08
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          (-faceData.headRotationY * Math.PI) / 180 * 1.2,
          0.08
        );
      } else {
        // Bouncy idle animation
        groupRef.current.rotation.y = Math.sin(time * 0.4) * 0.08;
        groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.04;
        groupRef.current.position.y = Math.sin(time * 1.5) * 0.03;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.08} floatIntensity={0.15}>
        {/* Main face - more rounded for anime style */}
        <mesh>
          <sphereGeometry args={[0.85, 64, 64]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>

        {/* Blush spots */}
        <mesh position={[-0.35, -0.05, 0.7]} rotation={[0, 0.3, 0]}>
          <circleGeometry args={[0.12, 32]} />
          <meshBasicMaterial color="#ffb3c1" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.35, -0.05, 0.7]} rotation={[0, -0.3, 0]}>
          <circleGeometry args={[0.12, 32]} />
          <meshBasicMaterial color="#ffb3c1" transparent opacity={0.5} />
        </mesh>

        {/* Anime eyes */}
        <AnimeEyes 
          faceData={faceData}
          emotion={emotion}
          accentColor={colors?.accent}
          isSpeaking={isSpeaking}
        />

        {/* Anime mouth */}
        <AnimeMouth 
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          faceData={faceData}
          emotion={emotion}
        />

        {/* Cute nose */}
        <mesh position={[0, -0.02, 0.82]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshToonMaterial color="#ffcdb2" />
        </mesh>

        {/* Hair bangs (simplified) */}
        <AnimeHair colors={colors} />
      </Float>

      {/* Sparkle effects when active */}
      {isConnected && (
        <>
          <Sparkles 
            count={40} 
            scale={3} 
            size={3} 
            speed={0.8} 
            opacity={0.6} 
            color={glowColor}
          />
          {/* Kawaii floating stars */}
          <FloatingStars emotion={emotion} color={accentColor} />
        </>
      )}

      {/* Outer glow */}
      <mesh position={[0, 0, -0.3]}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial 
          color={glowColor}
          transparent
          opacity={isConnected ? 0.2 : 0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
});

AnimeFace.displayName = "AnimeFace";

// Large anime-style eyes
const AnimeEyes = memo(({ faceData, emotion, accentColor, isSpeaking }: {
  faceData?: FaceData;
  emotion?: string;
  accentColor?: string;
  isSpeaking: boolean;
}) => {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const [blink, setBlink] = useState(1);
  const [sparkle, setSparkle] = useState(0);

  // Blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(0.05);
      setTimeout(() => setBlink(1), 100);
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Eye sparkle animation
  useFrame((state) => {
    setSparkle(Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5);
    
    const eyeOpen = faceData?.faceDetected 
      ? Math.min(faceData.leftEyeOpenness, faceData.rightEyeOpenness)
      : blink;

    // Happy squint
    const happySquint = emotion === "happy" ? 0.7 : 1;

    [leftRef, rightRef].forEach(ref => {
      if (ref.current) {
        ref.current.scale.y = THREE.MathUtils.lerp(
          ref.current.scale.y, 
          eyeOpen * happySquint, 
          0.25
        );
      }
    });
  });

  const eyeColor = accentColor || "#6366f1";

  return (
    <>
      {/* Left eye */}
      <group ref={leftRef} position={[-0.22, 0.12, 0.65]}>
        {/* Eye white with anime shape */}
        <mesh>
          <capsuleGeometry args={[0.1, 0.08, 16, 32]} />
          <meshToonMaterial color="#ffffff" />
        </mesh>
        {/* Large iris */}
        <mesh position={[0, 0, 0.08]}>
          <circleGeometry args={[0.09, 32]} />
          <meshToonMaterial color={eyeColor} />
        </mesh>
        {/* Gradient iris detail */}
        <mesh position={[0, -0.02, 0.085]}>
          <circleGeometry args={[0.07, 32]} />
          <meshBasicMaterial color={new THREE.Color(eyeColor).multiplyScalar(0.7)} />
        </mesh>
        {/* Pupil */}
        <mesh position={[0, 0, 0.09]}>
          <circleGeometry args={[0.04, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Large highlight */}
        <mesh position={[0.03, 0.04, 0.095]}>
          <circleGeometry args={[0.035, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Small highlight */}
        <mesh position={[-0.02, -0.02, 0.095]}>
          <circleGeometry args={[0.015, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        {/* Sparkle */}
        <mesh position={[0.04, 0.05, 0.1]} scale={0.8 + sparkle * 0.4}>
          <ringGeometry args={[0.008, 0.015, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Right eye - mirrored */}
      <group ref={rightRef} position={[0.22, 0.12, 0.65]}>
        <mesh>
          <capsuleGeometry args={[0.1, 0.08, 16, 32]} />
          <meshToonMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <circleGeometry args={[0.09, 32]} />
          <meshToonMaterial color={eyeColor} />
        </mesh>
        <mesh position={[0, -0.02, 0.085]}>
          <circleGeometry args={[0.07, 32]} />
          <meshBasicMaterial color={new THREE.Color(eyeColor).multiplyScalar(0.7)} />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <circleGeometry args={[0.04, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[-0.03, 0.04, 0.095]}>
          <circleGeometry args={[0.035, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.02, -0.02, 0.095]}>
          <circleGeometry args={[0.015, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        <mesh position={[-0.04, 0.05, 0.1]} scale={0.8 + sparkle * 0.4}>
          <ringGeometry args={[0.008, 0.015, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </>
  );
});

AnimeEyes.displayName = "AnimeEyes";

// Anime-style mouth
const AnimeMouth = memo(({ isSpeaking, audioLevel, faceData, emotion }: {
  isSpeaking: boolean;
  audioLevel: number;
  faceData?: FaceData;
  emotion?: string;
}) => {
  const mouthRef = useRef<THREE.Group>(null);
  const [mouthShape, setMouthShape] = useState<"smile" | "open" | "cat" | "o">("smile");

  useEffect(() => {
    if (emotion === "happy") setMouthShape("smile");
    else if (emotion === "curious" || emotion === "thinking") setMouthShape("o");
    else if (isSpeaking) setMouthShape("open");
    else setMouthShape("cat");
  }, [emotion, isSpeaking]);

  useFrame(() => {
    if (mouthRef.current && isSpeaking) {
      mouthRef.current.scale.y = 0.8 + audioLevel * 0.6;
    }
  });

  const MouthShape = () => {
    switch (mouthShape) {
      case "smile":
        return (
          <mesh rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
            <meshToonMaterial color="#ff6b9d" />
          </mesh>
        );
      case "open":
        return (
          <group ref={mouthRef}>
            <mesh>
              <circleGeometry args={[0.06, 32]} />
              <meshBasicMaterial color="#4a0010" />
            </mesh>
            <mesh position={[0, 0.04, 0.01]}>
              <circleGeometry args={[0.04, 32, 0, Math.PI]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      case "o":
        return (
          <mesh>
            <ringGeometry args={[0.03, 0.05, 32]} />
            <meshToonMaterial color="#ff6b9d" />
          </mesh>
        );
      case "cat":
      default:
        return (
          <>
            {/* Cat mouth - "ω" shape */}
            <mesh position={[-0.03, 0, 0]} rotation={[0, 0, Math.PI + 0.3]}>
              <torusGeometry args={[0.03, 0.01, 8, 16, Math.PI]} />
              <meshToonMaterial color="#ff6b9d" />
            </mesh>
            <mesh position={[0.03, 0, 0]} rotation={[0, 0, Math.PI - 0.3]}>
              <torusGeometry args={[0.03, 0.01, 8, 16, Math.PI]} />
              <meshToonMaterial color="#ff6b9d" />
            </mesh>
          </>
        );
    }
  };

  return (
    <group position={[0, -0.2, 0.78]}>
      <MouthShape />
    </group>
  );
});

AnimeMouth.displayName = "AnimeMouth";

// Simplified anime hair
const AnimeHair = memo(({ colors }: { colors?: AnimeAvatarProps["colors"] }) => {
  const hairColor = colors?.secondary || "#4a3728";
  
  return (
    <group position={[0, 0.3, 0]}>
      {/* Main hair volume */}
      <mesh position={[0, 0.2, -0.2]}>
        <sphereGeometry args={[0.9, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshToonMaterial color={hairColor} />
      </mesh>
      
      {/* Bangs */}
      {[-0.35, -0.15, 0.05, 0.25, 0.4].map((x, i) => (
        <mesh key={i} position={[x, -0.15, 0.6]} rotation={[0.2, 0, (x - 0.05) * 0.3]}>
          <coneGeometry args={[0.1, 0.35, 8]} />
          <meshToonMaterial color={hairColor} />
        </mesh>
      ))}

      {/* Side hair strands */}
      <mesh position={[-0.7, -0.2, 0.2]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
        <meshToonMaterial color={hairColor} />
      </mesh>
      <mesh position={[0.7, -0.2, 0.2]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
        <meshToonMaterial color={hairColor} />
      </mesh>
    </group>
  );
});

AnimeHair.displayName = "AnimeHair";

// Floating decorative stars
const FloatingStars = memo(({ emotion, color }: { emotion?: string; color: THREE.Color }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  if (emotion !== "happy" && emotion !== "warm") return null;

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos((i / 3) * Math.PI * 2) * 1.3,
            Math.sin((i / 3) * Math.PI * 2) * 1.3 + 0.3,
            0.5,
          ]}
          scale={0.08}
        >
          <ringGeometry args={[0.5, 1, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
});

FloatingStars.displayName = "FloatingStars";

// Main component
const AnimeAvatar: React.FC<AnimeAvatarProps> = ({
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
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <directionalLight position={[-3, 3, 3]} intensity={0.4} color="#ffe4f2" />
        <pointLight position={[0, 0, 2]} intensity={0.5} color={colors?.glow || "#ffd700"} />

        <AnimeFace
          isSpeaking={isSpeaking}
          isConnected={isConnected}
          isListening={isListening}
          getVolume={getVolume}
          emotion={emotion}
          faceData={faceData}
          colors={colors}
        />

        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};

export default memo(AnimeAvatar);
