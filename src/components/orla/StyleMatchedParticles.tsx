import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useAvatarStyle, AvatarStyle } from "@/hooks/useAvatarStyle";

interface StyleMatchedParticlesProps {
  isActive?: boolean;
  audioLevel?: number;
  particleCount?: number;
  size?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: "circle" | "diamond" | "star" | "glow";
}

// Generate particles based on style
const generateParticles = (count: number, style: AvatarStyle): Particle[] => {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 100 + Math.random() * 60;
    
    particles.push({
      id: i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      type: style.effects.sparkles 
        ? (Math.random() > 0.7 ? "star" : Math.random() > 0.5 ? "diamond" : "circle")
        : "glow",
    });
  }
  
  return particles;
};

const ParticleShape = memo(({ 
  type, 
  color, 
  size 
}: { 
  type: Particle["type"]; 
  color: string; 
  size: number;
}) => {
  switch (type) {
    case "star":
      return (
        <svg width={size * 2} height={size * 2} viewBox="0 0 24 24" fill={color}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      );
    case "diamond":
      return (
        <svg width={size * 2} height={size * 2} viewBox="0 0 24 24" fill={color}>
          <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
      );
    case "glow":
      return (
        <div 
          className="rounded-full" 
          style={{ 
            width: size * 2, 
            height: size * 2, 
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          }} 
        />
      );
    default:
      return (
        <div 
          className="rounded-full" 
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: color,
          }} 
        />
      );
  }
});

ParticleShape.displayName = "ParticleShape";

const StyleMatchedParticles = memo(({ 
  isActive = false,
  audioLevel = 0,
  particleCount = 20,
  size = 320,
}: StyleMatchedParticlesProps) => {
  const { currentStyle } = useAvatarStyle();
  
  const particles = useMemo(
    () => generateParticles(particleCount, currentStyle),
    [particleCount, currentStyle]
  );
  
  // Don't render if particles are disabled
  if (!currentStyle.effects.particles && !currentStyle.effects.sparkles) {
    return null;
  }
  
  const baseOpacity = isActive ? 0.7 : 0.3;
  const audioBoost = audioLevel * 0.5;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ width: size, height: size }}
    >
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size, height: size }}
      >
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
            }}
            initial={{
              x: particle.x * 0.5,
              y: particle.y * 0.5,
              opacity: 0,
              scale: 0,
            }}
            animate={isActive ? {
              x: [
                particle.x * (0.8 + audioBoost),
                particle.x * (1.1 + audioBoost),
                particle.x * (0.8 + audioBoost),
              ],
              y: [
                particle.y * (0.8 + audioBoost),
                particle.y * (1.1 + audioBoost),
                particle.y * (0.8 + audioBoost),
              ],
              opacity: [
                baseOpacity * 0.5,
                baseOpacity,
                baseOpacity * 0.5,
              ],
              scale: [
                0.8 + audioBoost * 0.3,
                1.2 + audioBoost * 0.5,
                0.8 + audioBoost * 0.3,
              ],
              rotate: particle.type === "star" ? [0, 180, 360] : 0,
            } : {
              x: particle.x * 0.6,
              y: particle.y * 0.6,
              opacity: 0.2,
              scale: 0.5,
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ParticleShape 
              type={particle.type} 
              color={currentStyle.colors.primary} 
              size={particle.size * (1 + audioBoost)} 
            />
          </motion.div>
        ))}
        
        {/* Orbiting particles */}
        {isActive && currentStyle.effects.particles && (
          <>
            {[0, 1, 2].map((index) => (
              <motion.div
                key={`orbit-${index}`}
                className="absolute left-1/2 top-1/2"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8 + index * 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  width: 100 + index * 30,
                  height: 100 + index * 30,
                  marginLeft: -(50 + index * 15),
                  marginTop: -(50 + index * 15),
                }}
              >
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 4 + index * 2,
                    height: 4 + index * 2,
                    backgroundColor: currentStyle.colors.primary,
                    boxShadow: `0 0 ${10 + audioLevel * 10}px ${currentStyle.colors.glow}`,
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                  animate={{
                    scale: [1, 1.5 + audioLevel, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ))}
          </>
        )}
        
        {/* Pulsing glow rings */}
        {isActive && currentStyle.effects.pulse && (
          <>
            {[0, 1, 2].map((index) => (
              <motion.div
                key={`pulse-${index}`}
                className="absolute left-1/2 top-1/2 rounded-full border"
                style={{
                  borderColor: currentStyle.colors.primary,
                }}
                initial={{
                  width: 80,
                  height: 80,
                  marginLeft: -40,
                  marginTop: -40,
                  opacity: 0.8,
                }}
                animate={{
                  width: [80, 200 + audioLevel * 50],
                  height: [80, 200 + audioLevel * 50],
                  marginLeft: [-40, -100 - audioLevel * 25],
                  marginTop: [-40, -100 - audioLevel * 25],
                  opacity: [0.8, 0],
                  borderWidth: [2, 0],
                }}
                transition={{
                  duration: 2,
                  delay: index * 0.6,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
        
        {/* Audio reactive burst */}
        {audioLevel > 0.3 && (
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 60 + audioLevel * 80,
              height: 60 + audioLevel * 80,
              background: `radial-gradient(circle, ${currentStyle.colors.glow} 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
            }}
          />
        )}
      </div>
    </div>
  );
});

StyleMatchedParticles.displayName = "StyleMatchedParticles";

export default StyleMatchedParticles;
