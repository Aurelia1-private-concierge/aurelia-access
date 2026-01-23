import { useState, useEffect, useRef, useCallback } from "react";
import { Lock, Menu, X, ChevronDown } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/brand";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "#services", labelKey: "nav.services", id: "services" },
  { href: "#security", labelKey: "nav.security", id: "security" },
  { href: "#experiences", labelKey: "nav.experiences", id: "experiences" },
  { href: "#membership", labelKey: "nav.membership", id: "membership" },
];

// Primary navigation links
const primaryLinks = [
  { href: "/services", label: "Services" },
  { href: "/orla", label: "Meet Orla" },
  { href: "/blog", label: "Journal" },
  { href: "/partners/join", label: "Partners" },
];

// Discover dropdown links
const discoverLinks = [
  { href: "/services/marketplace", label: "Marketplace" },
  { href: "/auctions", label: "Auction House" },
  { href: "/gallery", label: "Gallery" },
];

// All page links for mobile menu
const pageLinks = [
  { href: "/services", label: "Services" },
  { href: "/services/marketplace", label: "Marketplace" },
  { href: "/auctions", label: "Auctions" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Journal" },
  { href: "/orla", label: "Meet Orla" },
  { href: "/partners/join", label: "Partners" },
];

interface SectionPosition {
  id: string;
  top: number;
  bottom: number;
}

const Navigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { scrollY } = useScroll();
  
  const sectionPositionsRef = useRef<SectionPosition[]>([]);
  const rafIdRef = useRef<number | null>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const updateSectionPositions = useCallback(() => {
    const sections = navLinks.map(link => link.href.replace('#', ''));
    const positions: SectionPosition[] = [];
    
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        positions.push({
          id: sectionId,
          top: rect.top + scrollTop,
          bottom: rect.top + scrollTop + rect.height
        });
      }
    });
    
    sectionPositionsRef.current = positions;
  }, []);

  const handleScroll = useCallback(() => {
    if (rafIdRef.current !== null) return;
    
    rafIdRef.current = requestAnimationFrame(() => {
      const scrollPosition = window.scrollY + 200;
      
      for (const section of sectionPositionsRef.current) {
        if (scrollPosition >= section.top && scrollPosition < section.bottom) {
          setActiveSection(prev => prev !== section.id ? section.id : prev);
          break;
        }
      }
      
      rafIdRef.current = null;
    });
  }, []);

  useEffect(() => {
    const initTimeout = setTimeout(updateSectionPositions, 100);
    
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateSectionPositions, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      clearTimeout(initTimeout);
      clearTimeout(resizeTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleScroll, updateSectionPositions]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2 }}
        data-tour="navigation"
        aria-label="Main navigation"
        role="navigation"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled 
            ? "border-b border-border/20 glass" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="relative z-10">
            <Logo variant="wordmark" size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10 text-xs font-light tracking-[0.1em]">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative py-2 transition-colors duration-300 ${
                  location.pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {location.pathname === link.href && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute -bottom-0.5 left-0 right-0 h-px bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            
            {/* Discover Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`relative py-2 transition-colors duration-300 flex items-center gap-1 outline-none ${
                discoverLinks.some(link => location.pathname === link.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
                Discover
                <ChevronDown className="w-3 h-3" />
                {discoverLinks.some(link => location.pathname === link.href) && (
                  <motion.span
                    layoutId="activeDiscover"
                    className="absolute -bottom-0.5 left-0 right-0 h-px bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="center" 
                sideOffset={12}
                className="min-w-[160px] bg-background/95 backdrop-blur-md border-border/30"
              >
                {discoverLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer text-xs tracking-[0.1em] font-light ${
                        location.pathname === link.href
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {location.pathname === "/" && (
              <>
                <span className="w-px h-4 bg-border/30" />
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
                    {t(link.labelKey)}
                    {activeSection === link.href.replace('#', '') && (
                      <motion.span
                        layoutId="activeSection"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                ))}
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="nav" className="hidden lg:flex" />
            
            <Link 
              to="/auth" 
              className="hidden lg:flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors group"
              aria-label="Sign in to your client account"
            >
              <span className="w-8 h-8 rounded-full border border-border/30 flex items-center justify-center group-hover:border-primary/40 transition-all duration-300" aria-hidden="true">
                <Lock className="w-3 h-3" aria-hidden="true" />
              </span>
              <span>{t("nav.clientLogin")}</span>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-foreground"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-background/95 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute top-20 left-0 right-0 px-6 py-8 flex flex-col"
            >
              <nav className="flex flex-col gap-1">
                {pageLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-4 text-2xl font-light tracking-wide border-b border-border/10 transition-colors ${
                        location.pathname === link.href
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                {location.pathname === "/" && navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (pageLinks.length + index) * 0.05 }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-4 text-2xl font-light tracking-wide border-b border-border/10 transition-colors ${
                        activeSection === link.href.replace('#', '')
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {t(link.labelKey)}
                    </a>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-border/10 flex flex-col gap-6">
                <LanguageSwitcher variant="nav" />
                
                <Link 
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase text-center flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {t("nav.clientLogin")}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
