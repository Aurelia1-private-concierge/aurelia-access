import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: "button" | "div";
  strength?: number;
  enableRipple?: boolean;
  enableParticles?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
}

const MagneticButton = ({
  children,
  className,
  onClick,
  as = "button",
  strength = 0.3,
  enableRipple = true,
  enableParticles = false,
}: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const rippleIdRef = useRef(0);
  const particleIdRef = useRef(0);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const x = (clientX - centerX) * strength;
    const y = (clientY - centerY) * strength;

    setPosition({ x, y });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add ripple
    if (enableRipple) {
      const newRipple: Ripple = {
        id: rippleIdRef.current++,
        x,
        y,
      };
      setRipples((prev) => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }

    // Add particles burst
    if (enableParticles) {
      const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
        id: particleIdRef.current++,
        x,
        y,
        angle: (i / 8) * Math.PI * 2,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      
      // Remove particles after animation
      setTimeout(() => {
        setParticles((prev) => 
          prev.filter((p) => !newParticles.some((np) => np.id === p.id))
        );
      }, 800);
    }

    onClick?.();
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={handleClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 15, mass: 0.5 }}
      className={cn("inline-block relative overflow-hidden", className)}
      role={as === "button" ? "button" : undefined}
      style={{ willChange: "transform" }}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-primary/30 pointer-events-none"
          initial={{ 
            width: 0, 
            height: 0, 
            x: ripple.x, 
            y: ripple.y, 
            opacity: 0.5 
          }}
          animate={{ 
            width: 200, 
            height: 200, 
            x: ripple.x - 100, 
            y: ripple.y - 100, 
            opacity: 0 
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
      
      {/* Particle burst effects */}
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary pointer-events-none"
          initial={{ 
            x: particle.x, 
            y: particle.y, 
            opacity: 1,
            scale: 1,
          }}
          animate={{ 
            x: particle.x + Math.cos(particle.angle) * 50, 
            y: particle.y + Math.sin(particle.angle) * 50, 
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
};

export default MagneticButton;
