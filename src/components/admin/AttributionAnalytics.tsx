import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Users, Target, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format, subDays } from "date-fns";

interface AttributionData {
  source: string;
  medium: string;
  campaign: string;
  landings: number;
  signups: number;
  conversions: number;
  conversionRate: number;
}

interface ChannelSummary {
  channel: string;
  visitors: number;
  conversions: number;
  rate: number;
}

const COLORS = ["hsl(var(--primary))", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899"];

const AttributionAnalytics = () => {
  const [dateRange, setDateRange] = useState("7");
  const [attributionData, setAttributionData] = useState<AttributionData[]>([]);
  const [channelData, setChannelData] = useState<ChannelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalLandings: 0,
    totalSignups: 0,
    totalConversions: 0,
    avgConversionRate: 0,
  });

  useEffect(() => {
    fetchAttributionData();
  }, [dateRange]);

  const fetchAttributionData = async () => {
    setLoading(true);
    try {
      const startDate = format(subDays(new Date(), parseInt(dateRange)), "yyyy-MM-dd");

      // Fetch funnel events grouped by source/medium/campaign
      const { data: funnelData, error } = await supabase
        .from("funnel_events")
        .select("*")
        .gte("created_at", startDate);

      if (error) throw error;

      // Process attribution data
      const campaignMap = new Map<string, AttributionData>();
      const channelMap = new Map<string, ChannelSummary>();

      funnelData?.forEach((event) => {
        const source = event.source || "direct";
        const medium = event.medium || "none";
        const campaign = event.campaign || "none";
        const key = `${source}|${medium}|${campaign}`;

        if (!campaignMap.has(key)) {
          campaignMap.set(key, {
            source,
            medium,
            campaign,
            landings: 0,
            signups: 0,
            conversions: 0,
            conversionRate: 0,
          });
        }

        const entry = campaignMap.get(key)!;
        if (event.stage === "landing") entry.landings++;
        if (event.stage === "signup_completed") entry.signups++;
        if (event.stage === "converted" || event.stage === "subscription_started") entry.conversions++;

        // Channel aggregation
        const channelKey = medium || "direct";
        if (!channelMap.has(channelKey)) {
          channelMap.set(channelKey, {
            channel: channelKey,
            visitors: 0,
            conversions: 0,
            rate: 0,
          });
        }

        const channelEntry = channelMap.get(channelKey)!;
        if (event.stage === "landing") channelEntry.visitors++;
        if (event.stage === "converted" || event.stage === "subscription_started") channelEntry.conversions++;
      });

      // Calculate conversion rates
      campaignMap.forEach((entry) => {
        entry.conversionRate = entry.landings > 0 ? (entry.conversions / entry.landings) * 100 : 0;
      });

      channelMap.forEach((entry) => {
        entry.rate = entry.visitors > 0 ? (entry.conversions / entry.visitors) * 100 : 0;
      });

      const processedData = Array.from(campaignMap.values())
        .filter((d) => d.landings > 0)
        .sort((a, b) => b.landings - a.landings);

      const processedChannels = Array.from(channelMap.values())
        .filter((c) => c.visitors > 0)
        .sort((a, b) => b.visitors - a.visitors);

      // Calculate totals
      const totalLandings = processedData.reduce((sum, d) => sum + d.landings, 0);
      const totalSignups = processedData.reduce((sum, d) => sum + d.signups, 0);
      const totalConversions = processedData.reduce((sum, d) => sum + d.conversions, 0);
      const avgConversionRate = totalLandings > 0 ? (totalConversions / totalLandings) * 100 : 0;

      setAttributionData(processedData);
      setChannelData(processedChannels);
      setTotals({ totalLandings, totalSignups, totalConversions, avgConversionRate });
    } catch (err) {
      console.error("Error fetching attribution data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Attribution Analytics</h2>
          <p className="text-muted-foreground text-sm">Track marketing channel performance and ROI</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visitors</p>
                <p className="text-2xl font-bold">{totals.totalLandings.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sign-ups</p>
                <p className="text-2xl font-bold">{totals.totalSignups.toLocaleString()}</p>
              </div>
              <Target className="w-8 h-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{totals.totalConversions.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{totals.avgConversionRate.toFixed(2)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance Bar Chart */}
        <Card className="bg-card/50 border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : channelData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No channel data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={channelData.slice(0, 6)}>
                  <XAxis dataKey="channel" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="visitors" fill="hsl(var(--primary))" name="Visitors" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" fill="#10B981" name="Conversions" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Channel Distribution Pie Chart */}
        <Card className="bg-card/50 border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">Traffic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : channelData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No traffic data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={channelData}
                    dataKey="visitors"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ channel, percent }) => `${channel} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {channelData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Table */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : attributionData.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No campaign data yet. Start using UTM links to track your marketing efforts.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Source</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Medium</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Campaign</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Visitors</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Sign-ups</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Conversions</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {attributionData.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-b border-border/20 hover:bg-card/30">
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {row.source}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {row.medium}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-foreground">
                        {row.campaign !== "none" ? row.campaign : "-"}
                      </td>
                      <td className="py-3 px-2 text-right font-mono">{row.landings}</td>
                      <td className="py-3 px-2 text-right font-mono">{row.signups}</td>
                      <td className="py-3 px-2 text-right font-mono">{row.conversions}</td>
                      <td className="py-3 px-2 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-mono ${
                            row.conversionRate > 5
                              ? "text-green-500"
                              : row.conversionRate > 2
                              ? "text-amber-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {row.conversionRate.toFixed(1)}%
                          {row.conversionRate > 5 && <ArrowUpRight className="w-3 h-3" />}
                        </span>
                      </td>
                    </tr>
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

export default AttributionAnalytics;
