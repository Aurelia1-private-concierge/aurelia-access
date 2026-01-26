import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Brain } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useOrlaIntelligence } from "@/contexts/OrlaIntelligenceContext";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const OrlaIntelligenceSwitch = memo(() => {
  const { mode, toggleMode, modeConfig } = useOrlaIntelligence();

  const isIQMode = mode === "iq";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/50 backdrop-blur-sm">
            {/* EQ Icon */}
            <motion.div
              animate={{
                scale: !isIQMode ? 1.1 : 0.9,
                opacity: !isIQMode ? 1 : 0.5,
              }}
              transition={{ duration: 0.2 }}
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-colors",
                  !isIQMode ? "text-destructive fill-destructive/30" : "text-muted-foreground"
                )}
              />
            </motion.div>

            {/* Switch */}
            <Switch
              checked={isIQMode}
              onCheckedChange={toggleMode}
              className={cn(
                "data-[state=checked]:bg-primary data-[state=unchecked]:bg-destructive/80",
                "h-5 w-9"
              )}
            />

            {/* IQ Icon */}
            <motion.div
              animate={{
                scale: isIQMode ? 1.1 : 0.9,
                opacity: isIQMode ? 1 : 0.5,
              }}
              transition={{ duration: 0.2 }}
            >
              <Brain
                className={cn(
                  "w-4 h-4 transition-colors",
                  isIQMode ? "text-primary" : "text-muted-foreground"
                )}
              />
            </motion.div>

            {/* Mode Label */}
            <AnimatePresence mode="wait">
              <motion.span
                key={mode}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "text-xs font-medium tracking-wide hidden sm:inline-block min-w-[24px]",
                  isIQMode ? "text-primary" : "text-destructive"
                )}
              >
                {mode.toUpperCase()}
              </motion.span>
            </AnimatePresence>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-card border-border/50 backdrop-blur-xl"
        >
          <div className="text-center">
            <p className="font-medium text-foreground">{modeConfig.label}</p>
            <p className="text-xs text-muted-foreground">{modeConfig.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

OrlaIntelligenceSwitch.displayName = "OrlaIntelligenceSwitch";

export default OrlaIntelligenceSwitch;
