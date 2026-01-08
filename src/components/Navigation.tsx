import { useState, useEffect } from "react";
import { Lock, Menu } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/brand";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#security", label: "Security" },
  { href: "#experiences", label: "Experiences" },
  { href: "#membership", label: "Membership" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.href.replace('#', ''));
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 2.2 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? "border-b border-border/30 glass shadow-lg shadow-background/20" 
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/">
          <Logo variant="wordmark" size="md" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-10 text-sm font-light tracking-wide">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`relative py-2 transition-colors duration-300 ${
                activeSection === link.href.replace('#', '')
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              {activeSection === link.href.replace('#', '') && (
                <motion.span
                  layoutId="activeSection"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-6">
          <Link 
            to="/auth" 
            className="hidden md:flex items-center space-x-2 text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span className="w-8 h-8 rounded-full border border-border/30 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300">
              <Lock className="w-3.5 h-3.5 text-primary" />
            </span>
            <span>Client Login</span>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="text-foreground md:hidden p-2 hover:bg-secondary/30 rounded-full transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background border-border/30">
              <SheetHeader className="text-left pb-6 border-b border-border/30">
                <SheetTitle>
                  <Logo variant="wordmark" size="md" animated={false} />
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
                    className={`py-4 px-4 text-lg font-light transition-all duration-300 border-b border-border/20 ${
                      activeSection === link.href.replace('#', '')
                        ? "text-foreground bg-secondary/30 border-l-2 border-l-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                    }`}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <div className="absolute bottom-8 left-6 right-6">
                <Link 
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-3 py-4 bg-primary text-primary-foreground text-sm font-medium tracking-widest uppercase w-full gold-glow-hover transition-all duration-300"
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
