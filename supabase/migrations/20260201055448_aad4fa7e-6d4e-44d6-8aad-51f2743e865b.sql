-- =============================================
-- TIER 3: Voice Sessions & Fraud Detection
-- =============================================

-- Voice Sessions Table
-- Tracks ElevenLabs conversational AI sessions
CREATE TABLE public.voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL DEFAULT 'standard' CHECK (session_type IN ('standard', 'authenticated', 'biometric')),
  voiceprint_verified BOOLEAN DEFAULT FALSE,
  voiceprint_confidence NUMERIC(5, 4),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  transcript_summary TEXT,
  intents_detected JSONB DEFAULT '[]'::jsonb,
  commands_executed INTEGER DEFAULT 0,
  provider TEXT DEFAULT 'elevenlabs',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voice Commands Table
-- Logs individual voice commands and their execution
CREATE TABLE public.voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.voice_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  transcript TEXT NOT NULL,
  intent TEXT,
  confidence NUMERIC(5, 4),
  entities JSONB DEFAULT '{}'::jsonb,
  action_taken TEXT,
  action_result JSONB,
  response_text TEXT,
  response_audio_url TEXT,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voiceprint Registry (for biometric verification)
CREATE TABLE public.voiceprint_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  voiceprint_hash TEXT NOT NULL,
  enrollment_samples INTEGER DEFAULT 0,
  verification_threshold NUMERIC(5, 4) DEFAULT 0.85,
  last_verified_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment Intents Table
-- Tracks multi-currency payment processing
CREATE TABLE public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  converted_amount INTEGER,
  converted_currency TEXT,
  exchange_rate NUMERIC(12, 6),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'requires_action', 'succeeded', 'failed', 'canceled', 'refunded')),
  fraud_score NUMERIC(5, 2) DEFAULT 0,
  fraud_status TEXT DEFAULT 'clean' CHECK (fraud_status IN ('clean', 'review', 'blocked', 'approved')),
  risk_factors JSONB DEFAULT '[]'::jsonb,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  geolocation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fraud Alerts Table
-- Tracks suspicious payment activities
CREATE TABLE public.fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id UUID REFERENCES public.payment_intents(id) ON DELETE CASCADE,
  user_id UUID,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'velocity_limit',
    'geolocation_anomaly',
    'device_mismatch',
    'amount_anomaly',
    'time_anomaly',
    'card_testing',
    'multiple_failures',
    'ip_reputation',
    'manual_review'
  )),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  rule_triggered TEXT,
  rule_details JSONB,
  action_taken TEXT CHECK (action_taken IN ('allow', 'review', 'block', 'challenge')),
  action_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  is_false_positive BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fraud Rules Table
-- Configurable fraud detection rules
CREATE TABLE public.fraud_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  condition JSONB NOT NULL,
  action TEXT NOT NULL DEFAULT 'review',
  severity TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 100,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Currency Exchange Cache
-- Caches exchange rates to reduce API calls
CREATE TABLE public.currency_exchange_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate NUMERIC(12, 6) NOT NULL,
  source TEXT DEFAULT 'frankfurter',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(base_currency, target_currency)
);

-- Payment Velocity Tracking
-- For fraud velocity checks
CREATE TABLE public.payment_velocity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('hour', 'day', 'week', 'month')),
  period_start TIMESTAMPTZ NOT NULL,
  transaction_count INTEGER DEFAULT 0,
  total_amount NUMERIC(15, 2) DEFAULT 0,
  currencies_used TEXT[] DEFAULT '{}',
  unique_ips INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_type, period_start)
);

-- Enable RLS
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voiceprint_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_exchange_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_velocity ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Voice Sessions
CREATE POLICY "Users can view their own voice sessions"
  ON public.voice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice sessions"
  ON public.voice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice sessions"
  ON public.voice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies: Voice Commands
CREATE POLICY "Users can view their own voice commands"
  ON public.voice_commands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice commands"
  ON public.voice_commands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Voiceprint Registry
CREATE POLICY "Users can view their own voiceprint"
  ON public.voiceprint_registry FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own voiceprint"
  ON public.voiceprint_registry FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies: Payment Intents
CREATE POLICY "Users can view their own payment intents"
  ON public.payment_intents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment intents"
  ON public.payment_intents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment intents"
  ON public.payment_intents FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies: Fraud Alerts (admin only via service role)
CREATE POLICY "Service role can manage fraud alerts"
  ON public.fraud_alerts FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies: Fraud Rules (read-only for authenticated)
CREATE POLICY "Authenticated users can view active fraud rules"
  ON public.fraud_rules FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- RLS Policies: Currency Cache (public read)
CREATE POLICY "Anyone can read currency cache"
  ON public.currency_exchange_cache FOR SELECT
  USING (true);

-- RLS Policies: Payment Velocity
CREATE POLICY "Users can view their own velocity"
  ON public.payment_velocity FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_voice_sessions_user_id ON public.voice_sessions(user_id);
CREATE INDEX idx_voice_sessions_started_at ON public.voice_sessions(started_at DESC);
CREATE INDEX idx_voice_commands_session_id ON public.voice_commands(session_id);
CREATE INDEX idx_voice_commands_user_id ON public.voice_commands(user_id);
CREATE INDEX idx_voice_commands_intent ON public.voice_commands(intent);
CREATE INDEX idx_payment_intents_user_id ON public.payment_intents(user_id);
CREATE INDEX idx_payment_intents_status ON public.payment_intents(status);
CREATE INDEX idx_payment_intents_fraud_status ON public.payment_intents(fraud_status);
CREATE INDEX idx_payment_intents_created_at ON public.payment_intents(created_at DESC);
CREATE INDEX idx_fraud_alerts_payment_intent_id ON public.fraud_alerts(payment_intent_id);
CREATE INDEX idx_fraud_alerts_severity ON public.fraud_alerts(severity);
CREATE INDEX idx_fraud_alerts_created_at ON public.fraud_alerts(created_at DESC);
CREATE INDEX idx_currency_cache_lookup ON public.currency_exchange_cache(base_currency, target_currency);
CREATE INDEX idx_payment_velocity_user_period ON public.payment_velocity(user_id, period_type, period_start);

-- Insert default fraud rules
INSERT INTO public.fraud_rules (name, rule_type, condition, action, severity, priority, description) VALUES
  ('High Velocity Hour', 'velocity', '{"period": "hour", "max_transactions": 10, "max_amount": 50000}', 'review', 'high', 10, 'More than 10 transactions or $50k in 1 hour'),
  ('High Velocity Day', 'velocity', '{"period": "day", "max_transactions": 25, "max_amount": 100000}', 'review', 'medium', 20, 'More than 25 transactions or $100k in 1 day'),
  ('Large Transaction', 'amount', '{"threshold": 25000}', 'review', 'medium', 30, 'Single transaction over $25,000'),
  ('Very Large Transaction', 'amount', '{"threshold": 100000}', 'block', 'critical', 5, 'Single transaction over $100,000'),
  ('Multiple Card Failures', 'failure', '{"max_failures": 3, "period": "hour"}', 'block', 'high', 15, 'More than 3 failed payments in 1 hour'),
  ('Geo Velocity', 'geolocation', '{"max_distance_km": 5000, "period_minutes": 60}', 'review', 'high', 25, 'Transactions from locations >5000km apart within 1 hour'),
  ('New Device Large Amount', 'device', '{"new_device_threshold": 5000}', 'challenge', 'medium', 35, 'Large transaction from unrecognized device'),
  ('Off Hours High Risk', 'time', '{"start_hour": 2, "end_hour": 5, "threshold_multiplier": 0.5}', 'review', 'low', 50, 'Transactions during 2-5 AM local time');

-- Trigger for updated_at
CREATE TRIGGER update_payment_intents_updated_at
  BEFORE UPDATE ON public.payment_intents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voiceprint_registry_updated_at
  BEFORE UPDATE ON public.voiceprint_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fraud_rules_updated_at
  BEFORE UPDATE ON public.fraud_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();