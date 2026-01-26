-- Drop existing policies on partner_waitlist
DROP POLICY IF EXISTS "Admins can read partner waitlist" ON public.partner_waitlist;
DROP POLICY IF EXISTS "Admins can delete partner waitlist entries" ON public.partner_waitlist;
DROP POLICY IF EXISTS "Admins can update partner waitlist" ON public.partner_waitlist;

-- Recreate policies using the has_role security definer function
CREATE POLICY "Admins can read partner waitlist"
ON public.partner_waitlist
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update partner waitlist"
ON public.partner_waitlist
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete partner waitlist entries"
ON public.partner_waitlist
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));