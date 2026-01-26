import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import UltraPremiumVideoBot from "./UltraPremiumVideoBot";

interface VideoBotTriggerProps {
  className?: string;
  position?: "bottom-right" | "bottom-left";
}

const VideoBotTrigger: React.FC<VideoBotTriggerProps> = ({
  className,
  position = "bottom-right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "fixed z-40",
              position === "bottom-right" ? "bottom-24 right-4" : "bottom-24 left-4",
              className
            )}
          >
            <motion.button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsOpen(true)}
              className="relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-2xl blur-xl"
                animate={{
                  opacity: isHovered ? 0.8 : 0.5,
                  scale: isHovered ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Orbiting particles */}
              <motion.div
                className="absolute inset-0 -m-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary/60 rounded-full" />
              </motion.div>
              
              {/* Main button */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-background via-card to-background border border-primary/30 flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/20">
                {/* Inner gradient animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"
                  animate={{ x: [-50, 50, -50] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                
                {/* Icon container */}
                <div className="relative z-10 flex items-center justify-center">
                  <motion.div
                    animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
                  >
                    <Video className="w-7 h-7 text-primary" />
                  </motion.div>
                  
                  {/* Crown badge */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-2 border-background"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Crown className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                </div>
              </div>
              
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 whitespace-nowrap",
                      position === "bottom-right" ? "right-20" : "left-20"
                    )}
                  >
                    <div className="px-4 py-2 rounded-xl bg-card/95 backdrop-blur-sm border border-primary/20 shadow-xl">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Video Concierge</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Premium AI-powered assistance
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Bot Modal */}
      <AnimatePresence>
        {isOpen && (
          <UltraPremiumVideoBot onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoBotTrigger;
