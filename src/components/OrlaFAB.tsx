import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import OrlaMiniAvatar from "@/components/orla/OrlaMiniAvatar";
import { useAvatarStyle } from "@/hooks/useAvatarStyle";

const OrlaFAB = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { currentStyle } = useAvatarStyle();
  
  return (
    <Link to="/orla">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="fixed bottom-28 right-6 md:right-8 z-50 w-14 h-14 rounded-full overflow-hidden border-2 border-primary/60 flex items-center justify-center transition-all duration-300 group cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${currentStyle.colors.primary}E6, ${currentStyle.colors.primary})`,
          boxShadow: `0 0 40px ${currentStyle.colors.glow}`,
        }}
      >
        {/* Animated glow ring */}
        <motion.span 
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: currentStyle.colors.primary, opacity: 0.4 }}
        />
        <motion.span 
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: currentStyle.colors.primary, opacity: 0.3 }}
        />
        
        {/* Style-matched particles on hover */}
        {isHovered && currentStyle.effects.sparkles && (
          <>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.span
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ backgroundColor: currentStyle.colors.primary }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: Math.cos((i / 6) * Math.PI * 2) * 25,
                  y: Math.sin((i / 6) * Math.PI * 2) * 25,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}
        
        {/* Notification Dot */}
        <motion.span 
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-background rounded-full z-10 flex items-center justify-center shadow-lg shadow-emerald-500/40"
        >
          <span className="text-[9px] font-bold text-white">1</span>
        </motion.span>

        {/* Mini Avatar */}
        <OrlaMiniAvatar size={56} isActive={isHovered} showSparkles={true} forceStatic={true} />

        {/* Tooltip on hover */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 backdrop-blur-xl border border-border/30 rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            backgroundColor: `${currentStyle.colors.secondary}F2`,
          }}
        >
          <p className="text-xs text-foreground font-medium">Speak with Orla</p>
          <p className="text-[10px] text-muted-foreground">Voice conversation</p>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default OrlaFAB;
