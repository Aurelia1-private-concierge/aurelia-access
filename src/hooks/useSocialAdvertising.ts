import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types based on database schema
export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'reddit' | 'threads';
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  account_name: string;
  account_id: string | null;
  profile_url: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SocialCampaign {
  id: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  target_platforms: SocialPlatform[];
  target_audience: Record<string, unknown>;
  budget_cents: number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  content_templates: Record<string, unknown>;
  campaign_type: string;
  metrics: Record<string, unknown>;
  created_at: string;
}

export interface SocialPost {
  id: string;
  campaign_id: string | null;
  account_id: string | null;
  platform: SocialPlatform;
  content: string;
  media_urls: string[];
  hashtags: string[];
  scheduled_at: string | null;
  published_at: string | null;
  status: PostStatus;
  platform_post_id: string | null;
  platform_url: string | null;
  engagement_metrics: Record<string, number>;
  error_message: string | null;
  created_at: string;
}

export interface ContentTemplate {
  id: string;
  title: string;
  category: string;
  platform: SocialPlatform | null;
  content_template: string;
  hashtag_sets: string[];
  target_audience: string[];
  tone: string;
  performance_score: number;
  times_used: number;
}

// Platform metadata
export const PLATFORM_INFO: Record<SocialPlatform, { 
  name: string; 
  icon: string; 
  color: string;
  maxLength: number;
  audience: string;
}> = {
  twitter: { 
    name: "X (Twitter)", 
    icon: "🐦", 
    color: "#1DA1F2",
    maxLength: 280,
    audience: "Tech executives, Crypto wealth"
  },
  linkedin: { 
    name: "LinkedIn", 
    icon: "💼", 
    color: "#0A66C2",
    maxLength: 3000,
    audience: "C-Suite, Family Offices"
  },
  instagram: { 
    name: "Instagram", 
    icon: "📸", 
    color: "#E4405F",
    maxLength: 2200,
    audience: "Lifestyle affluents"
  },
  facebook: { 
    name: "Facebook", 
    icon: "📘", 
    color: "#1877F2",
    maxLength: 5000,
    audience: "Wealth networks"
  },
  reddit: { 
    name: "Reddit", 
    icon: "🔴", 
    color: "#FF4500",
    maxLength: 10000,
    audience: "r/fatFIRE community"
  },
  threads: { 
    name: "Threads", 
    icon: "🧵", 
    color: "#000000",
    maxLength: 500,
    audience: "Emerging affluent"
  },
};

// UHNWI Audience Presets
export const AUDIENCE_PRESETS = {
  "c-suite": {
    name: "C-Suite Executives",
    platforms: ["linkedin", "twitter"] as SocialPlatform[],
    targeting: {
      titles: ["CEO", "CFO", "CTO", "COO", "CMO"],
      industries: ["Finance", "Tech", "Healthcare", "Legal"],
      companySize: "500+",
    },
  },
  "family-office": {
    name: "Family Office Principals",
    platforms: ["linkedin"] as SocialPlatform[],
    targeting: {
      interests: ["Wealth management", "Alternative investments", "Estate planning"],
      netWorth: "$30M+",
    },
  },
  "tech-wealth": {
    name: "Tech Entrepreneurs",
    platforms: ["twitter", "reddit", "threads"] as SocialPlatform[],
    targeting: {
      interests: ["Startups", "Crypto", "AI", "Private equity"],
      subreddits: ["r/fatFIRE", "r/HENRYfinance"],
    },
  },
  "luxury-lifestyle": {
    name: "Luxury Enthusiasts",
    platforms: ["instagram", "facebook"] as SocialPlatform[],
    targeting: {
      interests: ["Private jets", "Yachts", "Fine art", "Luxury travel"],
      behaviors: ["Frequent travelers", "Luxury purchasers"],
    },
  },
};

export function useSocialAdvertising() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [campaigns, setCampaigns] = useState<SocialCampaign[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [accountsRes, campaignsRes, postsRes, templatesRes] = await Promise.all([
        supabase.from("social_accounts").select("*").order("created_at", { ascending: false }),
        supabase.from("social_campaigns").select("*").order("created_at", { ascending: false }),
        supabase.from("social_advertising_posts").select("*").order("scheduled_at", { ascending: false }).limit(100),
        supabase.from("social_content_library").select("*").order("performance_score", { ascending: false }),
      ]);

      if (accountsRes.data) setAccounts(accountsRes.data as unknown as SocialAccount[]);
      if (campaignsRes.data) setCampaigns(campaignsRes.data as unknown as SocialCampaign[]);
      if (postsRes.data) setPosts(postsRes.data as unknown as SocialPost[]);
      if (templatesRes.data) setTemplates(templatesRes.data as unknown as ContentTemplate[]);
    } catch (error) {
      console.error("Error fetching social advertising data:", error);
      toast({
        title: "Error",
        description: "Failed to load social advertising data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create campaign
  const createCampaign = async (campaign: Partial<SocialCampaign>) => {
    try {
      const { data, error } = await supabase
        .from("social_campaigns")
        .insert(campaign as never)
        .select()
        .single();

      if (error) throw error;

      setCampaigns(prev => [data as unknown as SocialCampaign, ...prev]);
      toast({ title: "Campaign created", description: `"${campaign.name}" is ready` });
      return data;
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" });
      throw error;
    }
  };

  // Create post
  const createPost = async (post: Partial<SocialPost>) => {
    try {
      const { data, error } = await supabase
        .from("social_advertising_posts")
        .insert(post as never)
        .select()
        .single();

      if (error) throw error;

      setPosts(prev => [data as unknown as SocialPost, ...prev]);
      toast({ title: "Post created", description: "Post scheduled successfully" });
      return data;
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
      throw error;
    }
  };

  // Publish post immediately
  const publishPost = async (postId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("social-publish", {
        body: { postId },
      });

      if (error) throw error;

      await fetchData(); // Refresh data
      toast({ 
        title: "Publishing", 
        description: data.message || "Post is being published" 
      });
      return data;
    } catch (error) {
      console.error("Error publishing post:", error);
      toast({ title: "Error", description: "Failed to publish post", variant: "destructive" });
      throw error;
    }
  };

  // Generate AI content
  const generateContent = async (baseContent: string, platforms: SocialPlatform[], theme?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-social-content", {
        body: { baseContent, platforms, theme },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating content:", error);
      toast({ title: "Error", description: "Failed to generate content", variant: "destructive" });
      throw error;
    }
  };

  // Save content template
  const saveTemplate = async (template: Partial<ContentTemplate>) => {
    try {
      const { data, error } = await supabase
        .from("social_content_library")
        .insert(template as never)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data as unknown as ContentTemplate, ...prev]);
      toast({ title: "Template saved", description: "Added to content library" });
      return data;
    } catch (error) {
      console.error("Error saving template:", error);
      toast({ title: "Error", description: "Failed to save template", variant: "destructive" });
      throw error;
    }
  };

  // Get analytics summary
  const getAnalyticsSummary = () => {
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => p.status === "published").length;
    const scheduledPosts = posts.filter(p => p.status === "scheduled").length;
    const failedPosts = posts.filter(p => p.status === "failed").length;

    const totalEngagement = posts.reduce((sum, post) => {
      const metrics = post.engagement_metrics || {};
      return sum + (metrics.likes || 0) + (metrics.shares || 0) + (metrics.comments || 0);
    }, 0);

    const platformBreakdown = Object.keys(PLATFORM_INFO).map(platform => ({
      platform: platform as SocialPlatform,
      count: posts.filter(p => p.platform === platform).length,
      published: posts.filter(p => p.platform === platform && p.status === "published").length,
    }));

    return {
      totalPosts,
      publishedPosts,
      scheduledPosts,
      failedPosts,
      totalEngagement,
      platformBreakdown,
      activeCampaigns: campaigns.filter(c => c.status === "active").length,
      connectedAccounts: accounts.filter(a => a.is_active).length,
    };
  };

  return {
    loading,
    accounts,
    campaigns,
    posts,
    templates,
    fetchData,
    createCampaign,
    createPost,
    publishPost,
    generateContent,
    saveTemplate,
    getAnalyticsSummary,
    PLATFORM_INFO,
    AUDIENCE_PRESETS,
  };
}
