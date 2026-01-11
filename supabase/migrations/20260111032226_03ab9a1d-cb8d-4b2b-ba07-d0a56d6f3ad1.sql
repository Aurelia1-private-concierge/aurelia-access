-- Add rate limiting for analytics_events to prevent data flooding
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.analytics_events;

-- Create rate-limited INSERT policy (max 100 events per session per minute)
CREATE POLICY "Rate limited analytics insert" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (
  (
    SELECT COUNT(*) < 100 
    FROM public.analytics_events ae 
    WHERE ae.session_id = session_id 
    AND ae.created_at > NOW() - INTERVAL '1 minute'
  )
  OR session_id IS NULL
);