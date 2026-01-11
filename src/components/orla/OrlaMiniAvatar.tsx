import React, { useRef, useState, memo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import orlaAvatar from "@/assets/orla-avatar.png";
import { useAvatarPreferences } from "@/hooks/useAvatarPreferences";
import { OrlaExpression } from "@/hooks/useOrlaExpression";
import ExpressiveOrb from "./OrlaExpressions";

interface OrlaMiniAvatarProps {
  size?: number;
  isActive?: boolean;
  showSparkles?: boolean;
  forceStatic?: boolean;
  expression?: OrlaExpression;
  isBlinking?: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
}

// Simple error boundary wrapper
class ErrorBoundaryWrapper extends React.Component<{
  children: React.ReactNode;
  onError: () => void;
}> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch() {
    this.props.onError();
  }
  
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Static avatar fallback with expression support
const StaticAvatar = memo(({ 
  size, 
  isActive,
  expression = "neutral",
  isSpeaking = false,
}: { 
  size: number; 
  isActive: boolean;
  expression?: OrlaExpression;
  isSpeaking?: boolean;
}) => {
  // Expression-based styling
  const expressionStyles: Record<OrlaExpression, string> = {
    neutral: "",
    happy: "brightness-105 saturate-110",
    thinking: "brightness-95",
    listening: "brightness-100",
    speaking: "brightness-110",
    surprised: "brightness-115 saturate-120",
    sleepy: "brightness-85 saturate-90",
  };

  return (
    <motion.div
      className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center"
      style={{ width: size, height: size }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        boxShadow: isActive ? [
          "0 0 10px rgba(212,175,55,0.3)",
          "0 0 20px rgba(212,175,55,0.5)",
          "0 0 10px rgba(212,175,55,0.3)"
        ] : "0 0 0px rgba(212,175,55,0)"
      }}
      transition={{ 
        scale: { duration: 0.3, ease: "easeOut" },
        opacity: { duration: 0.3 },
        boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      <motion.img 
        src={orlaAvatar} 
        alt="Orla" 
        className={`w-full h-full object-cover rounded-full transition-all duration-300 ${expressionStyles[expression]}`}
        style={{ width: size, height: size }}
        animate={isSpeaking ? { 
          scale: [1, 1.02, 1],
        } : {}}
        transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0 }}
      />
      
      {/* Expression overlay */}
      <AnimatePresence>
        {expression === "happy" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-amber-400/10 to-transparent rounded-full pointer-events-none"
          />
        )}
        {expression === "thinking" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-0 right-0 w-4 h-4"
          >
            <span className="text-primary text-lg">💭</span>
          </motion.div>
        )}
        {expression === "listening" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 border-2 border-primary/50 rounded-full pointer-events-none"
          />
        )}
      </AnimatePresence>
      
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-full"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
});

StaticAvatar.displayName = "StaticAvatar";

// 3D Avatar component with expressions
const ThreeDAvatar = memo(({ 
  isActive, 
  showSparkles,
  reducedMotion,
  expression,
  isBlinking,
}: { 
  isActive: boolean; 
  showSparkles: boolean;
  reducedMotion: boolean;
  expression: OrlaExpression;
  isBlinking: boolean;
}) => (
  <Canvas
    camera={{ position: [0, 0, 2.5], fov: 45 }}
    dpr={reducedMotion ? 1 : [1, 2]}
    gl={{ 
      antialias: !reducedMotion,
      alpha: true,
      powerPreference: reducedMotion ? "low-power" : "default",
    }}
    style={{ background: "transparent" }}
  >
    <ambientLight intensity={0.5} />
    <directionalLight position={[2, 2, 3]} intensity={0.8} color="#fff5e6" />
    <pointLight position={[0, -1, 2]} intensity={0.2} color="#D4AF37" />
    
    <Float
      speed={reducedMotion ? 1 : 2}
      rotationIntensity={reducedMotion ? 0.05 : 0.1}
      floatIntensity={reducedMotion ? 0.08 : 0.15}
      floatingRange={[-0.03, 0.03]}
    >
      <ExpressiveOrb 
        expression={expression}
        intensity={1}
        isBlinking={isBlinking}
        isActive={isActive}
        reducedMotion={reducedMotion}
      />
    </Float>
    
    {showSparkles && isActive && !reducedMotion && (
      <Sparkles count={6} scale={2} size={1.5} speed={0.3} opacity={0.5} color="#D4AF37" />
    )}
    
    <Environment preset="city" />
  </Canvas>
));

ThreeDAvatar.displayName = "ThreeDAvatar";

// Mode transition overlay
const ModeTransition = memo(({ isTransitioning }: { isTransitioning: boolean }) => (
  <AnimatePresence>
    {isTransitioning && (
      <motion.div
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm flex items-center justify-center z-10"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
      </motion.div>
    )}
  </AnimatePresence>
));

ModeTransition.displayName = "ModeTransition";

// Main component
const OrlaMiniAvatar = ({ 
  size = 56, 
  isActive = false,
  showSparkles = true,
  forceStatic = false,
  expression = "neutral",
  isBlinking = false,
  isSpeaking = false,
  isListening = false,
}: OrlaMiniAvatarProps) => {
  const { shouldUse3D, reducedMotion, mode } = useAvatarPreferences();
  const [hasError, setHasError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentMode, setCurrentMode] = useState<"3d" | "static">("static");
  
  const use3D = !forceStatic && !hasError && shouldUse3D();
  
  // Determine expression based on state
  const currentExpression: OrlaExpression = 
    isSpeaking ? "speaking" : 
    isListening ? "listening" : 
    expression;
  
  // Handle mode transitions
  useEffect(() => {
    const newMode = use3D ? "3d" : "static";
    if (newMode !== currentMode) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentMode(newMode);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [use3D, currentMode]);
  
  // Auto-blink for static avatar
  const [staticBlinking, setStaticBlinking] = useState(false);
  useEffect(() => {
    if (currentMode === "static") {
      const blinkInterval = setInterval(() => {
        setStaticBlinking(true);
        setTimeout(() => setStaticBlinking(false), 150);
      }, 3000 + Math.random() * 2000);
      return () => clearInterval(blinkInterval);
    }
  }, [currentMode]);
  
  return (
    <motion.div 
      className="relative rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5"
      style={{ width: size, height: size }}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <ModeTransition isTransitioning={isTransitioning} />
      
      <AnimatePresence mode="wait">
        {currentMode === "3d" && !isTransitioning ? (
          <motion.div
            key="3d"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <ErrorBoundaryWrapper onError={() => setHasError(true)}>
              <ThreeDAvatar 
                isActive={isActive} 
                showSparkles={showSparkles}
                reducedMotion={reducedMotion}
                expression={currentExpression}
                isBlinking={isBlinking}
              />
            </ErrorBoundaryWrapper>
          </motion.div>
        ) : (
          <motion.div
            key="static"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <StaticAvatar 
              size={size} 
              isActive={isActive} 
              expression={currentExpression}
              isSpeaking={isSpeaking}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Active ring indicator */}
      <motion.div 
        className={`absolute inset-0 rounded-full border-2 pointer-events-none transition-all duration-500 ${
          isActive 
            ? "border-primary/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
            : "border-transparent"
        }`}
        animate={isListening ? {
          boxShadow: [
            "0 0 10px rgba(212,175,55,0.3)",
            "0 0 25px rgba(212,175,55,0.6)",
            "0 0 10px rgba(212,175,55,0.3)"
          ]
        } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
      
      {/* Speaking indicator */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && !isSpeaking && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center"
          >
            <motion.div
              animate={{ height: ["30%", "80%", "30%"] }}
              transition={{ duration: 0.4, repeat: Infinity }}
              className="w-1 bg-white rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrlaMiniAvatar;
