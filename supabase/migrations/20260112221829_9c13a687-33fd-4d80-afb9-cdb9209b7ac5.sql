-- Create table to track IP-based login attempts
CREATE TABLE IF NOT EXISTS public.ip_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  email TEXT,
  attempt_type TEXT NOT NULL DEFAULT 'failed', -- 'failed', 'success', 'lockout'
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast IP lookups
CREATE INDEX idx_ip_login_attempts_ip ON public.ip_login_attempts(ip_address, created_at DESC);
CREATE INDEX idx_ip_login_attempts_email ON public.ip_login_attempts(email, created_at DESC);

-- Enable RLS
ALTER TABLE public.ip_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts (for security monitoring)
CREATE POLICY "Admins can view login attempts"
ON public.ip_login_attempts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Edge functions can insert (using service role)
-- No public insert policy - only edge function with service role can insert

-- Create function to check if IP is rate limited
CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(
  p_ip_address TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15,
  p_lockout_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(
  is_limited BOOLEAN,
  attempts_in_window INTEGER,
  lockout_until TIMESTAMP WITH TIME ZONE,
  cooldown_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_lockout_start TIMESTAMP WITH TIME ZONE;
  v_attempts INTEGER;
  v_last_lockout TIMESTAMP WITH TIME ZONE;
  v_lockout_end TIMESTAMP WITH TIME ZONE;
  v_cooldown INTEGER;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  v_lockout_start := now() - (p_lockout_minutes || ' minutes')::INTERVAL;
  
  -- Check for active lockout
  SELECT created_at INTO v_last_lockout
  FROM public.ip_login_attempts
  WHERE ip_address = p_ip_address
    AND attempt_type = 'lockout'
    AND created_at > v_lockout_start
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_last_lockout IS NOT NULL THEN
    v_lockout_end := v_last_lockout + (p_lockout_minutes || ' minutes')::INTERVAL;
    v_cooldown := GREATEST(0, EXTRACT(EPOCH FROM (v_lockout_end - now()))::INTEGER);
    
    IF v_cooldown > 0 THEN
      RETURN QUERY SELECT 
        TRUE as is_limited,
        p_max_attempts as attempts_in_window,
        v_lockout_end as lockout_until,
        v_cooldown as cooldown_seconds;
      RETURN;
    END IF;
  END IF;
  
  -- Count failed attempts in window
  SELECT COUNT(*)::INTEGER INTO v_attempts
  FROM public.ip_login_attempts
  WHERE ip_address = p_ip_address
    AND attempt_type = 'failed'
    AND created_at > v_window_start;
  
  -- Check if should be locked out
  IF v_attempts >= p_max_attempts THEN
    v_lockout_end := now() + (p_lockout_minutes || ' minutes')::INTERVAL;
    v_cooldown := p_lockout_minutes * 60;
    
    RETURN QUERY SELECT 
      TRUE as is_limited,
      v_attempts as attempts_in_window,
      v_lockout_end as lockout_until,
      v_cooldown as cooldown_seconds;
    RETURN;
  END IF;
  
  -- Not limited
  RETURN QUERY SELECT 
    FALSE as is_limited,
    v_attempts as attempts_in_window,
    NULL::TIMESTAMP WITH TIME ZONE as lockout_until,
    0 as cooldown_seconds;
END;
$$;

-- Create function to record login attempt (called by edge function)
CREATE OR REPLACE FUNCTION public.record_ip_login_attempt(
  p_ip_address TEXT,
  p_email TEXT,
  p_attempt_type TEXT,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ip_login_attempts (ip_address, email, attempt_type, user_agent)
  VALUES (p_ip_address, LOWER(p_email), p_attempt_type, p_user_agent);
  
  -- Auto-create lockout record if this was the 5th failed attempt
  IF p_attempt_type = 'failed' THEN
    DECLARE
      v_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO v_count
      FROM public.ip_login_attempts
      WHERE ip_address = p_ip_address
        AND attempt_type = 'failed'
        AND created_at > now() - INTERVAL '15 minutes';
      
      IF v_count >= 5 THEN
        INSERT INTO public.ip_login_attempts (ip_address, email, attempt_type, user_agent)
        VALUES (p_ip_address, LOWER(p_email), 'lockout', p_user_agent);
      END IF;
    END;
  END IF;
  
  -- Cleanup old records (older than 24 hours) occasionally
  IF random() < 0.05 THEN
    DELETE FROM public.ip_login_attempts
    WHERE created_at < now() - INTERVAL '24 hours';
  END IF;
END;
$$;