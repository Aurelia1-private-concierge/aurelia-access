import { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Glasses, Brain, Sparkles, ChevronRight } from "lucide-react";
import VRExperienceHub from "./vr/VRExperienceHub";
import EQProfileModule from "./eq/EQProfileModule";

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
    className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-8 flex flex-col h-full min-h-[400px] will-change-transform"
  >
    {/* Animated background - reduced animation complexity */}
    <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div 
      className={`absolute ${glowPosition} w-40 h-40 rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity`}
      style={{ background: colorClass.includes("purple") ? "rgba(147, 51, 234, 0.2)" : "rgba(212, 175, 55, 0.2)" }}
    />
    
    <div className="relative z-10 flex flex-col h-full">
      <div className={`w-16 h-16 rounded-2xl ${iconBgClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8 text-primary-foreground" />
      </div>
      
      <h3 className={`text-2xl font-serif text-foreground mb-3 group-hover:${colorClass.includes("purple") ? "text-purple-400" : "text-primary"} transition-colors`}>
        {title}
      </h3>
      
      <p className="text-muted-foreground font-light mb-6">
        {description}
      </p>

      <ul className="space-y-2 mb-6 flex-1">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={`w-1.5 h-1.5 rounded-full ${colorClass.includes("purple") ? "bg-purple-500" : "bg-primary"}`} />
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
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Background effects - simplified for better performance */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" 
          style={{ willChange: "transform" }}
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
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">
              Intelligence Meets <span className="text-primary italic">Immersion</span>
            </h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto">
              Cutting-edge technology that understands you and transports you to extraordinary realms
            </p>
          </motion.div>

          {/* Feature Cards - Using optimized memoized components */}
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
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

          {/* Stats - simplified animations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: "10K+", label: "VR Tours Completed" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "50ms", label: "Response Time" },
              { value: "AI-Powered", label: "Personalization" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-secondary/30 border border-border/20">
                <p className="text-2xl md:text-3xl font-serif text-primary mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
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
