import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "gold" | "primary" | "accent";
  tiltIntensity?: number;
  enableTilt?: boolean;
  enableGlow?: boolean;
  variant?: "default" | "glass" | "elevated" | "outlined";
}

export const PremiumCard = ({
  children,
  className,
  glowColor = "gold",
  tiltIntensity = 10,
  enableTilt = true,
  enableGlow = true,
  variant = "default",
}: PremiumCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]), {
    stiffness: 300,
    damping: 30,
  });

  const glowOpacity = useSpring(0, { stiffness: 300, damping: 30 });
  const glowX = useSpring(50, { stiffness: 300, damping: 30 });
  const glowY = useSpring(50, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !enableTilt) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / rect.width;
    const y = (e.clientY - centerY) / rect.height;

    mouseX.set(x);
    mouseY.set(y);

    if (enableGlow) {
      glowX.set(((e.clientX - rect.left) / rect.width) * 100);
      glowY.set(((e.clientY - rect.top) / rect.height) * 100);
    }
  };

  const handleMouseEnter = () => {
    if (enableGlow) glowOpacity.set(1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    if (enableGlow) {
      glowOpacity.set(0);
      glowX.set(50);
      glowY.set(50);
    }
  };

  const glowColors = {
    gold: "hsl(var(--gold) / 0.15)",
    primary: "hsl(var(--primary) / 0.15)",
    accent: "hsl(var(--accent) / 0.15)",
  };

  const variantStyles = {
    default: "bg-card border border-border/20",
    glass: "glass border border-border/10",
    elevated: "bg-card border border-border/30 shadow-xl",
    outlined: "bg-transparent border-2 border-border/40 hover:border-primary/40",
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-300",
        variantStyles[variant],
        className
      )}
    >
      {/* Glow effect */}
      {enableGlow && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            opacity: glowOpacity,
            background: `radial-gradient(circle at ${glowX.get()}% ${glowY.get()}%, ${glowColors[glowColor]}, transparent 50%)`,
          }}
        />
      )}

      {/* Top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default PremiumCard;
