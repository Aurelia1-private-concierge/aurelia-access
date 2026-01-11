import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrlaExpression } from "@/hooks/useOrlaExpression";

interface ExpressiveOrbProps {
  expression: OrlaExpression;
  intensity: number;
  isBlinking: boolean;
  isActive: boolean;
  reducedMotion: boolean;
}

// Expression configurations
const expressionConfigs: Record<OrlaExpression, {
  eyeScale: number;
  eyeY: number;
  pupilScale: number;
  mouthCurve: number;
  mouthWidth: number;
  orbColor: string;
  glowIntensity: number;
  bounceSpeed: number;
}> = {
  neutral: {
    eyeScale: 1,
    eyeY: 0.12,
    pupilScale: 1,
    mouthCurve: 0.8,
    mouthWidth: 1,
    orbColor: "#f5ebe0",
    glowIntensity: 0.05,
    bounceSpeed: 1,
  },
  happy: {
    eyeScale: 0.9,
    eyeY: 0.14,
    pupilScale: 1.1,
    mouthCurve: 1.2,
    mouthWidth: 1.2,
    orbColor: "#fff5e6",
    glowIntensity: 0.15,
    bounceSpeed: 1.5,
  },
  thinking: {
    eyeScale: 0.85,
    eyeY: 0.18,
    pupilScale: 0.9,
    mouthCurve: 0.3,
    mouthWidth: 0.7,
    orbColor: "#e8e4df",
    glowIntensity: 0.08,
    bounceSpeed: 0.5,
  },
  listening: {
    eyeScale: 1.15,
    eyeY: 0.1,
    pupilScale: 1.2,
    mouthCurve: 0.5,
    mouthWidth: 0.8,
    orbColor: "#f0ebe5",
    glowIntensity: 0.12,
    bounceSpeed: 0.7,
  },
  speaking: {
    eyeScale: 1,
    eyeY: 0.12,
    pupilScale: 1,
    mouthCurve: 0.6,
    mouthWidth: 1.1,
    orbColor: "#fff8f0",
    glowIntensity: 0.18,
    bounceSpeed: 1.2,
  },
  surprised: {
    eyeScale: 1.4,
    eyeY: 0.08,
    pupilScale: 0.7,
    mouthCurve: 0.2,
    mouthWidth: 0.6,
    orbColor: "#fffaf5",
    glowIntensity: 0.25,
    bounceSpeed: 2,
  },
  sleepy: {
    eyeScale: 0.5,
    eyeY: 0.1,
    pupilScale: 0.8,
    mouthCurve: 0.4,
    mouthWidth: 0.9,
    orbColor: "#e5e0db",
    glowIntensity: 0.03,
    bounceSpeed: 0.3,
  },
};

const ExpressiveOrb = memo(({ 
  expression, 
  intensity, 
  isBlinking, 
  isActive, 
  reducedMotion 
}: ExpressiveOrbProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  
  const config = expressionConfigs[expression];
  
  // Lerp values for smooth transitions
  const lerpedValues = useRef({
    eyeScale: config.eyeScale,
    eyeY: config.eyeY,
    mouthCurve: config.mouthCurve,
    glowIntensity: config.glowIntensity,
  });

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const speed = reducedMotion ? 0.3 : config.bounceSpeed;
    const lerpSpeed = 0.1;
    
    // Lerp expression values
    lerpedValues.current.eyeScale += (config.eyeScale - lerpedValues.current.eyeScale) * lerpSpeed;
    lerpedValues.current.eyeY += (config.eyeY - lerpedValues.current.eyeY) * lerpSpeed;
    lerpedValues.current.mouthCurve += (config.mouthCurve - lerpedValues.current.mouthCurve) * lerpSpeed;
    lerpedValues.current.glowIntensity += (config.glowIntensity - lerpedValues.current.glowIntensity) * lerpSpeed;
    
    // Main orb animation
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(time * 1.5 * speed) * 0.03 * intensity);
      meshRef.current.rotation.y = Math.sin(time * 0.3 * speed) * 0.1;
      meshRef.current.rotation.x = Math.sin(time * 0.2 * speed) * 0.05;
    }
    
    // Glow animation
    if (glowRef.current) {
      const pulse = Math.sin(time * 2 * speed) * 0.15 + 0.85;
      glowRef.current.scale.setScalar(1.15 + (isActive ? 0.1 : 0) + Math.sin(time * 1.5 * speed) * 0.05);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * (isActive ? 0.5 : 0.3) * lerpedValues.current.glowIntensity * 3;
    }
    
    // Eye animations
    const blinkScale = isBlinking ? 0.1 : lerpedValues.current.eyeScale;
    const eyeY = lerpedValues.current.eyeY;
    
    if (leftEyeRef.current) {
      leftEyeRef.current.scale.setScalar(blinkScale);
      leftEyeRef.current.position.y = eyeY;
      // Look around slightly
      leftEyeRef.current.position.x = -0.22 + Math.sin(time * 0.5) * 0.02;
    }
    
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.setScalar(blinkScale);
      rightEyeRef.current.position.y = eyeY;
      rightEyeRef.current.position.x = 0.22 + Math.sin(time * 0.5) * 0.02;
    }
    
    // Mouth animation for speaking
    if (mouthRef.current) {
      let mouthScale = lerpedValues.current.mouthCurve;
      if (expression === "speaking") {
        mouthScale = 0.6 + Math.sin(time * 8) * 0.3 + Math.sin(time * 12) * 0.15;
      }
      mouthRef.current.scale.set(config.mouthWidth, mouthScale, 1);
    }
  });

  const orbColor = useMemo(() => new THREE.Color(config.orbColor), [config.orbColor]);

  return (
    <group>
      {/* Main orb */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, reducedMotion ? 16 : 32, reducedMotion ? 16 : 32]} />
        <meshStandardMaterial
          color={orbColor}
          roughness={0.3}
          metalness={0.1}
          emissive="#D4AF37"
          emissiveIntensity={isActive ? lerpedValues.current.glowIntensity * 2 : lerpedValues.current.glowIntensity}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh ref={glowRef} scale={1.15}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>
      
      {/* Highlight */}
      <mesh scale={0.25} position={[0.25, 0.3, 0.65]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      
      {/* Eyes */}
      <mesh ref={leftEyeRef} position={[-0.22, 0.12, 0.72]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.22, 0.12, 0.72]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      
      {/* Eye highlights */}
      <mesh position={[-0.19, 0.14, 0.78]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.25, 0.14, 0.78]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.18, 0.78]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI * 0.8]} />
        <meshBasicMaterial color="#c47a7a" />
      </mesh>
      
      {/* Blush (appears when happy) */}
      {expression === "happy" && (
        <>
          <mesh position={[-0.35, 0, 0.65]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#ffb3b3" transparent opacity={0.4 * intensity} />
          </mesh>
          <mesh position={[0.35, 0, 0.65]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#ffb3b3" transparent opacity={0.4 * intensity} />
          </mesh>
        </>
      )}
      
      {/* Thinking indicator (small rotating dots) */}
      {expression === "thinking" && (
        <group rotation={[0, 0, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 3) * Math.PI * 2) * 0.5,
                0.6,
                Math.sin((i / 3) * Math.PI * 2) * 0.5,
              ]}
            >
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Z's for sleepy */}
      {expression === "sleepy" && (
        <group position={[0.5, 0.4, 0]}>
          <mesh position={[0, 0, 0]} scale={0.8}>
            <planeGeometry args={[0.15, 0.15]} />
            <meshBasicMaterial color="#D4AF37" transparent opacity={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
});

ExpressiveOrb.displayName = "ExpressiveOrb";

export default ExpressiveOrb;
