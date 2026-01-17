-- Fix overly permissive RLS policies for discovery tables
-- These tables should only be accessible by admins (via has_role function)

-- First, check if has_role function exists, if not create it
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Admins can manage discovery_logs" ON public.discovery_logs;
DROP POLICY IF EXISTS "Admins can manage potential_partners" ON public.potential_partners;
DROP POLICY IF EXISTS "Admins can manage potential_users" ON public.potential_users;

-- Create proper admin-only policies for discovery_logs
CREATE POLICY "Admins can view discovery_logs"
  ON public.discovery_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert discovery_logs"
  ON public.discovery_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update discovery_logs"
  ON public.discovery_logs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete discovery_logs"
  ON public.discovery_logs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create proper admin-only policies for potential_partners
CREATE POLICY "Admins can view potential_partners"
  ON public.potential_partners FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert potential_partners"
  ON public.potential_partners FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update potential_partners"
  ON public.potential_partners FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete potential_partners"
  ON public.potential_partners FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create proper admin-only policies for potential_users
CREATE POLICY "Admins can view potential_users"
  ON public.potential_users FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert potential_users"
  ON public.potential_users FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update potential_users"
  ON public.potential_users FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete potential_users"
  ON public.potential_users FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix visitor_logs - should allow anonymous inserts but with rate limiting context
-- Keep INSERT open for anonymous tracking but restrict other operations
DROP POLICY IF EXISTS "Anyone can track visits" ON public.visitor_logs;

CREATE POLICY "Anyone can insert visitor logs"
  ON public.visitor_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view visitor logs"
  ON public.visitor_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage visitor logs"
  ON public.visitor_logs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));