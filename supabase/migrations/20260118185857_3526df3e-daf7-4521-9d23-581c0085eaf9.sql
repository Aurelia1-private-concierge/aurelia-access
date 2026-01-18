-- Complete RLS fix for partners table
-- First drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admins can view all partners" ON public.partners;
DROP POLICY IF EXISTS "Admins can manage all partners" ON public.partners;
DROP POLICY IF EXISTS "Partners can view their own data only" ON public.partners;
DROP POLICY IF EXISTS "Partners can update their own data only" ON public.partners;
DROP POLICY IF EXISTS "Partners can insert their own record only" ON public.partners;
DROP POLICY IF EXISTS "Partners can delete their own record only" ON public.partners;

-- User-level policies: Partners can manage their own records
CREATE POLICY "Users can view own partner record"
  ON public.partners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own partner record"
  ON public.partners FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own partner record"
  ON public.partners FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own partner record"
  ON public.partners FOR DELETE
  USING (auth.uid() = user_id);

-- Admin policies: Full access for admins
CREATE POLICY "Admins can view all partners"
  ON public.partners FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage partners"
  ON public.partners FOR ALL
  USING (has_role(auth.uid(), 'admin'));