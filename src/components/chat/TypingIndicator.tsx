import React, { forwardRef } from "react";
import { motion, Easing } from "framer-motion";

interface TypingIndicatorProps {
  senderName?: string;
  variant?: "default" | "luxury" | "minimal";
  className?: string;
}

const TypingIndicator = forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ senderName = "Concierge", variant = "default", className = "" }, ref) => {
    const ease: Easing = "easeInOut";

    const getDotAnimation = (i: number) => ({
      y: [-2, 2, -2],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        delay: i * 0.15,
        ease,
      },
    });

    if (variant === "minimal") {
      return (
        <div ref={ref} className={`flex items-center gap-1 ${className}`}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={getDotAnimation(i)}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
            />
          ))}
        </div>
      );
    }

    if (variant === "luxury") {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`flex items-start gap-3 ${className}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-serif">
            A
          </div>
          <div className="bg-card border border-border/50 rounded-2xl rounded-tl-none px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={getDotAnimation(i)}
                    className="w-2 h-2 rounded-full bg-primary/70"
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground italic">
                {senderName} is composing...
              </span>
            </div>
          </div>
        </motion.div>
      );
    }

    // Default variant
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-2 px-4 py-2 ${className}`}
      >
        <div className="flex items-center gap-1 px-3 py-2 bg-muted rounded-full">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={getDotAnimation(i)}
              className="w-2 h-2 rounded-full bg-muted-foreground/50"
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {senderName} is typing...
        </span>
      </motion.div>
    );
  }
);

TypingIndicator.displayName = "TypingIndicator";

export default TypingIndicator;
