import { Instagram, Twitter, Linkedin, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo, BRAND } from "@/components/brand";
import LanguageSwitcher from "./LanguageSwitcher";

const Footer = () => {
  const { t } = useTranslation();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: Instagram, href: "/instagram", label: "Instagram", isInternal: true },
    { icon: Twitter, href: "/twitter", label: "X", isInternal: true },
    { icon: Linkedin, href: "https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=tyrone-mitchell-730a253a4", label: "LinkedIn", isInternal: false },
  ];

  const quickLinks = [
    { href: "/services", label: t("nav.services") },
    { href: "/#security", label: t("nav.security") },
    { href: "/#experiences", label: t("nav.experiences") },
    { href: "/auth", label: t("nav.membership") },
    { href: "/partners/join", label: t("footer.becomePartner") },
  ];

  return (
    <footer role="contentinfo" aria-label="Site footer" className="bg-background border-t border-border/10 relative">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-5"
          >
            <Link to="/">
              <Logo variant="wordmark" size="lg" />
            </Link>
            <p className="text-sm text-muted-foreground mt-6 leading-relaxed max-w-sm">
              {BRAND.description}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-8">
              {socialLinks.map(({ icon: Icon, href, label, isInternal }) => (
                isInternal ? (
                  <Link key={label} to={href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-10 h-10 rounded-full border border-border/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300"
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
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-full border border-border/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300"
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
            className="md:col-span-3"
          >
            <h4 className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground mb-6">
              {t("footer.navigate")}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4"
          >
            <h4 className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground mb-6">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a 
                  href="mailto:concierge@aurelia-privateconcierge.com" 
                  className="hover:text-foreground transition-colors duration-300"
                >
                  concierge@aurelia-privateconcierge.com
                </a>
              </li>
              <li className="text-muted-foreground/60">
                London • Geneva • Singapore
              </li>
              <li className="pt-4">
                <LanguageSwitcher variant="footer" />
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
      
      {/* Legal Strip */}
      <div className="border-t border-border/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-[10px] text-muted-foreground/50 text-center">
            {BRAND.legal.trademark}
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-muted-foreground/50">
            © 2026 Aurelia Concierge Services. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[10px] text-muted-foreground/50">
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t("footer.privacy")}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t("footer.terms")}</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to top"
            className="w-10 h-10 rounded-full border border-border/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
