import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Heart, MessageCircle, Share2, Eye, Users, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PLATFORM_INFO, SocialPlatform } from "@/hooks/useSocialAdvertising";

interface AnalyticsSummary {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  failedPosts: number;
  totalEngagement: number;
  platformBreakdown: Array<{
    platform: SocialPlatform;
    count: number;
    published: number;
  }>;
  activeCampaigns: number;
  connectedAccounts: number;
}

interface EngagementMetricsProps {
  analytics: AnalyticsSummary;
}

const EngagementMetrics = forwardRef<HTMLDivElement, EngagementMetricsProps>(
  ({ analytics }, ref) => {
    const publishRate = analytics.totalPosts > 0 
      ? Math.round((analytics.publishedPosts / analytics.totalPosts) * 100)
      : 0;

    const successRate = (analytics.publishedPosts + analytics.failedPosts) > 0
      ? Math.round((analytics.publishedPosts / (analytics.publishedPosts + analytics.failedPosts)) * 100)
      : 100;

    const stats = [
      { 
        label: "Total Posts", 
        value: analytics.totalPosts, 
        icon: BarChart3,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10" 
      },
      { 
        label: "Published", 
        value: analytics.publishedPosts, 
        icon: TrendingUp,
        color: "text-green-500",
        bgColor: "bg-green-500/10"
      },
      { 
        label: "Scheduled", 
        value: analytics.scheduledPosts, 
        icon: Target,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10"
      },
      { 
        label: "Engagement", 
        value: analytics.totalEngagement, 
        icon: Heart,
        color: "text-red-500",
        bgColor: "bg-red-500/10"
      },
    ];

    return (
      <Card ref={ref} className="border-border/50">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Engagement Analytics
          </CardTitle>
          <CardDescription>
            Cross-platform performance metrics for UHNWI campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${stat.bgColor}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="p-4 border border-border/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Publish Rate</span>
                <span className="text-sm text-muted-foreground">{publishRate}%</span>
              </div>
              <Progress value={publishRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {analytics.publishedPosts} of {analytics.totalPosts} posts published
              </p>
            </div>
            <div className="p-4 border border-border/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-sm text-muted-foreground">{successRate}%</span>
              </div>
              <Progress 
                value={successRate} 
                className={`h-2 ${successRate < 80 ? "[&>div]:bg-yellow-500" : ""}`} 
              />
              <p className="text-xs text-muted-foreground mt-2">
                {analytics.failedPosts} failed attempts
              </p>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Platform Distribution</h4>
            <div className="space-y-3">
              {analytics.platformBreakdown
                .filter(p => p.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((platform, index) => {
                  const info = PLATFORM_INFO[platform.platform];
                  const percentage = analytics.totalPosts > 0 
                    ? Math.round((platform.count / analytics.totalPosts) * 100)
                    : 0;

                  return (
                    <motion.div
                      key={platform.platform}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: info.color + "20" }}
                      >
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{info.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {platform.count} posts ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: info.color,
                            }}
                          />
                        </div>
                      </div>
                      <Badge 
                        variant={platform.published > 0 ? "default" : "outline"}
                        className="text-xs"
                      >
                        {platform.published} live
                      </Badge>
                    </motion.div>
                  );
                })}

              {analytics.platformBreakdown.every(p => p.count === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No posts yet. Start creating content to see platform analytics.
                </p>
              )}
            </div>
          </div>

          {/* Campaign & Account Summary */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{analytics.activeCampaigns}</p>
                <p className="text-xs text-muted-foreground">Active Campaigns</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{analytics.connectedAccounts}</p>
                <p className="text-xs text-muted-foreground">Connected Accounts</p>
              </div>
            </div>
          </div>

          {/* Engagement Breakdown (placeholder - would need real data) */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium mb-3">Engagement Types</h4>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Heart, label: "Likes", value: 0, color: "text-red-500" },
                { icon: MessageCircle, label: "Comments", value: 0, color: "text-blue-500" },
                { icon: Share2, label: "Shares", value: 0, color: "text-green-500" },
                { icon: Eye, label: "Views", value: 0, color: "text-purple-500" },
              ].map((metric) => (
                <div key={metric.label} className="text-center p-3 rounded-lg bg-muted/30">
                  <metric.icon className={`h-5 w-5 mx-auto mb-1 ${metric.color}`} />
                  <p className="text-lg font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

EngagementMetrics.displayName = "EngagementMetrics";

export default EngagementMetrics;
