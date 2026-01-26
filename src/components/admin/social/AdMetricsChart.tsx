import React, { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAdSpendManagement, useCurrencyFormat, SUPPORTED_AD_PLATFORMS } from "@/hooks/useAdSpendManagement";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const AdMetricsChart = forwardRef<HTMLDivElement>((_, ref) => {
  const { metrics, loading } = useAdSpendManagement();
  const formatCurrency = useCurrencyFormat("USD");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<string>("spend");
  const [dateRange, setDateRange] = useState<string>("30");

  // Filter and aggregate data
  const filteredMetrics = metrics.filter((m) => {
    if (selectedPlatform !== "all" && m.platform !== selectedPlatform) return false;

    const metricDate = new Date(m.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));

    return metricDate >= cutoffDate;
  });

  // Group by date for chart
  const chartData = filteredMetrics.reduce((acc, m) => {
    const existing = acc.find((d) => d.date === m.date);
    if (existing) {
      existing.spend += m.spend;
      existing.impressions += m.impressions;
      existing.clicks += m.clicks;
      existing.conversions += m.conversions;
      existing.revenue += m.revenue;
    } else {
      acc.push({
        date: m.date,
        spend: m.spend,
        impressions: m.impressions,
        clicks: m.clicks,
        conversions: m.conversions,
        revenue: m.revenue,
      });
    }
    return acc;
  }, [] as Array<{
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate summary stats
  const totals = chartData.reduce(
    (acc, d) => ({
      spend: acc.spend + d.spend,
      impressions: acc.impressions + d.impressions,
      clicks: acc.clicks + d.clicks,
      conversions: acc.conversions + d.conversions,
      revenue: acc.revenue + d.revenue,
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  );

  const metricOptions = [
    { value: "spend", label: "Ad Spend", color: "#ef4444" },
    { value: "impressions", label: "Impressions", color: "#3b82f6" },
    { value: "clicks", label: "Clicks", color: "#22c55e" },
    { value: "conversions", label: "Conversions", color: "#a855f7" },
    { value: "revenue", label: "Revenue", color: "#eab308" },
  ];

  const currentMetric = metricOptions.find((m) => m.value === selectedMetric) || metricOptions[0];

  if (loading) {
    return (
      <Card ref={ref}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading metrics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={ref}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Track ROI and performance across advertising platforms
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {SUPPORTED_AD_PLATFORMS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.icon} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No performance data available</p>
            <p className="text-sm">Data will appear once campaigns start running</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-muted/30 rounded-lg text-center"
              >
                <p className="text-xs text-muted-foreground">Total Spend</p>
                <p className="text-lg font-bold text-red-500">{formatCurrency(totals.spend)}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-3 bg-muted/30 rounded-lg text-center"
              >
                <p className="text-xs text-muted-foreground">Impressions</p>
                <p className="text-lg font-bold text-blue-500">{totals.impressions.toLocaleString()}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-3 bg-muted/30 rounded-lg text-center"
              >
                <p className="text-xs text-muted-foreground">Clicks</p>
                <p className="text-lg font-bold text-green-500">{totals.clicks.toLocaleString()}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-3 bg-muted/30 rounded-lg text-center"
              >
                <p className="text-xs text-muted-foreground">Conversions</p>
                <p className="text-lg font-bold text-purple-500">{totals.conversions.toLocaleString()}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 bg-muted/30 rounded-lg text-center"
              >
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-lg font-bold text-yellow-500">{formatCurrency(totals.revenue)}</p>
              </motion.div>
            </div>

            {/* Main Chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`color${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) =>
                      selectedMetric === "spend" || selectedMetric === "revenue"
                        ? `$${value.toLocaleString()}`
                        : value.toLocaleString()
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) =>
                      selectedMetric === "spend" || selectedMetric === "revenue"
                        ? [formatCurrency(value), currentMetric.label]
                        : [value.toLocaleString(), currentMetric.label]
                    }
                    labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke={currentMetric.color}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#color${selectedMetric})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison Bar Chart */}
            <div className="h-[200px]">
              <p className="text-sm font-medium mb-3">Spend vs Revenue Comparison</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-14)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { day: "numeric" })}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name === "spend" ? "Ad Spend" : "Revenue"]}
                  />
                  <Legend />
                  <Bar dataKey="spend" name="Ad Spend" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AdMetricsChart.displayName = "AdMetricsChart";

export default AdMetricsChart;
