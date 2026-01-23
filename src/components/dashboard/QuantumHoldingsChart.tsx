import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, LucideIcon } from "lucide-react";
import { QuantumChart, QuantumTabs } from "@/components/quantum";
import { cn } from "@/lib/utils";

interface Holding {
  name: string;
  value: string;
  numericValue: number;
  allocation: string;
  icon: LucideIcon;
  change: string;
}

interface QuantumHoldingsChartProps {
  holdings: Holding[];
  className?: string;
  onViewDetails?: () => void;
}

export const QuantumHoldingsChart = ({
  holdings,
  className,
  onViewDetails,
}: QuantumHoldingsChartProps) => {
  const chartData = holdings.map((h) => ({
    name: h.name.split(" ")[0],
    value: h.numericValue / 1000000, // Convert to millions
    allocation: parseFloat(h.allocation),
  }));

  const tabs = [
    {
      id: "bar",
      label: "Bar Chart",
      content: (
        <QuantumChart
          data={chartData}
          type="bar"
          height={250}
          dataKeys={["value"]}
          animated
        />
      ),
    },
    {
      id: "radar",
      label: "Radar View",
      content: (
        <QuantumChart
          data={chartData}
          type="radar"
          height={250}
          dataKeys={["allocation"]}
          animated
        />
      ),
    },
    {
      id: "area",
      label: "Area View",
      content: (
        <QuantumChart
          data={chartData}
          type="area"
          height={250}
          dataKeys={["value"]}
          animated
        />
      ),
    },
  ];

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
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-mono text-lg text-foreground">Asset Holdings</h3>
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-mono"
          >
            View Details <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Chart tabs */}
      <div className="relative z-10">
        <QuantumTabs
          tabs={tabs}
          defaultTab="bar"
          variant="pills"
          animated
        />
      </div>

      {/* Holdings list */}
      <div className="relative z-10 mt-6 space-y-3">
        {holdings.map((holding, index) => (
          <motion.div
            key={holding.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-primary/10 hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <holding.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{holding.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{holding.allocation} of portfolio</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono font-medium text-foreground">{holding.value}</p>
              <p
                className={cn(
                  "text-xs font-mono",
                  holding.change.startsWith("+") ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {holding.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuantumHoldingsChart;
