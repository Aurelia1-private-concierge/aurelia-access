import { Check } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

const images = [
  { src: "https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?q=80&w=600&auto=format&fit=crop", alt: "Luxury Yacht", offset: false },
  { src: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=600&auto=format&fit=crop", alt: "Luxury Watch", offset: true },
  { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&auto=format&fit=crop", alt: "Luxury Interiors", offset: false },
  { src: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=600&auto=format&fit=crop", alt: "Private Jet", offset: true },
];

const ExperiencesSection = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);
  const imagesY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  const benefits = [t("experiences.benefit1"), t("experiences.benefit2"), t("experiences.benefit3")];

  return (
    <section ref={ref} id="experiences" className="py-24 bg-secondary/20 relative overflow-hidden">
      <motion.div style={{ y: glowY }} className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-8 order-2 lg:order-1">
          <div className="space-y-4">
            <p className="text-primary text-xs font-medium tracking-[0.2em] uppercase">{t("experiences.label")}</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
              {t("experiences.title")} <br /><span className="italic text-muted-foreground">{t("experiences.titleHighlight")}</span>
            </h2>
          </div>
          <p className="font-light text-muted-foreground leading-relaxed">{t("experiences.subtitle")}</p>
          <ul className="space-y-4 pt-4">
            {benefits.map((benefit, index) => (
              <motion.li key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.1 }} className="flex items-start space-x-3">
                <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm text-foreground/80 font-light">{benefit}</span>
              </motion.li>
            ))}
          </ul>
          <button className="text-foreground text-sm tracking-widest uppercase border-b border-primary pb-1 hover:text-primary transition-colors pt-6">{t("experiences.viewAcquisitions")}</button>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ y: imagesY }} className="relative order-1 lg:order-2">
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className={`relative overflow-hidden group ${image.offset ? "translate-y-8" : ""}`}>
                <img src={image.src} className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={image.alt} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExperiencesSection;
