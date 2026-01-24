-- Exit Intent Conversions - Track popup interactions
CREATE TABLE public.exit_intent_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  page_path TEXT NOT NULL,
  offer_type TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('shown', 'dismissed', 'converted')),
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lead Scores - Store calculated scores per visitor/user
CREATE TABLE public.lead_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  user_id UUID,
  email TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  signals JSONB DEFAULT '{}',
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral Shares - Log share actions and channels
CREATE TABLE public.referral_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'twitter', 'linkedin', 'email', 'sms', 'copy')),
  referral_code TEXT,
  page_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Behavioral Triggers - Queue for triggered emails
CREATE TABLE public.behavioral_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blog Posts - Store generated SEO content
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  meta_description TEXT,
  keywords TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  author_id UUID,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.exit_intent_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public insert for exit intent (anonymous tracking)
CREATE POLICY "Anyone can insert exit intent conversions"
ON public.exit_intent_conversions FOR INSERT
WITH CHECK (true);

-- Admins can view all exit intent data
CREATE POLICY "Admins can view exit intent conversions"
ON public.exit_intent_conversions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Public insert for lead scores
CREATE POLICY "Anyone can insert lead scores"
ON public.lead_scores FOR INSERT
WITH CHECK (true);

-- Anyone can update their own lead score by session
CREATE POLICY "Anyone can update lead scores by session"
ON public.lead_scores FOR UPDATE
USING (true);

-- Admins can view all lead scores
CREATE POLICY "Admins can view lead scores"
ON public.lead_scores FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Public insert for referral shares
CREATE POLICY "Anyone can insert referral shares"
ON public.referral_shares FOR INSERT
WITH CHECK (true);

-- Users can view their own shares
CREATE POLICY "Users can view their own referral shares"
ON public.referral_shares FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Behavioral triggers - service role only for insert/update
CREATE POLICY "Admins can manage behavioral triggers"
ON public.behavioral_triggers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Blog posts - public read for published, admin for all
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts FOR SELECT
USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_exit_intent_session ON public.exit_intent_conversions(session_id);
CREATE INDEX idx_lead_scores_session ON public.lead_scores(session_id);
CREATE INDEX idx_lead_scores_score ON public.lead_scores(score DESC);
CREATE INDEX idx_referral_shares_user ON public.referral_shares(user_id);
CREATE INDEX idx_behavioral_triggers_status ON public.behavioral_triggers(status, scheduled_for);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status, published_at DESC);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

-- Add updated_at triggers
CREATE TRIGGER update_lead_scores_updated_at
BEFORE UPDATE ON public.lead_scores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();