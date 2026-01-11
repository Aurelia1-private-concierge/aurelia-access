import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Calendar, 
  Clock, 
  Globe,
  CheckCircle,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Instagram,
  Linkedin,
  Twitter,
  Facebook
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AutomationRule {
  id: string;
  name: string;
  platform: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

const AutomatedPosting = () => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: "1",
      name: "Weekly Luxury Insights",
      platform: "linkedin",
      trigger: "Every Monday 9:00 AM",
      action: "Post curated industry insights",
      enabled: true,
      lastRun: "2026-01-06 09:00",
      nextRun: "2026-01-13 09:00",
    },
    {
      id: "2",
      name: "Daily Destination Spotlight",
      platform: "instagram",
      trigger: "Daily 6:00 PM",
      action: "Share destination highlights",
      enabled: true,
      lastRun: "2026-01-10 18:00",
      nextRun: "2026-01-11 18:00",
    },
    {
      id: "3",
      name: "Event Announcements",
      platform: "twitter",
      trigger: "On new event creation",
      action: "Tweet event details with link",
      enabled: true,
      lastRun: "2026-01-09 14:30",
    },
    {
      id: "4",
      name: "Client Success Stories",
      platform: "facebook",
      trigger: "Bi-weekly Friday 10:00 AM",
      action: "Share anonymized testimonials",
      enabled: false,
      nextRun: "2026-01-17 10:00",
    },
    {
      id: "5",
      name: "Market Updates",
      platform: "linkedin",
      trigger: "On market news trigger",
      action: "Post market analysis",
      enabled: true,
      lastRun: "2026-01-08 11:45",
    },
  ]);

  const [isConnecting, setIsConnecting] = useState(false);

  const platformIcons: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
  };

  const platformColors: Record<string, string> = {
    instagram: "text-pink-500",
    linkedin: "text-blue-600",
    twitter: "text-sky-500",
    facebook: "text-blue-500",
  };

  const toggleRule = (id: string) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
    toast.success("Automation rule updated");
  };

  const runNow = (id: string) => {
    toast.success("Running automation immediately...");
    // Simulate running
    setTimeout(() => {
      setAutomationRules(prev =>
        prev.map(rule =>
          rule.id === id 
            ? { ...rule, lastRun: new Date().toISOString().slice(0, 16).replace('T', ' ') }
            : rule
        )
      );
      toast.success("Automation completed successfully");
    }, 2000);
  };

  const handleConnectPlatform = (platform: string) => {
    setIsConnecting(true);
    toast.info(`Connecting to ${platform}...`);
    setTimeout(() => {
      setIsConnecting(false);
      toast.success(`${platform} connected successfully`);
    }, 2000);
  };

  // Automation statistics
  const stats = {
    totalAutomations: automationRules.length,
    activeAutomations: automationRules.filter(r => r.enabled).length,
    postsThisWeek: 24,
    engagementRate: "4.2%",
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Automations", value: stats.totalAutomations, icon: Zap },
          { label: "Active Rules", value: stats.activeAutomations, icon: CheckCircle },
          { label: "Posts This Week", value: stats.postsThisWeek, icon: Calendar },
          { label: "Avg. Engagement", value: stats.engagementRate, icon: RefreshCw },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Connected Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Connected Platforms
          </CardTitle>
          <CardDescription>
            Manage your social media platform connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { name: "LinkedIn", id: "linkedin", connected: true, posts: 156 },
              { name: "Instagram", id: "instagram", connected: true, posts: 89 },
              { name: "X (Twitter)", id: "twitter", connected: true, posts: 234 },
              { name: "Facebook", id: "facebook", connected: false, posts: 0 },
            ].map(platform => (
              <div 
                key={platform.id}
                className={`p-4 border rounded-lg ${platform.connected ? 'border-green-500/30 bg-green-500/5' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-center gap-2 ${platformColors[platform.id]}`}>
                    {platformIcons[platform.id]}
                    <span className="font-medium">{platform.name}</span>
                  </div>
                  {platform.connected ? (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline">Disconnected</Badge>
                  )}
                </div>
                {platform.connected ? (
                  <p className="text-sm text-muted-foreground">
                    {platform.posts} posts published
                  </p>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => handleConnectPlatform(platform.name)}
                    disabled={isConnecting}
                  >
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Automation Rules
              </CardTitle>
              <CardDescription>
                Configure automated posting schedules and triggers
              </CardDescription>
            </div>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Add New Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationRules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border rounded-lg ${rule.enabled ? 'bg-card' : 'bg-muted/50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={platformColors[rule.platform]}>
                      {platformIcons[rule.platform]}
                    </div>
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">{rule.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {rule.trigger}
                      </div>
                      {rule.lastRun && (
                        <p className="text-xs text-muted-foreground">
                          Last run: {rule.lastRun}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => runNow(rule.id)}
                        disabled={!rule.enabled}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                    </div>
                  </div>
                </div>
                {rule.nextRun && rule.enabled && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Next scheduled: {rule.nextRun}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Scheduled Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "Today 6:00 PM", platform: "instagram", content: "Santorini sunset experiences..." },
              { time: "Tomorrow 9:00 AM", platform: "linkedin", content: "Luxury market insights Q1 2026..." },
              { time: "Jan 13 10:00 AM", platform: "twitter", content: "New yacht collection announcement..." },
              { time: "Jan 14 2:00 PM", platform: "facebook", content: "Client testimonial spotlight..." },
            ].map((post, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={platformColors[post.platform]}>
                    {platformIcons[post.platform]}
                  </div>
                  <div>
                    <p className="text-sm">{post.content}</p>
                    <p className="text-xs text-muted-foreground">{post.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm">
                    <Pause className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedPosting;
