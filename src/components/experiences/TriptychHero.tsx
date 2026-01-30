import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import triptychHeroImage from "@/assets/triptych-hero.jpg";
import TriptychCountdown from "./TriptychCountdown";

const TriptychHero = () => {
  const scrollToInquiry = () => {
    document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${triptychHeroImage})` }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-[80px]" />

      <div className="relative z-10 text-center px-6 py-32">
        {/* Pre-title */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-8"
        >
          Journeys Beyond Limits presents
        </motion.p>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-6xl md:text-8xl lg:text-9xl text-foreground tracking-[0.2em] mb-6"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
        >
          TRIPTYCH
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground font-light tracking-wide mb-4"
        >
          A Restricted Cultural Immersion
        </motion.p>

        {/* Location & Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12"
        >
          <span className="text-primary text-sm uppercase tracking-[0.3em]">
            Rio de Janeiro
          </span>
          <span className="hidden sm:block w-8 h-px bg-border" />
          <span className="text-primary text-sm uppercase tracking-[0.3em]">
            June 19–24, 2026
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-muted-foreground/80 font-light max-w-2xl mx-auto leading-relaxed mb-12"
        >
          An unprecedented symphonic encounter, high-level Brazilian gastronomy, 
          and forms of access that are never publicly announced. Not a public release — 
          shared selectively with those who seek interpretation, not observation.
        </motion.p>

        {/* Countdown Timer */}
        <TriptychCountdown />

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <button
            onClick={scrollToInquiry}
            className="group px-8 py-4 border border-primary/30 text-primary text-xs uppercase tracking-[0.3em] hover:bg-primary hover:text-primary-foreground transition-all duration-500"
          >
            Express Interest
          </button>
          <a
            href="mailto:partners@aurelia-privateconcierge.com?subject=Partnership%20Inquiry%20-%20TRIPTYCH"
            className="group px-8 py-4 bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-[0.3em] hover:bg-primary/20 transition-all duration-500"
          >
            Partner With Us
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground/40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TriptychHero;
