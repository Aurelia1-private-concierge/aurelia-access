import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import triptychLandscape from "@/assets/triptych-landscape.jpg";
import triptychSound from "@/assets/triptych-sound.jpg";
import triptychTaste from "@/assets/triptych-taste.jpg";
import triptychRest from "@/assets/triptych-rest.jpg";

const galleryImages = [
  {
    src: triptychLandscape,
    alt: "Golden hour vista over Guanabara Bay from a private terrace",
    caption: "The Landscape",
    description: "Where ocean meets mountain in eternal dialogue",
  },
  {
    src: triptychSound,
    alt: "Intimate orchestral performance in an opulent Brazilian theater",
    caption: "The Sound",
    description: "A symphony composed for this moment alone",
  },
  {
    src: triptychTaste,
    alt: "Exquisite Brazilian-fusion cuisine in candlelit ambiance",
    caption: "The Taste",
    description: "Gastronomy as cultural revelation",
  },
  {
    src: triptychRest,
    alt: "Ultra-luxury suite overlooking Rio de Janeiro at twilight",
    caption: "The Rest",
    description: "Sanctuary between encounters",
  },
];

const TriptychGallery = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/10 to-background" />
      
      {/* Floating orbs */}
      <motion.div 
        style={{ y: y1, opacity }}
        className="absolute top-1/4 left-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px]"
      />
      <motion.div 
        style={{ y: y2, opacity }}
        className="absolute bottom-1/4 right-10 w-80 h-80 bg-primary/3 rounded-full blur-[80px]"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-primary block mb-4">
            Visual Prelude
          </span>
          <h2 
            className="text-3xl md:text-4xl text-foreground"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Glimpses of What Awaits
          </h2>
        </motion.div>

        {/* Gallery grid with staggered animation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.alt}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                delay: index * 0.15, 
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="group relative aspect-[3/4] overflow-hidden"
            >
              {/* Image */}
              <div className="absolute inset-0">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
              
              {/* Border frame */}
              <div className="absolute inset-2 border border-primary/0 group-hover:border-primary/30 transition-all duration-500" />
              
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <motion.p 
                  className="text-sm md:text-base text-foreground font-light tracking-wide"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {image.caption}
                </motion.p>
                <p className="text-[10px] text-muted-foreground/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {image.description}
                </p>
                <div className="w-8 h-px bg-primary/50 mt-2 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground/60 mt-12 italic"
        >
          Actual locations and experiences may vary. Photography for atmosphere only.
        </motion.p>
      </div>
    </section>
  );
};

export default TriptychGallery;
