import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Environment, 
  Float, 
  MeshDistortMaterial,
  Sparkles,
  GradientTexture,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

interface Orla3DAvatarProps {
  isSpeaking: boolean;
  isConnected: boolean;
  isListening: boolean;
  getVolume?: () => number;
  emotion?: "neutral" | "happy" | "thinking" | "curious" | "warm";
  size?: number;
}

// Advanced shader for the ethereal face effect
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
      float breathing = sin(time * 0.8) * 0.02;
      pos.y += breathing;
      
      // Audio-reactive subtle distortion when speaking
      if (speaking > 0.5) {
        float wave = sin(position.y * 10.0 + time * 5.0) * audioLevel * 0.03;
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
      // Base skin tone with subtle iridescence
      vec3 skinBase = vec3(0.95, 0.87, 0.82);
      vec3 warmTint = vec3(1.0, 0.85, 0.75);
      vec3 coolTint = vec3(0.85, 0.88, 0.95);
      
      // Subsurface scattering simulation
      float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      vec3 sssColor = mix(skinBase, warmTint, fresnel * 0.3);
      
      // Add subtle color variation based on position
      float heightGrad = smoothstep(-1.0, 1.0, vPosition.y);
      sssColor = mix(sssColor, coolTint, heightGrad * 0.15);
      
      // Speaking glow effect
      float speakGlow = speaking * audioLevel * 0.2;
      vec3 glowColor = vec3(0.83, 0.69, 0.22); // Gold accent
      sssColor += glowColor * speakGlow * (1.0 - heightGrad);
      
      // Emotion-based color shifts
      if (emotion > 0.5 && emotion < 1.5) {
        // Happy - warmer tones
        sssColor = mix(sssColor, warmTint, 0.1);
      } else if (emotion > 1.5 && emotion < 2.5) {
        // Thinking - cooler tones
        sssColor = mix(sssColor, coolTint, 0.15);
      }
      
      // Soft edge fade for ethereal effect
      float edgeFade = 1.0 - smoothstep(0.3, 0.5, abs(vUv.x - 0.5));
      edgeFade *= 1.0 - smoothstep(0.35, 0.5, abs(vUv.y - 0.5));
      
      gl_FragColor = vec4(sssColor, 0.95 * edgeFade);
    }
  `,
};

// The main 3D face mesh with expressions
function AnimatedFace({ 
  isSpeaking, 
  isConnected, 
  isListening,
  getVolume, 
  emotion 
}: Omit<Orla3DAvatarProps, 'size'>) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
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
      neutral: { mouthOpen: 0, smile: 0.1, eyebrowRaise: 0, eyeSquint: 0 },
      happy: { mouthOpen: 0.1, smile: 0.6, eyebrowRaise: 0.2, eyeSquint: 0.3 },
      thinking: { mouthOpen: 0, smile: 0, eyebrowRaise: 0.4, eyeSquint: 0.1 },
      curious: { mouthOpen: 0.05, smile: 0.2, eyebrowRaise: 0.5, eyeSquint: 0 },
      warm: { mouthOpen: 0.05, smile: 0.4, eyebrowRaise: 0.1, eyeSquint: 0.2 },
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
        eyebrowRaise: base.eyebrowRaise + 0.2,
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
        emotion === "warm" ? 4 : 0;
      shaderMaterial.uniforms.emotion.value = emotionValue;
    }

    // Smooth morph interpolation
    setCurrentMorphs((prev) => ({
      mouthOpen: prev.mouthOpen + (targetMorphs.mouthOpen - prev.mouthOpen) * 0.15,
      smile: prev.smile + (targetMorphs.smile - prev.smile) * 0.1,
      eyebrowRaise: prev.eyebrowRaise + (targetMorphs.eyebrowRaise - prev.eyebrowRaise) * 0.1,
      eyeSquint: prev.eyeSquint + (targetMorphs.eyeSquint - prev.eyeSquint) * 0.1,
    }));

    // Subtle head movement
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
      meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.02;
      
      if (isSpeaking) {
        meshRef.current.rotation.z = Math.sin(time * 2) * 0.01;
      }
    }
  });

  return (
    <group>
      {/* Main face mesh - stylized oval */}
      <mesh ref={meshRef} material={shaderMaterial}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>

      {/* Ethereal glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
        <ringGeometry args={[1.05, 1.15, 64]} />
        <meshBasicMaterial 
          color="#D4AF37" 
          transparent 
          opacity={isConnected ? 0.6 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Eyes group */}
      <EyeGroup 
        isSpeaking={isSpeaking}
        isListening={isListening}
        emotion={emotion}
        morphs={currentMorphs}
      />

      {/* Mouth */}
      <AnimatedMouth 
        morphs={currentMorphs}
        isSpeaking={isSpeaking}
        audioLevel={audioLevel}
      />

      {/* Ambient particles when active */}
      {isConnected && (
        <Sparkles 
          count={30}
          scale={3}
          size={2}
          speed={0.4}
          opacity={0.4}
          color="#D4AF37"
        />
      )}
    </group>
  );
}

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
        ref.current.position.y = 0.15 + morphs.eyebrowRaise * 0.05 + lookTarget.y;
      }
    });
  });

  const eyeBaseProps = {
    position: [0, 0.15, 0.85] as [number, number, number],
  };

  return (
    <>
      {/* Left eye */}
      <group ref={leftEyeRef} position={[-0.25, 0.15, 0.85]} userData={{ baseX: -0.25 }}>
        <mesh>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.2} />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.02, 0.02, 0.06]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Right eye */}
      <group ref={rightEyeRef} position={[0.25, 0.15, 0.85]} userData={{ baseX: 0.25 }}>
        <mesh>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.2} />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.02, 0.02, 0.06]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Eyebrows */}
      <mesh position={[-0.25, 0.35 + morphs.eyebrowRaise * 0.1, 0.8]} rotation={[0, 0, 0.1]}>
        <capsuleGeometry args={[0.015, 0.12, 4, 8]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      <mesh position={[0.25, 0.35 + morphs.eyebrowRaise * 0.1, 0.8]} rotation={[0, 0, -0.1]}>
        <capsuleGeometry args={[0.015, 0.12, 4, 8]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
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
    <group position={[0, -0.25, 0.85]}>
      {/* Lips outer */}
      <mesh>
        <torusGeometry args={[0.12 + morphs.smile * 0.03, 0.025, 16, 32, Math.PI]} />
        <meshStandardMaterial 
          color="#c47a7a" 
          roughness={0.4}
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

// Background with elegant gradient
function ElegantBackground() {
  return (
    <>
      <mesh position={[0, 0, -3]} scale={10}>
        <planeGeometry />
        <meshBasicMaterial>
          <GradientTexture
            stops={[0, 0.5, 1]}
            colors={["#0a0a0f", "#1a1520", "#0d0d12"]}
          />
        </meshBasicMaterial>
      </mesh>
    </>
  );
}

// Main exported component
const Orla3DAvatar = ({ 
  isSpeaking, 
  isConnected, 
  isListening,
  getVolume,
  emotion = "neutral",
  size = 300 
}: Orla3DAvatarProps) => {
  return (
    <div 
      className="relative rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={["#0a0a0f"]} />
        
        {/* Lighting setup for premium look */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[2, 2, 5]} 
          intensity={1} 
          color="#fff5e6"
        />
        <directionalLight 
          position={[-2, 1, 3]} 
          intensity={0.5} 
          color="#e6f0ff"
        />
        <pointLight 
          position={[0, -1, 2]} 
          intensity={0.3} 
          color="#D4AF37"
        />

        {/* Main animated face */}
        <Float
          speed={1.5}
          rotationIntensity={0.1}
          floatIntensity={0.2}
          floatingRange={[-0.05, 0.05]}
        >
          <AnimatedFace
            isSpeaking={isSpeaking}
            isConnected={isConnected}
            isListening={isListening}
            getVolume={getVolume}
            emotion={emotion}
          />
        </Float>

        <ElegantBackground />
        
        {/* Environment for realistic reflections */}
        <Environment preset="city" />
      </Canvas>

      {/* Status indicator ring */}
      <div 
        className={`absolute inset-0 rounded-full border-2 pointer-events-none transition-all duration-500 ${
          isSpeaking 
            ? "border-gold/60 shadow-[0_0_30px_rgba(212,175,55,0.4)]" 
            : isListening
              ? "border-accent/40 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              : isConnected
                ? "border-muted/30"
                : "border-transparent"
        }`}
      />

      {/* Speaking pulse animation */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-gold/10 to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export default Orla3DAvatar;
