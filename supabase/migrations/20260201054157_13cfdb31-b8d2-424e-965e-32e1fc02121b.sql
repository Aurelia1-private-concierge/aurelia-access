-- =============================================
-- TIER 2: Events, E-Signatures, and Realtime Bidding
-- =============================================

-- Document Signature Status Enum
CREATE TYPE public.signature_status AS ENUM (
  'draft',
  'pending_signature',
  'partially_signed',
  'completed',
  'declined',
  'expired',
  'voided'
);

-- Legal Document Type Enum
CREATE TYPE public.legal_document_type AS ENUM (
  'nda',
  'dpa',
  'service_agreement',
  'partnership_agreement',
  'terms_of_service',
  'privacy_policy',
  'consent_form',
  'other'
);

-- Event Status Enum
CREATE TYPE public.event_status AS ENUM (
  'draft',
  'planning',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'postponed'
);

-- =============================================
-- 1. Events Table (VIP Event Management)
-- =============================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  organizer_type TEXT DEFAULT 'member',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  timezone TEXT DEFAULT 'UTC',
  is_all_day BOOLEAN DEFAULT false,
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_country TEXT,
  is_virtual BOOLEAN DEFAULT false,
  virtual_meeting_url TEXT,
  max_guests INT,
  current_guest_count INT DEFAULT 0,
  estimated_budget NUMERIC(12,2),
  actual_spend NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  status public.event_status DEFAULT 'draft',
  visibility TEXT DEFAULT 'private',
  service_request_id UUID REFERENCES public.service_requests(id),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- 2. Event Participants Table
-- =============================================
CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'guest',
  invitation_status TEXT DEFAULT 'pending',
  invitation_sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  dietary_restrictions TEXT,
  accessibility_needs TEXT,
  plus_one_count INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(event_id, email)
);

-- =============================================
-- 3. Legal Documents Table (E-Signatures)
-- =============================================
CREATE TABLE public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  document_type public.legal_document_type NOT NULL,
  template_id TEXT,
  content TEXT,
  file_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  signature_status public.signature_status DEFAULT 'draft',
  requires_signatures INT DEFAULT 1,
  completed_signatures INT DEFAULT 0,
  provider TEXT,
  provider_document_id TEXT,
  provider_envelope_id TEXT,
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  voided_reason TEXT,
  event_id UUID REFERENCES public.events(id),
  partner_id UUID REFERENCES public.partners(id),
  service_request_id UUID REFERENCES public.service_requests(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- 4. Document Signers Table
-- =============================================
CREATE TABLE public.document_signers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'signer',
  signing_order INT DEFAULT 1,
  status TEXT DEFAULT 'pending',
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  signature_ip TEXT,
  signature_user_agent TEXT,
  signature_data JSONB,
  provider_recipient_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- 5. Bid Notifications Table (Realtime Bidding)
-- =============================================
CREATE TABLE public.bid_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  bid_id UUID,
  notification_type TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  recipient_id UUID REFERENCES auth.users(id),
  partner_id UUID REFERENCES public.partners(id),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  delivered_via TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- 6. PII Redaction Rules Table
-- =============================================
CREATE TABLE public.redaction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL UNIQUE,
  description TEXT,
  field_names TEXT[] NOT NULL,
  pattern_type TEXT DEFAULT 'field',
  regex_pattern TEXT,
  redaction_type TEXT DEFAULT 'mask',
  mask_character TEXT DEFAULT '*',
  preserve_length BOOLEAN DEFAULT false,
  show_last_n INT DEFAULT 0,
  applies_to_roles TEXT[] DEFAULT '{}',
  exception_roles TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- 7. Redaction Audit Log
-- =============================================
CREATE TABLE public.redaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  viewer_id UUID REFERENCES auth.users(id),
  viewer_role TEXT,
  rule_id UUID REFERENCES public.redaction_rules(id),
  redaction_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX idx_event_participants_user ON public.event_participants(user_id);
CREATE INDEX idx_legal_documents_created_by ON public.legal_documents(created_by);
CREATE INDEX idx_legal_documents_status ON public.legal_documents(signature_status);
CREATE INDEX idx_document_signers_document ON public.document_signers(document_id);
CREATE INDEX idx_document_signers_user ON public.document_signers(user_id);
CREATE INDEX idx_bid_notifications_request ON public.bid_notifications(service_request_id);
CREATE INDEX idx_bid_notifications_recipient ON public.bid_notifications(recipient_id);
CREATE INDEX idx_redaction_logs_entity ON public.redaction_logs(entity_type, entity_id);

-- =============================================
-- Enable RLS
-- =============================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redaction_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redaction_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Events: Organizers and participants can view
CREATE POLICY "Users view own events"
  ON public.events FOR SELECT
  TO authenticated
  USING (
    organizer_id = auth.uid()
    OR id IN (SELECT event_id FROM public.event_participants WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users manage own events"
  ON public.events FOR ALL
  TO authenticated
  USING (organizer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Event Participants
CREATE POLICY "View event participants"
  ON public.event_participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Manage event participants"
  ON public.event_participants FOR ALL
  TO authenticated
  USING (
    event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Legal Documents
CREATE POLICY "View legal documents"
  ON public.legal_documents FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR id IN (SELECT document_id FROM public.document_signers WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Manage own legal documents"
  ON public.legal_documents FOR ALL
  TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Document Signers
CREATE POLICY "View own signer records"
  ON public.document_signers FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR document_id IN (SELECT id FROM public.legal_documents WHERE created_by = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Manage signers"
  ON public.document_signers FOR ALL
  TO authenticated
  USING (
    document_id IN (SELECT id FROM public.legal_documents WHERE created_by = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Bid Notifications
CREATE POLICY "View own bid notifications"
  ON public.bid_notifications FOR SELECT
  TO authenticated
  USING (
    recipient_id = auth.uid()
    OR partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "System manages bid notifications"
  ON public.bid_notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Redaction Rules: Admins only
CREATE POLICY "Admins manage redaction rules"
  ON public.redaction_rules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Redaction Logs
CREATE POLICY "Admins view redaction logs"
  ON public.redaction_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System inserts redaction logs"
  ON public.redaction_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- Enable Realtime for Bidding
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.bid_notifications;

-- =============================================
-- Triggers
-- =============================================
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_participants_updated_at
  BEFORE UPDATE ON public.event_participants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON public.legal_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_redaction_rules_updated_at
  BEFORE UPDATE ON public.redaction_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Insert Default Redaction Rules
-- =============================================
INSERT INTO public.redaction_rules (rule_name, description, field_names, redaction_type, show_last_n, applies_to_roles) VALUES
  ('email_redaction', 'Redact email addresses for partners', ARRAY['email', 'client_email'], 'mask', 0, ARRAY['partner']),
  ('phone_redaction', 'Redact phone numbers for partners', ARRAY['phone', 'client_phone', 'contact_phone'], 'mask', 4, ARRAY['partner']),
  ('name_partial', 'Show only initials for partners', ARRAY['full_name', 'client_name', 'display_name'], 'pseudonymize', 0, ARRAY['partner']),
  ('address_redaction', 'Redact full addresses', ARRAY['address', 'home_address', 'billing_address'], 'mask', 0, ARRAY['partner']),
  ('financial_redaction', 'Redact financial details', ARRAY['bank_account', 'card_number', 'ssn'], 'mask', 4, ARRAY['partner', 'member']);