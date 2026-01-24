import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Flame, Snowflake, ThermometerSun } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface LeadScoreIndicatorProps {
  score: number;
  breakdown?: Record<string, number>;
  compact?: boolean;
  showTrend?: boolean;
  previousScore?: number;
}

export const LeadScoreIndicator = ({
  score,
  breakdown,
  compact = false,
  showTrend = false,
  previousScore
}: LeadScoreIndicatorProps) => {
  const getTier = (s: number) => {
    if (s >= 80) return { label: "Qualified", color: "text-purple-500", bg: "bg-purple-500/10", icon: Flame };
    if (s >= 50) return { label: "Hot", color: "text-red-500", bg: "bg-red-500/10", icon: Flame };
    if (s >= 25) return { label: "Warm", color: "text-orange-500", bg: "bg-orange-500/10", icon: ThermometerSun };
    return { label: "Cold", color: "text-blue-400", bg: "bg-blue-400/10", icon: Snowflake };
  };

  const tier = getTier(score);
  const TierIcon = tier.icon;

  const getTrend = () => {
    if (previousScore === undefined) return null;
    const diff = score - previousScore;
    if (diff > 5) return { icon: TrendingUp, color: "text-green-500", label: `+${diff}` };
    if (diff < -5) return { icon: TrendingDown, color: "text-red-500", label: `${diff}` };
    return { icon: Minus, color: "text-muted-foreground", label: "0" };
  };

  const trend = showTrend ? getTrend() : null;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            tier.bg, tier.color
          )}>
            <TierIcon className="w-3 h-3" />
            <span>{score}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{tier.label} Lead</p>
          <p className="text-xs text-muted-foreground">Score: {score}/100</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={cn("rounded-lg p-4", tier.bg)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TierIcon className={cn("w-5 h-5", tier.color)} />
          <span className={cn("font-semibold", tier.color)}>{tier.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{score}</span>
          <span className="text-sm text-muted-foreground">/100</span>
          {trend && (
            <Badge variant="outline" className={cn("text-xs", trend.color)}>
              <trend.icon className="w-3 h-3 mr-1" />
              {trend.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full bg-background/50 rounded-full h-2 mb-3">
        <div
          className={cn("h-2 rounded-full transition-all duration-500", {
            "bg-purple-500": score >= 80,
            "bg-red-500": score >= 50 && score < 80,
            "bg-orange-500": score >= 25 && score < 50,
            "bg-blue-400": score < 25
          })}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      {/* Breakdown */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-2">Score Breakdown:</p>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize">
                  {key.replace(/_/g, " ")}
                </span>
                <span className={cn("font-medium", tier.color)}>+{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadScoreIndicator;
