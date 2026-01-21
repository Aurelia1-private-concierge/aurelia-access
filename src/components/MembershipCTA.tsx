import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MembershipCTA = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 md:py-32 bg-background relative">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-10 rounded-full border border-primary/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>

          <h2 
            className="text-4xl md:text-5xl lg:text-6xl text-foreground tracking-[-0.02em] mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("membership.title")}
          </h2>
          <p className="text-muted-foreground font-light mb-12 leading-relaxed max-w-xl mx-auto">
            {t("membership.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/auth" 
              className="group w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-3"
            >
              {t("membership.beginApplication")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="mailto:concierge@aurelia-privateconcierge.com" 
              className="w-full sm:w-auto px-10 py-4 bg-transparent border border-primary/30 text-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
            >
              {t("membership.contactLiaison")}
            </a>
          </div>

          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }} 
            transition={{ delay: 0.3 }} 
            className="mt-12 pt-8 border-t border-border/10 inline-flex items-center gap-6 text-[10px] text-muted-foreground/40 uppercase tracking-wide"
          >
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              {t("membership.deposit")}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              {t("membership.verification")}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default MembershipCTA;
