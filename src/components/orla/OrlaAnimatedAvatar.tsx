import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
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
  const animationRef = useRef<number>();
  
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
  
  // Subtle eye movement when connected
  useEffect(() => {
    if (!isConnected) {
      setEyePosition({ x: 0, y: 0 });
      return;
    }
    
    const moveEyes = () => {
      // Small random movement
      setEyePosition({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 2,
      });
    };
    
    const interval = setInterval(moveEyes, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div 
      className="relative overflow-hidden rounded-full"
      style={{ width: size, height: size }}
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
    </div>
  );
};

export default OrlaAnimatedAvatar;
