import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import orlaAvatarTiny from "@/assets/orla-avatar-tiny.webp";

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
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
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
        )}
      </AnimatePresence>

      {/* Listening indicator ring */}
      <AnimatePresence>
        {isListening && !isSpeaking && (
          <motion.div
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
        )}
      </AnimatePresence>

      {/* Static avatar image - using optimized smaller version */}
      <motion.img
        src={orlaAvatarTiny}
        alt="Orla"
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

      {/* Listening status dot */}
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
    </div>
  );
});

OrlaMiniAvatar.displayName = "OrlaMiniAvatar";

export default OrlaMiniAvatar;
