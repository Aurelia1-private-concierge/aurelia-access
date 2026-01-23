import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { QuantumCard, QuantumProgress } from "@/components/quantum";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string;
  change: string;
  trending: "up" | "down";
  icon?: LucideIcon;
  progress?: number;
}

interface QuantumPortfolioStatsProps {
  stats: Stat[];
  className?: string;
}

export const QuantumPortfolioStats = ({ stats, className }: QuantumPortfolioStatsProps) => {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4", className)}>
      {stats.map((stat, index) => (
        <QuantumCard
          key={stat.label}
          variant="data"
          className="p-4 sm:p-6"
          animated
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              {stat.label}
            </span>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {stat.trending === "up" ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              )}
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="font-mono text-xl sm:text-3xl text-primary tracking-tight tabular-nums"
          >
            {stat.value}
          </motion.p>

          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                "text-sm font-mono",
                stat.trending === "up" ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {stat.change}
            </span>
            {stat.progress !== undefined && (
              <div className="flex-1">
                <QuantumProgress
                  value={stat.progress}
                  size="sm"
                  variant={stat.trending === "up" ? "success" : "error"}
                  showValue={false}
                  animated
                />
              </div>
            )}
          </div>

          {/* Data streaming indicator */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            />
            <span className="text-[10px] font-mono text-muted-foreground">LIVE</span>
          </div>
        </QuantumCard>
      ))}
    </div>
  );
};

export default QuantumPortfolioStats;
