import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextualTooltipProps {
  children: ReactNode;
  title: string;
  description: string;
  tip?: string;
  position?: "top" | "bottom" | "left" | "right";
  showIcon?: boolean;
  className?: string;
}

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowClasses = {
  top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-border",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-border",
  left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-border",
  right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-border",
};

export default function ContextualTooltip({
  children,
  title,
  description,
  tip,
  position = "top",
  showIcon = true,
  className,
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
        {showIcon && (
          <button
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(!isVisible);
            }}
            aria-label="Show help"
          >
            <HelpCircle className="w-3 h-3 text-primary" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 w-64 p-4 rounded-xl bg-card border border-border shadow-xl",
              positionClasses[position]
            )}
          >
            {/* Close button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary/50 transition-colors"
              aria-label="Dismiss tooltip"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>

            {/* Content */}
            <h4 className="text-sm font-medium text-foreground pr-6">{title}</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {description}
            </p>

            {/* Pro tip */}
            {tip && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-primary/80">{tip}</p>
                </div>
              </div>
            )}

            {/* Arrow */}
            <div
              className={cn(
                "absolute w-0 h-0 border-[6px]",
                arrowClasses[position]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
