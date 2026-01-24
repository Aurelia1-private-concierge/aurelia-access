import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExitIntentPopupProps {
  delay?: number; // ms before enabling
  offerType?: "vip_waitlist" | "exclusive_content" | "discount";
}

const OFFERS = {
  vip_waitlist: {
    icon: Sparkles,
    title: "Wait! Don't Miss Your VIP Spot",
    description: "Join our priority waitlist and get exclusive early access to Aurelia's private concierge services.",
    cta: "Get VIP Access",
    incentive: "Priority enrollment + 10% founding member discount"
  },
  exclusive_content: {
    icon: Gift,
    title: "Before You Go...",
    description: "Get our exclusive guide: \"The Art of Luxury Travel\" – insider secrets from our concierge team.",
    cta: "Send Me the Guide",
    incentive: "Free 24-page digital guide"
  },
  discount: {
    icon: Gift,
    title: "Exclusive Offer Just for You",
    description: "We'd hate to see you leave. Here's a special founding member discount on your first month.",
    cta: "Claim My Discount",
    incentive: "15% off first 3 months"
  }
};

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("exit_intent_session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("exit_intent_session", sessionId);
  }
  return sessionId;
};

export const ExitIntentPopup = ({ 
  delay = 5000, 
  offerType = "vip_waitlist" 
}: ExitIntentPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { toast } = useToast();

  const offer = OFFERS[offerType];
  const IconComponent = offer.icon;

  const trackConversion = useCallback(async (action: "shown" | "dismissed" | "converted", emailValue?: string) => {
    try {
      await supabase.from("exit_intent_conversions").insert({
        session_id: getSessionId(),
        page_path: window.location.pathname,
        offer_type: offerType,
        action,
        email: emailValue || null
      });
    } catch (error) {
      console.error("Failed to track exit intent:", error);
    }
  }, [offerType]);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!isEnabled || hasShown) return;
    
    // Only trigger when mouse moves toward top of viewport (likely closing tab)
    if (e.clientY <= 10 && e.relatedTarget === null) {
      const dismissed = localStorage.getItem("exit_intent_dismissed");
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        // Don't show again for 24 hours
        if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) return;
      }
      
      setIsVisible(true);
      setHasShown(true);
      trackConversion("shown");
    }
  }, [isEnabled, hasShown, trackConversion]);

  useEffect(() => {
    const timer = setTimeout(() => setIsEnabled(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("exit_intent_dismissed", Date.now().toString());
    trackConversion("dismissed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Add to waitlist with VIP flag
      const { error } = await supabase.from("launch_signups").insert({
        email,
        source: `exit_intent_${offerType}`,
        metadata: { vip: true, offer: offerType }
      });

      if (error && error.code !== "23505") throw error;

      await trackConversion("converted", email);
      
      toast({
        title: "Welcome to the VIP list!",
        description: "Check your email for exclusive access details.",
      });

      setIsVisible(false);
      localStorage.setItem("exit_intent_converted", "true");
    } catch (error) {
      console.error("Exit intent conversion failed:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="relative bg-gradient-to-br from-background via-background to-muted border border-gold/30 rounded-2xl p-8 shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-gold" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
                  {offer.title}
                </h2>
                <p className="text-muted-foreground">
                  {offer.description}
                </p>
              </div>

              {/* Incentive badge */}
              <div className="bg-gold/10 border border-gold/20 rounded-lg px-4 py-2 mb-6 text-center">
                <span className="text-sm font-medium text-gold">
                  {offer.incentive}
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50 border-border focus:border-gold"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold hover:bg-gold/90 text-gold-foreground font-medium"
                >
                  {isSubmitting ? "Processing..." : offer.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              {/* Skip link */}
              <button
                onClick={handleDismiss}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                No thanks, I'll pass
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
