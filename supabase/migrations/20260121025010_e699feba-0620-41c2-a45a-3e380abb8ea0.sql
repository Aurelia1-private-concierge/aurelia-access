-- Fix overly permissive INSERT policy - require service role or valid contact_id
DROP POLICY IF EXISTS "Service can insert automation logs" ON public.contact_automation_logs;

-- More restrictive policy: only allow inserts when there's a valid contact_id reference
CREATE POLICY "Valid contact logs only"
  ON public.contact_automation_logs FOR INSERT
  WITH CHECK (
    contact_id IS NOT NULL AND 
    EXISTS (SELECT 1 FROM public.contact_submissions WHERE id = contact_id)
  );