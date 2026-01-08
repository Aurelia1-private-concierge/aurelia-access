-- Ensure only admins can read launch_signups data
-- First, drop any potentially permissive SELECT policies
DROP POLICY IF EXISTS "Admins can view all signups" ON public.launch_signups;

-- Create a new SELECT policy that ONLY allows admins
CREATE POLICY "Only admins can view signups"
ON public.launch_signups
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also ensure the INSERT policy is explicitly for non-authenticated public access
DROP POLICY IF EXISTS "Anyone can sign up for launch alerts" ON public.launch_signups;

CREATE POLICY "Anyone can sign up for launch alerts"
ON public.launch_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);