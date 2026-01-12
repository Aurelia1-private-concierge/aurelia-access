-- Create enum for key status
CREATE TYPE public.encryption_key_status AS ENUM ('active', 'rotating', 'retired', 'compromised');

-- Create enum for certificate status
CREATE TYPE public.certificate_status AS ENUM ('active', 'pending', 'expired', 'revoked');

-- Encryption keys management table
CREATE TABLE public.encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_identifier TEXT NOT NULL UNIQUE,
  key_version INTEGER NOT NULL DEFAULT 1,
  algorithm TEXT NOT NULL DEFAULT 'AES-256-GCM',
  status encryption_key_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  rotated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  next_rotation_at TIMESTAMP WITH TIME ZONE,
  rotation_interval_days INTEGER DEFAULT 90,
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Key rotation history
CREATE TABLE public.key_rotation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID REFERENCES public.encryption_keys(id) ON DELETE CASCADE,
  old_version INTEGER NOT NULL,
  new_version INTEGER NOT NULL,
  rotated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  rotated_by UUID REFERENCES auth.users(id),
  rotation_reason TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  affected_records INTEGER DEFAULT 0
);

-- Certificate management table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  issuer TEXT,
  serial_number TEXT,
  fingerprint_sha256 TEXT,
  status certificate_status NOT NULL DEFAULT 'active',
  issued_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  renewal_reminder_days INTEGER DEFAULT 30,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  certificate_type TEXT DEFAULT 'TLS',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Security audit events for encryption operations
CREATE TABLE public.security_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  actor_id UUID REFERENCES auth.users(id),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_rotation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access
CREATE POLICY "Admins can manage encryption keys"
ON public.encryption_keys
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view key rotation history"
ON public.key_rotation_history
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage certificates"
ON public.certificates
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view security audit events"
ON public.security_audit_events
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_encryption_keys_status ON public.encryption_keys(status);
CREATE INDEX idx_encryption_keys_next_rotation ON public.encryption_keys(next_rotation_at);
CREATE INDEX idx_certificates_expires_at ON public.certificates(expires_at);
CREATE INDEX idx_certificates_status ON public.certificates(status);
CREATE INDEX idx_security_audit_events_created ON public.security_audit_events(created_at DESC);
CREATE INDEX idx_security_audit_events_type ON public.security_audit_events(event_type);

-- Trigger for updated_at on certificates
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check for expiring certificates
CREATE OR REPLACE FUNCTION public.get_expiring_certificates(days_threshold INTEGER DEFAULT 30)
RETURNS SETOF public.certificates
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.certificates
  WHERE status = 'active'
    AND expires_at <= (now() + (days_threshold || ' days')::INTERVAL)
  ORDER BY expires_at ASC
$$;

-- Function to get keys due for rotation
CREATE OR REPLACE FUNCTION public.get_keys_due_for_rotation()
RETURNS SETOF public.encryption_keys
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.encryption_keys
  WHERE status = 'active'
    AND next_rotation_at <= now()
  ORDER BY next_rotation_at ASC
$$;

-- Insert default encryption key record
INSERT INTO public.encryption_keys (
  key_identifier,
  key_version,
  algorithm,
  status,
  next_rotation_at,
  rotation_interval_days,
  metadata
) VALUES (
  'master-encryption-key',
  1,
  'AES-256-GCM',
  'active',
  now() + INTERVAL '90 days',
  90,
  '{"purpose": "Primary data encryption key", "compliance": ["SOC2", "GDPR"]}'::jsonb
);

-- Insert sample certificate for demonstration
INSERT INTO public.certificates (
  name,
  domain,
  issuer,
  status,
  issued_at,
  expires_at,
  certificate_type,
  metadata
) VALUES (
  'Primary TLS Certificate',
  '*.aurelia.com',
  'Let''s Encrypt',
  'active',
  now() - INTERVAL '30 days',
  now() + INTERVAL '60 days',
  'TLS',
  '{"algorithm": "RSA-2048", "san": ["aurelia.com", "*.aurelia.com"]}'::jsonb
);