-- Fix the analytics_events rate limiting policy (currently has a bug where session_id = session_id is always true)
DROP POLICY IF EXISTS "Rate limited analytics insert" ON public.analytics_events;

CREATE POLICY "Rate limited analytics insert" ON public.analytics_events
FOR INSERT
WITH CHECK (
  (
    SELECT COUNT(*) < 100
    FROM public.analytics_events ae
    WHERE ae.session_id = analytics_events.session_id
    AND ae.created_at > (NOW() - INTERVAL '1 minute')
  )
  OR session_id IS NULL
);

-- Add policy for users to view their own analytics
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;

CREATE POLICY "Users can view own analytics" ON public.analytics_events
FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Update the Admins can view analytics policy to be more specific
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics_events;