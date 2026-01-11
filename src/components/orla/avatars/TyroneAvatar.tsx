import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Sparkles, GradientTexture } from "@react-three/drei";
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
  isConnected?: boolean;
  isListening?: boolean;
  getVolume?: () => number;
  emotion?: "neutral" | "happy" | "thinking" | "curious" | "warm" | "concerned" | "urgent";
  currentExpression?: string;
  faceData?: FaceData | null;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  size?: number;
}

// Advanced shader for human-like ethereal face effect
const faceShaderMaterial = {
  uniforms: {
    time: { value: 0 },
    speaking: { value: 0 },
    emotion: { value: 0 },
    audioLevel: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform float time;
    uniform float speaking;
    uniform float audioLevel;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      
      vec3 pos = position;
      
      // Subtle breathing animation
      float breathing = sin(time * 0.8) * 0.015;
      pos.y += breathing;
      
      // Audio-reactive subtle distortion when speaking
      if (speaking > 0.5) {
        float wave = sin(position.y * 10.0 + time * 5.0) * audioLevel * 0.02;
        pos.x += wave;
      }
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform float time;
    uniform float speaking;
    uniform float emotion;
    uniform float audioLevel;
    
    void main() {
      // Rich warm skin tone - elegant mahogany
      vec3 skinBase = vec3(0.42, 0.30, 0.24);
      vec3 warmTint = vec3(0.48, 0.34, 0.28);
      vec3 coolTint = vec3(0.38, 0.28, 0.24);
      
      // Subsurface scattering simulation for realistic skin
      float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      vec3 sssColor = mix(skinBase, warmTint, fresnel * 0.35);
      
      // Add subtle color variation based on position
      float heightGrad = smoothstep(-1.0, 1.0, vPosition.y);
      sssColor = mix(sssColor, coolTint, heightGrad * 0.12);
      
      // Speaking glow effect - champagne gold
      float speakGlow = speaking * audioLevel * 0.25;
      vec3 glowColor = vec3(0.85, 0.72, 0.45);
      sssColor += glowColor * speakGlow * (1.0 - heightGrad);
      
      // Emotion-based color shifts
      if (emotion > 0.5 && emotion < 1.5) {
        // Happy - warmer tones
        sssColor = mix(sssColor, warmTint, 0.12);
      } else if (emotion > 1.5 && emotion < 2.5) {
        // Thinking - cooler tones with pulse
        float thinkPulse = sin(time * 2.5) * 0.5 + 0.5;
        sssColor = mix(sssColor, coolTint, 0.12 + thinkPulse * 0.08);
      } else if (emotion > 4.5 && emotion < 5.5) {
        // Concerned - slightly muted
        vec3 concernTint = vec3(0.40, 0.29, 0.25);
        sssColor = mix(sssColor, concernTint, 0.1);
      } else if (emotion > 5.5 && emotion < 6.5) {
        // Urgent - subtle alert glow
        float urgentPulse = sin(time * 4.0) * 0.5 + 0.5;
        vec3 urgentGlow = vec3(0.50, 0.38, 0.30);
        sssColor = mix(sssColor, urgentGlow, urgentPulse * 0.12);
      }
      
      // Soft edge fade for ethereal effect
      float edgeFade = 1.0 - smoothstep(0.32, 0.5, abs(vUv.x - 0.5));
      edgeFade *= 1.0 - smoothstep(0.38, 0.5, abs(vUv.y - 0.5));
      
      gl_FragColor = vec4(sssColor, 0.96 * edgeFade);
    }
  `,
};

// Animated eyes with blinking and tracking
function EyeGroup({ 
  isSpeaking, 
  isListening, 
  emotion, 
  morphs 
}: { 
  isSpeaking: boolean;
  isListening: boolean;
  emotion?: string;
  morphs: { mouthOpen: number; smile: number; eyebrowRaise: number; eyeSquint: number };
}) {
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const [blinkState, setBlinkState] = useState(0);
  const [lookTarget, setLookTarget] = useState({ x: 0, y: 0 });

  // Blinking
  useEffect(() => {
    const blink = () => {
      setBlinkState(1);
      setTimeout(() => setBlinkState(0), 120);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.3) blink();
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  // Look around subtly
  useEffect(() => {
    const updateLook = () => {
      setLookTarget({
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.05,
      });
    };

    const interval = setInterval(updateLook, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    const eyeScale = 1 - blinkState * 0.9 - morphs.eyeSquint * 0.3;
    
    [leftEyeRef, rightEyeRef].forEach((ref) => {
      if (ref.current) {
        ref.current.scale.y = Math.max(0.1, eyeScale);
        ref.current.position.x = ref.current.userData.baseX + lookTarget.x;
        ref.current.position.y = 0.18 + morphs.eyebrowRaise * 0.05 + lookTarget.y;
      }
    });
  });

  return (
    <>
      {/* Left eye */}
      <group ref={leftEyeRef} position={[-0.28, 0.18, 0.88]} userData={{ baseX: -0.28 }}>
        <mesh>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.2} />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.025, 0.025, 0.07]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Right eye */}
      <group ref={rightEyeRef} position={[0.28, 0.18, 0.88]} userData={{ baseX: 0.28 }}>
        <mesh>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.2} />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.025, 0.025, 0.07]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Eyebrows - refined masculine arch */}
      <mesh position={[-0.28, 0.38 + morphs.eyebrowRaise * 0.1, 0.82]} rotation={[0, 0, 0.12]}>
        <capsuleGeometry args={[0.018, 0.14, 4, 8]} />
        <meshStandardMaterial color="#1a1512" roughness={0.8} />
      </mesh>
      <mesh position={[0.28, 0.38 + morphs.eyebrowRaise * 0.1, 0.82]} rotation={[0, 0, -0.12]}>
        <capsuleGeometry args={[0.018, 0.14, 4, 8]} />
        <meshStandardMaterial color="#1a1512" roughness={0.8} />
      </mesh>
    </>
  );
}

// Animated mouth with lip-sync
function AnimatedMouth({ 
  morphs, 
  isSpeaking, 
  audioLevel 
}: { 
  morphs: { mouthOpen: number; smile: number; eyebrowRaise: number; eyeSquint: number };
  isSpeaking: boolean;
  audioLevel: number;
}) {
  const mouthRef = useRef<THREE.Mesh>(null);
  const [viseme, setViseme] = useState(0);

  // Simulate viseme changes when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setViseme(0);
      return;
    }

    const interval = setInterval(() => {
      setViseme(Math.random());
    }, 80 + Math.random() * 40);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  useFrame(() => {
    if (mouthRef.current) {
      // Mouth shape based on audio and viseme
      const openAmount = morphs.mouthOpen + (isSpeaking ? viseme * 0.2 : 0);
      const smileAmount = morphs.smile * (1 - openAmount * 0.5);
      
      mouthRef.current.scale.x = 0.15 + smileAmount * 0.1 + openAmount * 0.05;
      mouthRef.current.scale.y = 0.02 + openAmount * 0.1;
    }
  });

  return (
    <group position={[0, -0.28, 0.88]}>
      {/* Lips outer - fuller masculine lips */}
      <mesh>
        <torusGeometry args={[0.11 + morphs.smile * 0.03, 0.028, 16, 32, Math.PI]} />
        <meshStandardMaterial 
          color="#6b4a4a" 
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>
      
      {/* Mouth opening */}
      <mesh ref={mouthRef} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.15, 0.02]} />
        <meshBasicMaterial color="#2d1f1f" transparent opacity={0.9} />
      </mesh>

      {/* Teeth hint when mouth is open */}
      {morphs.mouthOpen > 0.15 && (
        <mesh position={[0, 0.04, -0.01]}>
          <planeGeometry args={[0.1, morphs.mouthOpen * 0.15]} />
          <meshBasicMaterial color="#f5f5f5" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// The main 3D face mesh with expressions
function AnimatedFace({ 
  isSpeaking, 
  isConnected, 
  isListening,
  getVolume, 
  emotion 
}: Omit<TyroneAvatarProps, 'size' | 'colors' | 'faceData' | 'currentExpression'>) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [targetMorphs, setTargetMorphs] = useState({
    mouthOpen: 0,
    smile: 0,
    eyebrowRaise: 0,
    eyeSquint: 0,
  });
  const [currentMorphs, setCurrentMorphs] = useState({
    mouthOpen: 0,
    smile: 0,
    eyebrowRaise: 0,
    eyeSquint: 0,
  });

  // Create the shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        speaking: { value: 0 },
        emotion: { value: 0 },
        audioLevel: { value: 0 },
      },
      vertexShader: faceShaderMaterial.vertexShader,
      fragmentShader: faceShaderMaterial.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, []);

  // Audio level tracking
  useEffect(() => {
    if (!isSpeaking || !getVolume) {
      setAudioLevel(0);
      return;
    }

    let animationId: number;
    const updateAudio = () => {
      const vol = getVolume();
      setAudioLevel((prev) => prev + (vol - prev) * 0.25);
      animationId = requestAnimationFrame(updateAudio);
    };
    animationId = requestAnimationFrame(updateAudio);

    return () => cancelAnimationFrame(animationId);
  }, [isSpeaking, getVolume]);

  // Update expression targets based on state
  useEffect(() => {
    const emotionMap: Record<string, typeof targetMorphs> = {
      neutral: { mouthOpen: 0, smile: 0.08, eyebrowRaise: 0, eyeSquint: 0 },
      happy: { mouthOpen: 0.1, smile: 0.55, eyebrowRaise: 0.18, eyeSquint: 0.28 },
      thinking: { mouthOpen: 0, smile: 0, eyebrowRaise: 0.38, eyeSquint: 0.1 },
      curious: { mouthOpen: 0.05, smile: 0.18, eyebrowRaise: 0.45, eyeSquint: 0 },
      warm: { mouthOpen: 0.05, smile: 0.38, eyebrowRaise: 0.1, eyeSquint: 0.18 },
      concerned: { mouthOpen: 0, smile: -0.1, eyebrowRaise: 0.28, eyeSquint: 0.12 },
      urgent: { mouthOpen: 0.08, smile: 0, eyebrowRaise: 0.55, eyeSquint: 0.05 },
    };

    const base = emotionMap[emotion || "neutral"] || emotionMap.neutral;
    
    if (isSpeaking) {
      setTargetMorphs({
        ...base,
        mouthOpen: 0.2 + audioLevel * 0.5,
      });
    } else if (isListening) {
      setTargetMorphs({
        ...base,
        eyebrowRaise: base.eyebrowRaise + 0.18,
      });
    } else {
      setTargetMorphs(base);
    }
  }, [emotion, isSpeaking, isListening, audioLevel]);

  // Animation frame
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Update shader uniforms
    if (shaderMaterial) {
      shaderMaterial.uniforms.time.value = time;
      shaderMaterial.uniforms.speaking.value = isSpeaking ? 1 : 0;
      shaderMaterial.uniforms.audioLevel.value = audioLevel;
      
      const emotionValue = 
        emotion === "happy" ? 1 :
        emotion === "thinking" ? 2 :
        emotion === "curious" ? 3 :
        emotion === "warm" ? 4 :
        emotion === "concerned" ? 5 :
        emotion === "urgent" ? 6 : 0;
      shaderMaterial.uniforms.emotion.value = emotionValue;
    }

    // Smooth morph interpolation
    setCurrentMorphs((prev) => ({
      mouthOpen: prev.mouthOpen + (targetMorphs.mouthOpen - prev.mouthOpen) * 0.15,
      smile: prev.smile + (targetMorphs.smile - prev.smile) * 0.1,
      eyebrowRaise: prev.eyebrowRaise + (targetMorphs.eyebrowRaise - prev.eyebrowRaise) * 0.1,
      eyeSquint: prev.eyeSquint + (targetMorphs.eyeSquint - prev.eyeSquint) * 0.1,
    }));

    // Subtle head movement - confident masculine bearing
    if (meshRef.current) {
      if (emotion === "thinking") {
        meshRef.current.rotation.y = Math.sin(time * 0.45) * 0.07 + Math.sin(time * 1.1) * 0.025;
        meshRef.current.rotation.x = Math.sin(time * 0.28) * 0.035 - 0.025;
        meshRef.current.rotation.z = Math.sin(time * 0.65) * 0.018;
      } else if (emotion === "urgent") {
        meshRef.current.rotation.y = Math.sin(time * 0.55) * 0.055;
        meshRef.current.rotation.x = Math.sin(time * 0.38) * 0.028;
      } else if (emotion === "concerned") {
        meshRef.current.rotation.y = Math.sin(time * 0.22) * 0.035;
        meshRef.current.rotation.x = Math.sin(time * 0.32) * 0.022 - 0.018;
      } else {
        meshRef.current.rotation.y = Math.sin(time * 0.28) * 0.045;
        meshRef.current.rotation.x = Math.sin(time * 0.18) * 0.018;
      }
      
      if (isSpeaking) {
        meshRef.current.rotation.z = Math.sin(time * 2) * 0.008;
      }
    }
  });

  return (
    <group>
      {/* Main face mesh - stylized oval with warm skin */}
      <mesh ref={meshRef} material={shaderMaterial}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>

      {/* Elegant glow ring - champagne gold */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
        <ringGeometry args={[1.05, 1.15, 64]} />
        <meshBasicMaterial 
          color="#D4AF37" 
          transparent 
          opacity={isConnected ? 0.55 : 0.28}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Eyes group */}
      <EyeGroup 
        isSpeaking={isSpeaking || false}
        isListening={isListening || false}
        emotion={emotion}
        morphs={currentMorphs}
      />

      {/* Mouth */}
      <AnimatedMouth 
        morphs={currentMorphs}
        isSpeaking={isSpeaking || false}
        audioLevel={audioLevel}
      />

      {/* Ambient particles when active - gold */}
      {isConnected && (
        <Sparkles 
          count={28}
          scale={3}
          size={2}
          speed={0.35}
          opacity={0.38}
          color="#D4AF37"
        />
      )}
    </group>
  );
}

// Elegant background gradient
function ElegantBackground() {
  return (
    <mesh position={[0, 0, -3]} scale={10}>
      <planeGeometry />
      <meshBasicMaterial>
        <GradientTexture
          stops={[0, 0.5, 1]}
          colors={["#0a0a0f", "#1a1520", "#0d0d12"]}
        />
      </meshBasicMaterial>
    </mesh>
  );
}

const TyroneAvatar: React.FC<TyroneAvatarProps> = ({
  isSpeaking = false,
  isConnected = false,
  isListening = false,
  getVolume,
  emotion = "neutral",
  size = 300,
}) => {
  return (
    <div 
      className="relative rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Elegant warm lighting */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 5, 5]} intensity={0.85} color="#f5efe6" />
        <directionalLight position={[-3, 2, 4]} intensity={0.45} color="#d4b76a" />
        <pointLight position={[0, -2, 3]} intensity={0.22} color="#a08050" />
        
        <ElegantBackground />
        
        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.08}>
          <AnimatedFace
            isSpeaking={isSpeaking}
            isConnected={isConnected}
            isListening={isListening}
            getVolume={getVolume}
            emotion={emotion}
          />
        </Float>
        
        <Environment preset="studio" />
      </Canvas>
      
      {/* Outer glow effect */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: isConnected 
            ? "radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.12) 0%, transparent 70%)"
            : "radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.06) 0%, transparent 70%)",
          transition: "background 0.3s ease",
        }}
      />
    </div>
  );
};

export default TyroneAvatar;
