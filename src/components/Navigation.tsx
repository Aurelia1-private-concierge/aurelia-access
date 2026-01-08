import { Lock, Menu } from "lucide-react";
import { motion } from "framer-motion";

const Navigation = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full z-50 border-b border-border/30 glass"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="#" className="font-serif text-xl tracking-widest text-foreground hover:text-primary transition-colors duration-300">
          AURELIA
        </a>

        <div className="hidden md:flex items-center space-x-10 text-sm font-light tracking-wide">
          <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
            Services
          </a>
          <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
            Security
          </a>
          <a href="#experiences" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
            Experiences
          </a>
          <a href="#membership" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
            Membership
          </a>
        </div>

        <div className="flex items-center space-x-6">
          <button className="hidden md:flex items-center space-x-2 text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Client Login</span>
          </button>
          <button className="text-foreground md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
