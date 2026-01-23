import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface CinematicIntroProps {
  onComplete: () => void;
  duration?: number;
}

const CinematicIntro = ({ onComplete, duration = 3000 }: CinematicIntroProps) => {
  const [phase, setPhase] = useState<"particles" | "reveal" | "fadeout">("particles");
  const [isVisible, setIsVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Particle animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      targetX: number;
      targetY: number;
      arrived: boolean;
    }> = [];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const particleCount = 150;

    // Create particles scattered around the screen
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 200 + Math.random() * 400;
      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
        targetX: centerX + (Math.random() - 0.5) * 100,
        targetY: centerY + (Math.random() - 0.5) * 60,
        arrived: false,
      });
    }

    let startTime = Date.now();
    const convergeDuration = duration * 0.6;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / convergeDuration, 1);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections between nearby particles
      ctx.strokeStyle = `rgba(212, 175, 55, ${0.1 * (1 - progress * 0.5)})`;
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        // Move towards target with easing
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const ease = 0.02 + progress * 0.08;
        
        p.x += dx * ease;
        p.y += dy * ease;

        // Check if arrived
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
          p.arrived = true;
        }

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${p.opacity})`);
        gradient.addColorStop(0.5, `rgba(212, 175, 55, ${p.opacity * 0.5})`);
        gradient.addColorStop(1, "rgba(212, 175, 55, 0)");

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 248, 220, ${p.opacity})`;
        ctx.fill();
      });

      if (elapsed < convergeDuration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setPhase("reveal");
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration]);

  // Phase transitions
  useEffect(() => {
    if (phase === "reveal") {
      const timer = setTimeout(() => {
        setPhase("fadeout");
      }, duration * 0.25);
      return () => clearTimeout(timer);
    }
    
    if (phase === "fadeout") {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phase, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "fadeout" ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
      >
        {/* Particle canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ opacity: phase === "reveal" ? 0.3 : 1, transition: "opacity 0.5s" }}
        />

        {/* Logo reveal */}
        <AnimatePresence>
          {phase === "reveal" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-10 text-center"
            >
              {/* Glow behind logo */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.5 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 -z-10"
                style={{
                  background: "radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />
              
              {/* Logo text */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-5xl md:text-7xl font-medium tracking-[0.15em] text-foreground"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                AURELIA
              </motion.h1>
              
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4"
              />
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-xs uppercase tracking-[0.4em] text-muted-foreground mt-4"
              >
                Private Concierge
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vignette effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 20%, hsl(var(--background)) 100%)",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default CinematicIntro;
