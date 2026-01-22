/**
 * Credit Cost Preview Component
 * Shows estimated credit cost on service cards
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDynamicCreditCost, PricingContext } from "@/lib/dynamic-pricing";

interface CreditCostPreviewProps {
  category: string;
  minPrice?: number;
  maxPrice?: number;
  priority?: string;
  variant?: "badge" | "inline" | "prominent";
  className?: string;
}

export const CreditCostPreview: React.FC<CreditCostPreviewProps> = ({
  category,
  minPrice,
  maxPrice,
  priority = "standard",
  variant = "badge",
  className = "",
}) => {
  const [minCost, setMinCost] = useState<number | null>(null);
  const [maxCost, setMaxCost] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateCosts = async () => {
      setIsLoading(true);
      try {
        // Calculate minimum cost (using min price or no price)
        const minContext: PricingContext = {
          category,
          partnerServicePrice: minPrice,
          priority,
        };
        const min = await getDynamicCreditCost(minContext);
        setMinCost(min);

        // Calculate maximum cost (using max price)
        if (maxPrice && maxPrice !== minPrice) {
          const maxContext: PricingContext = {
            category,
            partnerServicePrice: maxPrice,
            priority,
          };
          const max = await getDynamicCreditCost(maxContext);
          setMaxCost(max);
        } else {
          setMaxCost(null);
        }
      } catch (error) {
        console.error("Failed to calculate credit cost:", error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateCosts();
  }, [category, minPrice, maxPrice, priority]);

  if (isLoading) {
    return (
      <span className={`text-muted-foreground text-sm ${className}`}>
        ...
      </span>
    );
  }

  if (minCost === null) {
    return null;
  }

  const costDisplay =
    maxCost && maxCost !== minCost
      ? `${minCost}-${maxCost}`
      : `${minCost}`;

  const tooltipContent = (
    <div className="space-y-1 text-xs">
      <p className="font-medium">Estimated credit cost</p>
      <p className="text-muted-foreground">
        Cost varies based on service value, priority, and timing.
      </p>
      {minPrice && (
        <p className="text-muted-foreground">
          Service range: ${minPrice.toLocaleString()}
          {maxPrice ? ` - $${maxPrice.toLocaleString()}` : "+"}
        </p>
      )}
    </div>
  );

  // Badge variant - compact for cards
  if (variant === "badge") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className={`gap-1 cursor-help ${className}`}
            >
              <Sparkles className="h-3 w-3 text-primary" />
              {costDisplay} credits
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top">{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Inline variant - for text flow
  if (variant === "inline") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`inline-flex items-center gap-1 text-sm text-primary cursor-help ${className}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {costDisplay} credits
              <Info className="h-3 w-3 text-muted-foreground" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Prominent variant - for featured sections
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2 cursor-help ${className}`}
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="text-lg font-bold text-primary">{costDisplay}</p>
              <p className="text-xs text-muted-foreground">credits</p>
            </div>
            <Info className="h-4 w-4 text-muted-foreground ml-1" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CreditCostPreview;
