import { motion } from "framer-motion";

interface GlowingOrbProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "gold" | "blue" | "purple";
  intensity?: "soft" | "medium" | "intense";
}

const sizes = {
  sm: "w-32 h-32",
  md: "w-64 h-64",
  lg: "w-96 h-96",
  xl: "w-[500px] h-[500px]",
};

const colors = {
  gold: "from-primary/20 via-primary/10 to-transparent",
  blue: "from-blue-500/20 via-blue-500/10 to-transparent",
  purple: "from-purple-500/20 via-purple-500/10 to-transparent",
};

const glows = {
  soft: "blur-[60px]",
  medium: "blur-[100px]",
  intense: "blur-[150px]",
};

const GlowingOrb = ({
  className = "",
  size = "lg",
  color = "gold",
  intensity = "medium",
}: GlowingOrbProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.1, 1],
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute rounded-full bg-gradient-radial ${colors[color]} ${sizes[size]} ${glows[intensity]} pointer-events-none ${className}`}
    />
  );
};

export default GlowingOrb;
