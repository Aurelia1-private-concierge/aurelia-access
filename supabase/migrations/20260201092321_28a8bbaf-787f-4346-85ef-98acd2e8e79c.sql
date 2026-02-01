-- Tier 5: Social Publishing & Marketing Analytics

-- Social Content Templates
CREATE TABLE IF NOT EXISTS public.social_content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'twitter', 'linkedin', 'facebook', 'tiktok')),
  content_type TEXT NOT NULL DEFAULT 'post' CHECK (content_type IN ('post', 'story', 'reel', 'carousel', 'thread')),
  template_text TEXT NOT NULL,
  hashtag_strategy JSONB DEFAULT '[]',
  tone TEXT DEFAULT 'luxury',
  target_audience TEXT[] DEFAULT ARRAY['uhnw', 'luxury_lifestyle'],
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generated Social Content
CREATE TABLE IF NOT EXISTS public.social_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.social_content_templates(id),
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'post',
  generated_text TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  call_to_action TEXT,
  ai_model TEXT,
  generation_params JSONB DEFAULT '{}',
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Post Schedule
CREATE TABLE IF NOT EXISTS public.social_post_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.social_content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  account_id TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  published_at TIMESTAMPTZ,
  platform_post_id TEXT,
  platform_response JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Accounts (for multi-account publishing)
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_handle TEXT,
  account_id TEXT NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social Performance Metrics
CREATE TABLE IF NOT EXISTS public.social_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_schedule_id UUID REFERENCES public.social_post_schedule(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0,
  follower_change INTEGER DEFAULT 0,
  sentiment_score DECIMAL(3,2),
  sentiment_breakdown JSONB DEFAULT '{}',
  demographic_insights JSONB DEFAULT '{}',
  fetched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT DEFAULT 'awareness' CHECK (campaign_type IN ('awareness', 'engagement', 'conversion', 'retention', 'referral')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget_amount DECIMAL(12,2),
  budget_currency TEXT DEFAULT 'USD',
  spent_amount DECIMAL(12,2) DEFAULT 0,
  target_audience JSONB DEFAULT '{}',
  goals JSONB DEFAULT '{}',
  channels TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign Content Links
CREATE TABLE IF NOT EXISTS public.campaign_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.social_content(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(campaign_id, content_id)
);

-- Campaign Analytics
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_impressions BIGINT DEFAULT 0,
  total_reach BIGINT DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  conversion_value DECIMAL(12,2) DEFAULT 0,
  cost_per_click DECIMAL(8,4),
  cost_per_conversion DECIMAL(10,4),
  return_on_ad_spend DECIMAL(8,4),
  channel_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Content Performance A/B Testing
CREATE TABLE IF NOT EXISTS public.content_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  variant_a_content_id UUID REFERENCES public.social_content(id),
  variant_b_content_id UUID REFERENCES public.social_content(id),
  metric_to_optimize TEXT DEFAULT 'engagement_rate',
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'cancelled')),
  winner_variant TEXT,
  statistical_significance DECIMAL(5,4),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_ab_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin access only for marketing operations)
CREATE POLICY "Admins manage social templates" ON public.social_content_templates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage social content" ON public.social_content
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage post schedules" ON public.social_post_schedule
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage social accounts" ON public.social_accounts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view performance metrics" ON public.social_performance_metrics
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage campaigns" ON public.marketing_campaigns
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage campaign content" ON public.campaign_content
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view campaign analytics" ON public.campaign_analytics
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage ab tests" ON public.content_ab_tests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Service role policies for edge functions
CREATE POLICY "Service role social templates" ON public.social_content_templates
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role social content" ON public.social_content
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role post schedules" ON public.social_post_schedule
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role social accounts" ON public.social_accounts
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role performance metrics" ON public.social_performance_metrics
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role campaigns" ON public.marketing_campaigns
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role campaign content" ON public.campaign_content
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role campaign analytics" ON public.campaign_analytics
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role ab tests" ON public.content_ab_tests
  FOR ALL TO service_role USING (true);

-- Indexes for performance
CREATE INDEX idx_social_content_platform ON public.social_content(platform);
CREATE INDEX idx_social_content_status ON public.social_content(approval_status);
CREATE INDEX idx_post_schedule_status ON public.social_post_schedule(status);
CREATE INDEX idx_post_schedule_time ON public.social_post_schedule(scheduled_for);
CREATE INDEX idx_campaign_status ON public.marketing_campaigns(status);
CREATE INDEX idx_campaign_dates ON public.marketing_campaigns(start_date, end_date);
CREATE INDEX idx_campaign_analytics_date ON public.campaign_analytics(campaign_id, date);

-- Enable realtime for scheduled posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_post_schedule;