-- Fix profiles table RLS - remove admin bypass for viewing profiles
-- Admins should use a secure backend function if they need access to all profiles

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a stricter SELECT policy - users can ONLY view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- For admin access to profiles, create a SECURITY DEFINER function
-- This prevents direct table access while still allowing controlled admin operations
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS SETOF profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles
  WHERE has_role(auth.uid(), 'admin'::text)
$$;

-- Revoke direct function access, only allow authenticated users
REVOKE ALL ON FUNCTION public.admin_get_all_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_all_profiles() TO authenticated;