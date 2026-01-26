import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import {
  Ear,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Users,
  RefreshCw,
  Filter,
  ExternalLink,
  Heart,
  Share2,
  AlertCircle,
  Smile,
  Frown,
  Meh,
  Hash,
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
import { useToast } from "@/hooks/use-toast";

interface Mention {
  id: string;
  platform: string;
  author: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  engagement: number;
  url?: string;
  timestamp: string;
}

interface CompetitorActivity {
  name: string;
  mentions: number;
  sentimentScore: number;
  topTopics: string[];
}

interface TrendingTopic {
  topic: string;
  volume: number;
  change: number;
  sentiment: "positive" | "neutral" | "negative";
}

const SocialListeningPanel = forwardRef<HTMLDivElement>((_, ref) => {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorActivity[]>([]);
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchSocialData = async () => {
    setIsLoading(true);
    try {
      // Sample data for demonstration
      const sampleMentions: Mention[] = [
        {
          id: "1",
          platform: "LinkedIn",
          author: "Sarah M.",
          content: "Just experienced @Aurelia's yacht charter service. Absolutely impeccable attention to detail!",
          sentiment: "positive",
          engagement: 245,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "2",
          platform: "X",
          author: "JohnDoe_Luxury",
          content: "Comparing luxury concierge services - Aurelia seems to have the edge on personalization",
          sentiment: "positive",
          engagement: 89,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "3",
          platform: "Reddit",
          author: "fatFIRE_member",
          content: "Has anyone tried Aurelia? Looking for a new concierge service after Quintessentially dropped the ball",
          sentiment: "neutral",
          engagement: 156,
          timestamp: new Date(Date.now() - 14400000).toISOString(),
        },
        {
          id: "4",
          platform: "Instagram",
          author: "luxury_lifestyle_22",
          content: "The private jet booking through Aurelia was seamless. Highly recommend! ✈️",
          sentiment: "positive",
          engagement: 892,
          timestamp: new Date(Date.now() - 28800000).toISOString(),
        },
        {
          id: "5",
          platform: "LinkedIn",
          author: "Michael T.",
          content: "Slow response times from Aurelia this week. Hope it's not a pattern.",
          sentiment: "negative",
          engagement: 12,
          timestamp: new Date(Date.now() - 43200000).toISOString(),
        },
      ];

      const sampleCompetitors: CompetitorActivity[] = [
        {
          name: "Quintessentially",
          mentions: 342,
          sentimentScore: 68,
          topTopics: ["pricing concerns", "global coverage", "membership perks"],
        },
        {
          name: "Velocity Black",
          mentions: 256,
          sentimentScore: 75,
          topTopics: ["app experience", "travel bookings", "responsiveness"],
        },
        {
          name: "John Paul Group",
          mentions: 189,
          sentimentScore: 72,
          topTopics: ["corporate clients", "reliability", "luxury hotels"],
        },
        {
          name: "Ten Lifestyle Group",
          mentions: 145,
          sentimentScore: 70,
          topTopics: ["credit card perks", "dining reservations", "global reach"],
        },
      ];

      const sampleTrends: TrendingTopic[] = [
        { topic: "Private Aviation", volume: 12500, change: 24, sentiment: "positive" },
        { topic: "Luxury Travel 2026", volume: 8900, change: 18, sentiment: "positive" },
        { topic: "Concierge Services", volume: 5600, change: -5, sentiment: "neutral" },
        { topic: "Yacht Charter", volume: 4200, change: 32, sentiment: "positive" },
        { topic: "Exclusive Events", volume: 3800, change: 15, sentiment: "positive" },
        { topic: "Personal Assistant", volume: 2900, change: -8, sentiment: "neutral" },
      ];

      setMentions(sampleMentions);
      setCompetitors(sampleCompetitors);
      setTrends(sampleTrends);
    } catch (err) {
      console.error("Error fetching social data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialData();
  }, []);

  const filteredMentions = mentions.filter(m => {
    if (platformFilter !== "all" && m.platform.toLowerCase() !== platformFilter) return false;
    if (sentimentFilter !== "all" && m.sentiment !== sentimentFilter) return false;
    return true;
  });

  const sentimentStats = {
    positive: mentions.filter(m => m.sentiment === "positive").length,
    neutral: mentions.filter(m => m.sentiment === "neutral").length,
    negative: mentions.filter(m => m.sentiment === "negative").length,
  };

  const totalMentions = mentions.length;
  const overallSentiment =
    totalMentions > 0
      ? Math.round(
          ((sentimentStats.positive * 100 + sentimentStats.neutral * 50) / totalMentions)
        )
      : 0;

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Smile className="w-4 h-4 text-emerald-400" />;
      case "negative":
        return <Frown className="w-4 h-4 text-red-400" />;
      default:
        return <Meh className="w-4 h-4 text-amber-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "x":
        return "bg-foreground/20 text-foreground border-foreground/30";
      case "instagram":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "reddit":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div ref={ref} className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Mentions</p>
                <p className="text-2xl font-bold text-foreground">{totalMentions}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Sentiment Score</p>
                <p className={`text-2xl font-bold ${overallSentiment >= 70 ? "text-emerald-400" : overallSentiment >= 50 ? "text-amber-400" : "text-red-400"}`}>
                  {overallSentiment}%
                </p>
              </div>
              <Smile className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Positive</p>
                <p className="text-2xl font-bold text-emerald-400">{sentimentStats.positive}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Negative</p>
                <p className="text-2xl font-bold text-red-400">{sentimentStats.negative}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Topics */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Trending Topics in Luxury Concierge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {trends.map((trend, index) => (
              <motion.div
                key={trend.topic}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border border-border/30 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{trend.topic}</span>
                  {getSentimentIcon(trend.sentiment)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{trend.volume.toLocaleString()} mentions</span>
                  <span className={trend.change >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {trend.change >= 0 ? "+" : ""}{trend.change}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitor Activity */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Users className="w-5 h-5" />
            Competitor Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <motion.div
                key={competitor.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 border border-border/30 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{competitor.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {competitor.mentions} mentions
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {competitor.topTopics.map((topic, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Sentiment</p>
                  <div className="flex items-center gap-2">
                    <Progress value={competitor.sentimentScore} className="w-20 h-2" />
                    <span className={`font-medium ${competitor.sentimentScore >= 70 ? "text-emerald-400" : "text-amber-400"}`}>
                      {competitor.sentimentScore}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Mentions */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Ear className="w-5 h-5" />
            Brand Mentions
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="x">X</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchSocialData}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMentions.map((mention, index) => (
              <motion.div
                key={mention.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border/30 rounded-lg p-4 hover:border-border/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className={getPlatformColor(mention.platform)}>
                        {mention.platform}
                      </Badge>
                      <span className="text-sm font-medium">{mention.author}</span>
                      <Badge variant="outline" className={getSentimentColor(mention.sentiment)}>
                        {getSentimentIcon(mention.sentiment)}
                        <span className="ml-1 capitalize">{mention.sentiment}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground mb-2">{mention.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {mention.engagement} engagements
                      </span>
                      <span>
                        {new Date(mention.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {mention.url && (
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}

            {filteredMentions.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No mentions found matching the filters.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Opportunities */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2 text-primary">
            <Share2 className="w-5 h-5" />
            Engagement Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
              <div>
                <p className="font-medium">Respond to Reddit inquiry</p>
                <p className="text-sm text-muted-foreground">r/fatFIRE user asking about concierge services</p>
              </div>
              <Button size="sm">Engage</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
              <div>
                <p className="font-medium">Address negative feedback</p>
                <p className="text-sm text-muted-foreground">LinkedIn mention about response times</p>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
              <div>
                <p className="font-medium">Amplify positive testimonial</p>
                <p className="text-sm text-muted-foreground">High-engagement Instagram post</p>
              </div>
              <Button size="sm" variant="outline">Share</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

SocialListeningPanel.displayName = "SocialListeningPanel";

export default SocialListeningPanel;
