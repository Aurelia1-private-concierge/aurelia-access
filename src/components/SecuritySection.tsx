import { Shield, Lock, Eye, Server, KeyRound, Fingerprint, CheckCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

const SecuritySection = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const leftGlowY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const rightGlowY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  const securityFeatures = [
    { icon: Lock, titleKey: "security.aes.title", descriptionKey: "security.aes.description" },
    { icon: Eye, titleKey: "security.zeroKnowledge.title", descriptionKey: "security.zeroKnowledge.description" },
    { icon: Server, titleKey: "security.swiss.title", descriptionKey: "security.swiss.description" },
    { icon: KeyRound, titleKey: "security.privacy.title", descriptionKey: "security.privacy.description" },
  ];

  const certifications = [
    "ISO 27001 Certified",
    "SOC 2 Type II Compliant",
    "GDPR Compliant",
    "Swiss Data Protection",
  ];

  return (
    <section ref={ref} id="security" className="py-32 md:py-40 bg-background relative overflow-hidden">
      <motion.div style={{ y: leftGlowY }} className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 pointer-events-none" />
      <motion.div style={{ y: rightGlowY }} className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/3 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-4">
                <span className="w-12 h-px bg-primary/40" />
                <p className="text-[11px] uppercase tracking-[0.4em] text-primary/70 font-medium">
                  {t("security.label")}
                </p>
              </div>
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl text-foreground tracking-[-0.02em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {t("security.title")} <br />
                <span className="italic text-muted-foreground/70">{t("security.titleHighlight")}</span>
              </h2>
            </div>
            <p className="font-light text-muted-foreground leading-relaxed max-w-lg text-lg">{t("security.subtitle")}</p>
            
            {/* Stats */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-card border border-border/30 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>99.99%</p>
                  <p className="text-xs text-muted-foreground tracking-wide">{t("security.uptimeSla")}</p>
                </div>
              </div>
              <div className="w-px h-12 bg-border/30" />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-card border border-border/30 flex items-center justify-center">
                  <Fingerprint className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t("security.zero")}</p>
                  <p className="text-xs text-muted-foreground tracking-wide">{t("security.dataBreaches")}</p>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="pt-8 border-t border-border/20">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Certifications</p>
              <div className="flex flex-wrap gap-3">
                {certifications.map((cert) => (
                  <span key={cert} className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 border border-border/20 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <motion.div 
                key={feature.titleKey} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: index * 0.1 }} 
                className="group p-8 bg-card/30 border border-border/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/50 transition-all duration-500 card-hover"
              >
                <div className="w-12 h-12 rounded-full bg-background border border-border/30 flex items-center justify-center mb-6 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-300">
                  <feature.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                </div>
                <h3 
                  className="text-xl text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors duration-300"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{t(feature.descriptionKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
