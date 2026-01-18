import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface QuantumButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export const QuantumButton = ({
  children,
  className,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  onClick,
  disabled = false,
}: QuantumButtonProps) => {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50",
    secondary:
      "bg-slate-800 border border-cyan-500/30 text-cyan-400 hover:bg-slate-700 hover:border-cyan-400/50",
    ghost:
      "bg-transparent text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300",
    danger:
      "bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center font-medium rounded-md",
        "transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {/* Scan line animation */}
      <motion.div
        className="absolute inset-0 rounded-md overflow-hidden pointer-events-none"
        initial={false}
      >
        <motion.div
          animate={{ y: ["100%", "-100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-white/5 to-transparent"
        />
      </motion.div>

      {/* Content */}
      <span className="relative z-10 flex items-center">
        {loading && (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mr-2"
          >
            <svg className={iconSizes[size]} viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="32"
                strokeDashoffset="12"
              />
            </svg>
          </motion.span>
        )}
        {Icon && !loading && iconPosition === "left" && (
          <Icon className={cn(iconSizes[size], "mr-2")} />
        )}
        {children}
        {Icon && !loading && iconPosition === "right" && (
          <Icon className={cn(iconSizes[size], "ml-2")} />
        )}
      </span>
    </motion.button>
  );
};

export default QuantumButton;
