import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
  life: number;
  maxLife: number;
}

type ParticleMode = "default" | "ocean" | "cloud" | "ember" | "celebration";

interface AmbientParticlesProps {
  mode?: ParticleMode;
  interactive?: boolean;
}

const modeConfigs = {
  default: {
    hueRange: [40, 50],
    saturation: 70,
    lightness: 55,
    count: { mobile: 15, desktop: 50 },
    speed: 0.3,
    connectionDistance: 120,
    connectionColor: "hsla(42, 70%, 55%,",
  },
  ocean: {
    hueRange: [180, 220],
    saturation: 60,
    lightness: 50,
    count: { mobile: 20, desktop: 60 },
    speed: 0.2,
    connectionDistance: 100,
    connectionColor: "hsla(200, 60%, 50%,",
  },
  cloud: {
    hueRange: [200, 220],
    saturation: 20,
    lightness: 80,
    count: { mobile: 10, desktop: 30 },
    speed: 0.15,
    connectionDistance: 80,
    connectionColor: "hsla(210, 20%, 80%,",
  },
  ember: {
    hueRange: [10, 40],
    saturation: 80,
    lightness: 50,
    count: { mobile: 25, desktop: 70 },
    speed: 0.4,
    connectionDistance: 60,
    connectionColor: "hsla(25, 80%, 50%,",
  },
  celebration: {
    hueRange: [0, 360],
    saturation: 80,
    lightness: 60,
    count: { mobile: 30, desktop: 100 },
    speed: 0.5,
    connectionDistance: 0,
    connectionColor: "",
  },
};

const AmbientParticles = ({ mode = "default", interactive = true }: AmbientParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();
  const [isReady, setIsReady] = useState(false);

  const config = modeConfigs[mode];

  const createParticle = useCallback((canvas: HTMLCanvasElement, config: typeof modeConfigs.default): Particle => {
    const [minHue, maxHue] = config.hueRange;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * config.speed,
      speedY: (Math.random() - 0.5) * config.speed,
      opacity: Math.random() * 0.3 + 0.1,
      hue: minHue + Math.random() * (maxHue - minHue),
      life: 0,
      maxLife: 500 + Math.random() * 500,
    };
  }, []);

  useEffect(() => {
    // Defer initialization
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particles: Particle[] = [];
      const count = isMobile ? config.count.mobile : config.count.desktop;

      for (let i = 0; i < count; i++) {
        particles.push(createParticle(canvas, config));
      }
      particlesRef.current = particles;
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        // Cursor avoidance (sophisticated physics)
        if (interactive && mouseRef.current.x > 0) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const force = (150 - distance) / 150;
            const angle = Math.atan2(dy, dx);
            // Push away from cursor
            particle.speedX -= Math.cos(angle) * force * 0.08;
            particle.speedY -= Math.sin(angle) * force * 0.08;
          }
        }

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Damping
        particle.speedX *= 0.99;
        particle.speedY *= 0.99;

        // Add slight random movement
        particle.speedX += (Math.random() - 0.5) * 0.02;
        particle.speedY += (Math.random() - 0.5) * 0.02;

        // Update life
        particle.life++;
        if (particle.life > particle.maxLife) {
          // Respawn
          Object.assign(particle, createParticle(canvas, config));
        }

        // Wrap around edges with smooth transition
        const buffer = 50;
        if (particle.x < -buffer) particle.x = canvas.width + buffer;
        if (particle.x > canvas.width + buffer) particle.x = -buffer;
        if (particle.y < -buffer) particle.y = canvas.height + buffer;
        if (particle.y > canvas.height + buffer) particle.y = -buffer;

        // Calculate fade based on life
        const lifeFade = particle.life < 50 
          ? particle.life / 50 
          : particle.life > particle.maxLife - 50 
            ? (particle.maxLife - particle.life) / 50 
            : 1;

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 4
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, ${config.saturation}%, ${config.lightness}%, ${particle.opacity * lifeFade})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, ${config.saturation}%, ${config.lightness}%, 0)`);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw connections (skip for celebration mode)
        if (config.connectionDistance > 0) {
          particlesRef.current.slice(i + 1).forEach((other) => {
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < config.connectionDistance) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `${config.connectionColor}${0.1 * (1 - dist / config.connectionDistance) * lifeFade})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    resize();
    createParticles();
    animate();

    window.addEventListener("resize", resize);
    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isReady, mode, interactive, config, createParticle]);

  if (!isReady) return null;

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 0.5 }}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  );
};

export default AmbientParticles;
