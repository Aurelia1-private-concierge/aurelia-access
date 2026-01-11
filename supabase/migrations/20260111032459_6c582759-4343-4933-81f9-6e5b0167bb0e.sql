-- Fix audit_logs INSERT policy to be service-role only
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

-- Audit logs should only be insertable via service role (edge functions)
-- Regular users cannot insert directly - this is enforced by not having an INSERT policy for anon/authenticated
-- Edge functions use service role which bypasses RLS

-- Fix launch_signups rate limiting - the previous policy had a bug
DROP POLICY IF EXISTS "Rate limited launch signups" ON public.launch_signups;

-- Create proper rate-limited INSERT policy using a function
CREATE OR REPLACE FUNCTION public.check_launch_signup_rate_limit(p_email TEXT, p_phone TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_count INTEGER := 0;
  v_phone_count INTEGER := 0;
BEGIN
  -- Check email rate limit if provided
  IF p_email IS NOT NULL THEN
    SELECT COUNT(*) INTO v_email_count
    FROM public.launch_signups
    WHERE email = p_email
    AND created_at > NOW() - INTERVAL '1 hour';
    
    IF v_email_count >= 3 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check phone rate limit if provided
  IF p_phone IS NOT NULL THEN
    SELECT COUNT(*) INTO v_phone_count
    FROM public.launch_signups
    WHERE phone = p_phone
    AND created_at > NOW() - INTERVAL '1 hour';
    
    IF v_phone_count >= 3 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create policy using the function
CREATE POLICY "Rate limited launch signups" 
ON public.launch_signups 
FOR INSERT 
WITH CHECK (
  public.check_launch_signup_rate_limit(email, phone)
);