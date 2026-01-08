import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <header className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Background Image with subtle animation */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=3270&auto=format&fit=crop"
          alt="Luxury Resort Evening"
          className="w-full h-full object-cover opacity-60 scale-105 animate-subtle-pulse"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay z-10" />

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center space-x-2 border border-border/30 bg-secondary/50 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
            By Invitation Only
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl text-foreground font-medium font-serif tracking-tight leading-tight"
        >
          Beyond <span className="text-primary italic pr-2">Concierge.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base md:text-lg text-muted-foreground font-light tracking-wide max-w-2xl mx-auto leading-relaxed"
        >
          Experience the world's most exclusive service. Engineered for sovereignty, curated for legacy, and powered by intelligent discretion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 pt-8"
        >
          <button className="group relative px-8 py-3 bg-primary text-primary-foreground text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-primary/90 gold-glow-hover">
            <span className="relative z-10">Join Aurelia</span>
          </button>

          <button className="group px-8 py-3 border border-border/40 text-foreground text-sm font-medium tracking-widest uppercase hover:bg-secondary/50 transition-all duration-300 flex items-center space-x-3">
            <span>Discover Experiences</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-foreground/30"
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </header>
  );
};

export default HeroSection;
