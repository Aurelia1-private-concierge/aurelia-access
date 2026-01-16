-- Fix the remaining overly permissive RLS policy for analytics_events
-- This policy intentionally allows public INSERT for analytics tracking
-- but we add validation to prevent abuse

DROP POLICY IF EXISTS "Allow analytics event tracking with rate limit" ON public.analytics_events;
CREATE POLICY "Allow analytics event tracking"
ON public.analytics_events
FOR INSERT
WITH CHECK (
  -- Require event_name and event_category to be present and reasonable
  event_name IS NOT NULL AND 
  length(event_name) > 0 AND 
  length(event_name) < 100 AND
  event_category IS NOT NULL AND 
  length(event_category) > 0 AND 
  length(event_category) < 50
);