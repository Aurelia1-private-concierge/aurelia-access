import React, { useRef, useMemo, useEffect, useState, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles, GradientTexture } from "@react-three/drei";
import * as THREE from "three";
import { FaceData } from "@/hooks/useFaceTracking";

interface RealisticAvatarProps {
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

// Realistic skin shader with subsurface scattering
const skinShaderMaterial = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float time;
    uniform float speaking;
    uniform float audioLevel;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;
      
      // Subtle breathing
      float breathing = sin(time * 0.8) * 0.015;
      pos.y += breathing;
      
      // Audio-reactive movement
      if (speaking > 0.5) {
        float wave = sin(position.y * 8.0 + time * 6.0) * audioLevel * 0.02;
        pos.x += wave;
      }
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float time;
    uniform float speaking;
    uniform float emotion;
    uniform float audioLevel;
    uniform vec3 skinColor;
    uniform vec3 accentColor;
    
    void main() {
      // Realistic skin with subsurface scattering
      vec3 baseColor = skinColor;
      vec3 warmTint = skinColor * vec3(1.1, 0.95, 0.9);
      vec3 coolTint = skinColor * vec3(0.9, 0.95, 1.05);
      
      // View-dependent fresnel for skin translucency
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
      
      // Subsurface approximation
      vec3 sss = mix(baseColor, warmTint, fresnel * 0.4);
      
      // Position-based color variation (blush on cheeks, etc.)
      float cheekBlush = smoothstep(0.2, 0.4, abs(vPosition.x)) * smoothstep(-0.1, 0.1, vPosition.y);
      sss = mix(sss, warmTint * vec3(1.15, 0.9, 0.9), cheekBlush * 0.15);
      
      // Forehead and chin cooler tones
      float verticalGrad = smoothstep(-0.5, 0.5, vPosition.y);
      sss = mix(sss * vec3(0.98, 0.98, 1.02), sss, smoothstep(0.0, 0.3, abs(vPosition.y - 0.3)));
      
      // Speaking glow
      float speakGlow = speaking * audioLevel * 0.15;
      sss += accentColor * speakGlow * (1.0 - abs(vPosition.y));
      
      // Emotion color shifts
      if (emotion > 0.5 && emotion < 1.5) {
        sss = mix(sss, warmTint * 1.05, 0.1); // Happy
      } else if (emotion > 1.5 && emotion < 2.5) {
        float pulse = sin(time * 2.0) * 0.5 + 0.5;
        sss = mix(sss, coolTint, 0.1 + pulse * 0.05); // Thinking
      }
      
      // Soft edge fade
      float edgeFade = smoothstep(0.0, 0.1, 0.5 - length(vUv - 0.5));
      
      // Subtle skin texture
      float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
      sss += (noise - 0.5) * 0.02;
      
      gl_FragColor = vec4(sss, 0.98 * edgeFade);
    }
  `,
};

// Realistic face mesh
const RealisticFace = memo(({
  isSpeaking,
  isConnected,
  isListening,
  getVolume,
  emotion,
  faceData,
  colors,
}: Omit<RealisticAvatarProps, "size">) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const skinColor = useMemo(() => new THREE.Color(colors?.primary || "#f5e1d0"), [colors]);
  const accentColor = useMemo(() => new THREE.Color(colors?.accent || "#D4AF37"), [colors]);
  
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        speaking: { value: 0 },
        emotion: { value: 0 },
        audioLevel: { value: 0 },
        skinColor: { value: skinColor },
        accentColor: { value: accentColor },
      },
      vertexShader: skinShaderMaterial.vertexShader,
      fragmentShader: skinShaderMaterial.fragmentShader,
      transparent: true,
      side: THREE.FrontSide,
    });
  }, [skinColor, accentColor]);

  // Audio tracking
  useEffect(() => {
    if (!isSpeaking || !getVolume) {
      setAudioLevel(0);
      return;
    }
    let animationId: number;
    const update = () => {
      setAudioLevel(prev => prev + (getVolume() - prev) * 0.2);
      animationId = requestAnimationFrame(update);
    };
    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [isSpeaking, getVolume]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (shaderMaterial) {
      shaderMaterial.uniforms.time.value = time;
      shaderMaterial.uniforms.speaking.value = isSpeaking ? 1 : 0;
      shaderMaterial.uniforms.audioLevel.value = audioLevel;
      shaderMaterial.uniforms.emotion.value = 
        emotion === "happy" ? 1 : emotion === "thinking" ? 2 : 0;
    }

    if (meshRef.current) {
      // Face tracking integration
      if (faceData?.faceDetected) {
        meshRef.current.rotation.x = THREE.MathUtils.lerp(
          meshRef.current.rotation.x,
          (faceData.headRotationX * Math.PI) / 180,
          0.1
        );
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y,
          (-faceData.headRotationY * Math.PI) / 180,
          0.1
        );
      } else {
        // Idle animation
        meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.04;
        meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.02;
      }
    }
  });

  return (
    <group>
      {/* Main head */}
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
        <mesh ref={meshRef} material={shaderMaterial}>
          <sphereGeometry args={[0.9, 64, 64]} />
        </mesh>

        {/* Realistic eyes */}
        <RealisticEyes 
          faceData={faceData}
          emotion={emotion}
          accentColor={colors?.accent}
        />

        {/* Realistic mouth */}
        <RealisticMouth 
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          faceData={faceData}
        />

        {/* Nose */}
        <mesh position={[0, 0, 0.85]}>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshPhysicalMaterial 
            color={colors?.primary || "#f5e1d0"}
            roughness={0.4}
            clearcoat={0.3}
          />
        </mesh>

        {/* Eyebrows */}
        <RealisticEyebrows faceData={faceData} emotion={emotion} />
      </Float>

      {/* Ambient glow */}
      {isConnected && (
        <>
          <mesh position={[0, 0, -0.2]}>
            <sphereGeometry args={[1.1, 32, 32]} />
            <meshBasicMaterial 
              color={colors?.glow || "#D4AF37"}
              transparent
              opacity={0.15}
              side={THREE.BackSide}
            />
          </mesh>
          <Sparkles count={20} scale={2.5} size={1.5} speed={0.3} opacity={0.3} color={colors?.accent} />
        </>
      )}
    </group>
  );
});

RealisticFace.displayName = "RealisticFace";

// Realistic eyes with iris detail
const RealisticEyes = memo(({ faceData, emotion, accentColor }: { 
  faceData?: FaceData;
  emotion?: string;
  accentColor?: string;
}) => {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const [blink, setBlink] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(0.1);
      setTimeout(() => setBlink(1), 120);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    const eyeOpen = faceData?.faceDetected 
      ? (faceData.leftEyeOpenness + faceData.rightEyeOpenness) / 2 
      : blink;
    
    [leftRef, rightRef].forEach(ref => {
      if (ref.current) {
        ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, eyeOpen, 0.2);
      }
    });
  });

  const EyeComponent = ({ position, ref }: { position: [number, number, number]; ref: React.RefObject<THREE.Group> }) => (
    <group ref={ref} position={position}>
      {/* Sclera */}
      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="#fffef8" roughness={0.1} />
      </mesh>
      {/* Iris */}
      <mesh position={[0, 0, 0.06]}>
        <circleGeometry args={[0.045, 32]} />
        <meshStandardMaterial color={accentColor || "#4a6741"} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Pupil */}
      <mesh position={[0, 0, 0.065]}>
        <circleGeometry args={[0.02, 32]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
      {/* Highlight */}
      <mesh position={[0.02, 0.02, 0.07]}>
        <circleGeometry args={[0.015, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );

  return (
    <>
      <group ref={leftRef} position={[-0.22, 0.15, 0.75]}>
        <mesh>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color="#fffef8" roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <circleGeometry args={[0.045, 32]} />
          <meshStandardMaterial color={accentColor || "#4a6741"} roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.065]}>
          <circleGeometry args={[0.02, 32]} />
          <meshBasicMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0.02, 0.02, 0.07]}>
          <circleGeometry args={[0.015, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>
      <group ref={rightRef} position={[0.22, 0.15, 0.75]}>
        <mesh>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color="#fffef8" roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <circleGeometry args={[0.045, 32]} />
          <meshStandardMaterial color={accentColor || "#4a6741"} roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.065]}>
          <circleGeometry args={[0.02, 32]} />
          <meshBasicMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0.02, 0.02, 0.07]}>
          <circleGeometry args={[0.015, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>
    </>
  );
});

RealisticEyes.displayName = "RealisticEyes";

// Realistic mouth
const RealisticMouth = memo(({ isSpeaking, audioLevel, faceData }: {
  isSpeaking: boolean;
  audioLevel: number;
  faceData?: FaceData;
}) => {
  const mouthRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (mouthRef.current) {
      const openness = faceData?.faceDetected 
        ? faceData.mouthOpenness 
        : (isSpeaking ? 0.1 + audioLevel * 0.4 : 0.02);
      
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.3 + openness, 0.15);
    }
  });

  return (
    <group position={[0, -0.22, 0.8]}>
      {/* Upper lip */}
      <mesh position={[0, 0.03, 0]}>
        <torusGeometry args={[0.08, 0.018, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#c47a7a" roughness={0.3} />
      </mesh>
      {/* Lower lip */}
      <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.09, 0.02, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#d48888" roughness={0.3} />
      </mesh>
      {/* Mouth opening */}
      <mesh ref={mouthRef} position={[0, 0, -0.01]}>
        <planeGeometry args={[0.1, 0.02]} />
        <meshBasicMaterial color="#2d1f1f" />
      </mesh>
    </group>
  );
});

RealisticMouth.displayName = "RealisticMouth";

// Realistic eyebrows
const RealisticEyebrows = memo(({ faceData, emotion }: { faceData?: FaceData; emotion?: string }) => {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const raise = faceData?.faceDetected 
      ? (faceData.leftEyebrowRaise + faceData.rightEyebrowRaise) / 2 - 0.5
      : (emotion === "thinking" ? 0.3 : emotion === "curious" ? 0.4 : 0);

    if (leftRef.current) {
      leftRef.current.position.y = 0.38 + raise * 0.08;
    }
    if (rightRef.current) {
      rightRef.current.position.y = 0.38 + raise * 0.08;
    }
  });

  return (
    <>
      <mesh ref={leftRef} position={[-0.22, 0.38, 0.7]} rotation={[0, 0, 0.15]}>
        <capsuleGeometry args={[0.012, 0.1, 4, 8]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      <mesh ref={rightRef} position={[0.22, 0.38, 0.7]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[0.012, 0.1, 4, 8]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
    </>
  );
});

RealisticEyebrows.displayName = "RealisticEyebrows";

// Main component
const RealisticAvatar: React.FC<RealisticAvatarProps> = ({
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
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 3, 3]} intensity={0.3} color="#ffe4c4" />
        <pointLight position={[0, 0, 2]} intensity={0.4} color={colors?.glow || "#D4AF37"} />

        <RealisticFace
          isSpeaking={isSpeaking}
          isConnected={isConnected}
          isListening={isListening}
          getVolume={getVolume}
          emotion={emotion}
          faceData={faceData}
          colors={colors}
        />

        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default memo(RealisticAvatar);
