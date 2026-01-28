import { memo, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Use tiny avatar for FAB (56-80px display) - only 5KB vs 990KB original
import orlaAvatarTiny from "@/assets/orla-avatar-tiny.webp";
import orlaAvatarSmall from "@/assets/orla-avatar-small.webp";

interface OrlaMiniAvatarProps {
  size?: number;
  isActive?: boolean;
  showSparkles?: boolean;
  forceStatic?: boolean;
  expression?: "neutral" | "happy" | "thinking" | "speaking" | "listening" | "surprised" | "sleepy";
  isBlinking?: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  mouthOpenness?: number;
  audioLevel?: number;
}

// ForwardRef wrapper for AnimatePresence children
const SpeakingRing = forwardRef<HTMLDivElement, { audioLevel: number }>(({ audioLevel }, ref) => (
  <motion.div
    ref={ref}
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{
      scale: [1, 1.1 + audioLevel * 0.15, 1],
      opacity: [0.7, 0.4, 0.7],
    }}
    exit={{ scale: 0.9, opacity: 0 }}
    transition={{
      duration: 0.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="absolute inset-0 rounded-full border-2 border-primary"
  />
));
SpeakingRing.displayName = "SpeakingRing";

const ListeningRing = forwardRef<HTMLDivElement>((_, ref) => (
  <motion.div
    ref={ref}
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{
      scale: [1, 1.05, 1],
      opacity: [0.5, 0.8, 0.5],
    }}
    exit={{ scale: 0.9, opacity: 0 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="absolute inset-0 rounded-full border-2 border-emerald-400"
  />
));
ListeningRing.displayName = "ListeningRing";

const SpeakingDot = forwardRef<HTMLDivElement>((_, ref) => (
  <motion.div
    ref={ref}
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
));
SpeakingDot.displayName = "SpeakingDot";

const ListeningDot = forwardRef<HTMLDivElement>((_, ref) => (
  <motion.div
    ref={ref}
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
));
ListeningDot.displayName = "ListeningDot";

const OrlaMiniAvatar = memo(({
  size = 56,
  isActive = false,
  isSpeaking = false,
  isListening = false,
  audioLevel = 0,
}: OrlaMiniAvatarProps) => {
  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Glow effect when active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/30"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Speaking indicator ring */}
      <AnimatePresence mode="wait">
        {isSpeaking && <SpeakingRing key="speaking-ring" audioLevel={audioLevel} />}
      </AnimatePresence>

      {/* Listening indicator ring */}
      <AnimatePresence mode="wait">
        {isListening && !isSpeaking && <ListeningRing key="listening-ring" />}
      </AnimatePresence>

      {/* Static avatar image - using size-appropriate optimized version */}
      {/* orlaAvatarTiny (~5KB) for sizes ≤80px, orlaAvatarSmall (~30KB) for larger */}
      <motion.img
        src={size <= 80 ? orlaAvatarTiny : orlaAvatarSmall}
        alt="Orla"
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        animate={isSpeaking ? {
          scale: [1, 1.02, 1],
        } : {}}
        transition={{
          duration: 0.3,
          repeat: isSpeaking ? Infinity : 0,
        }}
      />

      {/* Speaking status dot */}
      <AnimatePresence mode="wait">
        {isSpeaking && <SpeakingDot key="speaking-dot" />}
      </AnimatePresence>

      {/* Listening status dot */}
      <AnimatePresence mode="wait">
        {isListening && !isSpeaking && <ListeningDot key="listening-dot" />}
      </AnimatePresence>
    </div>
  );
});

OrlaMiniAvatar.displayName = "OrlaMiniAvatar";

export default OrlaMiniAvatar;
