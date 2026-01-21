import { Shield, Clock, Globe, Fingerprint, Users, Plane, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Shield,
      titleKey: "features.encryption.title",
      descriptionKey: "features.encryption.description",
      stat: "256-bit",
      statLabel: "Encryption",
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
    <section id="services" className="py-24 md:py-32 bg-background relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
            {t("features.label")}
          </span>
          <h2 
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("features.title")}
          </h2>
          <p className="text-muted-foreground font-light leading-relaxed">
            {t("features.subtitle")}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey || feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group p-8 bg-card/30 border border-border/10 hover:border-primary/20 transition-all duration-500"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-full border border-border/20 flex items-center justify-center group-hover:border-primary/30 transition-colors duration-500">
                  <feature.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-500" strokeWidth={1.5} />
                </div>
                <div className="text-right">
                  <span 
                    className="text-xl text-primary/60"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {feature.stat}
                  </span>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50">
                    {feature.statLabel}
                  </p>
                </div>
              </div>
              
              <h3 
                className="text-lg text-foreground mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {feature.titleKey ? t(feature.titleKey) : feature.title}
              </h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {feature.descriptionKey ? t(feature.descriptionKey) : feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 group"
          >
            Explore All Services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
