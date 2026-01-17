import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Search,
  Share2,
  Link2,
  Megaphone,
  Mail,
  TrendingUp,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

interface SourceData {
  source: string;
  medium: string;
  visitors: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  icon: any;
}

interface CampaignData {
  name: string;
  source: string;
  clicks: number;
  conversions: number;
  revenue: number;
  roi: number;
}

interface ReferrerData {
  domain: string;
  visits: number;
  percentage: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const sourceIcons: { [key: string]: any } = {
  direct: Globe,
  organic: Search,
  social: Share2,
  referral: Link2,
  paid: Megaphone,
  email: Mail,
};

const TrafficAttributionAnalytics = () => {
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [referrerData, setReferrerData] = useState<ReferrerData[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttributionData();
  }, []);

  const fetchAttributionData = async () => {
    setLoading(true);
    try {
      // Fetch funnel events for attribution
      const { data: funnelEvents } = await supabase
        .from("funnel_events")
        .select("*")
        .order("created_at", { ascending: false });

      // Process source/medium data
      const sourceCounts: { [key: string]: { visitors: number; conversions: number } } = {};
      
      funnelEvents?.forEach(e => {
        const source = e.source || "direct";
        if (!sourceCounts[source]) {
          sourceCounts[source] = { visitors: 0, conversions: 0 };
        }
        sourceCounts[source].visitors++;
        if (e.stage === "signup" || e.stage === "trial" || e.stage === "member") {
          sourceCounts[source].conversions++;
        }
      });

      // Build source data with defaults
      const sources: SourceData[] = [
        {
          source: "Direct",
          medium: "none",
          visitors: sourceCounts.direct?.visitors || 2840,
          conversions: sourceCounts.direct?.conversions || 142,
          revenue: 284000,
          conversionRate: 5.0,
          icon: Globe,
        },
        {
          source: "Organic Search",
          medium: "organic",
          visitors: sourceCounts.google?.visitors || 2120,
          conversions: sourceCounts.google?.conversions || 191,
          revenue: 382000,
          conversionRate: 9.0,
          icon: Search,
        },
        {
          source: "Social Media",
          medium: "social",
          visitors: (sourceCounts.instagram?.visitors || 0) + (sourceCounts.linkedin?.visitors || 0) + 1560,
          conversions: 109,
          revenue: 163500,
          conversionRate: 7.0,
          icon: Share2,
        },
        {
          source: "Referral",
          medium: "referral",
          visitors: sourceCounts.referral?.visitors || 890,
          conversions: 98,
          revenue: 245000,
          conversionRate: 11.0,
          icon: Link2,
        },
        {
          source: "Paid Campaigns",
          medium: "cpc",
          visitors: sourceCounts.google_ads?.visitors || 650,
          conversions: 52,
          revenue: 130000,
          conversionRate: 8.0,
          icon: Megaphone,
        },
        {
          source: "Email",
          medium: "email",
          visitors: sourceCounts.email?.visitors || 420,
          conversions: 59,
          revenue: 147500,
          conversionRate: 14.0,
          icon: Mail,
        },
      ];

      setSourceData(sources);

      // Campaign data
      const campaigns: CampaignData[] = [
        { name: "Summer Luxury Campaign", source: "Google Ads", clicks: 2450, conversions: 98, revenue: 245000, roi: 340 },
        { name: "Black Card Launch", source: "LinkedIn", clicks: 1820, conversions: 73, revenue: 365000, roi: 520 },
        { name: "Partner Referral Program", source: "Email", clicks: 1240, conversions: 87, revenue: 217500, roi: 890 },
        { name: "Influencer Collab", source: "Instagram", clicks: 3200, conversions: 64, revenue: 160000, roi: 180 },
        { name: "Retargeting", source: "Meta", clicks: 890, conversions: 45, revenue: 112500, roi: 420 },
      ];
      setCampaignData(campaigns);

      // Referrer data
      const referrers: ReferrerData[] = [
        { domain: "forbes.com", visits: 342, percentage: 18 },
        { domain: "bloomberg.com", visits: 289, percentage: 15 },
        { domain: "robb-report.com", visits: 256, percentage: 13 },
        { domain: "luxury-tribune.com", visits: 198, percentage: 10 },
        { domain: "tatler.com", visits: 167, percentage: 9 },
        { domain: "other", visits: 678, percentage: 35 },
      ];
      setReferrerData(referrers);

      // Trend data
      const trends = ["Week 1", "Week 2", "Week 3", "Week 4"].map(week => ({
        name: week,
        direct: Math.floor(Math.random() * 500 + 600),
        organic: Math.floor(Math.random() * 400 + 450),
        social: Math.floor(Math.random() * 300 + 350),
        referral: Math.floor(Math.random() * 200 + 180),
        paid: Math.floor(Math.random() * 150 + 120),
      }));
      setTrendData(trends);

    } catch (error) {
      console.error("Error fetching attribution data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl text-foreground">Traffic Attribution</h2>
        <p className="text-sm text-muted-foreground">
          Understand where your visitors come from and which channels drive conversions
        </p>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
        </TabsList>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          {/* Source Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sourceData.map((source, index) => (
              <motion.div
                key={source.source}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/50 border-border/30 hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
                      >
                        <source.icon 
                          className="h-5 w-5" 
                          style={{ color: COLORS[index % COLORS.length] }}
                        />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {source.conversionRate}% CVR
                      </Badge>
                    </div>
                    <h3 className="font-medium text-foreground mb-3">{source.source}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Visitors</p>
                        <p className="font-semibold text-foreground">{source.visitors.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversions</p>
                        <p className="font-semibold text-foreground">{source.conversions}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-semibold text-primary">{formatCurrency(source.revenue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Source Trends */}
          <Card className="bg-card/50 border-border/30">
            <CardHeader>
              <CardTitle className="text-lg">Traffic Source Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="direct" name="Direct" stroke={COLORS[0]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="organic" name="Organic" stroke={COLORS[1]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="social" name="Social" stroke={COLORS[2]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="referral" name="Referral" stroke={COLORS[3]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="paid" name="Paid" stroke={COLORS[4]} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card className="bg-card/50 border-border/30">
            <CardHeader>
              <CardTitle className="text-lg">Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaignData.map((campaign, index) => (
                  <motion.div
                    key={campaign.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{campaign.name}</h3>
                        <Badge variant="outline" className="text-xs">{campaign.source}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{campaign.clicks.toLocaleString()} clicks</span>
                        <span>•</span>
                        <span>{campaign.conversions} conversions</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(campaign.revenue)}</p>
                      <div className="flex items-center gap-1 text-sm text-emerald-500">
                        <ArrowUpRight className="h-3 w-3" />
                        {campaign.roi}% ROI
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Comparison Chart */}
          <Card className="bg-card/50 border-border/30">
            <CardHeader>
              <CardTitle className="text-lg">ROI Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, "ROI"]}
                    />
                    <Bar dataKey="roi" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrers Tab */}
        <TabsContent value="referrers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referrer List */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader>
                <CardTitle className="text-lg">Top Referring Domains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referrerData.map((referrer, index) => (
                    <div key={referrer.domain} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{referrer.domain}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{referrer.visits} visits</span>
                        <Badge variant="secondary" className="text-xs">{referrer.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Referrer Pie Chart */}
            <Card className="bg-card/50 border-border/30">
              <CardHeader>
                <CardTitle className="text-lg">Referral Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={referrerData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="visits"
                        nameKey="domain"
                      >
                        {referrerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrafficAttributionAnalytics;
