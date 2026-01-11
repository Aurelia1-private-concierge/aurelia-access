-- Create funnel_events table to track user journey stages
CREATE TABLE public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  stage TEXT NOT NULL,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  referrer TEXT,
  landing_page TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_funnel_events_session ON public.funnel_events(session_id);
CREATE INDEX idx_funnel_events_stage ON public.funnel_events(stage);
CREATE INDEX idx_funnel_events_created ON public.funnel_events(created_at DESC);
CREATE INDEX idx_funnel_events_source ON public.funnel_events(source, medium, campaign);

-- Enable RLS
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert funnel events (for anonymous tracking)
CREATE POLICY "Anyone can insert funnel events"
ON public.funnel_events
FOR INSERT
WITH CHECK (true);

-- Only admins can view funnel events
CREATE POLICY "Admins can view all funnel events"
ON public.funnel_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a view for funnel conversion rates
CREATE OR REPLACE VIEW public.funnel_summary AS
SELECT
  source,
  medium,
  campaign,
  COUNT(DISTINCT CASE WHEN stage = 'landing' THEN session_id END) as landing_count,
  COUNT(DISTINCT CASE WHEN stage = 'signup_started' THEN session_id END) as signup_started_count,
  COUNT(DISTINCT CASE WHEN stage = 'signup_completed' THEN session_id END) as signup_completed_count,
  COUNT(DISTINCT CASE WHEN stage = 'onboarding_started' THEN session_id END) as onboarding_started_count,
  COUNT(DISTINCT CASE WHEN stage = 'onboarding_completed' THEN session_id END) as onboarding_completed_count,
  COUNT(DISTINCT CASE WHEN stage = 'trial_started' THEN session_id END) as trial_started_count,
  COUNT(DISTINCT CASE WHEN stage = 'converted' THEN session_id END) as converted_count,
  DATE_TRUNC('day', MIN(created_at)) as first_event_date,
  DATE_TRUNC('day', MAX(created_at)) as last_event_date
FROM public.funnel_events
GROUP BY source, medium, campaign;

-- Grant access to the view
GRANT SELECT ON public.funnel_summary TO authenticated;