-- Add rate limiting for launch_signups to prevent spam
-- First drop the existing permissive policy
DROP POLICY IF EXISTS "Anyone can sign up for launch alerts" ON public.launch_signups;

-- Create a more restrictive INSERT policy with rate limiting via RPC
-- Users can only insert if they haven't signed up with same email/phone recently
CREATE POLICY "Rate limited launch signups" 
ON public.launch_signups 
FOR INSERT 
WITH CHECK (
  -- Check rate limit: max 3 signups per email per hour
  (
    SELECT COUNT(*) < 3 
    FROM public.launch_signups ls 
    WHERE ls.email = email 
    AND ls.created_at > NOW() - INTERVAL '1 hour'
  )
  OR email IS NULL
);

-- Also add unique constraint to prevent duplicate signups
ALTER TABLE public.launch_signups 
ADD CONSTRAINT launch_signups_email_unique UNIQUE (email);

ALTER TABLE public.launch_signups 
ADD CONSTRAINT launch_signups_phone_unique UNIQUE (phone);