import { motion } from "framer-motion";
import { Clock, ArrowUpRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { QuantumTimeline } from "@/components/quantum";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  action: string;
  item: string;
  date: string;
  value: string;
  status?: "completed" | "pending" | "processing";
}

interface QuantumActivityFeedProps {
  activities: Activity[];
  title?: string;
  className?: string;
  onViewDetails?: (id: string) => void;
}

export const QuantumActivityFeed = ({
  activities,
  title = "Recent Activity",
  className,
  onViewDetails,
}: QuantumActivityFeedProps) => {
  const timelineEvents = activities.map((activity) => ({
    id: activity.id,
    title: activity.action,
    description: `${activity.item} — ${activity.value}`,
    date: activity.date,
    status: activity.status === "completed" 
      ? "completed" as const
      : activity.status === "processing" 
        ? "current" as const 
        : "pending" as const,
    content: onViewDetails ? (
      <button
        onClick={() => onViewDetails(activity.id)}
        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-mono"
      >
        View Details <ArrowUpRight className="w-3 h-3" />
      </button>
    ) : undefined,
  }));

  return (
    <div
      className={cn(
        "relative p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-mono text-lg text-foreground">{title}</h3>
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 border border-primary/20"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono text-primary">SYNCED</span>
        </motion.div>
      </div>

      {/* Timeline */}
      <div className="relative z-10">
        <QuantumTimeline
          events={timelineEvents}
          variant="compact"
          animated
        />
      </div>

      {/* Scanning effect */}
      <motion.div
        animate={{ y: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"
      />
    </div>
  );
};

export default QuantumActivityFeed;
