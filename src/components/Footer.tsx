import { Instagram, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/20 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-primary/3 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <a href="#" className="font-serif text-2xl tracking-widest text-foreground hover:text-primary transition-colors duration-300">
                AURELIA
              </a>
              <p className="text-xs text-muted-foreground/50 mt-3 tracking-wide">
                Beyond Concierge. By Invitation Only.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              {[
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map(({ icon: Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="w-10 h-10 rounded-full border border-border/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </motion.div>
          </div>
        </div>
        
        <div className="border-t border-border/10">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground/40 font-light">
            <p>© 2024 Aurelia Holdings Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-muted-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-muted-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-muted-foreground transition-colors">Sovereign Data Agreement</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
