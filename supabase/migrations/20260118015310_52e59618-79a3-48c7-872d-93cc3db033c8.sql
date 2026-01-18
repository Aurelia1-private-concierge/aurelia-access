-- Add INSERT policy for audit_logs to allow users to log their own auth events
CREATE POLICY "Users can insert their own audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (
  -- Allow authenticated users to insert logs for themselves
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Allow anonymous inserts for pre-auth events (login attempts, OAuth starts)
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Also add policy for authenticated users to view their own logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);