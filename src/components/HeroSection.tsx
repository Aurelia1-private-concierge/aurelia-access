import { ArrowRight, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";
import heroImage from "@/assets/hero-penthouse.jpg";

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <header ref={ref} className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Background Image with parallax */}
      <motion.div 
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-0 w-full h-[120%] z-0"
      >
        <img
          src={heroImage}
          alt="Luxury Art Gallery"
          className="w-full h-full object-cover opacity-70"
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay z-10" />

      {/* Content with parallax */}
      <motion.div 
        style={{ y: contentY, opacity }}
        className="relative z-20 text-center px-6 max-w-4xl mx-auto space-y-8"
      >
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
          <Link 
            to="/auth" 
            className="group relative px-8 py-3 bg-primary text-primary-foreground text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-primary/90 gold-glow-hover"
          >
            <span className="relative z-10">Join Aurelia</span>
          </Link>

          <a 
            href="#experiences" 
            className="group px-8 py-3 border border-border/40 text-foreground text-sm font-medium tracking-widest uppercase hover:bg-secondary/50 transition-all duration-300 flex items-center space-x-3"
          >
            <span>Discover Experiences</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </motion.div>
      </motion.div>

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
