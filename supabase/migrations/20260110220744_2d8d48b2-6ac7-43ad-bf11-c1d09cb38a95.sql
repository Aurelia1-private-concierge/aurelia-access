-- Remove ineffective deny policies that use USING (false)
-- These policies don't add security, they just create confusion

-- Remove from profiles table
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny public access to profiles" ON public.profiles;

-- Remove from partners table  
DROP POLICY IF EXISTS "Deny anonymous access to partners" ON public.partners;