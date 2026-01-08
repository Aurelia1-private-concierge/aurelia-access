-- Create table to track Discovery Service engagement from Surprise Me feature
CREATE TABLE public.discovery_service_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id TEXT NOT NULL,
  service_title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('reveal', 'click', 'save')),
  match_score NUMERIC,
  traveler_archetype TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discovery_service_analytics ENABLE ROW LEVEL SECURITY;

-- Users can insert their own analytics
CREATE POLICY "Users can insert their own analytics"
ON public.discovery_service_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own analytics (for personalization)
CREATE POLICY "Users can view their own analytics"
ON public.discovery_service_analytics
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all analytics for insights
CREATE POLICY "Admins can view all analytics"
ON public.discovery_service_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient querying
CREATE INDEX idx_discovery_analytics_service ON public.discovery_service_analytics(service_id);
CREATE INDEX idx_discovery_analytics_event ON public.discovery_service_analytics(event_type);
CREATE INDEX idx_discovery_analytics_created ON public.discovery_service_analytics(created_at DESC);