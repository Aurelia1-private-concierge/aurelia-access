import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuantumTheme } from "../hooks/useQuantumTheme";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface QuantumChartProps {
  data: DataPoint[];
  type?: "line" | "bar" | "area" | "radar";
  className?: string;
  height?: number;
  animated?: boolean;
  showGrid?: boolean;
  gradientFill?: boolean;
  dataKeys?: string[];
}

export const QuantumChart = ({
  data,
  type = "line",
  className,
  height = 300,
  animated = true,
  showGrid = true,
  gradientFill = true,
  dataKeys = ["value"],
}: QuantumChartProps) => {
  const { colors } = useQuantumTheme();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/95 border border-cyan-500/30 rounded-lg p-3 backdrop-blur-sm"
        >
          <p className="text-cyan-400 font-mono text-xs mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-mono text-sm">
              {entry.name}: <span className="text-cyan-300">{entry.value}</span>
            </p>
          ))}
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
            />
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <defs>
              <linearGradient id="quantumBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity={1} />
                <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(34, 211, 238, 0.1)"
                vertical={false}
              />
            )}
            <XAxis
              dataKey="name"
              stroke="rgba(34, 211, 238, 0.5)"
              tick={{ fill: "rgba(34, 211, 238, 0.7)", fontSize: 12, fontFamily: "monospace" }}
            />
            <YAxis
              stroke="rgba(34, 211, 238, 0.5)"
              tick={{ fill: "rgba(34, 211, 238, 0.7)", fontSize: 12, fontFamily: "monospace" }}
            />
            <Tooltip content={<CustomTooltip />} />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={gradientFill ? "url(#quantumBarGradient)" : "rgb(34, 211, 238)"}
                radius={[4, 4, 0, 0]}
                animationDuration={animated ? 1500 : 0}
              >
                {data.map((_, cellIndex) => (
                  <Cell
                    key={`cell-${cellIndex}`}
                    className="hover:brightness-125 transition-all cursor-pointer"
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="quantumAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(34, 211, 238, 0.1)"
              />
            )}
            <XAxis
              dataKey="name"
              stroke="rgba(34, 211, 238, 0.5)"
              tick={{ fill: "rgba(34, 211, 238, 0.7)", fontSize: 12, fontFamily: "monospace" }}
            />
            <YAxis
              stroke="rgba(34, 211, 238, 0.5)"
              tick={{ fill: "rgba(34, 211, 238, 0.7)", fontSize: 12, fontFamily: "monospace" }}
            />
            <Tooltip content={<CustomTooltip />} />
            {dataKeys.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke="rgb(34, 211, 238)"
                strokeWidth={2}
                fill="url(#quantumAreaGradient)"
                animationDuration={animated ? 1500 : 0}
              />
            ))}
          </AreaChart>
        );

      case "radar":
        return (
          <RadarChart {...commonProps} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid stroke="rgba(34, 211, 238, 0.2)" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: "rgba(34, 211, 238, 0.7)", fontSize: 11, fontFamily: "monospace" }}
            />
            <PolarRadiusAxis
              stroke="rgba(34, 211, 238, 0.3)"
              tick={{ fill: "rgba(34, 211, 238, 0.5)", fontSize: 10 }}
            />
            {dataKeys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke="rgb(34, 211, 238)"
                fill="rgba(34, 211, 238, 0.3)"
                fillOpacity={0.5}
                animationDuration={animated ? 1500 : 0}
              />
            ))}
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            <defs>
              <linearGradient id="quantumLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity={0.5} />
                <stop offset="50%" stopColor="rgb(34, 211, 238)" stopOpacity={1} />
                <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity={0.5} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(34, 211, 238, 0.1)"
              />
            )}
            <XAxis
              dataKey="name"
              stroke="rgba(34, 211, 238, 0.5)"
              tick={{ fill: "rgba(34, 211, 238, 0.7)", fontSize: 12, fontFamily: "monospace" }}
            />
            <YAxis
              stroke="rgba(34, 211, 238, 0.5)"
              tick={{ fill: "rgba(34, 211, 238, 0.7)", fontSize: 12, fontFamily: "monospace" }}
            />
            <Tooltip content={<CustomTooltip />} />
            {dataKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke="url(#quantumLineGradient)"
                strokeWidth={3}
                dot={{
                  fill: "rgb(34, 211, 238)",
                  stroke: "rgb(34, 211, 238)",
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  fill: "rgb(34, 211, 238)",
                  stroke: "white",
                  strokeWidth: 2,
                  filter: "url(#glow)",
                }}
                animationDuration={animated ? 1500 : 0}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0 } : undefined}
      animate={{ opacity: 1 }}
      className={cn(
        "relative rounded-lg border border-cyan-500/20 bg-slate-900/80 p-4 overflow-hidden",
        className
      )}
    >
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Scanning line effect */}
      <motion.div
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none"
      />

      {/* Chart container */}
      <div className="relative z-10" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50" />
    </motion.div>
  );
};

export default QuantumChart;
