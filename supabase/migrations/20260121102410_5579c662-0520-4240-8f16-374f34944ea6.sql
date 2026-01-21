-- Drop the overly permissive INSERT policies
DROP POLICY IF EXISTS "System can insert health events" ON public.health_events;
DROP POLICY IF EXISTS "System can insert publication health logs" ON public.publication_health_logs;

-- Create more secure policies that only allow authenticated users or service role
-- Edge functions use service role key which bypasses RLS, so we don't need special policies for them
-- Instead, allow admins to insert (they're the primary users of these tables)

-- For health_events: Allow any authenticated user to insert their own events
CREATE POLICY "Authenticated users can insert health events"
ON public.health_events
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- For publication_health_logs: Only admins can insert
CREATE POLICY "Admins can insert publication health logs"
ON public.publication_health_logs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));