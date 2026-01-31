import { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Glasses, Brain, Sparkles, ChevronRight, Orbit, Zap } from "lucide-react";
import VRExperienceHub from "./vr/VRExperienceHub";
import EQProfileModule from "./eq/EQProfileModule";

// Animated floating orb component - visible gold glows
const FloatingOrb = memo(({ 
  className, 
  delay = 0,
  size = 80,
  color = "rgba(212, 175, 55, 0.7)"
}: { 
  className?: string; 
  delay?: number;
  size?: number;
  color?: string;
}) => (
  <motion.div
    initial={{ opacity: 0.8 }}
    animate={{ 
      opacity: [0.6, 1, 0.6],
      y: [0, -20, 0],
      scale: [1, 1.15, 1],
    }}
    transition={{
      opacity: { duration: 3, delay, repeat: Infinity, ease: "easeInOut" },
      y: { duration: 4, delay, repeat: Infinity, ease: "easeInOut" },
      scale: { duration: 3, delay: delay + 0.5, repeat: Infinity, ease: "easeInOut" },
    }}
    className={`absolute rounded-full pointer-events-none ${className}`}
    style={{ 
      width: size,
      height: size,
      background: `radial-gradient(circle, ${color} 0%, ${color.replace('0.7', '0.3')} 40%, transparent 70%)`,
      boxShadow: `0 0 ${size}px ${color}, 0 0 ${size * 1.5}px ${color.replace('0.7', '0.4')}`,
      zIndex: 1 
    }}
  >
    {/* Solid center dot for guaranteed visibility */}
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: size * 0.2,
        height: size * 0.2,
        background: color.replace('0.7', '1'),
        boxShadow: `0 0 ${size * 0.3}px ${color}`,
      }}
    />
  </motion.div>
));

FloatingOrb.displayName = "FloatingOrb";

// Animated icon with rotation
const AnimatedIcon = memo(({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, rotate: 0 }}
    animate={{ 
      opacity: [0.2, 0.5, 0.2],
      rotate: 360,
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
    className="absolute"
  >
    <Orbit className="w-6 h-6 text-primary/30" />
  </motion.div>
));

AnimatedIcon.displayName = "AnimatedIcon";

// Memoized feature card to prevent unnecessary re-renders
const FeatureCard = memo(({ 
  onClick, 
  title, 
  description, 
  icon: Icon, 
  items, 
  ctaText,
  colorClass,
  glowPosition,
  iconBgClass
}: {
  onClick: () => void;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  ctaText: string;
  colorClass: string;
  glowPosition: string;
  iconBgClass: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 flex flex-col"
  >
    {/* Animated background - reduced size */}
    <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div 
      className={`absolute ${glowPosition} w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity`}
      style={{ background: colorClass.includes("purple") ? "rgba(147, 51, 234, 0.15)" : "rgba(212, 175, 55, 0.15)" }}
    />
    
    <div className="relative z-10 flex flex-col h-full">
      <div className={`w-12 h-12 rounded-xl ${iconBgClass} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      
      <h3 className={`text-xl font-serif text-foreground mb-2 group-hover:${colorClass.includes("purple") ? "text-purple-400" : "text-primary"} transition-colors`}>
        {title}
      </h3>
      
      <p className="text-muted-foreground font-light text-sm mb-4">
        {description}
      </p>

      <ul className="space-y-1.5 mb-4 flex-1">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`w-1 h-1 rounded-full ${colorClass.includes("purple") ? "bg-purple-500" : "bg-primary"}`} />
            {item}
          </li>
        ))}
      </ul>

      <div className={`flex items-center gap-2 ${colorClass.includes("purple") ? "text-purple-400" : "text-primary"} text-sm font-medium group-hover:gap-3 transition-all mt-auto`}>
        <span>{ctaText}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  </motion.div>
));

FeatureCard.displayName = "FeatureCard";

const MetaverseEntryPoint = () => {
  const [showVR, setShowVR] = useState(false);
  const [showEQ, setShowEQ] = useState(false);

  const handleOpenVR = useCallback(() => setShowVR(true), []);
  const handleCloseVR = useCallback(() => setShowVR(false), []);
  const handleOpenEQ = useCallback(() => setShowEQ(true), []);
  const handleCloseEQ = useCallback(() => setShowEQ(false), []);
  const handleEQComplete = useCallback((profile: unknown) => {
    console.log("EQ Profile:", profile);
    setShowEQ(false);
  }, []);

  return (
    <>
      <section className="py-16 px-6 relative min-h-[500px]" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--secondary) / 0.15) 50%, hsl(var(--background)) 100%)' }}>
        {/* Background effects - contained within section */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        {/* Animated floating orbs - bright gold glows visible on dark background */}
        <FloatingOrb color="rgba(212, 175, 55, 0.8)" className="top-10 left-[10%]" delay={0} size={100} />
        <FloatingOrb color="rgba(212, 175, 55, 0.7)" className="top-16 right-[12%]" delay={1.2} size={80} />
        <FloatingOrb color="rgba(167, 139, 250, 0.7)" className="bottom-24 left-[18%]" delay={2} size={120} />
        <FloatingOrb color="rgba(212, 175, 55, 0.75)" className="bottom-16 right-[8%]" delay={0.8} size={70} />
        
        {/* Animated rotating icons */}
        <div className="absolute top-[15%] left-[5%]">
          <AnimatedIcon delay={0} />
        </div>
        <div className="absolute top-[25%] right-[8%]">
          <AnimatedIcon delay={2} />
        </div>
        <div className="absolute bottom-[20%] left-[12%]">
          <AnimatedIcon delay={4} />
        </div>
        
        {/* Central glow */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          animate={{
            background: [
              "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 border border-primary/30 bg-primary/5 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
                Next-Generation Experience
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-serif text-foreground mb-3">
              Intelligence Meets <span className="text-primary italic">Immersion</span>
            </h2>
            <p className="text-muted-foreground font-light text-sm max-w-xl mx-auto">
              Cutting-edge technology that understands you and transports you to extraordinary realms
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              onClick={handleOpenVR}
              title="Metaverse Experience Hub"
              description="Step into immersive 3D environments. Preview private jets, tour superyachts, walk through luxury properties—all from anywhere in the world."
              icon={Glasses}
              items={["Virtual property tours", "Interactive yacht previews", "3D collectible examination", "Immersive destination planning"]}
              ctaText="Enter the Metaverse"
              colorClass="from-primary/10 via-transparent to-blue-500/10"
              glowPosition="-top-20 -right-20"
              iconBgClass="bg-gradient-to-br from-primary/30 to-primary"
            />

            <FeatureCard
              onClick={handleOpenEQ}
              title="EQ Intelligence Profile"
              description="Our AI learns your emotional landscape, preferences, and decision-making style to anticipate your desires before you express them."
              icon={Brain}
              items={["Emotional preference mapping", "Personalized service calibration", "Anticipatory recommendations", "Mood-aware experiences"]}
              ctaText="Discover Your Profile"
              colorClass="from-purple-500/10 via-transparent to-primary/10"
              glowPosition="-bottom-20 -left-20"
              iconBgClass="bg-gradient-to-br from-purple-500/30 to-purple-500"
            />
          </div>

          {/* Stats - compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { value: "10K+", label: "VR Tours Completed" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "50ms", label: "Response Time" },
              { value: "AI-Powered", label: "Personalization" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-secondary/30 border border-border/20">
                <p className="text-xl md:text-2xl font-serif text-primary mb-0.5">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modals - only render when needed */}
      {showVR && <VRExperienceHub isOpen={showVR} onClose={handleCloseVR} />}
      {showEQ && (
        <EQProfileModule 
          isOpen={showEQ} 
          onClose={handleCloseEQ} 
          onComplete={handleEQComplete}
        />
      )}
    </>
  );
};

export default MetaverseEntryPoint;
