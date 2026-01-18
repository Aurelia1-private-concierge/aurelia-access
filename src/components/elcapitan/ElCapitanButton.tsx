import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface ElCapitanButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  disabled?: boolean;
}

export const ElCapitanButton = ({
  children,
  className,
  variant = "default",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  onClick,
  disabled = false,
}: ElCapitanButtonProps) => {
  const sizeStyles = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base gap-3",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const variantStyles = {
    default:
      "bg-white/15 hover:bg-white/25 border-white/30 text-foreground shadow-lg shadow-black/10",
    accent:
      "bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500/90 hover:to-purple-500/90 border-white/20 text-white shadow-lg shadow-blue-500/20",
    ghost:
      "bg-transparent hover:bg-white/10 border-transparent text-foreground/80 hover:text-foreground",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center font-medium rounded-xl",
        "backdrop-blur-md border transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-inherit">
        {Icon && iconPosition === "left" && <Icon className={iconSizes[size]} />}
        {children}
        {Icon && iconPosition === "right" && <Icon className={iconSizes[size]} />}
      </span>
    </motion.button>
  );
};

export default ElCapitanButton;
