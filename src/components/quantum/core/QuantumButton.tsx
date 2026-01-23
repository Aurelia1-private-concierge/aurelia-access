import { useState, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface QuantumButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  showParticles?: boolean;
  showRipple?: boolean;
  soundEnabled?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export const QuantumButton = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  className,
  showParticles = true,
  showRipple = true,
  soundEnabled = true,
}: QuantumButtonProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleId = useRef(0);

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantStyles = {
    primary: cn(
      "bg-gradient-to-r from-cyan-600 to-cyan-500",
      "border-cyan-400/50 hover:border-cyan-300",
      "text-white shadow-lg shadow-cyan-500/25",
      "hover:shadow-cyan-500/40"
    ),
    secondary: cn(
      "bg-slate-800/80 border-cyan-500/30",
      "hover:bg-slate-700/80 hover:border-cyan-400/50",
      "text-cyan-400"
    ),
    ghost: cn(
      "bg-transparent border-transparent",
      "hover:bg-cyan-500/10 hover:border-cyan-500/30",
      "text-cyan-400"
    ),
    danger: cn(
      "bg-gradient-to-r from-red-600 to-red-500",
      "border-red-400/50 hover:border-red-300",
      "text-white shadow-lg shadow-red-500/25",
      "hover:shadow-red-500/40"
    ),
  };

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio context may not be available
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    playClickSound();

    // Create ripple
    if (showRipple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    // Create particles
    if (showParticles && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const newParticles: Particle[] = Array.from({ length: 8 }, () => ({
        id: particleId.current++,
        x: centerX,
        y: centerY,
        angle: Math.random() * Math.PI * 2,
      }));

      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
      }, 600);
    }

    onClick?.();
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-lg border font-mono",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
        sizeStyles[size],
        variantStyles[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "10px 10px",
        }}
      />

      {/* Shimmer effect */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
      />

      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Particle burst */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            initial={{ x: particle.x, y: particle.y, opacity: 1, scale: 1 }}
            animate={{
              x: particle.x + Math.cos(particle.angle) * 50,
              y: particle.y + Math.sin(particle.angle) * 50,
              opacity: 0,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full bg-white pointer-events-none"
            style={{ left: 0, top: 0 }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            {children}
            {icon && iconPosition === "right" && icon}
          </>
        )}
      </span>

      {/* Top edge glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </motion.button>
  );
};

export default QuantumButton;
