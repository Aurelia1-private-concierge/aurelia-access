import { Instagram, Twitter, Linkedin, Facebook, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo, BRAND } from "@/components/brand";
import LanguageSwitcher from "./LanguageSwitcher";
import SecurityTrustBadge from "./SecurityTrustBadge";

const Footer = () => {
  const { t } = useTranslation();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-background border-t border-border/20 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-primary/3 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2"
            >
              <Link to="/">
                <Logo variant="wordmark" size="lg" />
              </Link>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-sm">
                {BRAND.description} {BRAND.tagline}
              </p>
              <div className="mt-4">
                <SecurityTrustBadge variant="compact" />
              </div>
              <div className="flex items-center gap-3 mt-6">
                {[
                  { icon: Instagram, href: "/instagram", label: "Instagram", isInternal: true },
                  { icon: Facebook, href: "/facebook", label: "Facebook", isInternal: true },
                  { icon: Twitter, href: "/twitter", label: "X (Twitter)", isInternal: true },
                  { icon: Linkedin, href: "/linkedin", label: "LinkedIn", isInternal: true },
                ].map(({ icon: Icon, href, label, isInternal }) => (
                  isInternal ? (
                    <Link key={label} to={href}>
                      <motion.div
                        aria-label={label}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-full border border-border/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                      >
                        <Icon className="w-4 h-4" />
                      </motion.div>
                    </Link>
                  ) : (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-full border border-border/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  )
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-foreground mb-6">
                {t("footer.navigate")}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    {t("nav.services")}
                  </Link>
                </li>
                <li>
                  <Link to="/#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    {t("nav.security")}
                  </Link>
                </li>
                <li>
                  <Link to="/#experiences" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    {t("nav.experiences")}
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    {t("nav.membership")}
                  </Link>
                </li>
                <li>
                  <Link to="/social" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    Follow Us
                  </Link>
                </li>
                <li>
                  <Link to="/partner/apply" className="text-sm text-primary hover:text-primary/80 transition-colors duration-300">
                    {t("footer.becomePartner")}
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-foreground mb-6">
                {t("footer.contact")}
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:concierge@aurelia-privateconcierge.com" className="hover:text-foreground transition-colors duration-300">
                    concierge@aurelia-privateconcierge.com
                  </a>
                </li>
                <li>London • Geneva • Singapore</li>
                <li className="text-xs text-muted-foreground/80">
                  Aurelia Holdings Ltd.<br />
                  London, United Kingdom
                </li>
                <li className="pt-2">
                  <span className="text-xs tracking-wide text-primary">{t("footer.privateLine")}</span>
                </li>
                <li className="pt-3">
                  <a 
                    href="https://wa.me/+447309935106" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-serif font-semibold text-base text-background bg-gradient-to-r from-primary to-primary/60 hover:from-primary/60 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                      alt="WhatsApp" 
                      className="h-5 w-5"
                    />
                    Chat on WhatsApp
                  </a>
                </li>
                <li className="pt-3">
                  <Link to="/contact" className="text-primary hover:text-primary/80 transition-colors duration-300 text-sm">
                    Contact Us →
                  </Link>
                </li>
                <li className="pt-4">
                  <LanguageSwitcher variant="footer" />
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
        
        {/* Legal Text Strip */}
        <div className="border-t border-border/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed">
              {BRAND.legal.trademark} {BRAND.legal.jurisdiction}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/10">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground/60 font-light">
              © 2026 Aurelia Concierge Services.. All rights reserved. Unauthorized reproduction prohibited.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground/60 font-light">
              <Link to="/privacy" className="hover:text-muted-foreground transition-colors">{t("footer.privacy")}</Link>
              <Link to="/terms" className="hover:text-muted-foreground transition-colors">{t("footer.terms")}</Link>
              <a href="mailto:concierge@aurelia-privateconcierge.com" className="hover:text-muted-foreground transition-colors">{t("footer.legal")}</a>
              <Link to="/contact" className="hover:text-muted-foreground transition-colors">Contact</Link>
            </div>
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full border border-border/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
