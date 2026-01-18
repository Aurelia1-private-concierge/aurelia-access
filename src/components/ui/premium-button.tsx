import { ReactNode, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PremiumButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "luxury";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      icon,
      iconPosition = "right",
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 gold-glow-hover",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/30",
      outline:
        "bg-transparent border border-border/40 text-foreground hover:border-primary/50 hover:bg-primary/5",
      ghost: "bg-transparent text-foreground hover:bg-secondary/50",
      luxury:
        "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground btn-luxury gold-glow-hover",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs tracking-wider",
      md: "px-6 py-3 text-xs tracking-widest",
      lg: "px-8 py-4 text-sm tracking-widest",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 font-medium uppercase transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Shimmer effect for luxury variant */}
        {variant === "luxury" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {icon && iconPosition === "left" && icon}
              {children}
              {icon && iconPosition === "right" && icon}
            </>
          )}
        </span>
      </motion.button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";

export default PremiumButton;
