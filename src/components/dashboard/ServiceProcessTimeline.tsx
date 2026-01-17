import { motion } from "framer-motion";
import {
  Send,
  Search,
  ListChecks,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { tierResponseTimes } from "@/lib/discovery-intake-config";

interface ServiceProcessTimelineProps {
  currentStatus: string;
  showEstimates?: boolean;
}

interface TimelineStage {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  statuses: string[];
}

const stages: TimelineStage[] = [
  {
    id: "submitted",
    label: "Submitted",
    description: "Request received and queued",
    icon: Send,
    statuses: ["pending"],
  },
  {
    id: "review",
    label: "Under Review",
    description: "Concierge team is reviewing",
    icon: Search,
    statuses: ["accepted", "in_progress"],
  },
  {
    id: "options",
    label: "Options Ready",
    description: "Curated options prepared",
    icon: ListChecks,
    statuses: ["options_ready"],
  },
  {
    id: "awaiting",
    label: "Awaiting Confirmation",
    description: "Pending your approval",
    icon: Clock,
    statuses: ["awaiting_confirmation"],
  },
  {
    id: "fulfilling",
    label: "In Progress",
    description: "Fulfillment underway",
    icon: Loader2,
    statuses: ["fulfilling"],
  },
  {
    id: "completed",
    label: "Completed",
    description: "Successfully fulfilled",
    icon: CheckCircle,
    statuses: ["completed"],
  },
];

const getStageIndex = (status: string): number => {
  if (status === "cancelled") return -1;
  const index = stages.findIndex((stage) => stage.statuses.includes(status));
  return index >= 0 ? index : 0;
};

const getTierFromSubscription = (tier: string | null): "silver" | "gold" | "platinum" => {
  if (!tier) return "silver";
  const lowerTier = tier.toLowerCase();
  if (lowerTier.includes("platinum") || lowerTier.includes("black")) return "platinum";
  if (lowerTier.includes("gold") || lowerTier.includes("prestige")) return "gold";
  return "silver";
};

export const ServiceProcessTimeline = ({
  currentStatus,
  showEstimates = true,
}: ServiceProcessTimelineProps) => {
  const { tier } = useSubscription();
  const memberTier = getTierFromSubscription(tier);
  const responseTimes = tierResponseTimes[memberTier];
  const currentStageIndex = getStageIndex(currentStatus);
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="space-y-4">
      {/* Estimated times header */}
      {showEstimates && !isCancelled && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-primary font-medium mb-1">
            Estimated Timeline ({memberTier.charAt(0).toUpperCase() + memberTier.slice(1)} Member)
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Initial: {responseTimes.initial}h</span>
            <span>•</span>
            <span>Options: {responseTimes.options}h</span>
            <span>•</span>
            <span>Fulfillment: {responseTimes.fulfillment}</span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />

        {/* Stages */}
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            let stageClass = "";
            let iconClass = "";
            let dotClass = "";

            if (isCancelled && index === 0) {
              stageClass = "opacity-50";
              iconClass = "text-destructive";
              dotClass = "bg-destructive border-destructive";
            } else if (isCompleted) {
              stageClass = "";
              iconClass = "text-emerald-500";
              dotClass = "bg-emerald-500 border-emerald-500";
            } else if (isCurrent) {
              stageClass = "";
              iconClass = "text-primary";
              dotClass = "bg-primary border-primary";
            } else {
              stageClass = "opacity-40";
              iconClass = "text-muted-foreground";
              dotClass = "bg-muted border-border";
            }

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative flex items-start gap-4 ${stageClass}`}
              >
                {/* Dot */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background ${dotClass}`}
                >
                  {isCurrent && stage.id === "fulfilling" ? (
                    <Loader2 className={`w-4 h-4 ${iconClass} animate-spin`} />
                  ) : isCancelled && index === 0 ? (
                    <XCircle className="w-4 h-4 text-destructive" />
                  ) : isCompleted ? (
                    <CheckCircle className={`w-4 h-4 ${iconClass}`} />
                  ) : (
                    <Icon className={`w-4 h-4 ${iconClass}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium ${
                        isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stage.label}
                    </p>
                    {isCurrent && !isCancelled && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stage.description}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Cancelled state */}
          {isCancelled && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative flex items-start gap-4"
            >
              <div className="relative z-10 w-8 h-8 rounded-full border-2 border-destructive bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0 pb-4">
                <p className="text-sm font-medium text-destructive">Cancelled</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This request has been cancelled
                </p>
              </div>
            </motion.div>
          )}

          {/* Rating stage for completed */}
          {currentStatus === "completed" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative flex items-start gap-4"
            >
              <div className="relative z-10 w-8 h-8 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0 pb-4">
                <p className="text-sm font-medium text-primary">Rate Your Experience</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Help us improve by sharing your feedback
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceProcessTimeline;
