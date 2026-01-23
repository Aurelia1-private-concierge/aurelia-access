import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { LucideIcon, Circle, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  icon?: LucideIcon;
  status?: "completed" | "current" | "pending" | "error";
  content?: ReactNode;
}

interface QuantumTimelineProps {
  events: TimelineEvent[];
  orientation?: "vertical" | "horizontal";
  className?: string;
  animated?: boolean;
  showConnectors?: boolean;
  variant?: "default" | "compact" | "detailed";
}

export const QuantumTimeline = ({
  events,
  orientation = "vertical",
  className,
  animated = true,
  showConnectors = true,
  variant = "default",
}: QuantumTimelineProps) => {
  const statusStyles = {
    completed: {
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-400/20",
      border: "border-emerald-400/50",
      glow: "shadow-emerald-400/30",
    },
    current: {
      icon: Circle,
      color: "text-cyan-400",
      bg: "bg-cyan-400/20",
      border: "border-cyan-400/50",
      glow: "shadow-cyan-400/30",
    },
    pending: {
      icon: Clock,
      color: "text-slate-400",
      bg: "bg-slate-700/50",
      border: "border-slate-500/30",
      glow: "",
    },
    error: {
      icon: AlertCircle,
      color: "text-red-400",
      bg: "bg-red-400/20",
      border: "border-red-400/50",
      glow: "shadow-red-400/30",
    },
  };

  const getStatusConfig = (status: TimelineEvent["status"] = "pending") => {
    return statusStyles[status];
  };

  if (orientation === "horizontal") {
    return (
      <div className={cn("relative overflow-x-auto", className)}>
        <div className="flex items-start gap-4 min-w-max p-4">
          {events.map((event, index) => {
            const config = getStatusConfig(event.status);
            const StatusIcon = event.icon || config.icon;

            return (
              <motion.div
                key={event.id}
                initial={animated ? { opacity: 0, y: 20 } : undefined}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col items-center"
              >
                {/* Connector line */}
                {showConnectors && index < events.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-0.5">
                    <motion.div
                      initial={animated ? { scaleX: 0 } : undefined}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className={cn(
                        "h-full origin-left",
                        event.status === "completed"
                          ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                          : "bg-slate-700"
                      )}
                    />
                    {/* Data flow animation */}
                    {event.status === "completed" && (
                      <motion.div
                        animate={{ x: [0, 100] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                      />
                    )}
                  </div>
                )}

                {/* Node */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={cn(
                    "relative w-10 h-10 rounded-full flex items-center justify-center",
                    "border-2 shadow-lg",
                    config.bg,
                    config.border,
                    config.glow && `shadow-lg ${config.glow}`
                  )}
                >
                  <StatusIcon className={cn("w-5 h-5", config.color)} />

                  {/* Pulse for current */}
                  {event.status === "current" && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-cyan-400"
                    />
                  )}
                </motion.div>

                {/* Content */}
                <div className="mt-3 text-center max-w-32">
                  <p className="text-xs font-mono text-slate-500 mb-1">
                    {event.date}
                  </p>
                  <h4 className="text-sm font-mono text-cyan-400 font-medium">
                    {event.title}
                  </h4>
                  {variant !== "compact" && event.description && (
                    <p className="mt-1 text-xs text-slate-400">
                      {event.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Main connector line */}
      {showConnectors && (
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-700">
          <motion.div
            initial={animated ? { scaleY: 0 } : undefined}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gradient-to-b from-cyan-400 via-cyan-400/50 to-transparent origin-top"
            style={{
              height: `${
                (events.filter((e) => e.status === "completed" || e.status === "current")
                  .length /
                  events.length) *
                100
              }%`,
            }}
          />
        </div>
      )}

      {/* Events */}
      <div className="space-y-6">
        {events.map((event, index) => {
          const config = getStatusConfig(event.status);
          const StatusIcon = event.icon || config.icon;

          return (
            <motion.div
              key={event.id}
              initial={animated ? { opacity: 0, x: -20 } : undefined}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4"
            >
              {/* Node */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex-shrink-0",
                  "flex items-center justify-center",
                  "border-2 shadow-lg",
                  config.bg,
                  config.border,
                  config.glow && `shadow-lg ${config.glow}`
                )}
              >
                <StatusIcon className={cn("w-5 h-5", config.color)} />

                {/* Pulse for current */}
                {event.status === "current" && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-cyan-400"
                  />
                )}
              </motion.div>

              {/* Content card */}
              <div
                className={cn(
                  "flex-1 rounded-lg border border-cyan-500/20 bg-slate-900/80 p-4",
                  "relative overflow-hidden"
                )}
              >
                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: "15px 15px",
                  }}
                />

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between mb-2">
                  <h4 className="font-mono text-sm text-cyan-400 font-medium">
                    {event.title}
                  </h4>
                  <span className="text-xs font-mono text-slate-500">
                    {event.date}
                  </span>
                </div>

                {/* Description */}
                {event.description && (
                  <p className="relative z-10 text-sm text-slate-400 leading-relaxed">
                    {event.description}
                  </p>
                )}

                {/* Custom content */}
                {variant === "detailed" && event.content && (
                  <div className="relative z-10 mt-3 pt-3 border-t border-cyan-500/10">
                    {event.content}
                  </div>
                )}

                {/* Scan line effect */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.5,
                  }}
                  className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent pointer-events-none"
                />

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/30" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/30" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/30" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/30" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuantumTimeline;
