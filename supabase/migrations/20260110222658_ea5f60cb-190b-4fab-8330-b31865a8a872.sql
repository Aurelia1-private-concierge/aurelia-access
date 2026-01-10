-- Create rate_limits table to track form submissions
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits(identifier, action_type, created_at DESC);

-- Enable RLS but allow public inserts (controlled via function)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow inserts via the check function (no direct access)
CREATE POLICY "No direct access to rate_limits"
ON public.rate_limits
FOR ALL
USING (false);

-- Create function to check and record rate limits
-- Returns true if allowed, false if rate limited
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action_type TEXT,
  p_max_requests INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start time
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count recent requests
  SELECT COUNT(*) INTO v_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND created_at > v_window_start;
  
  -- Check if rate limited
  IF v_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  -- Record this request
  INSERT INTO public.rate_limits (identifier, action_type)
  VALUES (p_identifier, p_action_type);
  
  -- Clean up old records (older than 24 hours) occasionally
  IF random() < 0.1 THEN
    DELETE FROM public.rate_limits
    WHERE created_at < now() - INTERVAL '24 hours';
  END IF;
  
  RETURN true;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO anon, authenticated;