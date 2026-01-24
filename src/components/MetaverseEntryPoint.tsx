import { useState } from "react";
import { motion } from "framer-motion";
import { Glasses, Brain, Sparkles, ChevronRight } from "lucide-react";
import VRExperienceHub from "./vr/VRExperienceHub";
import EQProfileModule from "./eq/EQProfileModule";

const MetaverseEntryPoint = () => {
  const [showVR, setShowVR] = useState(false);
  const [showEQ, setShowEQ] = useState(false);

  return (
    <>
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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

          {/* Feature Cards - Aligned heights */}
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* VR/Metaverse Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowVR(true)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-8 flex flex-col h-full min-h-[400px]"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div 
                className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[60px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Glasses className="w-8 h-8 text-primary-foreground" />
                </div>
                
                <h3 className="text-2xl font-serif text-foreground mb-3 group-hover:text-primary transition-colors">
                  Metaverse Experience Hub
                </h3>
                
                <p className="text-muted-foreground font-light mb-6">
                  Step into immersive 3D environments. Preview private jets, tour superyachts, 
                  walk through luxury properties—all from anywhere in the world.
                </p>

                <ul className="space-y-2 mb-6 flex-1">
                  {["Virtual property tours", "Interactive yacht previews", "3D collectible examination", "Immersive destination planning"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all mt-auto">
                  <span>Enter the Metaverse</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* EQ Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowEQ(true)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-8 flex flex-col h-full min-h-[400px]"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div 
                className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[60px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-serif text-foreground mb-3 group-hover:text-purple-400 transition-colors">
                  EQ Intelligence Profile
                </h3>
                
                <p className="text-muted-foreground font-light mb-6">
                  Our AI learns your emotional landscape, preferences, and decision-making style 
                  to anticipate your desires before you express them.
                </p>

                <ul className="space-y-2 mb-6 flex-1">
                  {["Emotional preference mapping", "Personalized service calibration", "Anticipatory recommendations", "Mood-aware experiences"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:gap-3 transition-all mt-auto">
                  <span>Discover Your Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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

      {/* Modals */}
      <VRExperienceHub isOpen={showVR} onClose={() => setShowVR(false)} />
      <EQProfileModule 
        isOpen={showEQ} 
        onClose={() => setShowEQ(false)} 
        onComplete={(profile) => {
          console.log("EQ Profile:", profile);
          setShowEQ(false);
        }}
      />
    </>
  );
};

export default MetaverseEntryPoint;
