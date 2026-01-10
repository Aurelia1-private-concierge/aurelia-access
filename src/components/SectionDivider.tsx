import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface SectionDividerProps {
  variant?: "default" | "wide" | "minimal" | "ornate";
  className?: string;
}

const SectionDivider = ({ variant = "default", className = "" }: SectionDividerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const lineScale = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  const particleOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const glowIntensity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.5]);

  // Generate random particles
  const particles = Array.from({ length: variant === "ornate" ? 12 : 6 }, (_, i) => ({
    id: i,
    delay: i * 0.15,
    x: (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 40),
    size: 2 + Math.random() * 3,
  }));

  if (variant === "minimal") {
    return (
      <div ref={ref} className={`relative py-12 overflow-hidden ${className}`}>
        <motion.div
          style={{ scaleX: lineScale }}
          className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />
      </div>
    );
  }

  if (variant === "ornate") {
    return (
      <div ref={ref} className={`relative py-20 overflow-hidden ${className}`}>
        {/* Central ornament */}
        <div className="relative flex items-center justify-center">
          {/* Left line */}
          <motion.div
            style={{ scaleX: lineScale, originX: 1 }}
            className="absolute right-1/2 mr-8 h-px w-32 md:w-48 bg-gradient-to-l from-primary/50 to-transparent"
          />
          
          {/* Right line */}
          <motion.div
            style={{ scaleX: lineScale, originX: 0 }}
            className="absolute left-1/2 ml-8 h-px w-32 md:w-48 bg-gradient-to-r from-primary/50 to-transparent"
          />

          {/* Center diamond ornament */}
          <motion.div
            style={{ opacity: particleOpacity }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border border-primary/40 rotate-45"
            />
            <motion.div
              style={{ opacity: glowIntensity }}
              className="absolute inset-0 w-6 h-6 border border-primary/20 rotate-45 blur-sm"
            />
            {/* Inner dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            </div>
          </motion.div>

          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              style={{ opacity: particleOpacity }}
              initial={{ y: 0, x: 0 }}
              animate={{
                y: [-10, 10, -10],
                x: [0, particle.x * 0.3, 0],
              }}
              transition={{
                duration: 4 + particle.delay,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
              className="absolute"
            >
              <div
                className="rounded-full bg-primary/40"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: particle.x,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Ambient glow */}
        <motion.div
          style={{ opacity: glowIntensity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-32 h-8 bg-primary/10 blur-2xl rounded-full" />
        </motion.div>
      </div>
    );
  }

  if (variant === "wide") {
    return (
      <div ref={ref} className={`relative py-16 overflow-hidden ${className}`}>
        <div className="relative max-w-4xl mx-auto px-8">
          {/* Main line */}
          <motion.div
            style={{ scaleX: lineScale }}
            className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          />

          {/* Accent dots */}
          <motion.div
            style={{ opacity: particleOpacity }}
            className="absolute top-1/2 left-1/4 -translate-y-1/2"
          >
            <div className="w-1 h-1 rounded-full bg-primary/50" />
          </motion.div>
          <motion.div
            style={{ opacity: particleOpacity }}
            className="absolute top-1/2 right-1/4 -translate-y-1/2"
          >
            <div className="w-1 h-1 rounded-full bg-primary/50" />
          </motion.div>

          {/* Center accent */}
          <motion.div
            style={{ opacity: particleOpacity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-primary/40"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div ref={ref} className={`relative py-16 overflow-hidden ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Left decorative line */}
        <motion.div
          style={{ scaleX: lineScale, originX: 1 }}
          className="h-px w-24 md:w-40 bg-gradient-to-l from-primary/40 to-transparent"
        />

        {/* Center element with particles */}
        <motion.div
          style={{ opacity: particleOpacity }}
          className="relative mx-6"
        >
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border border-primary/20"
          />
          
          {/* Inner ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-1 rounded-full border border-primary/30"
          />
          
          {/* Center pulse */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-2 h-2 rounded-full bg-primary/60" />
          </motion.div>

          {/* Floating particles around center */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              animate={{
                y: [-15, 15, -15],
                x: [particle.x * 0.5, -particle.x * 0.5, particle.x * 0.5],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + particle.delay,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 left-1/2"
              style={{
                marginLeft: particle.x,
                marginTop: -particle.size / 2,
              }}
            >
              <div
                className="rounded-full bg-primary/50"
                style={{
                  width: particle.size,
                  height: particle.size,
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Right decorative line */}
        <motion.div
          style={{ scaleX: lineScale, originX: 0 }}
          className="h-px w-24 md:w-40 bg-gradient-to-r from-primary/40 to-transparent"
        />
      </div>

      {/* Ambient background glow */}
      <motion.div
        style={{ opacity: glowIntensity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-48 h-12 bg-primary/5 blur-3xl rounded-full" />
      </motion.div>
    </div>
  );
};

export default SectionDivider;