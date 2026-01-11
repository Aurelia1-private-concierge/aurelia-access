import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  TrendingUp,
  MousePointerClick,
  Users,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface CampaignData {
  source: string;
  signups: number;
  conversionRate: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const CampaignAnalytics = () => {
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Pre-defined campaign links for easy copy
  const campaignLinks = [
    { name: "Instagram Bio", url: "/?utm_source=instagram&utm_medium=social&utm_campaign=bio_link" },
    { name: "LinkedIn Post", url: "/?utm_source=linkedin&utm_medium=social&utm_campaign=organic" },
    { name: "Twitter/X", url: "/?utm_source=twitter&utm_medium=social&utm_campaign=launch" },
    { name: "Luxury Travel", url: "/c/luxury-travel?utm_source=ads&utm_medium=paid" },
    { name: "VIP Events", url: "/c/vip-events?utm_source=ads&utm_medium=paid" },
    { name: "Wealth Network", url: "/c/wealth-management?utm_source=referral&utm_medium=network" },
    { name: "Email Newsletter", url: "/?utm_source=email&utm_medium=newsletter&utm_campaign=launch" },
    { name: "WhatsApp Share", url: "/?utm_source=whatsapp&utm_medium=referral" },
  ];

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const fetchCampaignData = async () => {
    setLoading(true);
    try {
      const { data: signups, error } = await supabase
        .from("launch_signups")
        .select("source, created_at");

      if (error) throw error;

      // Group by source
      const sourceMap: Record<string, number> = {};
      (signups || []).forEach((signup) => {
        const source = signup.source || "direct";
        sourceMap[source] = (sourceMap[source] || 0) + 1;
      });

      // Convert to array and sort
      const data = Object.entries(sourceMap)
        .map(([source, signups]) => ({
          source: formatSource(source),
          signups,
          conversionRate: Math.random() * 15 + 5, // Placeholder
        }))
        .sort((a, b) => b.signups - a.signups);

      setCampaignData(data);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSource = (source: string) => {
    return source
      .replace(/_/g, " ")
      .replace(/utm/gi, "")
      .replace(/campaign/gi, "")
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase()) || "Direct";
  };

  const handleCopyLink = async (name: string, path: string) => {
    const fullUrl = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(name);
      toast({ title: "Copied!", description: `${name} link copied to clipboard` });
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
    }
  };

  const totalSignups = campaignData.reduce((sum, c) => sum + c.signups, 0);
  const topSource = campaignData[0]?.source || "None";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          Campaign Analytics
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Track UTM campaigns, referral sources, and conversion rates
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{totalSignups}</p>
                <p className="text-xs text-muted-foreground">Total Signups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{campaignData.length}</p>
                <p className="text-xs text-muted-foreground">Active Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MousePointerClick className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground truncate max-w-[100px]">{topSource}</p>
                <p className="text-xs text-muted-foreground">Top Source</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <ExternalLink className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{campaignLinks.length}</p>
                <p className="text-xs text-muted-foreground">Ready Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution Chart */}
        <Card className="bg-card/50 border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">Signups by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignData.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="source" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="signups" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Source Pie Chart */}
        <Card className="bg-card/50 border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">Source Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={campaignData.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="signups"
                    nameKey="source"
                    label={({ source }) => source}
                  >
                    {campaignData.slice(0, 5).map((_, index) => (
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Links */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Ready-to-Use Campaign Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campaignLinks.map((link) => (
              <div
                key={link.name}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{link.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {window.location.origin}{link.url}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopyLink(link.name, link.url)}
                >
                  {copiedLink === link.name ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">All Campaign Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Signups</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignData.map((campaign, index) => (
                <TableRow key={campaign.source}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {campaign.source}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{campaign.signups}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {totalSignups > 0 ? ((campaign.signups / totalSignups) * 100).toFixed(1) : 0}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignAnalytics;
