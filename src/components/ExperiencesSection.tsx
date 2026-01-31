import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import OptimizedImage from "./OptimizedImage";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ui/scroll-reveal";

const images = [
  { src: "https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=600", alt: "Luxury superyacht cruising on crystal blue Mediterranean waters" },
  { src: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600", alt: "Rare Patek Philippe luxury watch with intricate gold details" },
  { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600", alt: "Elegant luxury penthouse interior with panoramic city views" },
  { src: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600", alt: "Private jet interior with premium leather seating" },
];

const ExperiencesSection = () => {
  const { t } = useTranslation();

  const benefits = [
    t("experiences.benefit1"),
    t("experiences.benefit2"),
    t("experiences.benefit3")
  ];

  return (
    <section id="experiences" className="py-24 md:py-32 bg-card/20 relative overflow-hidden" aria-labelledby="experiences-heading">
      {/* Subtle background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <ScrollReveal direction="left" className="order-2 lg:order-1">
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary/80 block mb-4">
              {t("experiences.label")}
            </span>
            <h2 
              id="experiences-heading"
              className="text-4xl md:text-5xl lg:text-6xl text-foreground tracking-[-0.02em] mb-6 text-gradient-gold"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {t("experiences.title")}
            </h2>
            <p className="text-muted-foreground font-light mb-8 leading-relaxed text-lg">
              {t("experiences.subtitle")}
            </p>

            <StaggerContainer className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <StaggerItem key={index}>
                  <div className="flex items-start gap-4 p-4 glass-card rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                    <span className="text-foreground/90">{benefit}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                to="/services" 
                className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 group shadow-lg shadow-primary/20 hover:shadow-primary/40"
                aria-label="View all luxury acquisitions and experiences"
              >
                {t("experiences.viewAcquisitions")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </motion.div>
          </ScrollReveal>

          {/* Images Grid - Bento Style */}
          <ScrollReveal direction="right" className="order-1 lg:order-2">
            <div className="bento-grid" role="list" aria-label="Luxury experience gallery">
              {images.map((image, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.03, zIndex: 10 }}
                  className={`overflow-hidden group glass-card rounded-xl ${
                    index === 0 ? 'bento-item-large' : ''
                  }`}
                  role="listitem"
                >
                  <OptimizedImage 
                    src={image.src} 
                    alt={image.alt}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="w-full h-full min-h-[200px] object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ExperiencesSection;
