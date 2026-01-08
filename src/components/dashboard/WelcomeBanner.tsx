import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  onStartTour: () => void;
  userName?: string;
}

const WelcomeBanner = ({ isVisible, onDismiss, onStartTour, userName }: WelcomeBannerProps) => {
  const displayName = userName?.split("@")[0] || "Member";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-card border border-primary/30 p-6 mb-6"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-serif text-xl text-foreground mb-1">
                  Welcome to Aurelia, {displayName}!
                </h2>
                <p className="text-sm text-muted-foreground mb-4 max-w-xl">
                  Your journey into exclusive luxury begins here. Let us show you around your 
                  personal dashboard and the powerful features at your fingertips.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={onStartTour}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gold-glow-hover"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Take the Tour
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onDismiss}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="p-1 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeBanner;
