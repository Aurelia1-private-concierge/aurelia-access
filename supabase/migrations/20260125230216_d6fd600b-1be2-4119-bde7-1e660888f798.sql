-- Aurelia Prescience: Predictive Lifestyle Intelligence System

-- Member Preference DNA - learned taste patterns
CREATE TABLE public.member_preference_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Taste dimensions (0-100 scale)
  adventure_score INTEGER DEFAULT 50 CHECK (adventure_score >= 0 AND adventure_score <= 100),
  luxury_threshold INTEGER DEFAULT 70 CHECK (luxury_threshold >= 0 AND luxury_threshold <= 100),
  spontaneity_score INTEGER DEFAULT 50 CHECK (spontaneity_score >= 0 AND spontaneity_score <= 100),
  privacy_preference INTEGER DEFAULT 80 CHECK (privacy_preference >= 0 AND privacy_preference <= 100),
  social_preference INTEGER DEFAULT 50 CHECK (social_preference >= 0 AND social_preference <= 100),
  -- Learned preferences (JSON for flexibility)
  preferred_destinations JSONB DEFAULT '[]'::jsonb,
  preferred_cuisines JSONB DEFAULT '[]'::jsonb,
  preferred_experiences JSONB DEFAULT '[]'::jsonb,
  avoided_categories JSONB DEFAULT '[]'::jsonb,
  -- Timing patterns
  preferred_travel_months JSONB DEFAULT '[]'::jsonb,
  preferred_booking_lead_days INTEGER DEFAULT 14,
  -- Budget patterns
  typical_spend_per_experience INTEGER,
  currency TEXT DEFAULT 'USD',
  -- Confidence metrics
  data_points_analyzed INTEGER DEFAULT 0,
  last_learning_at TIMESTAMP WITH TIME ZONE,
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Preference signals - raw behavioral data for learning
CREATE TABLE public.preference_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL, -- 'booking', 'inquiry', 'view', 'rating', 'rejection'
  category TEXT NOT NULL, -- 'travel', 'dining', 'events', 'wellness', etc.
  signal_data JSONB NOT NULL,
  sentiment_score INTEGER CHECK (sentiment_score >= -100 AND sentiment_score <= 100), -- negative = dislike
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lifestyle opportunities - AI-generated proactive suggestions
CREATE TABLE public.lifestyle_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Opportunity details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  opportunity_type TEXT NOT NULL, -- 'time_sensitive', 'calendar_match', 'preference_match', 'serendipity'
  -- Timing
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  suggested_dates JSONB, -- array of ideal dates
  -- Match scoring
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons JSONB NOT NULL, -- why this was suggested
  -- Details
  location TEXT,
  estimated_cost INTEGER,
  currency TEXT DEFAULT 'USD',
  images JSONB DEFAULT '[]'::jsonb,
  external_data JSONB, -- partner info, booking details
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'viewed', 'approved', 'declined', 'expired', 'booked'
  member_response TEXT, -- optional feedback
  responded_at TIMESTAMP WITH TIME ZONE,
  -- Execution
  auto_book_enabled BOOLEAN DEFAULT false,
  booking_reference TEXT,
  -- Metadata
  priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Important dates - member calendar intelligence
CREATE TABLE public.member_important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_type TEXT NOT NULL, -- 'anniversary', 'birthday', 'travel', 'event'
  title TEXT NOT NULL,
  description TEXT,
  recurring BOOLEAN DEFAULT false,
  date_value DATE NOT NULL,
  reminder_days INTEGER DEFAULT 14,
  associated_person TEXT, -- 'self', 'spouse', 'child', etc.
  preferences JSONB, -- specific preferences for this date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_preference_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preference_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyle_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_important_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policies - members can only see their own data
CREATE POLICY "Members can view own preference DNA" ON public.member_preference_dna
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Members can update own preference DNA" ON public.member_preference_dna
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert preference DNA" ON public.member_preference_dna
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can view own signals" ON public.preference_signals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Members can insert signals" ON public.preference_signals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can view own opportunities" ON public.lifestyle_opportunities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Members can update own opportunities" ON public.lifestyle_opportunities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert opportunities" ON public.lifestyle_opportunities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can manage own dates" ON public.member_important_dates
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all preference DNA" ON public.member_preference_dna
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all opportunities" ON public.lifestyle_opportunities
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_preference_signals_user ON public.preference_signals(user_id, created_at DESC);
CREATE INDEX idx_preference_signals_unprocessed ON public.preference_signals(processed) WHERE processed = false;
CREATE INDEX idx_opportunities_user_status ON public.lifestyle_opportunities(user_id, status);
CREATE INDEX idx_opportunities_pending ON public.lifestyle_opportunities(status, priority DESC) WHERE status = 'pending';
CREATE INDEX idx_important_dates_upcoming ON public.member_important_dates(user_id, date_value);

-- Trigger for updated_at
CREATE TRIGGER update_preference_dna_updated_at
  BEFORE UPDATE ON public.member_preference_dna
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.lifestyle_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();