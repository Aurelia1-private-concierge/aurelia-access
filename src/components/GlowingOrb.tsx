import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface GlowingOrbProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "gold" | "blue" | "purple";
  intensity?: "soft" | "medium" | "intense";
}

const sizes = {
  sm: "w-16 h-16 sm:w-32 sm:h-32",
  md: "w-32 h-32 sm:w-64 sm:h-64",
  lg: "w-48 h-48 sm:w-96 sm:h-96",
  xl: "w-64 h-64 sm:w-[500px] sm:h-[500px]",
};

const colors = {
  gold: "from-primary/20 via-primary/10 to-transparent",
  blue: "from-blue-500/20 via-blue-500/10 to-transparent",
  purple: "from-purple-500/20 via-purple-500/10 to-transparent",
};

const glows = {
  soft: "blur-[40px] sm:blur-[60px]",
  medium: "blur-[60px] sm:blur-[100px]",
  intense: "blur-[80px] sm:blur-[150px]",
};

// Mobile-friendly blur values
const mobileGlows = {
  soft: "blur-[30px]",
  medium: "blur-[40px]",
  intense: "blur-[50px]",
};

const GlowingOrb = ({
  className = "",
  size = "lg",
  color = "gold",
  intensity = "medium",
}: GlowingOrbProps) => {
  const isMobile = useIsMobile();
  const blurClass = isMobile ? mobileGlows[intensity] : glows[intensity];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isMobile ? [0.2, 0.4, 0.2] : [0.3, 0.6, 0.3],
        scale: isMobile ? [1, 1.05, 1] : [1, 1.1, 1],
      }}
      transition={{ 
        duration: isMobile ? 10 : 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute rounded-full bg-gradient-radial ${colors[color]} ${sizes[size]} ${blurClass} pointer-events-none ${className}`}
    />
  );
};

export default GlowingOrb;
