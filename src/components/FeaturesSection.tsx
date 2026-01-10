import { Shield, Sparkles, Globe, Fingerprint, ArrowUpRight, Clock, Users, Gem, Plane } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const FeaturesSection = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const features = [
    {
      icon: Shield,
      titleKey: "features.encryption.title",
      descriptionKey: "features.encryption.description",
      stat: "256-bit",
      statLabel: "Encryption",
      accent: true,
    },
    {
      icon: Clock,
      titleKey: "features.curation.title",
      descriptionKey: "features.curation.description",
      stat: "24/7",
      statLabel: "Availability",
    },
    {
      icon: Globe,
      titleKey: "features.liquidity.title",
      descriptionKey: "features.liquidity.description",
      stat: "180+",
      statLabel: "Countries",
    },
    {
      icon: Fingerprint,
      titleKey: "features.biometric.title",
      descriptionKey: "features.biometric.description",
      stat: "100%",
      statLabel: "Secure",
      accent: true,
    },
    {
      icon: Users,
      title: "Dedicated Team",
      description: "Your personal concierge team available around the clock for any request.",
      stat: "1:10",
      statLabel: "Staff Ratio",
    },
    {
      icon: Plane,
      title: "Global Access",
      description: "Seamless arrangements across every continent with trusted partners worldwide.",
      stat: "500+",
      statLabel: "Partners",
    },
  ];

  return (
    <section ref={ref} id="services" className="py-32 md:py-40 marble-bg relative overflow-hidden">
      <motion.div
        style={{ y: backgroundY }}
        className="absolute top-20 right-10 w-[500px] h-[500px] bg-primary/[0.03] blur-[180px] rounded-full pointer-events-none"
      />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-20 md:flex md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-primary/40" />
              <p className="text-[11px] uppercase tracking-[0.4em] text-primary/70 font-medium">
                {t("features.label")}
              </p>
            </div>
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl text-foreground tracking-[-0.02em] mb-5"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {t("features.title")}{" "}
              <span className="italic text-muted-foreground/70">{t("features.titleHighlight")}</span>
            </h2>
            <p className="font-light text-muted-foreground leading-relaxed text-lg">
              {t("features.subtitle")}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 md:mt-0"
          >
            <Link 
              to="/services" 
              className="group inline-flex items-center text-primary text-sm tracking-[0.15em] uppercase hover:opacity-80 transition-opacity"
            >
              {t("features.viewAll")}
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

        {/* Features Grid - Editorial Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey || feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative p-8 lg:p-10 bg-card/30 border border-border/20 backdrop-blur-sm transition-all duration-700 overflow-hidden ${
                feature.accent ? 'lg:col-span-1' : ''
              } ${
                hoveredIndex === index ? 'border-primary/40 bg-card/50' : 'hover:border-primary/20'
              }`}
            >
              {/* Background glow on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none"
              />

              {/* Large decorative icon */}
              <motion.div 
                initial={{ rotate: 0, scale: 1 }}
                animate={{ 
                  rotate: hoveredIndex === index ? 5 : 0,
                  scale: hoveredIndex === index ? 1.1 : 1,
                  opacity: hoveredIndex === index ? 0.15 : 0.05
                }}
                transition={{ duration: 0.5 }}
                className="absolute -top-4 -right-4 pointer-events-none"
              >
                <feature.icon className="w-32 h-32 text-primary" strokeWidth={0.5} />
              </motion.div>

              <div className="relative z-10 h-full flex flex-col min-h-[280px]">
                {/* Icon */}
                <motion.div 
                  animate={{ 
                    scale: hoveredIndex === index ? 1.1 : 1,
                    borderColor: hoveredIndex === index ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--border) / 0.3)'
                  }}
                  className="w-14 h-14 rounded-full bg-background border border-border/30 flex items-center justify-center mb-8 transition-all duration-500"
                >
                  <feature.icon 
                    className={`w-6 h-6 transition-colors duration-500 ${
                      hoveredIndex === index ? 'text-primary' : 'text-foreground/60'
                    }`} 
                    strokeWidth={1.5} 
                  />
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                  <h3 
                    className={`text-xl lg:text-2xl text-foreground mb-4 tracking-tight transition-colors duration-500 ${
                      hoveredIndex === index ? 'text-primary' : ''
                    }`}
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {feature.titleKey ? t(feature.titleKey) : feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">
                    {feature.descriptionKey ? t(feature.descriptionKey) : feature.description}
                  </p>
                </div>

                {/* Stat */}
                <div className="mt-8 pt-6 border-t border-border/20">
                  <div className="flex items-baseline gap-2">
                    <span 
                      className="text-2xl text-primary"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {feature.stat}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {feature.statLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gradient border on hover */}
              <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 gradient-border ${
                hoveredIndex === index ? 'opacity-100' : 'opacity-0'
              }`} />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <p className="text-muted-foreground/60 text-sm mb-6">
            Discover how we can serve you
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary/10 border border-primary/30 text-primary text-xs tracking-[0.2em] uppercase hover:bg-primary/20 transition-all duration-300"
          >
            <Gem className="w-4 h-4" />
            Explore All Services
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
