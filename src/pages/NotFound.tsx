import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Compass, MessageCircle, ArrowLeft } from "lucide-react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logger.warn("404 Error: User attempted to access non-existent route", location.pathname);
  }, [location.pathname]);

  const quickLinks = [
    { href: "/", label: "Return Home", icon: Home },
    { href: "/services", label: "Explore Services", icon: Compass },
    { href: "/orla", label: "Speak with Orla", icon: MessageCircle },
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--gold) / 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, hsl(var(--gold) / 0.2) 0%, transparent 50%)`
        }} />
      </div>

      {/* Decorative lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Logo variant="full" size="lg" linkTo="/" />
        </motion.div>

        {/* 404 Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-[8rem] md:text-[12rem] leading-none font-bold text-gradient-gold tracking-tight">
            404
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-6" />
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">
            The destination you seek appears to be beyond our reach. 
            Allow us to guide you back to familiar waters.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            >
              <Button
                asChild
                variant="outline"
                className="group border-gold/30 hover:border-gold hover:bg-gold/10 text-foreground px-6 py-5 min-w-[180px]"
              >
                <Link to={link.href} className="flex items-center gap-3">
                  <link.icon className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                  <span>{link.label}</span>
                </Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Go back to previous page</span>
          </button>
        </motion.div>

        {/* Decorative bottom element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 text-muted-foreground/50 text-sm">
            <div className="w-8 h-px bg-gold/30" />
            <span className="font-serif italic">Beyond Concierge</span>
            <div className="w-8 h-px bg-gold/30" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
