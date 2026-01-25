import React, { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { Target, Calendar, DollarSign, Sparkles, Plus, Play, Pause } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialCampaign, SocialPlatform, PLATFORM_INFO, AUDIENCE_PRESETS } from "@/hooks/useSocialAdvertising";

interface CampaignBuilderProps {
  campaigns: SocialCampaign[];
  onCreateCampaign: (campaign: Partial<SocialCampaign>) => Promise<unknown>;
}

const CampaignBuilder = forwardRef<HTMLDivElement, CampaignBuilderProps>(
  ({ campaigns, onCreateCampaign }, ref) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      campaign_type: "awareness",
      target_platforms: [] as SocialPlatform[],
      audience_preset: "",
      budget_cents: 0,
      start_date: "",
      end_date: "",
    });

    const handleCreate = async () => {
      if (!formData.name || formData.target_platforms.length === 0) return;
      
      setCreating(true);
      try {
        const audienceData = formData.audience_preset 
          ? AUDIENCE_PRESETS[formData.audience_preset as keyof typeof AUDIENCE_PRESETS]?.targeting || {}
          : {};

        await onCreateCampaign({
          name: formData.name,
          description: formData.description,
          campaign_type: formData.campaign_type,
          target_platforms: formData.target_platforms,
          target_audience: audienceData,
          budget_cents: formData.budget_cents * 100,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          status: "draft",
        });

        setDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          campaign_type: "awareness",
          target_platforms: [],
          audience_preset: "",
          budget_cents: 0,
          start_date: "",
          end_date: "",
        });
      } finally {
        setCreating(false);
      }
    };

    const togglePlatform = (platform: SocialPlatform) => {
      setFormData(prev => ({
        ...prev,
        target_platforms: prev.target_platforms.includes(platform)
          ? prev.target_platforms.filter(p => p !== platform)
          : [...prev.target_platforms, platform],
      }));
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "active": return "bg-green-500/10 text-green-500";
        case "paused": return "bg-yellow-500/10 text-yellow-500";
        case "completed": return "bg-blue-500/10 text-blue-500";
        case "archived": return "bg-gray-500/10 text-gray-500";
        default: return "bg-muted text-muted-foreground";
      }
    };

    return (
      <Card ref={ref} className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Campaign Manager
              </CardTitle>
              <CardDescription>
                Create and manage multi-platform advertising campaigns
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create UHNWI Campaign</DialogTitle>
                  <DialogDescription>
                    Build a targeted advertising campaign for ultra-high-net-worth audiences
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      placeholder="Beyond Ordinary Launch"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Campaign objectives and key messages..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Campaign Type</Label>
                      <Select
                        value={formData.campaign_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="awareness">Brand Awareness</SelectItem>
                          <SelectItem value="engagement">Engagement</SelectItem>
                          <SelectItem value="conversion">Conversion</SelectItem>
                          <SelectItem value="thought-leadership">Thought Leadership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>UHNWI Audience Preset</Label>
                      <Select
                        value={formData.audience_preset}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, audience_preset: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(AUDIENCE_PRESETS).map(([key, preset]) => (
                            <SelectItem key={key} value={key}>
                              {preset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Target Platforms</Label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(PLATFORM_INFO) as SocialPlatform[]).map((platform) => (
                        <div
                          key={platform}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                            formData.target_platforms.includes(platform)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => togglePlatform(platform)}
                        >
                          <Checkbox
                            checked={formData.target_platforms.includes(platform)}
                            onCheckedChange={() => togglePlatform(platform)}
                          />
                          <span>{PLATFORM_INFO[platform].icon}</span>
                          <span className="text-sm">{PLATFORM_INFO[platform].name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="budget">Budget (USD)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="5000"
                        value={formData.budget_cents || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget_cents: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="start">Start Date</Label>
                      <Input
                        id="start"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end">End Date</Label>
                      <Input
                        id="end"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={creating || !formData.name}>
                    {creating ? "Creating..." : "Create Campaign"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No campaigns yet. Create your first UHNWI campaign to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 border border-border/50 rounded-lg hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-foreground">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {campaign.campaign_type}
                        </Badge>
                      </div>
                      {campaign.description && (
                        <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {campaign.target_platforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {PLATFORM_INFO[platform as SocialPlatform]?.icon} {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {campaign.budget_cents && (
                        <div className="text-right mr-4">
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-medium">${(campaign.budget_cents / 100).toLocaleString()}</p>
                        </div>
                      )}
                      {campaign.status === "active" ? (
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pre-built Campaign Templates */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Quick Start Templates
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { name: "Beyond Ordinary Launch", type: "awareness", platforms: ["linkedin", "instagram", "twitter"] },
                { name: "The Circle Promotion", type: "engagement", platforms: ["reddit", "linkedin"] },
                { name: "Prescience AI Showcase", type: "thought-leadership", platforms: ["twitter", "linkedin"] },
                { name: "Partner Spotlight", type: "conversion", platforms: ["instagram", "facebook"] },
              ].map((template) => (
                <div
                  key={template.name}
                  className="p-3 border border-dashed border-border rounded-lg hover:border-primary/50 cursor-pointer transition-all group"
                  onClick={() => {
                    setFormData({
                      name: template.name,
                      description: "",
                      campaign_type: template.type,
                      target_platforms: template.platforms as SocialPlatform[],
                      audience_preset: "",
                      budget_cents: 0,
                      start_date: "",
                      end_date: "",
                    });
                    setDialogOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">
                      {template.name}
                    </span>
                    <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex gap-1 mt-2">
                    {template.platforms.map(p => (
                      <span key={p} className="text-xs">
                        {PLATFORM_INFO[p as SocialPlatform]?.icon}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

CampaignBuilder.displayName = "CampaignBuilder";

export default CampaignBuilder;
