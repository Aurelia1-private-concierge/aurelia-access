import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface QuantumBadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

export const QuantumBadge = ({
  children,
  className,
  variant = "default",
  pulse = false,
  size = "md",
}: QuantumBadgeProps) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  const variantStyles = {
    default: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative inline-flex items-center gap-1.5 font-mono uppercase tracking-wider",
        "rounded border",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {/* Pulse indicator */}
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              variant === "default" && "bg-cyan-400",
              variant === "success" && "bg-emerald-400",
              variant === "warning" && "bg-amber-400",
              variant === "error" && "bg-red-400",
              variant === "info" && "bg-blue-400"
            )}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              variant === "default" && "bg-cyan-400",
              variant === "success" && "bg-emerald-400",
              variant === "warning" && "bg-amber-400",
              variant === "error" && "bg-red-400",
              variant === "info" && "bg-blue-400"
            )}
          />
        </span>
      )}
      {children}
    </motion.span>
  );
};

export default QuantumBadge;
