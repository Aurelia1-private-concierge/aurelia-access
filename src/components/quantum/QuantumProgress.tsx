import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuantumProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

export const QuantumProgress = ({
  value,
  max = 100,
  label,
  showValue = true,
  variant = "default",
  size = "md",
  className,
  animated = true,
}: QuantumProgressProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const variantStyles = {
    default: "from-cyan-500 to-cyan-400",
    success: "from-emerald-500 to-emerald-400",
    warning: "from-amber-500 to-amber-400",
    error: "from-red-500 to-red-400",
  };

  const glowColors = {
    default: "shadow-cyan-500/50",
    success: "shadow-emerald-500/50",
    warning: "shadow-amber-500/50",
    error: "shadow-red-500/50",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-slate-400 font-mono">{label}</span>}
          {showValue && (
            <span className="text-cyan-400 font-mono tabular-nums">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "relative w-full rounded-full overflow-hidden",
          "bg-slate-800 border border-cyan-500/20",
          sizeStyles[size]
        )}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(34, 211, 238, 0.1) 4px, rgba(34, 211, 238, 0.1) 5px)",
          }}
        />

        {/* Progress bar */}
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            "shadow-lg",
            variantStyles[variant],
            glowColors[variant]
          )}
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{ x: ["0%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
        </motion.div>

        {/* Markers */}
        {size === "lg" && (
          <div className="absolute inset-0 flex justify-between px-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-px h-full bg-cyan-500/20"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuantumProgress;
