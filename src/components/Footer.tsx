import { Instagram, Twitter, Linkedin, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo, BRAND } from "@/components/brand";

const Footer = () => {
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
              <p className="text-sm text-muted-foreground/70 mt-4 leading-relaxed max-w-sm">
                {BRAND.description} {BRAND.tagline}
              </p>
              <div className="flex items-center gap-3 mt-6">
                {[
                  { icon: Instagram, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Linkedin, href: "#" },
                ].map(({ icon: Icon, href }, index) => (
                  <motion.a
                    key={index}
                    href={href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full border border-border/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
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
                Navigate
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    Services
                  </Link>
                </li>
                <li>
                  <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#experiences" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    Experiences
                  </a>
                </li>
                <li>
                  <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    Membership
                  </Link>
                </li>
                <li>
                  <Link to="/partner/apply" className="text-sm text-primary hover:text-primary/80 transition-colors duration-300">
                    Become a Partner
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
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:liaison@aurelia.com" className="hover:text-foreground transition-colors duration-300">
                    liaison@aurelia.com
                  </a>
                </li>
                <li>Geneva • London • Singapore</li>
                <li className="pt-2">
                  <span className="text-xs tracking-wide text-primary">24/7 Private Line</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
        
        {/* Legal Text Strip */}
        <div className="border-t border-border/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <p className="text-[10px] text-muted-foreground/30 text-center leading-relaxed">
              {BRAND.legal.trademark} {BRAND.legal.jurisdiction}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/10">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground/40 font-light">
              © {BRAND.year} {BRAND.entity}. {BRAND.legal.copyright}
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground/40 font-light">
              <Link to="/privacy" className="hover:text-muted-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-muted-foreground transition-colors">Terms of Service</Link>
              <a href="mailto:legal@aurelia.com" className="hover:text-muted-foreground transition-colors">Legal Inquiries</a>
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
