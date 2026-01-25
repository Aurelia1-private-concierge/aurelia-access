-- Create table to store Prismatic integration configurations
CREATE TABLE public.prismatic_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  integration_id TEXT UNIQUE NOT NULL, -- External Prismatic integration ID
  api_key_hash TEXT NOT NULL, -- Hashed API key for authentication
  scopes TEXT[] NOT NULL DEFAULT '{}', -- Allowed scopes: members, partners, requests, etc.
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create table to log all API calls from Prismatic
CREATE TABLE public.prismatic_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.prismatic_integrations(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_payload JSONB, -- Sanitized, no PII
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_prismatic_integrations_integration_id ON public.prismatic_integrations(integration_id);
CREATE INDEX idx_prismatic_integrations_active ON public.prismatic_integrations(is_active) WHERE is_active = true;
CREATE INDEX idx_prismatic_api_logs_integration_id ON public.prismatic_api_logs(integration_id);
CREATE INDEX idx_prismatic_api_logs_created_at ON public.prismatic_api_logs(created_at);
CREATE INDEX idx_prismatic_api_logs_endpoint ON public.prismatic_api_logs(endpoint);

-- Enable RLS
ALTER TABLE public.prismatic_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prismatic_api_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prismatic_integrations (admin only)
CREATE POLICY "Admins can manage Prismatic integrations"
  ON public.prismatic_integrations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for prismatic_api_logs (admin only, insert from service role)
CREATE POLICY "Admins can view API logs"
  ON public.prismatic_api_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role inserts (edge functions)
CREATE POLICY "Service role can insert API logs"
  ON public.prismatic_api_logs
  FOR INSERT
  WITH CHECK (true);

-- Rate limiting function for Prismatic API
CREATE OR REPLACE FUNCTION public.check_prismatic_rate_limit(
  p_integration_id UUID,
  p_limit INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.prismatic_api_logs
  WHERE integration_id = p_integration_id
    AND created_at > now() - INTERVAL '1 minute';
  
  RETURN v_count < p_limit;
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_prismatic_integrations_updated_at
  BEFORE UPDATE ON public.prismatic_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();