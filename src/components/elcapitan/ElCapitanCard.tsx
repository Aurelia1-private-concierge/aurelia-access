import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ElCapitanCardProps {
  children: ReactNode;
  className?: string;
  variant?: "light" | "dark" | "vibrant";
  blur?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
}

export const ElCapitanCard = ({
  children,
  className,
  variant = "light",
  blur = "lg",
  interactive = true,
}: ElCapitanCardProps) => {
  const blurAmount = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  const variantStyles = {
    light: "bg-white/10 border-white/20 shadow-lg shadow-black/5",
    dark: "bg-black/20 border-white/10 shadow-xl shadow-black/20",
    vibrant: "bg-gradient-to-br from-white/15 via-white/5 to-transparent border-white/25",
  };

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.02, y: -4 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative rounded-2xl border overflow-hidden",
        blurAmount[blur],
        variantStyles[variant],
        interactive && "cursor-pointer",
        className
      )}
    >
      {/* Frosted glass inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default ElCapitanCard;
