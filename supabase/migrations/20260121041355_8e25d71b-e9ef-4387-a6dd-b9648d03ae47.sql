-- Fix boardroom_participants RLS to prevent unauthorized email exposure
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Participants can view session participants" ON public.boardroom_participants;

-- Create more restrictive policy: only session hosts and verified participants can see emails
CREATE POLICY "Participants can view session participants securely"
ON public.boardroom_participants
FOR SELECT
USING (
  -- User is the host of the session
  EXISTS (
    SELECT 1 FROM public.boardroom_sessions bs
    WHERE bs.id = boardroom_participants.session_id
    AND bs.host_id = auth.uid()
  )
  OR
  -- User is a verified participant in the same session
  EXISTS (
    SELECT 1 FROM public.boardroom_participants bp
    WHERE bp.session_id = boardroom_participants.session_id
    AND bp.user_id = auth.uid()
    AND bp.status IN ('joined', 'waiting')
  )
);

-- Fix contact_submissions RLS to remove the 10-second exposure vulnerability
-- Drop the problematic policy that allows recent submitters to see their submission
DROP POLICY IF EXISTS "Recent submitters can see their submission" ON public.contact_submissions;

-- The admin-only policies remain in place for proper access control