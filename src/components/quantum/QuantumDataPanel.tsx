import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Activity, Cpu, Zap } from "lucide-react";

interface DataItem {
  label: string;
  value: string | number;
  unit?: string;
  status?: "online" | "processing" | "idle" | "error";
}

interface QuantumDataPanelProps {
  title?: string;
  items: DataItem[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  showHeader?: boolean;
}

export const QuantumDataPanel = ({
  title = "System Status",
  items,
  className,
  columns = 2,
  showHeader = true,
}: QuantumDataPanelProps) => {
  const statusColors = {
    online: "text-emerald-400",
    processing: "text-cyan-400",
    idle: "text-slate-500",
    error: "text-red-400",
  };

  const statusIcons = {
    online: <Zap className="w-3 h-3" />,
    processing: <Activity className="w-3 h-3 animate-pulse" />,
    idle: <Cpu className="w-3 h-3" />,
    error: <Activity className="w-3 h-3" />,
  };

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-cyan-500/20 bg-slate-900/80 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              {title}
            </span>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1 text-xs text-emerald-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono">ACTIVE</span>
          </motion.div>
        </div>
      )}

      {/* Data Grid */}
      <div className={cn("grid gap-px bg-cyan-500/10 p-px", gridCols[columns])}>
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-900 p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                {item.label}
              </span>
              {item.status && (
                <span className={cn("flex items-center gap-1", statusColors[item.status])}>
                  {statusIcons[item.status]}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-cyan-400 tabular-nums">
                {item.value}
              </span>
              {item.unit && (
                <span className="text-sm font-mono text-slate-500">{item.unit}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom scan line */}
      <div className="relative h-1 bg-slate-950 overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
        />
      </div>
    </div>
  );
};

export default QuantumDataPanel;
