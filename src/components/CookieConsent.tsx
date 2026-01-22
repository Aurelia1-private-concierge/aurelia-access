import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CONSENT_KEY = "aurelia-cookie-consent";

type ConsentStatus = "accepted" | "rejected" | null;

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY) as ConsentStatus;
    if (!consent) {
      // Delay cookie consent to avoid blocking LCP (Largest Contentful Paint)
      // LCP typically completes within 2.5s, so we defer to 4s
      const timer = setTimeout(() => setShowBanner(true), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status: "accepted" | "rejected") => {
    localStorage.setItem(CONSENT_KEY, status);
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-card/95 backdrop-blur-xl border border-primary/20 rounded-xl p-6 shadow-2xl">
              {/* Close button */}
              <button
                onClick={() => handleConsent("rejected")}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close cookie banner"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pr-8 md:pr-0">
                  <h3 className="font-serif text-lg text-foreground mb-2">
                    Your Privacy Matters
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use cookies to enhance your browsing experience, provide personalized 
                    services, and analyze our traffic. By clicking "Accept", you consent to 
                    our use of cookies. Read our{" "}
                    <Link 
                      to="/privacy" 
                      className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                    >
                      Privacy Policy
                    </Link>{" "}
                    for more information.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-row gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => handleConsent("rejected")}
                    className="flex-1 md:flex-none border-muted-foreground/30 hover:bg-muted/50"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleConsent("accepted")}
                    className="flex-1 md:flex-none bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
