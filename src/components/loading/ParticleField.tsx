import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'dot' | 'line' | 'ring';
}

const ParticleField = () => {
  const particles = useMemo(() => {
    const items: Particle[] = [];
    
    // Golden dust particles
    for (let i = 0; i < 40; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 4 + 4,
        delay: Math.random() * 3,
        type: 'dot'
      });
    }
    
    // Floating lines
    for (let i = 40; i < 50; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 40 + 20,
        duration: Math.random() * 6 + 6,
        delay: Math.random() * 2,
        type: 'line'
      });
    }
    
    // Subtle rings
    for (let i = 50; i < 55; i++) {
      items.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: Math.random() * 100 + 50,
        duration: Math.random() * 8 + 8,
        delay: Math.random() * 4,
        type: 'ring'
      });
    }
    
    return items;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Ambient gradient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--gold) / 0.08) 0%, transparent 70%)',
          left: '-10%',
          top: '-20%',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--gold) / 0.06) 0%, transparent 70%)',
          right: '-15%',
          bottom: '-10%',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Particle field */}
      {particles.map((particle) => {
        if (particle.type === 'dot') {
          return (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-primary"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0.5],
                y: [-20, -80],
                x: [0, (Math.random() - 0.5) * 30],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          );
        }
        
        if (particle.type === 'line') {
          return (
            <motion.div
              key={particle.id}
              className="absolute bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              style={{
                width: particle.size,
                height: 1,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                transformOrigin: 'center',
              }}
              initial={{ opacity: 0, rotate: Math.random() * 180 }}
              animate={{
                opacity: [0, 0.4, 0],
                x: [0, 50],
                rotate: [0, 10],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          );
        }
        
        if (particle.type === 'ring') {
          return (
            <motion.div
              key={particle.id}
              className="absolute rounded-full border border-primary/10"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0.3, 0],
                scale: [0.5, 1.5],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          );
        }
        
        return null;
      })}
    </div>
  );
};

export default ParticleField;
