-- Fix partners table RLS: Drop existing policies and create secure ones
DROP POLICY IF EXISTS "Admins can view all partners" ON public.partners;
DROP POLICY IF EXISTS "Admins can manage all partners" ON public.partners;

-- Admin access to all partner data
CREATE POLICY "Admins can view all partners"
  ON public.partners FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all partners"
  ON public.partners FOR ALL
  USING (has_role(auth.uid(), 'admin'));