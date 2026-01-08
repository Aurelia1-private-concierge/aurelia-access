import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Shield, Sparkles, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfetti } from "@/hooks/useConfetti";
import { cn } from "@/lib/utils";

interface UpgradeCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  tierName: string;
  tierId: string;
}

const tierConfig = {
  silver: {
    icon: Shield,
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/30",
    message: "Welcome to Silver",
  },
  gold: {
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    message: "Welcome to Gold",
  },
  platinum: {
    icon: Sparkles,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/30",
    message: "Welcome to Platinum",
  },
};

const UpgradeCelebration = ({ isOpen, onClose, tierName, tierId }: UpgradeCelebrationProps) => {
  const { firePremiumConfetti } = useConfetti();
  const [hasTriggered, setHasTriggered] = useState(false);

  const config = tierConfig[tierId as keyof typeof tierConfig] || tierConfig.gold;
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen && !hasTriggered) {
      firePremiumConfetti();
      setHasTriggered(true);
    }
  }, [isOpen, hasTriggered, firePremiumConfetti]);

  useEffect(() => {
    if (!isOpen) {
      setHasTriggered(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/90 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className={cn(
              "bg-card border-2 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden",
              config.border
            )}>
              {/* Background glow */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-20 pointer-events-none",
                config.bg.replace("/10", "/30")
              )} />

              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                  className={cn("w-32 h-32 rounded-full border-2", config.border)}
                />
              </div>

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className={cn(
                    "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6",
                    config.bg,
                    "border",
                    config.border
                  )}
                >
                  <Icon className={cn("w-10 h-10", config.color)} />
                </motion.div>

                {/* Party icon */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute top-4 right-8"
                >
                  <PartyPopper className="w-8 h-8 text-primary" />
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="font-serif text-3xl text-foreground mb-2">
                    Congratulations!
                  </h2>
                  <p className={cn("text-lg font-medium mb-2", config.color)}>
                    {config.message}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    You now have access to exclusive {tierName} member benefits and privileges.
                  </p>
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={onClose}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 gold-glow-hover"
                  >
                    Explore Your Benefits
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpgradeCelebration;
