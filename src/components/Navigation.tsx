import { useState } from "react";
import { Lock, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#security", label: "Security" },
  { href: "#experiences", label: "Experiences" },
  { href: "#membership", label: "Membership" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-10 text-sm font-light tracking-wide">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-6">
          <Link 
            to="/dashboard" 
            className="hidden md:flex items-center space-x-2 text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Client Login</span>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="text-foreground md:hidden p-2">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background border-border/30">
              <SheetHeader className="text-left pb-6 border-b border-border/30">
                <SheetTitle className="font-serif text-xl tracking-widest text-foreground">
                  AURELIA
                </SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col space-y-1 mt-8">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setIsOpen(false)}
                    className="py-4 px-2 text-lg font-light text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all duration-300 border-b border-border/20"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <div className="absolute bottom-8 left-6 right-6">
                <Link 
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-3 py-4 bg-primary text-primary-foreground text-sm font-medium tracking-widest uppercase w-full"
                >
                  <Lock className="w-4 h-4" />
                  <span>Client Login</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
