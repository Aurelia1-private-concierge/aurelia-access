import { Shield, Lock, Eye, Server, CheckCircle, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const SecuritySection = () => {
  const { t } = useTranslation();

  const securityFeatures = [
    { icon: Lock, titleKey: "security.aes.title", descKey: "security.aes.description" },
    { icon: Eye, titleKey: "security.zeroKnowledge.title", descKey: "security.zeroKnowledge.description" },
    { icon: Server, titleKey: "security.swiss.title", descKey: "security.swiss.description" },
    { icon: Fingerprint, titleKey: "security.privacy.title", descKey: "security.privacy.description" },
  ];

  const certifications = [
    "ISO 27001",
    "SOC 2 Type II",
    "GDPR",
    "Swiss DPA",
  ];

  return (
    <section id="security" className="py-24 md:py-32 bg-card/20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
              {t("security.label")}
            </span>
            <h2 
              className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {t("security.title")}
            </h2>
            <p className="text-muted-foreground font-light mb-8 leading-relaxed">
              {t("security.subtitle")}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border border-border/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary/70" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-2xl text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>99.99%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("security.uptimeSla")}</p>
                </div>
              </div>
              <div className="w-px h-10 bg-border/20" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border border-border/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary/70" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-2xl text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t("security.zero")}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("security.dataBreaches")}</p>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <span 
                  key={cert} 
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-background border border-border/20 text-[10px] text-muted-foreground uppercase tracking-wide"
                >
                  <CheckCircle className="w-3 h-3 text-primary/60" />
                  {cert}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <motion.div 
                key={feature.titleKey} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: index * 0.1 }} 
                className="group p-6 bg-background border border-border/10 hover:border-primary/20 transition-all duration-500"
              >
                <feature.icon className="w-5 h-5 text-muted-foreground mb-4 group-hover:text-primary transition-colors duration-500" strokeWidth={1.5} />
                <h3 className="text-sm text-foreground mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-xs text-muted-foreground/60 font-light leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
