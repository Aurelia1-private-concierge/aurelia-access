-- Create table for partner PMS/channel manager integrations
CREATE TABLE public.partner_pms_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'siteminder',
  property_code VARCHAR(100) NOT NULL,
  api_endpoint VARCHAR(500),
  credentials_encrypted TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'pending',
  sync_error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partner_id, provider, property_code)
);

-- Create table for availability sync logs
CREATE TABLE public.pms_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.partner_pms_integrations(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  rooms_synced INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_pms_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pms_sync_logs ENABLE ROW LEVEL SECURITY;

-- Partners can view and manage their own integrations
CREATE POLICY "Partners can view own integrations"
  ON public.partner_pms_integrations FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Partners can insert own integrations"
  ON public.partner_pms_integrations FOR INSERT
  WITH CHECK (
    partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Partners can update own integrations"
  ON public.partner_pms_integrations FOR UPDATE
  USING (
    partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Partners can delete own integrations"
  ON public.partner_pms_integrations FOR DELETE
  USING (
    partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

-- Sync logs readable by partner owners
CREATE POLICY "Partners can view own sync logs"
  ON public.pms_sync_logs FOR SELECT
  USING (
    integration_id IN (
      SELECT i.id FROM public.partner_pms_integrations i
      JOIN public.partners p ON p.id = i.partner_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_pms_integrations_partner ON public.partner_pms_integrations(partner_id);
CREATE INDEX idx_pms_integrations_active ON public.partner_pms_integrations(is_active) WHERE is_active = true;
CREATE INDEX idx_pms_sync_logs_integration ON public.pms_sync_logs(integration_id);

-- Trigger for updated_at
CREATE TRIGGER update_partner_pms_integrations_updated_at
  BEFORE UPDATE ON public.partner_pms_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();