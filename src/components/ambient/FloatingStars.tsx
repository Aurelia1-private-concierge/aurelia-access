import { memo, useMemo } from "react";
import { motion } from "framer-motion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

const FloatingStars = memo(() => {
  // Generate stars with consistent positions using useMemo
  const stars = useMemo<Star[]>(() => {
    const starCount = 60;
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: star.id % 5 === 0 
              ? "rgba(212, 175, 55, 0.8)" // Gold accent stars
              : "rgba(255, 255, 255, 0.7)",
            boxShadow: star.id % 5 === 0
              ? `0 0 ${star.size * 2}px rgba(212, 175, 55, 0.5)`
              : `0 0 ${star.size}px rgba(255, 255, 255, 0.3)`,
          }}
          animate={{
            opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Occasional shooting star effect */}
      <motion.div
        className="absolute w-1 h-1 bg-white rounded-full"
        style={{
          boxShadow: "0 0 4px #fff, -20px 0 10px rgba(255,255,255,0.3), -40px 0 6px rgba(255,255,255,0.1)",
        }}
        initial={{ left: "100%", top: "10%", opacity: 0 }}
        animate={{
          left: ["-10%"],
          top: ["30%"],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 2,
          delay: 8,
          repeat: Infinity,
          repeatDelay: 15,
          ease: "easeOut",
        }}
      />
      
      <motion.div
        className="absolute w-0.5 h-0.5 bg-primary rounded-full"
        style={{
          boxShadow: "0 0 4px rgba(212,175,55,0.8), -15px 0 8px rgba(212,175,55,0.3)",
        }}
        initial={{ left: "80%", top: "5%", opacity: 0 }}
        animate={{
          left: ["-5%"],
          top: ["25%"],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 1.5,
          delay: 20,
          repeat: Infinity,
          repeatDelay: 25,
          ease: "easeOut",
        }}
      />
    </div>
  );
});

FloatingStars.displayName = "FloatingStars";

export default FloatingStars;
