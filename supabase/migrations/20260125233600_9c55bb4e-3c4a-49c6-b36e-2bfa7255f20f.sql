-- Social Advertising Schema for UHNWI Multi-Platform Publishing

-- Create enum for social platforms
CREATE TYPE public.social_platform AS ENUM (
  'twitter',
  'linkedin', 
  'instagram',
  'facebook',
  'reddit',
  'threads'
);

-- Create enum for post status
CREATE TYPE public.social_post_status AS ENUM (
  'draft',
  'scheduled',
  'publishing',
  'published',
  'failed',
  'cancelled'
);

-- Create enum for campaign status
CREATE TYPE public.social_campaign_status AS ENUM (
  'draft',
  'active',
  'paused',
  'completed',
  'archived'
);

-- Social Accounts - Store connected platform credentials (encrypted)
CREATE TABLE public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform social_platform NOT NULL,
  account_name TEXT NOT NULL,
  account_id TEXT, -- Platform-specific account ID
  access_token_encrypted TEXT, -- Encrypted OAuth token
  refresh_token_encrypted TEXT, -- Encrypted refresh token
  token_expires_at TIMESTAMPTZ,
  profile_url TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(platform, account_id)
);

-- Social Campaigns - Multi-platform advertising campaigns
CREATE TABLE public.social_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status social_campaign_status DEFAULT 'draft',
  target_platforms social_platform[] DEFAULT '{}',
  target_audience JSONB DEFAULT '{}', -- UHNWI targeting presets
  budget_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  content_templates JSONB DEFAULT '{}', -- Platform-specific content
  campaign_type TEXT DEFAULT 'awareness', -- awareness, engagement, conversion
  metrics JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Posts - Enhanced with publishing tracking
CREATE TABLE public.social_advertising_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.social_campaigns(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  status social_post_status DEFAULT 'draft',
  platform_post_id TEXT, -- ID returned from platform after posting
  platform_url TEXT, -- Link to the live post
  engagement_metrics JSONB DEFAULT '{}', -- likes, shares, comments, impressions
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Post Analytics - Track engagement over time
CREATE TABLE public.social_post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.social_advertising_posts(id) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,4),
  demographics JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- Social Content Library - Reusable UHNWI content templates
CREATE TABLE public.social_content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- lifestyle, investment, travel, art, etc.
  platform social_platform,
  content_template TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  hashtag_sets TEXT[] DEFAULT '{}',
  target_audience TEXT[] DEFAULT '{}', -- UHNWI segments
  tone TEXT DEFAULT 'sophisticated', -- sophisticated, exclusive, aspirational
  performance_score NUMERIC(3,2) DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_advertising_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_content_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access
CREATE POLICY "Admins can manage social accounts"
  ON public.social_accounts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage social campaigns"
  ON public.social_campaigns FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage social posts"
  ON public.social_advertising_posts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view social analytics"
  ON public.social_post_analytics FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage content library"
  ON public.social_content_library FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger for all tables
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_campaigns_updated_at
  BEFORE UPDATE ON public.social_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_advertising_posts_updated_at
  BEFORE UPDATE ON public.social_advertising_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_content_library_updated_at
  BEFORE UPDATE ON public.social_content_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_social_posts_scheduled ON public.social_advertising_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_social_posts_campaign ON public.social_advertising_posts(campaign_id);
CREATE INDEX idx_social_posts_platform ON public.social_advertising_posts(platform);
CREATE INDEX idx_social_analytics_post ON public.social_post_analytics(post_id);
CREATE INDEX idx_social_campaigns_status ON public.social_campaigns(status);

-- Enable realtime for posts table (for live updates in dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_advertising_posts;