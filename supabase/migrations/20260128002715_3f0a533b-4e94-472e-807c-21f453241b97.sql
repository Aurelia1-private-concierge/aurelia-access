-- Fix partner_applications RLS: Restrict SELECT to only admins
-- This table contains sensitive business information (company names, contact details)
-- that should not be publicly readable

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view own applications" ON public.partner_applications;

-- Create proper SELECT policy: Only admins can view all applications
CREATE POLICY "Only admins can view partner applications" 
ON public.partner_applications 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));