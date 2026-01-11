import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  UserPlus,
  ClipboardCheck,
  CreditCard,
  ArrowRight,
  Filter,
  RefreshCw,
  Download,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface FunnelData {
  landing: number;
  signup_started: number;
  signup_completed: number;
  onboarding_started: number;
  onboarding_completed: number;
  trial_started: number;
  converted: number;
}

interface SourceBreakdown {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  landing_count: number;
  signup_completed_count: number;
  converted_count: number;
}

const FUNNEL_STAGES = [
  { key: "landing", label: "Landing", icon: Users, color: "bg-blue-500" },
  { key: "signup_started", label: "Signup Started", icon: UserPlus, color: "bg-indigo-500" },
  { key: "signup_completed", label: "Signup Completed", icon: UserPlus, color: "bg-violet-500" },
  { key: "onboarding_started", label: "Onboarding Started", icon: ClipboardCheck, color: "bg-purple-500" },
  { key: "onboarding_completed", label: "Onboarding Done", icon: ClipboardCheck, color: "bg-fuchsia-500" },
  { key: "trial_started", label: "Trial Started", icon: CreditCard, color: "bg-pink-500" },
  { key: "converted", label: "Converted", icon: TrendingUp, color: "bg-emerald-500" },
];

const ConversionFunnelDashboard = () => {
  const [funnelData, setFunnelData] = useState<FunnelData>({
    landing: 0,
    signup_started: 0,
    signup_completed: 0,
    onboarding_started: 0,
    onboarding_completed: 0,
    trial_started: 0,
    converted: 0,
  });
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdown[]>([]);
  const [dateRange, setDateRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);

  const fetchFunnelData = async () => {
    setIsLoading(true);
    try {
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      // Fetch stage counts
      const stagePromises = FUNNEL_STAGES.map(async (stage) => {
        const { count, error } = await supabase
          .from("funnel_events")
          .select("session_id", { count: "exact", head: true })
          .eq("stage", stage.key)
          .gte("created_at", startDate)
          .lte("created_at", endDate);

        return { stage: stage.key, count: error ? 0 : (count || 0) };
      });

      const results = await Promise.all(stagePromises);
      const newFunnelData = results.reduce((acc, { stage, count }) => {
        acc[stage as keyof FunnelData] = count;
        return acc;
      }, {} as FunnelData);

      setFunnelData(newFunnelData);

      // Fetch source breakdown
      const { data: sources, error: sourcesError } = await supabase
        .from("funnel_events")
        .select("source, medium, campaign, stage")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (!sourcesError && sources) {
        // Aggregate by source/medium/campaign
        const aggregated = sources.reduce((acc, event) => {
          const key = `${event.source || "direct"}-${event.medium || "none"}-${event.campaign || "none"}`;
          if (!acc[key]) {
            acc[key] = {
              source: event.source,
              medium: event.medium,
              campaign: event.campaign,
              landing_count: 0,
              signup_completed_count: 0,
              converted_count: 0,
            };
          }
          if (event.stage === "landing") acc[key].landing_count++;
          if (event.stage === "signup_completed") acc[key].signup_completed_count++;
          if (event.stage === "converted") acc[key].converted_count++;
          return acc;
        }, {} as Record<string, SourceBreakdown>);

        setSourceBreakdown(
          Object.values(aggregated)
            .sort((a, b) => b.landing_count - a.landing_count)
            .slice(0, 10)
        );
      }
    } catch (err) {
      console.error("Error fetching funnel data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData();
  }, [dateRange]);

  const getConversionRate = (from: number, to: number): string => {
    if (from === 0) return "0%";
    return `${((to / from) * 100).toFixed(1)}%`;
  };

  const getOverallConversion = (): string => {
    return getConversionRate(funnelData.landing, funnelData.converted);
  };

  const maxCount = Math.max(...Object.values(funnelData));

  const exportData = () => {
    const csv = [
      ["Stage", "Count", "Conversion from Previous"],
      ...FUNNEL_STAGES.map((stage, i) => {
        const count = funnelData[stage.key as keyof FunnelData];
        const prevCount = i > 0 ? funnelData[FUNNEL_STAGES[i - 1].key as keyof FunnelData] : count;
        return [stage.label, count, getConversionRate(prevCount, count)];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `funnel-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Conversion Funnel</h2>
          <p className="text-sm text-muted-foreground">
            Track user journey from marketing channels through conversion
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchFunnelData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={exportData}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Visitors</p>
                <p className="text-2xl font-bold text-foreground">{funnelData.landing.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Signups</p>
                <p className="text-2xl font-bold text-foreground">{funnelData.signup_completed.toLocaleString()}</p>
              </div>
              <UserPlus className="w-8 h-8 text-violet-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Conversions</p>
                <p className="text-2xl font-bold text-foreground">{funnelData.converted.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
                <p className="text-2xl font-bold text-emerald-500">{getOverallConversion()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Funnel Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {FUNNEL_STAGES.map((stage, index) => {
              const count = funnelData[stage.key as keyof FunnelData];
              const prevCount =
                index > 0 ? funnelData[FUNNEL_STAGES[index - 1].key as keyof FunnelData] : count;
              const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
              const Icon = stage.icon;

              return (
                <div key={stage.key} className="relative">
                  <div className="flex items-center gap-4">
                    {/* Stage info */}
                    <div className="w-40 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${stage.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{stage.label}</span>
                    </div>

                    {/* Bar */}
                    <div className="flex-1 h-10 bg-muted/30 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`h-full ${stage.color} opacity-80`}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        <span className="text-sm font-bold text-foreground">{count.toLocaleString()}</span>
                        {index > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {getConversionRate(prevCount, count)} from prev
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < FUNNEL_STAGES.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Source Breakdown */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Traffic Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sourceBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No traffic data available for the selected period
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Source</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Medium</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Campaign</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Visitors</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Signups</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Conversions</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceBreakdown.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/20 hover:bg-muted/20"
                    >
                      <td className="py-3 px-2">
                        <Badge variant="secondary">{row.source || "Direct"}</Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{row.medium || "-"}</td>
                      <td className="py-3 px-2 text-muted-foreground">{row.campaign || "-"}</td>
                      <td className="py-3 px-2 text-right font-medium">{row.landing_count}</td>
                      <td className="py-3 px-2 text-right">{row.signup_completed_count}</td>
                      <td className="py-3 px-2 text-right text-emerald-500 font-medium">
                        {row.converted_count}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Badge
                          variant="outline"
                          className={
                            row.converted_count / row.landing_count > 0.05
                              ? "border-emerald-500 text-emerald-500"
                              : ""
                          }
                        >
                          {getConversionRate(row.landing_count, row.converted_count)}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionFunnelDashboard;
