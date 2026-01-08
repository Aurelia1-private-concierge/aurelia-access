-- Add explicit deny policy for anonymous users on profiles table
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Also add explicit deny for public role
CREATE POLICY "Deny public access to profiles"
ON public.profiles
FOR ALL
TO public
USING (false);