-- Also tighten UPDATE policy on partner_applications
-- Only admins should be able to update application status

-- Drop the existing overly permissive UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update applications" ON public.partner_applications;

-- Create proper UPDATE policy: Only admins can update applications
CREATE POLICY "Only admins can update partner applications" 
ON public.partner_applications 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));