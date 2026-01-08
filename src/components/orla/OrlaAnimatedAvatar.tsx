import { motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import orlaAvatar from "@/assets/orla-avatar.png";

interface OrlaAnimatedAvatarProps {
  isSpeaking: boolean;
  isConnected: boolean;
  getVolume?: () => number;
  size?: number;
}

const OrlaAnimatedAvatar = ({ 
  isSpeaking, 
  isConnected, 
  getVolume,
  size = 208 
}: OrlaAnimatedAvatarProps) => {
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [blinkState, setBlinkState] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [targetEyePosition, setTargetEyePosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const eyeAnimationRef = useRef<number>();
  
  // Smooth eye following with lerp
  useEffect(() => {
    const animateEyes = () => {
      setEyePosition(prev => ({
        x: prev.x + (targetEyePosition.x - prev.x) * 0.15,
        y: prev.y + (targetEyePosition.y - prev.y) * 0.15,
      }));
      eyeAnimationRef.current = requestAnimationFrame(animateEyes);
    };
    
    eyeAnimationRef.current = requestAnimationFrame(animateEyes);
    return () => {
      if (eyeAnimationRef.current) {
        cancelAnimationFrame(eyeAnimationRef.current);
      }
    };
  }, [targetEyePosition]);
  
  // Mouse tracking for eyes
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle and distance from center
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // Normalize and clamp the movement (max 6px movement)
    const maxMove = 6;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normalizedDistance = Math.min(distance / 300, 1); // 300px = full movement
    
    const moveX = (deltaX / (distance || 1)) * normalizedDistance * maxMove;
    const moveY = (deltaY / (distance || 1)) * normalizedDistance * maxMove * 0.6; // Less vertical movement
    
    setTargetEyePosition({ x: moveX, y: moveY });
  }, []);
  
  // Add global mouse listener
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);
  
  // Lip sync based on audio volume
  useEffect(() => {
    if (!isSpeaking || !getVolume) {
      setMouthOpenness(0);
      return;
    }
    
    const updateMouth = () => {
      const volume = getVolume();
      // Map volume (0-1) to mouth openness with smoothing
      const targetOpenness = Math.min(1, volume * 2.5);
      setMouthOpenness(prev => prev + (targetOpenness - prev) * 0.3);
      animationRef.current = requestAnimationFrame(updateMouth);
    };
    
    animationRef.current = requestAnimationFrame(updateMouth);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpeaking, getVolume]);
  
  // Natural blinking
  useEffect(() => {
    const blink = () => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    };
    
    // Random blink interval between 2-5 seconds
    const scheduleNextBlink = () => {
      const delay = 2000 + Math.random() * 3000;
      return setTimeout(() => {
        blink();
        scheduleNextBlink();
      }, delay);
    };
    
    const timeoutId = scheduleNextBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  // Calculate head tilt based on state
  const headTilt = isSpeaking ? 0 : isConnected ? 3 : 0;

  return (
    <motion.div 
      ref={containerRef}
      className="relative overflow-hidden rounded-full"
      style={{ width: size, height: size }}
      animate={{
        rotate: headTilt,
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Base avatar image */}
      <img
        src={orlaAvatar}
        alt="Orla"
        className="w-full h-full object-cover"
      />
      
      {/* Animated facial features overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        style={{ pointerEvents: "none" }}
      >
        {/* Eyebrows - animated based on speaking/listening state */}
        <g>
          {/* Left eyebrow */}
          <motion.path
            d="M 30 34 Q 38 32 46 34"
            fill="none"
            stroke="rgba(80, 60, 50, 0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{
              d: isSpeaking 
                ? "M 30 36 Q 38 35 46 36" // Lowered/relaxed when speaking
                : isConnected 
                  ? "M 30 32 Q 38 29 46 32" // Raised when listening
                  : "M 30 34 Q 38 32 46 34", // Neutral
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          
          {/* Right eyebrow */}
          <motion.path
            d="M 54 34 Q 62 32 70 34"
            fill="none"
            stroke="rgba(80, 60, 50, 0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{
              d: isSpeaking 
                ? "M 54 36 Q 62 35 70 36" // Lowered/relaxed when speaking
                : isConnected 
                  ? "M 54 32 Q 62 29 70 32" // Raised when listening
                  : "M 54 34 Q 62 32 70 34", // Neutral
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </g>
        
        {/* Eyes container - positioned over the avatar's eyes */}
        <g transform={`translate(${eyePosition.x}, ${eyePosition.y})`}>
          {/* Left eye */}
          <ellipse
            cx="38"
            cy="42"
            rx="6"
            ry={blinkState ? 0.5 : 4}
            fill="rgba(30, 30, 35, 0.85)"
            className="transition-all duration-100"
          />
          {/* Left eye highlight */}
          {!blinkState && (
            <circle cx="36" cy="40" r="1.5" fill="rgba(255, 255, 255, 0.6)" />
          )}
          
          {/* Right eye */}
          <ellipse
            cx="62"
            cy="42"
            rx="6"
            ry={blinkState ? 0.5 : 4}
            fill="rgba(30, 30, 35, 0.85)"
            className="transition-all duration-100"
          />
          {/* Right eye highlight */}
          {!blinkState && (
            <circle cx="60" cy="40" r="1.5" fill="rgba(255, 255, 255, 0.6)" />
          )}
        </g>
        
        {/* Animated mouth */}
        <g>
          {/* Mouth background/shadow */}
          <motion.ellipse
            cx="50"
            cy="68"
            rx={8 + mouthOpenness * 2}
            ry={2 + mouthOpenness * 6}
            fill="rgba(60, 30, 40, 0.9)"
            animate={{
              ry: 2 + mouthOpenness * 6,
              rx: 8 + mouthOpenness * 2,
            }}
            transition={{ duration: 0.05 }}
          />
          
          {/* Lips - top */}
          <motion.path
            d={`M ${42 - mouthOpenness * 2} 66 Q 50 ${64 - mouthOpenness * 2} ${58 + mouthOpenness * 2} 66`}
            fill="none"
            stroke="rgba(180, 100, 110, 0.8)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          
          {/* Lips - bottom */}
          <motion.path
            d={`M ${42 - mouthOpenness * 2} ${68 + mouthOpenness * 4} Q 50 ${72 + mouthOpenness * 6} ${58 + mouthOpenness * 2} ${68 + mouthOpenness * 4}`}
            fill="none"
            stroke="rgba(180, 100, 110, 0.8)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          
          {/* Teeth hint when mouth is open */}
          {mouthOpenness > 0.3 && (
            <motion.rect
              x={45}
              y={66}
              width={10}
              height={mouthOpenness * 4}
              rx={1}
              fill="rgba(255, 255, 255, 0.85)"
              initial={{ opacity: 0 }}
              animate={{ opacity: mouthOpenness > 0.3 ? 0.7 : 0 }}
            />
          )}
        </g>
        
        {/* Subtle smile lines when speaking */}
        {isSpeaking && (
          <>
            <motion.path
              d="M 34 65 Q 32 68 34 71"
              fill="none"
              stroke="rgba(150, 100, 100, 0.3)"
              strokeWidth="0.8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            />
            <motion.path
              d="M 66 65 Q 68 68 66 71"
              fill="none"
              stroke="rgba(150, 100, 100, 0.3)"
              strokeWidth="0.8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            />
          </>
        )}
      </svg>
      
      {/* Warm lighting overlay when speaking */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          background: isSpeaking 
            ? "radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.1) 0%, transparent 60%)"
            : "radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.05) 0%, transparent 60%)",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default OrlaAnimatedAvatar;
