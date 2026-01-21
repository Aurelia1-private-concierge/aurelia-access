-- The edge functions use service role key which bypasses RLS
-- But we need to ensure the policies don't block legitimate use cases

-- Add policy for service role updates (via webhook/automation)
-- This is handled by service role bypassing RLS, but let's ensure admin can also update all fields
DROP POLICY IF EXISTS "Admins can update submissions" ON public.contact_submissions;

CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to also delete automation logs for cleanup
CREATE POLICY "Admins can delete automation logs"
  ON public.contact_automation_logs FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));