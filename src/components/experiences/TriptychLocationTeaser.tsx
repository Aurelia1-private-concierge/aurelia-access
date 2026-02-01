import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MapPin, Thermometer, Plane } from "lucide-react";

const TriptychLocationTeaser = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <section ref={containerRef} className="relative h-[80vh] min-h-[600px] overflow-hidden">
      {/* Parallax background */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 -top-20"
      >
        <img
          src="https://images.unsplash.com/photo-1619546952812-520e98064a52?w=1920&q=80"
          alt="Rio de Janeiro at dusk"
          className="w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      </motion.div>

      {/* Content */}
      <motion.div 
        style={{ y: textY }}
        className="relative z-10 h-full flex items-center justify-center px-6"
      >
        <div className="text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] uppercase tracking-[0.5em] text-primary block mb-6">
              The Setting
            </span>
            <h2 
              className="text-4xl md:text-6xl lg:text-7xl text-foreground mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              Rio de Janeiro
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-12 leading-relaxed">
              A city of contrasts where mountains meet sea, where samba meets symphony, 
              where the extraordinary unfolds at every turn.
            </p>
          </motion.div>

          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6"
          >
            <div className="flex items-center gap-3 px-5 py-3 bg-background/60 backdrop-blur-sm border border-border/20">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Brazil</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-background/60 backdrop-blur-sm border border-border/20">
              <Thermometer className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">22-26°C in June</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-background/60 backdrop-blur-sm border border-border/20">
              <Plane className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">GIG International</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20" />
    </section>
  );
};

export default TriptychLocationTeaser;
