import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import OptimizedImage from "./OptimizedImage";

const images = [
  { src: "https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=600", alt: "Luxury Yacht", offset: false },
  { src: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600", alt: "Luxury Watch", offset: true },
  { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600", alt: "Luxury Interiors", offset: false },
  { src: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600", alt: "Private Jet", offset: true },
];

const ExperiencesSection = () => {
  const { t } = useTranslation();

  const benefits = [
    t("experiences.benefit1"),
    t("experiences.benefit2"),
    t("experiences.benefit3")
  ];

  return (
    <section id="experiences" className="py-24 md:py-32 bg-card/20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
              {t("experiences.label")}
            </span>
            <h2 
              className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {t("experiences.title")}
            </h2>
            <p className="text-muted-foreground font-light mb-8 leading-relaxed">
              {t("experiences.subtitle")}
            </p>

            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            <Link 
              to="/services" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 group"
            >
              {t("experiences.viewAcquisitions")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Images Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="grid grid-cols-2 gap-3">
              {images.map((image, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`overflow-hidden group ${image.offset ? 'translate-y-6' : ''}`}
                >
                  <OptimizedImage 
                    src={image.src} 
                    alt={image.alt}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="w-full h-48 md:h-56 object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExperiencesSection;
