import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailPoint {
  x: number;
  y: number;
  id: number;
  opacity: number;
}

const GlowTrail = () => {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isActive, setIsActive] = useState(false);
  const idRef = useRef(0);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Only show on desktop
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      // Check distance from last point to avoid too many points
      const dx = clientX - lastPointRef.current.x;
      const dy = clientY - lastPointRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 8) return;
      
      lastPointRef.current = { x: clientX, y: clientY };
      
      const newPoint: TrailPoint = {
        x: clientX,
        y: clientY,
        id: idRef.current++,
        opacity: 1,
      };

      setTrail((prev) => {
        const updated = [...prev, newPoint];
        // Keep only last 12 points
        return updated.slice(-12);
      });
    };

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => {
      setIsActive(false);
      setTrail([]);
    };

    // Fade out trail points
    const fadeTrail = () => {
      setTrail((prev) => 
        prev
          .map((p) => ({ ...p, opacity: p.opacity - 0.08 }))
          .filter((p) => p.opacity > 0)
      );
      rafRef.current = requestAnimationFrame(fadeTrail);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    rafRef.current = requestAnimationFrame(fadeTrail);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!isActive && trail.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]" aria-hidden="true">
      <svg className="w-full h-full">
        <defs>
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.8)" />
            <stop offset="50%" stopColor="rgba(212, 175, 55, 0.3)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <AnimatePresence>
          {trail.map((point, index) => (
            <motion.circle
              key={point.id}
              cx={point.x}
              cy={point.y}
              r={4 + index * 0.5}
              fill="url(#glowGradient)"
              filter="url(#glow)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: point.opacity * 0.6, 
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.15 }}
            />
          ))}
        </AnimatePresence>
        
        {/* Connecting line */}
        {trail.length > 1 && (
          <motion.path
            d={trail.reduce((acc, point, i) => {
              if (i === 0) return `M ${point.x} ${point.y}`;
              return `${acc} L ${point.x} ${point.y}`;
            }, "")}
            stroke="rgba(212, 175, 55, 0.2)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
};

export default GlowTrail;
