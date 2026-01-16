import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

const FloatingWhatsApp = () => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice || window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDismissed) setIsTooltipVisible(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isDismissed]);

  // Use different URLs for mobile (app) vs desktop (web)
  const whatsappUrl = isMobile
    ? "https://wa.me/447309935106?text=Hello%20Aurelia%20Concierge"
    : "https://web.whatsapp.com/send?phone=447309935106&text=Hello%20Aurelia%20Concierge";

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 flex flex-col items-end gap-3">
      {/* Tooltip */}
      <AnimatePresence>
        {isTooltipVisible && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="relative bg-card border border-border/30 px-4 py-3 shadow-lg max-w-[200px]"
          >
            <button
              onClick={() => {
                setIsTooltipVisible(false);
                setIsDismissed(true);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss tooltip"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-xs text-foreground mb-1">Need assistance?</p>
            <p className="text-[10px] text-muted-foreground">Chat with our concierge team</p>
            {/* Arrow */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b border-border/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative group"
        onMouseEnter={() => !isDismissed && setIsTooltipVisible(true)}
        aria-label="Contact us on WhatsApp"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" aria-hidden="true" />
        
        {/* Button */}
        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50 transition-shadow duration-300">
          <MessageCircle className="w-6 h-6 text-white" fill="white" aria-hidden="true" />
        </div>

        {/* Online indicator */}
        <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-green-400 border-2 border-background flex items-center justify-center" aria-hidden="true">
          <span className="w-2 h-2 rounded-full bg-white" />
        </span>
      </motion.a>
    </div>
  );
};

export default FloatingWhatsApp;