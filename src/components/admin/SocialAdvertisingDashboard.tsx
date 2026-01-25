import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { Share2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocialAdvertising } from "@/hooks/useSocialAdvertising";

// Import sub-components
import PlatformConnector from "./social/PlatformConnector";
import CampaignBuilder from "./social/CampaignBuilder";
import ContentCalendar from "./social/ContentCalendar";
import EngagementMetrics from "./social/EngagementMetrics";
import AIContentGenerator from "./social/AIContentGenerator";

const SocialAdvertisingDashboard = forwardRef<HTMLDivElement>((_, ref) => {
  const {
    loading,
    accounts,
    campaigns,
    posts,
    fetchData,
    createCampaign,
    createPost,
    publishPost,
    generateContent,
    getAnalyticsSummary,
  } = useSocialAdvertising();

  const analytics = getAnalyticsSummary();

  if (loading) {
    return (
      <div ref={ref} className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading social advertising suite...</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2 flex items-center gap-3">
            <Share2 className="h-8 w-8 text-primary" />
            Social Advertising Suite
          </h1>
          <p className="text-muted-foreground">
            Multi-platform publishing system for UHNWI audience engagement
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </motion.div>

      {/* Quick Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {[
          { label: "Connected Accounts", value: analytics.connectedAccounts, color: "text-blue-500" },
          { label: "Active Campaigns", value: analytics.activeCampaigns, color: "text-green-500" },
          { label: "Scheduled Posts", value: analytics.scheduledPosts, color: "text-purple-500" },
          { label: "Published", value: analytics.publishedPosts, color: "text-primary" },
          { label: "Total Engagement", value: analytics.totalEngagement, color: "text-red-500" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="p-4 bg-card border border-border/50 rounded-lg text-center"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="bg-card border border-border/50 h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="ai-generator">AI Generator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="platforms">Platform Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <ContentCalendar
            posts={posts}
            onCreatePost={createPost}
            onPublishPost={publishPost}
          />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignBuilder
            campaigns={campaigns}
            onCreateCampaign={createCampaign}
          />
        </TabsContent>

        <TabsContent value="ai-generator">
          <AIContentGenerator onGenerate={generateContent} />
        </TabsContent>

        <TabsContent value="analytics">
          <EngagementMetrics analytics={analytics} />
        </TabsContent>

        <TabsContent value="platforms">
          <PlatformConnector
            accounts={accounts}
            onRefresh={fetchData}
            onConnect={(platform) => {
              console.log("Connect", platform);
            }}
            onDisconnect={(accountId) => {
              console.log("Disconnect", accountId);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* UHNWI Targeting Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg"
      >
        <h3 className="font-serif text-lg mb-2">🎯 UHNWI Targeting Active</h3>
        <p className="text-sm text-muted-foreground mb-4">
          All campaigns are optimized for ultra-high-net-worth audiences across configured platforms.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-background/50 rounded-full text-xs">C-Suite Executives</span>
          <span className="px-3 py-1 bg-background/50 rounded-full text-xs">Family Offices</span>
          <span className="px-3 py-1 bg-background/50 rounded-full text-xs">$30M+ Net Worth</span>
          <span className="px-3 py-1 bg-background/50 rounded-full text-xs">Private Equity</span>
          <span className="px-3 py-1 bg-background/50 rounded-full text-xs">r/fatFIRE</span>
        </div>
      </motion.div>
    </div>
  );
});

SocialAdvertisingDashboard.displayName = "SocialAdvertisingDashboard";

export default SocialAdvertisingDashboard;
