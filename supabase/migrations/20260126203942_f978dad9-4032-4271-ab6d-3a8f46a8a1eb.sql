-- Create enum types for marketing strategies
CREATE TYPE public.strategy_type AS ENUM ('free', 'paid');
CREATE TYPE public.strategy_status AS ENUM ('active', 'planned', 'paused');
CREATE TYPE public.partnership_status AS ENUM ('active', 'pending', 'negotiating', 'declined');

-- Create marketing_strategies table
CREATE TABLE public.marketing_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type strategy_type NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  channels TEXT[],
  estimated_hours_weekly NUMERIC,
  estimated_monthly_budget NUMERIC,
  target_cpa NUMERIC,
  expected_roi TEXT,
  expected_results TEXT,
  status strategy_status DEFAULT 'planned',
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create network_partnerships table
CREATE TABLE public.network_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_name TEXT NOT NULL,
  network_type TEXT,
  partnership_status partnership_status DEFAULT 'pending',
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  engagement_notes TEXT,
  referrals_received INTEGER DEFAULT 0,
  conversions_from_referrals INTEGER DEFAULT 0,
  last_contact_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  playbook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create campaign_alerts table
CREATE TABLE public.campaign_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  alert_type TEXT NOT NULL,
  threshold NUMERIC,
  current_value NUMERIC,
  message TEXT,
  triggered_at TIMESTAMPTZ DEFAULT now(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id)
);

-- Create content_gaps table for SEO analysis
CREATE TABLE public.content_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  difficulty_score INTEGER,
  priority TEXT DEFAULT 'medium',
  content_type TEXT,
  target_page TEXT,
  competitor_coverage JSONB,
  status TEXT DEFAULT 'identified',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create local_seo_markets table
CREATE TABLE public.local_seo_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  priority INTEGER DEFAULT 0,
  landing_page_url TEXT,
  gbp_claimed BOOLEAN DEFAULT false,
  citations_count INTEGER DEFAULT 0,
  local_keywords JSONB,
  schema_implemented BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create attribution_events table for multi-touch attribution
CREATE TABLE public.attribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID,
  touchpoint_type TEXT NOT NULL,
  channel TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  content TEXT,
  page_path TEXT,
  event_value NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.marketing_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_seo_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribution_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_strategies (admin only)
CREATE POLICY "Admins can manage marketing strategies"
ON public.marketing_strategies
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for network_partnerships (admin only)
CREATE POLICY "Admins can manage network partnerships"
ON public.network_partnerships
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for campaign_alerts (admin only)
CREATE POLICY "Admins can manage campaign alerts"
ON public.campaign_alerts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for content_gaps (admin only)
CREATE POLICY "Admins can manage content gaps"
ON public.content_gaps
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for local_seo_markets (admin only)
CREATE POLICY "Admins can manage local SEO markets"
ON public.local_seo_markets
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for attribution_events (insert for all, read for admin)
CREATE POLICY "Anyone can insert attribution events"
ON public.attribution_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can read attribution events"
ON public.attribution_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_marketing_strategies_updated_at
  BEFORE UPDATE ON public.marketing_strategies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_network_partnerships_updated_at
  BEFORE UPDATE ON public.network_partnerships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_gaps_updated_at
  BEFORE UPDATE ON public.content_gaps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_local_seo_markets_updated_at
  BEFORE UPDATE ON public.local_seo_markets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default marketing strategies
INSERT INTO public.marketing_strategies (name, type, category, description, channels, estimated_hours_weekly, expected_results, status) VALUES
('SEO Content Marketing', 'free', 'Content', 'Create high-quality blog posts, FAQ content, and service pages optimized for luxury keywords', ARRAY['Blog', 'FAQ', 'Service Pages'], 5, '30-50% organic traffic increase', 'active'),
('Social Media Organic', 'free', 'Social', 'Daily engagement on LinkedIn, Instagram, and X with UHNW-focused content', ARRAY['LinkedIn', 'Instagram', 'X'], 15, 'Brand awareness, 5-10 leads/month', 'active'),
('Community Engagement', 'free', 'Community', 'Active participation in r/fatFIRE, YPO Forums, and LinkedIn Groups', ARRAY['Reddit', 'YPO', 'LinkedIn Groups'], 4, 'Relationship building, referrals', 'active'),
('PR & Earned Media', 'free', 'PR', 'HARO responses and journalist outreach for press coverage', ARRAY['HARO', 'Press'], 3, 'High-DA backlinks, credibility', 'planned'),
('Referral Program', 'free', 'Referral', 'Member-to-member referral incentives', ARRAY['Email', 'In-App'], 2, '15-25% of new signups', 'active'),
('Email Newsletter', 'free', 'Email', 'Weekly digest with luxury lifestyle content and exclusive offers', ARRAY['Email'], 3, 'Nurture leads, 20%+ open rate', 'active'),
('Guest Posting', 'free', 'Content', 'Publish thought leadership on Forbes, Robb Report, TechCrunch', ARRAY['Forbes', 'Robb Report', 'TechCrunch'], 6, 'Authority backlinks', 'planned'),
('Video Content', 'free', 'Video', 'YouTube and LinkedIn video content showcasing experiences', ARRAY['YouTube', 'LinkedIn Video'], 5, 'Engagement, brand personality', 'planned');

INSERT INTO public.marketing_strategies (name, type, category, description, channels, estimated_monthly_budget, target_cpa, expected_results, status) VALUES
('LinkedIn Ads (C-Suite)', 'paid', 'Paid Social', 'Targeted ads to C-Suite executives and UHNW professionals', ARRAY['LinkedIn'], 10000, 225, '20-50 qualified leads', 'active'),
('Google Ads (Luxury Intent)', 'paid', 'Paid Search', 'High-intent keywords for luxury concierge services', ARRAY['Google'], 6500, 175, 'High-intent traffic', 'active'),
('Meta Ads (Lookalike)', 'paid', 'Paid Social', 'Lookalike audiences based on existing UHNW members', ARRAY['Facebook', 'Instagram'], 5500, 140, 'Retargeting conversions', 'active'),
('Reddit Ads (r/fatFIRE)', 'paid', 'Paid Social', 'Targeted ads to financial independence communities', ARRAY['Reddit'], 2000, 100, 'Niche UHNW audience', 'planned'),
('Programmatic Display', 'paid', 'Display', 'Premium display placements on luxury publications', ARRAY['Programmatic'], 12500, 300, 'Brand awareness, retargeting', 'planned'),
('Influencer Partnerships', 'paid', 'Influencer', 'Collaborations with luxury lifestyle influencers', ARRAY['Instagram', 'YouTube'], 27500, 550, 'Credibility, reach', 'planned'),
('Event Sponsorships', 'paid', 'Events', 'Sponsorship of UHNW networking events and conferences', ARRAY['Events'], 55000, NULL, 'Direct networking', 'planned'),
('Native Advertising', 'paid', 'Native', 'Sponsored content on luxury publications', ARRAY['Native Ads'], 10000, 250, 'Content distribution', 'planned');

-- Seed default network partnerships
INSERT INTO public.network_partnerships (network_name, network_type, partnership_status, engagement_notes) VALUES
('Tiger 21', 'Investment Network', 'pending', 'Premier peer-to-peer network for high-net-worth entrepreneurs'),
('YPO (Young Presidents Organization)', 'Executive Network', 'negotiating', 'Global leadership community of chief executives'),
('Vistage', 'Executive Coaching', 'pending', 'CEO peer advisory groups'),
('EO (Entrepreneurs Organization)', 'Entrepreneur Network', 'pending', 'Global business network for entrepreneurs'),
('Family Office Exchange', 'Family Office', 'pending', 'Network for ultra-wealthy families'),
('Luxury Network', 'Luxury Industry', 'active', 'Premium B2B networking for luxury brands'),
('Quintessentially Network', 'Concierge', 'pending', 'Potential partnership or referral arrangement');

-- Seed default local SEO markets
INSERT INTO public.local_seo_markets (city, country, region, priority, local_keywords) VALUES
('London', 'United Kingdom', 'Europe', 1, '{"keywords": ["luxury concierge London", "private concierge Mayfair", "VIP services London"]}'),
('Monaco', 'Monaco', 'Europe', 2, '{"keywords": ["concierge Monaco", "luxury lifestyle Monaco", "private services Monte Carlo"]}'),
('Dubai', 'UAE', 'Middle East', 3, '{"keywords": ["luxury concierge Dubai", "VIP services UAE", "private concierge Emirates"]}'),
('Singapore', 'Singapore', 'Asia', 4, '{"keywords": ["luxury concierge Singapore", "private services Singapore", "VIP concierge Asia"]}'),
('New York', 'USA', 'North America', 5, '{"keywords": ["luxury concierge NYC", "private concierge Manhattan", "VIP services New York"]}'),
('Geneva', 'Switzerland', 'Europe', 6, '{"keywords": ["concierge Geneva", "luxury services Switzerland", "private banking concierge"]}'),
('Hong Kong', 'China', 'Asia', 7, '{"keywords": ["luxury concierge Hong Kong", "VIP services HK", "private concierge Asia"]}');