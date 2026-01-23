import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface DynamicLightingProps {
  intensity?: "subtle" | "medium" | "strong";
  color?: string;
  size?: number;
}

const DynamicLighting = ({
  intensity = "subtle",
  color = "212, 175, 55",
  size = 400,
}: DynamicLightingProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number>();
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const opacityMap = {
    subtle: 0.03,
    medium: 0.06,
    strong: 0.1,
  };

  useEffect(() => {
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Only on desktop
    if (window.innerWidth < 768) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Smooth follow animation
    const animate = () => {
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;
      
      currentRef.current.x += dx * 0.08;
      currentRef.current.y += dy * 0.08;
      
      setPosition({ ...currentRef.current });
      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[5]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        background: `radial-gradient(circle at center, rgba(${color}, ${opacityMap[intensity]}) 0%, rgba(${color}, 0) 70%)`,
        filter: "blur(30px)",
        willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
};

// Ambient pulsing light orbs
export const AmbientLightOrb = ({
  position,
  color = "212, 175, 55",
  size = 200,
  pulseSpeed = 4,
}: {
  position: { x: string; y: string };
  color?: string;
  size?: number;
  pulseSpeed?: number;
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.03, 0.06, 0.03],
      }}
      transition={{
        duration: pulseSpeed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `radial-gradient(circle at center, rgba(${color}, 0.15) 0%, rgba(${color}, 0) 70%)`,
          filter: "blur(40px)",
        }}
      />
    </motion.div>
  );
};

export default DynamicLighting;
