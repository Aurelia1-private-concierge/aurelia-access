-- =============================================
-- TIER 1: OCR, KYC/AML, and Enhanced Matching
-- =============================================

-- Document Types Enum
CREATE TYPE public.document_type AS ENUM (
  'passport',
  'drivers_license',
  'national_id',
  'business_license',
  'tax_certificate',
  'insurance_certificate',
  'bank_statement',
  'utility_bill',
  'contract',
  'other'
);

-- OCR Processing Status Enum
CREATE TYPE public.ocr_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'manual_review'
);

-- KYC Verification Status Enum
CREATE TYPE public.kyc_status AS ENUM (
  'pending',
  'in_progress',
  'approved',
  'rejected',
  'expired',
  'manual_review'
);

-- AML Alert Severity Enum
CREATE TYPE public.aml_severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- AML Alert Type Enum
CREATE TYPE public.aml_alert_type AS ENUM (
  'pep_match',
  'sanctions_match',
  'adverse_media',
  'watchlist_match',
  'unusual_activity',
  'document_discrepancy',
  'identity_mismatch'
);

-- =============================================
-- 1. Partner Documents Table (OCR Intake)
-- =============================================
CREATE TABLE public.partner_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  document_type public.document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  ocr_status public.ocr_status DEFAULT 'pending',
  ocr_processed_at TIMESTAMPTZ,
  ocr_error_message TEXT,
  ocr_confidence_score NUMERIC(5,4), -- 0.0000 to 1.0000
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- 2. Extracted Data Table (OCR Results)
-- =============================================
CREATE TABLE public.extracted_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.partner_documents(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_value TEXT,
  field_type TEXT, -- 'text', 'date', 'number', 'address', 'name', etc.
  confidence NUMERIC(5,4) NOT NULL DEFAULT 0, -- 0.0000 to 1.0000
  bounding_box JSONB, -- {"x": 0, "y": 0, "width": 100, "height": 20}
  page_number INT DEFAULT 1,
  needs_verification BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- 3. KYC Verifications Table
-- =============================================
CREATE TABLE public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('partner', 'client', 'user')),
  entity_id UUID NOT NULL,
  verification_level TEXT DEFAULT 'standard', -- 'basic', 'standard', 'enhanced'
  status public.kyc_status DEFAULT 'pending',
  provider TEXT, -- 'internal', 'onfido', 'sumsub', etc.
  provider_reference_id TEXT,
  provider_response JSONB,
  
  -- Identity Verification
  identity_verified BOOLEAN DEFAULT false,
  identity_verified_at TIMESTAMPTZ,
  
  -- Document Verification
  documents_verified BOOLEAN DEFAULT false,
  documents_verified_at TIMESTAMPTZ,
  
  -- Address Verification  
  address_verified BOOLEAN DEFAULT false,
  address_verified_at TIMESTAMPTZ,
  
  -- PEP & Sanctions
  pep_checked BOOLEAN DEFAULT false,
  pep_status TEXT, -- 'clear', 'match', 'potential_match'
  sanctions_checked BOOLEAN DEFAULT false,
  sanctions_status TEXT,
  
  -- Risk Assessment
  risk_score NUMERIC(5,2), -- 0.00 to 100.00
  risk_level TEXT, -- 'low', 'medium', 'high', 'critical'
  risk_factors JSONB DEFAULT '[]',
  
  -- Review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Expiry
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- 4. AML Alerts Table
-- =============================================
CREATE TABLE public.aml_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('partner', 'client', 'user', 'transaction')),
  entity_id UUID NOT NULL,
  kyc_verification_id UUID REFERENCES public.kyc_verifications(id),
  
  alert_type public.aml_alert_type NOT NULL,
  severity public.aml_severity NOT NULL,
  
  -- Alert Details
  title TEXT NOT NULL,
  description TEXT,
  source TEXT, -- 'sanctions_list', 'pep_database', 'adverse_media', 'internal'
  match_details JSONB, -- Details of what matched
  match_score NUMERIC(5,4), -- Similarity/confidence score
  
  -- Resolution
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'escalated', 'resolved', 'false_positive')),
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  resolution_action TEXT, -- 'approved', 'rejected', 'enhanced_due_diligence', 'reported'
  
  -- Audit
  escalated_at TIMESTAMPTZ,
  escalated_to TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- 5. Preference Weights Table (AI Matching Enhancement)
-- =============================================
CREATE TABLE public.preference_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Service Category Preferences (weights 0-100)
  category_weights JSONB DEFAULT '{}', -- {"private_aviation": 85, "yacht_charter": 70, ...}
  
  -- Partner Preferences
  preferred_partners UUID[] DEFAULT '{}',
  excluded_partners UUID[] DEFAULT '{}',
  
  -- Quality Preferences
  min_partner_rating NUMERIC(3,2) DEFAULT 4.0,
  max_response_time_hours INT DEFAULT 24,
  
  -- Price Sensitivity (0 = price insensitive, 100 = very price sensitive)
  price_sensitivity INT DEFAULT 50 CHECK (price_sensitivity >= 0 AND price_sensitivity <= 100),
  
  -- Location Preferences
  preferred_regions TEXT[] DEFAULT '{}',
  excluded_regions TEXT[] DEFAULT '{}',
  
  -- Communication Preferences
  preferred_language TEXT DEFAULT 'en',
  communication_style TEXT, -- 'formal', 'casual', 'concise'
  
  -- Learning Data
  total_interactions INT DEFAULT 0,
  last_interaction_at TIMESTAMPTZ,
  model_version TEXT DEFAULT 'v1',
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(user_id)
);

-- =============================================
-- 6. Service Interaction Logs (Behavioral Tracking)
-- =============================================
CREATE TABLE public.service_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  
  -- Interaction Details
  interaction_type TEXT NOT NULL, -- 'view', 'inquiry', 'booking', 'cancellation', 'review'
  
  -- What was interacted with
  service_id UUID REFERENCES public.partner_services(id),
  partner_id UUID REFERENCES public.partners(id),
  service_category TEXT,
  
  -- Interaction Metrics
  time_spent_seconds INT,
  scroll_depth_percent INT,
  clicked_contact BOOLEAN DEFAULT false,
  added_to_favorites BOOLEAN DEFAULT false,
  
  -- Context
  source TEXT, -- 'search', 'recommendation', 'browse', 'direct'
  search_query TEXT,
  recommendation_score NUMERIC(5,4),
  recommendation_rank INT,
  
  -- Outcome
  converted BOOLEAN DEFAULT false,
  booking_value NUMERIC(12,2),
  
  -- Feedback
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX idx_partner_documents_partner ON public.partner_documents(partner_id);
CREATE INDEX idx_partner_documents_status ON public.partner_documents(ocr_status);
CREATE INDEX idx_extracted_data_document ON public.extracted_data(document_id);
CREATE INDEX idx_extracted_data_field ON public.extracted_data(field_name);
CREATE INDEX idx_kyc_verifications_entity ON public.kyc_verifications(entity_type, entity_id);
CREATE INDEX idx_kyc_verifications_status ON public.kyc_verifications(status);
CREATE INDEX idx_aml_alerts_entity ON public.aml_alerts(entity_type, entity_id);
CREATE INDEX idx_aml_alerts_status ON public.aml_alerts(status);
CREATE INDEX idx_aml_alerts_severity ON public.aml_alerts(severity);
CREATE INDEX idx_preference_weights_user ON public.preference_weights(user_id);
CREATE INDEX idx_service_interactions_user ON public.service_interactions(user_id);
CREATE INDEX idx_service_interactions_service ON public.service_interactions(service_id);
CREATE INDEX idx_service_interactions_created ON public.service_interactions(created_at DESC);

-- =============================================
-- Enable RLS
-- =============================================
ALTER TABLE public.partner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aml_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preference_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_interactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Partner Documents: Partners can view their own, admins can view all
CREATE POLICY "Partners view own documents"
  ON public.partner_documents FOR SELECT
  TO authenticated
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Partners insert own documents"
  ON public.partner_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins manage all documents"
  ON public.partner_documents FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Extracted Data: Same as documents
CREATE POLICY "View extracted data for own documents"
  ON public.extracted_data FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT pd.id FROM public.partner_documents pd
      JOIN public.partners p ON pd.partner_id = p.id
      WHERE p.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins manage extracted data"
  ON public.extracted_data FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- KYC Verifications: Admins only (sensitive compliance data)
CREATE POLICY "Admins manage KYC verifications"
  ON public.kyc_verifications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- AML Alerts: Admins only (highly sensitive)
CREATE POLICY "Admins manage AML alerts"
  ON public.aml_alerts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Preference Weights: Users manage their own
CREATE POLICY "Users manage own preference weights"
  ON public.preference_weights FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Service Interactions: Users view own, admins view all
CREATE POLICY "Users view own interactions"
  ON public.service_interactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own interactions"
  ON public.service_interactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage all interactions"
  ON public.service_interactions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Triggers for updated_at
-- =============================================
CREATE TRIGGER update_partner_documents_updated_at
  BEFORE UPDATE ON public.partner_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aml_alerts_updated_at
  BEFORE UPDATE ON public.aml_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preference_weights_updated_at
  BEFORE UPDATE ON public.preference_weights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();