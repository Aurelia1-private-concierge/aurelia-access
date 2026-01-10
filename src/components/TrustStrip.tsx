import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const partners = [
  { name: "Forbes", subtitle: "Wealth" },
  { name: "Bloomberg", subtitle: "Markets" },
  { name: "Robb Report", subtitle: "Luxury" },
  { name: "Tatler", subtitle: "Society" },
  { name: "Financial Times", subtitle: "Global" },
  { name: "Monocle", subtitle: "Culture" },
  { name: "Departures", subtitle: "Travel" },
  { name: "Town & Country", subtitle: "Elite" },
];

const TrustStrip = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Double the partners array for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-16 md:py-20 bg-background relative overflow-hidden">
      {/* Subtle top/bottom border lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-24 bg-primary/[0.02] blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-4 mb-3">
            <span className="w-8 h-px bg-primary/30" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary/60 font-medium">
              Trusted By The Elite
            </p>
            <span className="w-8 h-px bg-primary/30" />
          </div>
          <p className="text-xs text-muted-foreground/50 tracking-wide">
            As featured in the world's most prestigious publications
          </p>
        </motion.div>

        {/* Infinite Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          
          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Carousel Track */}
          <div className="overflow-hidden">
            <motion.div
              className="flex items-center gap-16 md:gap-24"
              animate={{
                x: isHovered ? 0 : [0, -50 * partners.length * 4],
              }}
              transition={{
                x: {
                  duration: isHovered ? 0 : 40,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              style={{ width: "fit-content" }}
            >
              {duplicatedPartners.map((partner, index) => (
                <motion.div
                  key={`${partner.name}-${index}`}
                  className="flex-shrink-0 group cursor-default"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Partner name */}
                    <span 
                      className="font-serif text-xl md:text-2xl tracking-[0.15em] text-foreground/30 group-hover:text-primary/80 transition-all duration-500"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {partner.name}
                    </span>
                    
                    {/* Subtitle on hover */}
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-5 text-[9px] uppercase tracking-[0.3em] text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      {partner.subtitle}
                    </motion.span>

                    {/* Hover underline effect */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-px bg-primary/40 group-hover:w-full transition-all duration-500" />
                    
                    {/* Subtle glow on hover */}
                    <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-8 bg-primary/10 blur-xl rounded-full" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-12"
        >
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            <div className="w-1 h-1 rounded-full bg-primary/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustStrip;
