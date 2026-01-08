import { Shield, Lock, Eye, Server, KeyRound, Fingerprint } from "lucide-react";
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

  return (
    <section ref={ref} id="security" className="py-24 bg-background relative overflow-hidden">
      <motion.div style={{ y: leftGlowY }} className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 pointer-events-none" />
      <motion.div style={{ y: rightGlowY }} className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/3 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-8">
            <div className="space-y-4">
              <p className="text-primary text-xs font-medium tracking-[0.2em] uppercase">{t("security.label")}</p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
                {t("security.title")} <br />
                <span className="italic text-muted-foreground">{t("security.titleHighlight")}</span>
              </h2>
            </div>
            <p className="font-light text-muted-foreground leading-relaxed max-w-lg">{t("security.subtitle")}</p>
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-secondary border border-border/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-serif text-foreground">99.99%</p>
                  <p className="text-xs text-muted-foreground tracking-wide">{t("security.uptimeSla")}</p>
                </div>
              </div>
              <div className="w-px h-12 bg-border/30" />
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-secondary border border-border/30 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-serif text-foreground">{t("security.zero")}</p>
                  <p className="text-xs text-muted-foreground tracking-wide">{t("security.dataBreaches")}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <motion.div key={feature.titleKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group p-6 bg-secondary/20 border border-border/20 backdrop-blur-sm hover:border-primary/40 hover:bg-secondary/40 transition-all duration-500 card-hover">
                <div className="w-10 h-10 rounded-full bg-background border border-border/30 flex items-center justify-center mb-4 group-hover:border-primary/50 transition-colors duration-300">
                  <feature.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2 tracking-tight">{t(feature.titleKey)}</h3>
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
