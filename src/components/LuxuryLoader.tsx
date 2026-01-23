import { motion } from "framer-motion";

interface LuxuryLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse" | "liquid";
  className?: string;
}

const LuxuryLoader = ({
  size = "md",
  variant = "spinner",
  className = "",
}: LuxuryLoaderProps) => {
  const sizeMap = {
    sm: { wrapper: 24, stroke: 2 },
    md: { wrapper: 40, stroke: 2.5 },
    lg: { wrapper: 64, stroke: 3 },
  };

  const { wrapper, stroke } = sizeMap[size];

  if (variant === "dots") {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full bg-primary"
            style={{ width: wrapper / 5, height: wrapper / 5 }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={`relative ${className}`} style={{ width: wrapper, height: wrapper }}>
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/30"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.2,
          }}
        />
        <div className="absolute inset-1/4 rounded-full bg-primary/50" />
      </div>
    );
  }

  if (variant === "liquid") {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ width: wrapper * 3, height: wrapper / 4 }}>
        <div className="absolute inset-0 bg-border/20 rounded-full" />
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full"
          initial={{ width: "0%", x: "-100%" }}
          animate={{ 
            width: ["0%", "50%", "0%"],
            x: ["-100%", "100%", "200%"]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`relative ${className}`} style={{ width: wrapper, height: wrapper }}>
      <svg
        viewBox="0 0 50 50"
        className="w-full h-full"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background circle */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-border/30"
        />
        
        {/* Animated arc */}
        <motion.circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="url(#luxuryGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray="125.6"
          initial={{ strokeDashoffset: 125.6 }}
          animate={{
            strokeDashoffset: [125.6, 31.4, 125.6],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "center" }}
        />
        
        <defs>
          <linearGradient id="luxuryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(42, 70%, 70%)" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center glow */}
      <motion.div
        className="absolute inset-1/4 rounded-full bg-primary/20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

// Skeleton with shimmer
export const LuxurySkeleton = ({
  className = "",
  variant = "text",
}: {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}) => {
  const baseClasses = "relative overflow-hidden bg-muted/30";
  
  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full aspect-square",
    rectangular: "rounded-lg",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default LuxuryLoader;
