import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  RefreshCw,
  Filter,
  Play,
  Pause,
  Copy,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateCampaignHealth, type StrategyMetrics } from "@/lib/marketing-strategies";

interface Campaign {
  id: string;
  name: string;
  type: "free" | "paid";
  channel: string;
  status: "active" | "paused" | "completed";
  metrics: StrategyMetrics;
  targetCPA?: number;
  budget?: number;
  startDate: string;
  endDate?: string;
}

const CampaignHubDashboard = forwardRef<HTMLDivElement>((_, ref) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  // Generate mock campaigns based on funnel data
  const generateCampaigns = async () => {
    setIsLoading(true);
    try {
      // Fetch funnel events to build campaign data
      const { data: funnelData, error } = await supabase
        .from("funnel_events")
        .select("source, medium, campaign, stage")
        .not("campaign", "is", null)
        .limit(500);

      if (error) throw error;

      // Aggregate by campaign
      const campaignMap = new Map<string, Campaign>();

      if (funnelData) {
        funnelData.forEach(event => {
          const key = event.campaign || "Direct";
          if (!campaignMap.has(key)) {
            campaignMap.set(key, {
              id: key,
              name: key,
              type: event.medium?.includes("cpc") || event.medium?.includes("paid") ? "paid" : "free",
              channel: event.source || "Unknown",
              status: "active",
              metrics: {
                impressions: 0,
                clicks: 0,
                leads: 0,
                conversions: 0,
                spend: 0,
                revenue: 0,
              },
              startDate: new Date().toISOString(),
            });
          }

          const campaign = campaignMap.get(key)!;
          campaign.metrics.impressions += 100;
          campaign.metrics.clicks += 10;
          if (event.stage === "signup_completed") campaign.metrics.leads += 1;
          if (event.stage === "converted") {
            campaign.metrics.conversions += 1;
            campaign.metrics.revenue += 5000;
          }
        });
      }

      // Add sample campaigns if none exist
      if (campaignMap.size === 0) {
        const sampleCampaigns: Campaign[] = [
          {
            id: "linkedin-cxo",
            name: "LinkedIn C-Suite Targeting",
            type: "paid",
            channel: "LinkedIn",
            status: "active",
            metrics: { impressions: 45000, clicks: 890, leads: 45, conversions: 8, spend: 8500, revenue: 40000 },
            targetCPA: 225,
            budget: 10000,
            startDate: "2026-01-01",
          },
          {
            id: "google-luxury",
            name: "Google Luxury Intent",
            type: "paid",
            channel: "Google",
            status: "active",
            metrics: { impressions: 32000, clicks: 640, leads: 32, conversions: 5, spend: 5200, revenue: 25000 },
            targetCPA: 175,
            budget: 6500,
            startDate: "2026-01-01",
          },
          {
            id: "organic-seo",
            name: "SEO Content Marketing",
            type: "free",
            channel: "Organic",
            status: "active",
            metrics: { impressions: 78000, clicks: 2340, leads: 58, conversions: 12, spend: 0, revenue: 60000 },
            startDate: "2026-01-01",
          },
          {
            id: "social-organic",
            name: "Social Media Organic",
            type: "free",
            channel: "Social",
            status: "active",
            metrics: { impressions: 156000, clicks: 4680, leads: 35, conversions: 6, spend: 0, revenue: 30000 },
            startDate: "2026-01-01",
          },
          {
            id: "meta-lookalike",
            name: "Meta Lookalike Audiences",
            type: "paid",
            channel: "Meta",
            status: "paused",
            metrics: { impressions: 28000, clicks: 420, leads: 21, conversions: 3, spend: 4200, revenue: 15000 },
            targetCPA: 140,
            budget: 5500,
            startDate: "2026-01-01",
          },
          {
            id: "referral-program",
            name: "Member Referral Program",
            type: "free",
            channel: "Referral",
            status: "active",
            metrics: { impressions: 5000, clicks: 250, leads: 25, conversions: 8, spend: 0, revenue: 40000 },
            startDate: "2026-01-01",
          },
        ];
        sampleCampaigns.forEach(c => campaignMap.set(c.id, c));
      }

      setCampaigns(Array.from(campaignMap.values()));
    } catch (err) {
      console.error("Error generating campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(c => {
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const totalSpend = campaigns.reduce((sum, c) => sum + c.metrics.spend, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.metrics.leads, 0);
  const overallROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "paused":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getHealthIndicator = (campaign: Campaign) => {
    const health = calculateCampaignHealth(campaign.metrics, campaign.targetCPA);
    if (health.status === "healthy") {
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    } else if (health.status === "warning") {
      return <AlertCircle className="w-4 h-4 text-amber-400" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div ref={ref} className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Campaigns</p>
                <p className="text-2xl font-bold text-foreground">
                  {campaigns.filter(c => c.status === "active").length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Spend</p>
                <p className="text-2xl font-bold text-foreground">${(totalSpend / 1000).toFixed(1)}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</p>
                <p className="text-2xl font-bold text-emerald-400">${(totalRevenue / 1000).toFixed(1)}K</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Conversions</p>
                <p className="text-2xl font-bold text-foreground">{totalConversions}</p>
              </div>
              <Target className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">ROAS</p>
                <p className={`text-2xl font-bold ${overallROAS >= 2 ? "text-emerald-400" : "text-amber-400"}`}>
                  {overallROAS.toFixed(2)}x
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            All Campaigns
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={generateCampaigns}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCampaigns.map((campaign, index) => {
              const health = calculateCampaignHealth(campaign.metrics, campaign.targetCPA);
              const ctr =
                campaign.metrics.impressions > 0
                  ? ((campaign.metrics.clicks / campaign.metrics.impressions) * 100).toFixed(2)
                  : "0";
              const cvr =
                campaign.metrics.clicks > 0
                  ? ((campaign.metrics.conversions / campaign.metrics.clicks) * 100).toFixed(2)
                  : "0";
              const cpa =
                campaign.metrics.conversions > 0
                  ? Math.round(campaign.metrics.spend / campaign.metrics.conversions)
                  : 0;
              const roas =
                campaign.metrics.spend > 0
                  ? (campaign.metrics.revenue / campaign.metrics.spend).toFixed(2)
                  : "∞";

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-border/30 rounded-lg p-4 hover:border-border/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getHealthIndicator(campaign)}
                        <h4 className="font-medium text-foreground">{campaign.name}</h4>
                        <Badge variant="outline" className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={campaign.type === "paid" ? "text-amber-400" : "text-emerald-400"}
                        >
                          {campaign.type === "paid" ? (
                            <DollarSign className="w-3 h-3 mr-1" />
                          ) : (
                            <Zap className="w-3 h-3 mr-1" />
                          )}
                          {campaign.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {campaign.channel}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Impressions</span>
                          <p className="font-medium">{campaign.metrics.impressions.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clicks</span>
                          <p className="font-medium">{campaign.metrics.clicks.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CTR</span>
                          <p className="font-medium">{ctr}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Leads</span>
                          <p className="font-medium">{campaign.metrics.leads}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Conversions</span>
                          <p className="font-medium text-emerald-400">{campaign.metrics.conversions}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CVR</span>
                          <p className="font-medium">{cvr}%</p>
                        </div>
                      </div>

                      {campaign.type === "paid" && (
                        <div className="flex items-center gap-6 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Spend: </span>
                            <span className="font-medium">${campaign.metrics.spend.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">CPA: </span>
                            <span
                              className={`font-medium ${
                                campaign.targetCPA && cpa > campaign.targetCPA
                                  ? "text-red-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              ${cpa}
                            </span>
                            {campaign.targetCPA && (
                              <span className="text-muted-foreground ml-1">(target: ${campaign.targetCPA})</span>
                            )}
                          </div>
                          <div>
                            <span className="text-muted-foreground">ROAS: </span>
                            <span className={`font-medium ${Number(roas) >= 2 ? "text-emerald-400" : "text-amber-400"}`}>
                              {roas}x
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Revenue: </span>
                            <span className="font-medium text-emerald-400">
                              ${campaign.metrics.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {health.issues.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span className="text-sm text-amber-400">{health.issues.join(" • ")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {campaign.status === "active" ? (
                        <Button size="sm" variant="outline" className="text-amber-400">
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-emerald-400">
                          <Play className="w-3 h-3 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filteredCampaigns.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No campaigns found matching the filters.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Free vs Paid Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-emerald-400">
              <Zap className="w-5 h-5" />
              Free Channels Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const freeCampaigns = campaigns.filter(c => c.type === "free");
              const freeLeads = freeCampaigns.reduce((sum, c) => sum + c.metrics.leads, 0);
              const freeConversions = freeCampaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);
              const freeRevenue = freeCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);

              return (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Leads Generated</span>
                    <span className="font-medium">{freeLeads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversions</span>
                    <span className="font-medium text-emerald-400">{freeConversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium">${freeRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="font-medium text-emerald-400">$0</span>
                  </div>
                  <div className="flex justify-between border-t border-border/30 pt-2">
                    <span className="text-muted-foreground">ROI</span>
                    <span className="font-bold text-emerald-400">∞</span>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-amber-400">
              <DollarSign className="w-5 h-5" />
              Paid Channels Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const paidCampaigns = campaigns.filter(c => c.type === "paid");
              const paidSpend = paidCampaigns.reduce((sum, c) => sum + c.metrics.spend, 0);
              const paidLeads = paidCampaigns.reduce((sum, c) => sum + c.metrics.leads, 0);
              const paidConversions = paidCampaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);
              const paidRevenue = paidCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
              const paidRoas = paidSpend > 0 ? (paidRevenue / paidSpend).toFixed(2) : "0";

              return (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Leads Generated</span>
                    <span className="font-medium">{paidLeads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversions</span>
                    <span className="font-medium text-emerald-400">{paidConversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium">${paidRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Spend</span>
                    <span className="font-medium text-amber-400">${paidSpend.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/30 pt-2">
                    <span className="text-muted-foreground">ROAS</span>
                    <span className={`font-bold ${Number(paidRoas) >= 2 ? "text-emerald-400" : "text-amber-400"}`}>
                      {paidRoas}x
                    </span>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

CampaignHubDashboard.displayName = "CampaignHubDashboard";

export default CampaignHubDashboard;
