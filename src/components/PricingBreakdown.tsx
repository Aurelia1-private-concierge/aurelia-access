/**
 * Pricing Breakdown Component
 * Shows members exactly how their credit cost is calculated
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Calculator, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PricingContext,
  PricingBreakdown as PricingBreakdownType,
  calculateDynamicCreditCost,
} from "@/lib/dynamic-pricing";

interface PricingBreakdownProps {
  context: PricingContext;
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const PricingBreakdown: React.FC<PricingBreakdownProps> = ({
  context,
  compact = false,
  showDetails = true,
  className = "",
}) => {
  const [breakdown, setBreakdown] = useState<PricingBreakdownType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBreakdown = async () => {
      setIsLoading(true);
      try {
        const result = await calculateDynamicCreditCost(context);
        setBreakdown(result);
      } catch (error) {
        console.error("Failed to calculate pricing:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBreakdown();
  }, [context]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Calculator className="h-4 w-4 animate-pulse" />
        <span className="text-sm">Calculating...</span>
      </div>
    );
  }

  if (!breakdown) {
    return null;
  }

  // Compact view - just shows the total
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`inline-flex items-center gap-1.5 cursor-help ${className}`}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-primary">
                {breakdown.finalCost} credits
              </span>
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs p-3">
            <div className="space-y-1 text-xs">
              {breakdown.breakdown.map((line, idx) => (
                <p key={idx} className={line.includes("────") ? "opacity-50" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full breakdown view
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={className}
      >
        <Card className="bg-card/50 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              Credit Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Base cost */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Base cost ({context.category})</span>
              <span className="font-medium">{breakdown.baseCost} credits</span>
            </div>

            {/* Tier adjustment */}
            {breakdown.tierAdjustment > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Service value tier
                </span>
                <span className="font-medium text-amber-500">
                  +{breakdown.tierAdjustment} credits
                </span>
              </div>
            )}

            {/* Priority multiplier */}
            {breakdown.priorityMultiplier > 1 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Priority ({context.priority})
                </span>
                <Badge variant="secondary" className="text-xs">
                  ×{breakdown.priorityMultiplier}
                </Badge>
              </div>
            )}

            {/* Budget multiplier */}
            {breakdown.budgetMultiplier > 1 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">High-value request</span>
                <Badge variant="secondary" className="text-xs">
                  ×{breakdown.budgetMultiplier}
                </Badge>
              </div>
            )}

            {/* Time multiplier */}
            {breakdown.timeMultiplier !== 1 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {context.isLastMinute
                    ? "Last-minute booking"
                    : context.isAdvanceBooking
                    ? "Advance booking"
                    : "Peak season"}
                </span>
                <Badge
                  variant={breakdown.timeMultiplier < 1 ? "default" : "secondary"}
                  className="text-xs"
                >
                  ×{breakdown.timeMultiplier}
                </Badge>
              </div>
            )}

            <Separator className="my-2" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold text-primary">
                  {breakdown.finalCost} credits
                </span>
              </div>
            </div>

            {/* Details toggle */}
            {showDetails && (
              <p className="text-xs text-muted-foreground mt-2">
                Credits are deducted when your request is confirmed. Unused credits
                remain in your account.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default PricingBreakdown;
